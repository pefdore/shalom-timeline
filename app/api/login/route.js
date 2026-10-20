import { NextResponse } from 'next/server'
import { getSheetData, appendToSheet, getVotingDates, isVotingOpen } from '@/lib/sheets'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = 'Membres'

const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const MEMBERS_DEV = {
  'Jeremy': { code: '0001', hasVoted: false },
  'Caroline': { code: '0002', hasVoted: false },
  'Arnaud': { code: '0003', hasVoted: false },
  'Coraline': { code: '0004', hasVoted: false },
  'Matthias': { code: '0005', hasVoted: false },
  'Laetitia': { code: '0006', hasVoted: false },
  'Toby': { code: '0007', hasVoted: false },
  'Margaux': { code: '0008', hasVoted: false },
  'Martin': { code: '0009', hasVoted: false },
  'Julie': { code: '0010', hasVoted: false },
  'Damien': { code: '0011', hasVoted: false },
  'Jessica': { code: '0012', hasVoted: false },
  'Pierre-François': { code: '0013', hasVoted: false },
  'Anne-Clémence': { code: '0014', hasVoted: false },
}

async function getMembersFromSheet() {
  try {
    const data = await getSheetData(SPREADSHEET_ID, SHEET_NAME, 'A:C')
    const members = {}
    for (let i = 1; i < data.length; i++) {
      const [name, code, voted] = data[i]
      if (name) {
        members[name] = { code: code || '', hasVoted: voted === 'TRUE' }
      }
    }
    return members
  } catch (error) {
    console.error('Error fetching members:', error)
    return null
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const member = searchParams.get('member')
  const code = searchParams.get('code')

  if (!member || !code) {
    return NextResponse.json(
      { success: false, message: 'Paramètres manquants' },
      { status: 400 }
    )
  }

  const { startDate, endDate } = getVotingDates()

  if (!isVotingOpen(startDate, endDate)) {
    return NextResponse.json(
      { success: false, message: `Les votes sont fermés. Réouvre du ${startDate} au ${endDate}` },
      { status: 403 }
    )
  }

  let memberData = null
  let members = null

  if (DEV_MODE) {
    memberData = MEMBERS_DEV[member]
  } else {
    members = await getMembersFromSheet()
    if (members) {
      memberData = members[member]
    }
  }

  if (!memberData) {
    return NextResponse.json(
      { success: false, message: 'Hmm, ce prénom n\'est pas sur la liste des copains. Vérifie l\'orthographe !' },
      { status: 401 }
    )
  }

  if (memberData.code !== code) {
    return NextResponse.json(
      { success: false, message: 'Ce code ne correspond pas... Petit indice : c\'est ton numéro d\'ordre dans la liste !' },
      { status: 401 }
    )
  }

  if (memberData.hasVoted) {
    return NextResponse.json(
      { success: false, message: 'Tu as déjà voté, merciiii ! Ton palmarès t\'attend sur la page Palmarès. 🏆' },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true, member })
}