import { NextResponse } from 'next/server'
import { getSheetData } from '@/lib/sheets'
import { buildPodiums, tallyRows, countVoters, CATEGORIES } from '@/lib/awards'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const MOCK_ROWS = [
  ['voter', 'category', 'votes', 'date'],
  ['Caroline', CATEGORIES[0].title, 'Jeremy:3, Toby:2, Matthias:1', new Date().toISOString()],
  ['Caroline', CATEGORIES[12].title, 'Toby:3, Jessica:2, Martin:1', new Date().toISOString()],
  ['Arnaud', CATEGORIES[0].title, 'Jeremy:3, Matthias:2, Toby:1', new Date().toISOString()],
  ['Arnaud', CATEGORIES[19].title, 'Jeremy & Caroline:3, Arnaud & Coraline:2, Martin & Julie:1', new Date().toISOString()],
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')

  if (DEV_MODE) {
    const podiums = buildPodiums(tallyRows(MOCK_ROWS))
    return NextResponse.json({
      success: true,
      results: podiums,
      voters: countVoters(MOCK_ROWS),
      year: year || new Date().getFullYear(),
      message: 'Résultats de démonstration. Le vrai palmarès n\'a pas de perdant·e·s ! 💛'
    })
  }

  try {
    const data = await getSheetData(SPREADSHEET_ID, 'Votes', 'A:D')
    const results = buildPodiums(tallyRows(data))

    return NextResponse.json({
      success: true,
      results,
      voters: countVoters(data),
      year: year || new Date().getFullYear(),
      message: 'Félicitations à toutes et à tous : le week-end reste une victoire collective. 🏆'
    })
  } catch (error) {
    console.error('Erreur getting results:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    )
  }
}
