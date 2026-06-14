import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
    } catch {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT.replace(/\\n/g, '\n'))
    }
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const credentialsPath = path.join(__dirname, '../google-credentials.json')
  return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
}

function getAuthClient() {
  const credentials = getCredentials()
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
}

export async function getSheetData(spreadsheetId, sheetName, range) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`,
  })

  return response.data.values || []
}

export async function appendToSheet(spreadsheetId, sheetName, values) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export async function updateSheetCell(spreadsheetId, sheetName, cell, value) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${cell}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value]] },
  })
}

export async function getAllSheetData(spreadsheetId, sheetName) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  })

  return response.data.values || []
}

export function isVotingOpen(startDate, endDate) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  return now >= start && now <= end
}

export function getVotingDates() {
  const weEndDate = process.env.WE_END_DATE || '2026-06-14'
  const startDate = new Date(weEndDate)
  const endDate = new Date(startDate)
  const durationDays = parseInt(process.env.VOTING_DURATION_DAYS) || 7
  endDate.setDate(endDate.getDate() + durationDays)
  
  return {
    startDate: weEndDate,
    endDate: endDate.toISOString().split('T')[0],
  }
}