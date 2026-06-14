import { NextResponse } from 'next/server'
import { getSheetData } from '@/lib/sheets'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const MOCK_RESULTS = {
  'Le Grand Prix de la Soufflerie': [{ name: 'Jeremy', points: 12 }, { name: 'Toby', points: 8 }, { name: 'Matthias', points: 5 }],
  "L'Award des Orgas': [{ name: 'Jeremy & Caroline', points: 25 }, { name: 'Arnaud & Coraline', points: 18 }, { name: 'Martin & Julie', points: 12 }],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')

  if (DEV_MODE) {
    return NextResponse.json({ 
      success: true, 
      results: MOCK_RESULTS,
      year: year || new Date().getFullYear()
    })
  }

  try {
    const data = await getSheetData(SPREADSHEET_ID, 'Votes', 'A:D')
    
    const results = {}
    
    for (let i = 1; i < data.length; i++) {
      const [voter, category, voteString] = data[i]
      if (!category || !voteString) continue

      if (!results[category]) {
        results[category] = {}
      }

      voteString.split(', ').forEach(v => {
        const [name, points] = v.split(':')
        if (name && points) {
          if (!results[category][name]) {
            results[category][name] = 0
          }
          results[category][name] += parseInt(points)
        }
      })
    }

    const winners = {}
    for (const [category, votes] of Object.entries(results)) {
      const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1])
      winners[category] = sorted.slice(0, 3).map(([name, points]) => ({ name, points }))
    }

    return NextResponse.json({ 
      success: true, 
      results: winners,
      year: year || new Date().getFullYear()
    })
  } catch (error) {
    console.error('Erreur getting results:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    )
  }
}