import { NextResponse } from 'next/server'
import {
  readState, readGazette, publicState, checkOrgasCode, checkMemberCode, isKnownMember,
} from '@/lib/investigation'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const member = searchParams.get('member')
  const code = searchParams.get('code')

  let authenticated = false
  let orgas = false
  if (member && code && isKnownMember(member)) {
    orgas = checkOrgasCode(code)
    authenticated = orgas || await checkMemberCode(member, code)
  }

  try {
    const [state, gazette] = await Promise.all([readState(), readGazette()])
    let myMonth = null
    if (authenticated && !orgas) {
      const myAttempts = gazette.filter((g) => g.member === member)
      myMonth = myAttempts.length ? myAttempts[0].month : null
    }
    return NextResponse.json({ success: true, ...publicState(state, gazette), myMonth, orgas })
  } catch (error) {
    console.error('Erreur état enquête:', error)
    return NextResponse.json(
      { success: false, message: 'Impossible de lire le dossier de l\u2019enquête.' },
      { status: 500 }
    )
  }
}
