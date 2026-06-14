import { NextResponse } from 'next/server'
import { appendToSheet, updateSheetCell, getSheetData } from '@/app/lib/sheets'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const CATEGORIES = [
  { id: 1, emoji: '💨', title: 'Le Grand Prix de la Soufflerie' },
  { id: 2, emoji: '💤', title: 'Sommeil Sacrifié' },
  { id: 3, emoji: '☕', title: "L'Award de la Marmotte" },
  { id: 4, emoji: '🏃‍♂️', title: 'Le Poumon d\'Or' },
  { id: 5, emoji: '🃏', title: 'Le MVP des Jeux de Société' },
  { id: 6, emoji: '🍳', title: 'Le Cordon Bleu' },
  { id: 7, emoji: '🧼', title: 'La Fée du Logis' },
  { id: 8, emoji: '🚗', title: 'Le Chauffeur de l\'Ombre' },
  { id: 9, emoji: '💬', title: 'La Machine à Private Jokes' },
  { id: 10, emoji: '🎧', title: 'Le DJ Moisi' },
  { id: 11, emoji: '🍻', title: 'Le Pilier de Comptoir' },
  { id: 12, emoji: '👑', title: 'Le Drama King/Queen' },
  { id: 13, emoji: '😂', title: 'Le Rire Contagieux' },
  { id: 14, emoji: '🩹', title: 'La Victime du Malentendu' },
  { id: 15, emoji: '🤥', title: "L'Award de la Mauvaise Foi" },
  { id: 16, emoji: '🔍', title: 'Où est mon... ?' },
  { id: 17, emoji: '💼', title: 'Le VRP d\'un produit random' },
  { id: 18, emoji: '🩴', title: 'Le Fashion Crime' },
  { id: 19, emoji: '🕵️‍♂️', title: 'Le Nostradamus du Groupe' },
  { id: 20, emoji: '🥇', title: 'L\'Award des Orgas' },
]

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
        message: 'Votes enregistrés (mode développement)' 
      })
    }

    for (const [categoryId, categoryVotes] of Object.entries(votes)) {
      const category = CATEGORIES.find(c => c.id === parseInt(categoryId))
      const categoryTitle = category ? category.title : `Catégorie ${categoryId}`
      
      const sortedVotes = Object.entries(categoryVotes)
        .sort((a, b) => b[1] - a[1])
        .map(([name, points]) => `${name}:${points}`)

      const voteData = [
        member,
        categoryTitle,
        sortedVotes.join(', '),
        new Date().toISOString()
      ]

      await appendToSheet(SPREADSHEET_ID, 'Votes', voteData)
    }

    await updateSheetCell(SPREADSHEET_ID, 'Membres', 'C2', 'TRUE')

    return NextResponse.json({ success: true })
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
    
    const results = {}
    
    for (let i = 1; i < data.length; i++) {
      const [voter, category, voteString] = data[i]
      if (!category || !voteString) continue

      if (!results[category]) {
        results[category] = {}
      }

      const votes = voteString.split(', ').forEach(v => {
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

    return NextResponse.json({ success: true, winners })
  } catch (error) {
    console.error('Erreur getting results:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    )
  }
}