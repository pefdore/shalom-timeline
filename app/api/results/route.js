import { NextResponse } from 'next/server'
import { getSheetData } from '@/lib/sheets'
import { buildPodiums, tallyRows, CATEGORIES } from '@/lib/awards'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const MOCK_RESULTS = {
  [CATEGORIES[0].title]: [{ name: 'Jeremy', points: 12, rank: 1, medal: '🥇' }, { name: 'Toby', points: 8, rank: 2, medal: '🥈' }, { name: 'Matthias', points: 5, rank: 3, medal: '🥉' }],
  [CATEGORIES[19].title]: [{ name: 'Jeremy & Caroline', points: 25, rank: 1, medal: '🥇' }, { name: 'Arnaud & Coraline', points: 18, rank: 2, medal: '🥈' }, { name: 'Martin & Julie', points: 12, rank: 3, medal: '🥉' }],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')

  if (DEV_MODE) {
    return NextResponse.json({
      success: true,
      results: MOCK_RESULTS,
      year: year || new Date().getFullYear(),
      message: 'Résultats de démonstration. Le vrai podium n\'a pas de perdant·e·s ! 💛'
    })
  }

  try {
    const data = await getSheetData(SPREADSHEET_ID, 'Votes', 'A:D')
    const results = buildPodiums(tallyRows(data))

    return NextResponse.json({
      success: true,
      results,
      year: year || new Date().getFullYear(),
      message: 'Félicitations à toutes et à tous : le week-end reste un victoire collective. 🏆'
    })
  } catch (error) {
    console.error('Erreur getting results:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    )
  }
}
