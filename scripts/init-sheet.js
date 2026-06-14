const { google } = require('googleapis')

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID

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
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  console.log('📋 Création des onglets...')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: 0, title: 'Membres' },
            fields: 'title',
          },
        },
        {
          addSheet: { properties: { title: 'Votes' } },
        },
        {
          addSheet: { properties: { title: 'Catégories' } },
        },
      ],
    },
  })

  console.log('✍️ Insertion des membres...')
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Membres!A1:C15',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: MEMBERS },
  })

  console.log('✍️ Insertion des catégories...')
  const categoriesWithHeader = [['Catégorie'], ...CATEGORIES.map(c => [c])]
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Catégories!A1:A21',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: categoriesWithHeader },
  })

  console.log('✅ Google Sheet initialisé avec succès!')
  console.log('   - Onglet "Membres": Liste des participants avec codes')
  console.log('   - Onglet "Votes": Enregistrement des votes')
  console.log('   - Onglet "Catégories": Liste des catégories')
}

initSheet().catch(console.error)