import { NextResponse } from 'next/server'

// Configuration Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID

// En mode développement, on simule l'enregistrement
const DEV_MODE = !process.env.GOOGLE_SHEET_ID

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

    // En mode dev, on simule juste un succès
    if (DEV_MODE) {
      console.log(`💾 Votes de ${member}:`, JSON.stringify(votes, null, 2))
      return NextResponse.json({ 
        success: true, 
        message: 'Votes enregistrés (mode développement)' 
      })
    }

    // En production, on enregistrerait dans Google Sheets
    // Note: Cette partie nécessite la configuration OAuth2 ou API key
    /*
    const { google } = require('googleapis')
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    
    const sheets = google.sheets({ version: 'v4', auth })
    
    // Formater les votes pour le sheet
    const rows = Object.entries(votes).map(([categoryId, categoryVotes]) => [
      member,
      categoryId,
      Object.entries(categoryVotes).sort((a, b) => b[1] - a[1]).map(([name, points]) => `${name}:${points}`).join(', ')
    ])
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Votes!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })
    */

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur vote:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement des votes' },
      { status: 500 }
    )
  }
}