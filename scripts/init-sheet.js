require('dotenv').config({ path: '.env.local', quiet: true })
const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID

const credentialsFile = process.env.GOOGLE_CREDENTIALS_FILE || 'google-credentials.json'
const credentialsPath = path.join(__dirname, '..', credentialsFile)
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))

console.log('Credentials loaded from:', credentialsPath)

const MEMBERS = [
  ['Nom', 'Code', 'A Voté'],
  ['Jeremy', '0001', 'FALSE'],
  ['Caroline', '0002', 'FALSE'],
  ['Arnaud', '0003', 'FALSE'],
  ['Coraline', '0004', 'FALSE'],
  ['Matthias', '0005', 'FALSE'],
  ['Laetitia', '0006', 'FALSE'],
  ['Toby', '0007', 'FALSE'],
  ['Margaux', '0008', 'FALSE'],
  ['Martin', '0009', 'FALSE'],
  ['Julie', '0010', 'FALSE'],
  ['Damien', '0011', 'FALSE'],
  ['Jessica', '0012', 'FALSE'],
  ['Pierre-François', '0013', 'FALSE'],
  ['Anne-Clémence', '0014', 'FALSE'],
]

const CATEGORIES = [
  'Le Grand Prix de la Soufflerie',
  'Sommeil Sacrifié',
  "L'Award de la Marmotte",
  'Le Poumon d\'Or',
  'Le MVP des Jeux de Société',
  'Le Cordon Bleu',
  'La Fée du Logis',
  'Le Chauffeur de l\'Ombre',
  'La Machine à Private Jokes',
  'Le DJ Moisi',
  'Le Pilier de Comptoir',
  'Le Drama King/Queen',
  'Le Rire Contagieux',
  'La Victime du Malentendu',
  "L'Award de la Mauvaise Foi",
  'Où est mon... ?',
  'Le VRP d\'un produit random',
  'Le Fashion Crime',
  'Le Nostradamus du Groupe',
  "L'Award des Orgas",
]

async function initSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  console.log('✍️ Insertion des membres...')
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Membres!A1:C15',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: MEMBERS },
    })
  } catch (e) {
    console.log('⚠️ Erreur insertion membres:', e.message)
  }

  console.log('✍️ Insertion des catégories...')
  const categoriesWithHeader = [['Catégorie'], ...CATEGORIES.map(c => [c])]
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Catégories!A1:A21',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: categoriesWithHeader },
    })
  } catch (e) {
    console.log('⚠️ Erreur insertion catégories:', e.message)
  }

  console.log('✅ Google Sheet configuré!')
}

initSheet().catch(console.error)