import { NextResponse } from 'next/server'

// Configuration Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = 'Membres'

// Liste des participants avec leurs codes (en prod, ça vient du sheet)
const MEMBERS = {
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

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const member = searchParams.get('member')
  const code = searchParams.get('code')

  // Validation basique
  if (!member || !code) {
    return NextResponse.json(
      { success: false, message: 'Paramètres manquants' },
      { status: 400 }
    )
  }

  const memberData = MEMBERS[member]

  // Membre non trouvé
  if (!memberData) {
    return NextResponse.json(
      { success: false, message: 'Alerte triche ! Tu n\'es pas dans la liste des copains autorises.' },
      { status: 401 }
    )
  }

  // Code incorrect
  if (memberData.code !== code) {
    return NextResponse.json(
      { success: false, message: 'Alerte triche ! Ton code est aussi faux que les dés pipés de Matthias.' },
      { status: 401 }
    )
    // A déjà voted (en mode dev, on autorise)
    if (memberData.hasVoted) {
      return NextResponse.json(
        { success: false, message: 'Alerte triche ! Tu as déjà balancé tes dossiers. Reviens l\'année prochaine !' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, member })
  }
}