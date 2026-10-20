import { NextResponse } from 'next/server'
import { appendToSheet, getSheetData } from '@/lib/sheets'
import { CATEGORIES, categoryTitleById, buildPodiums, tallyRows } from '@/lib/awards'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

export async function POST(request) {
  try {
    const body = await request.json()
    const { member, votes } = body

    if (!member || !votes) {
      return NextResponse.json(
        { success: false, message: 'Données incomplètes' },
        { status: 400 }
      )
    }

    if (DEV_MODE) {
      console.log(`💾 Votes de ${member}:`, JSON.stringify(votes, null, 2))
      return NextResponse.json({
        success: true,
        message: 'Votes enregistrés (mode développement). Merci pour ta contribution ! 💛'
      })
    }

    const validCategoryIds = new Set(CATEGORIES.map(c => c.id))

    for (const [categoryId, categoryVotes] of Object.entries(votes)) {
      const id = parseInt(categoryId)
      if (!validCategoryIds.has(id)) continue

      const categoryTitle = categoryTitleById(id)
      const sortedVotes = Object.entries(categoryVotes)
        .sort((a, b) => b[1] - a[1])
        .map(([name, points]) => `${name}:${points}`)

      if (sortedVotes.length === 0) continue

      const voteData = [
        member,
        categoryTitle,
        sortedVotes.join(', '),
        new Date().toISOString()
      ]

      await appendToSheet(SPREADSHEET_ID, 'Votes', voteData)
    }

    return NextResponse.json({
      success: true,
      message: 'Votes enregistrés. Le gîte te dit merci ! 🎉'
    })
  } catch (error) {
    console.error('Erreur vote:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement des votes' },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (DEV_MODE) {
    return NextResponse.json({ success: false, message: 'Mode développement' }, { status: 501 })
  }

  try {
    const data = await getSheetData(SPREADSHEET_ID, 'Votes', 'A:D')
    const winners = buildPodiums(tallyRows(data))

    return NextResponse.json({
      success: true,
      winners,
      message: 'Rappel : ici, même la 3e place reçoit des applaudissements. 👏'
    })
  } catch (error) {
    console.error('Erreur getting results:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    )
  }
}
