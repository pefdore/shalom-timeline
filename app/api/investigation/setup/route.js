import { NextResponse } from 'next/server'
import { saveState, checkOrgasCode } from '@/lib/investigation'
import { sendPushToMembers } from '@/lib/push'

export async function POST(request) {
  try {
    const body = await request.json()
    const { code, location, clues, revealDate, organizers } = body

    if (!checkOrgasCode(code)) {
      return NextResponse.json(
        { success: false, message: 'Code orgas invalide. Cette mission est réservée à la haute hiérarchie 🕵️' },
        { status: 401 }
      )
    }

    if (!location || !String(location).trim()) {
      return NextResponse.json(
        { success: false, message: 'Il faut un lieu secret. Un vrai, pas un fake pour piéger Julie.' },
        { status: 400 }
      )
    }

    const cluesArray = Array.isArray(clues)
      ? clues.map((c) => String(c).trim()).filter(Boolean)
      : []

    const organizersArray = Array.isArray(organizers)
      ? organizers.map((o) => String(o).trim()).filter(Boolean)
      : []

    await saveState({
      location: String(location).trim(),
      organizers: organizersArray,
      clues: cluesArray,
      revealDate: revealDate || '',
      solved: false,
      winner: '',
      solvedAt: '',
    })

    try {
      await sendPushToMembers([], {
        title: '🕵️ Nouvelle enquête ouverte !',
        body: 'Les orgas ont scellé un nouveau lieu secret. Premier indice dispo, à vos hypothèses !',
        url: '/investigation',
      })
    } catch {}

    return NextResponse.json({ success: true, message: 'Lieu scellé dans le coffre-fort 📦' })
  } catch (error) {
    console.error('Erreur setup enquête:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors du scellement du lieu secret.' },
      { status: 500 }
    )
  }
}
