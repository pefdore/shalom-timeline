import { NextResponse } from 'next/server'
import {
  readState, saveState, readGazette, addGazetteEntry,
  checkMemberCode, checkOrgasCode, isKnownMember, monthKey,
  isMatch, wrongVerdict, alreadyPlayedMsg,
} from '@/lib/investigation'

export async function POST(request) {
  try {
    const body = await request.json()
    const { member, code, guess } = body

    if (!member || !code || !guess) {
      return NextResponse.json(
        { success: false, message: 'Données incomplètes, commissionnaire.' },
        { status: 400 }
      )
    }
    if (!isKnownMember(member)) {
      return NextResponse.json(
        { success: false, message: "Alerte triche ! Tu n'es pas dans la liste des enquêteurs autorisés." },
        { status: 401 }
      )
    }
    if (checkOrgasCode(code)) {
      return NextResponse.json(
        { success: false, message: 'Un orgas qui devine son propre lieu ? Interdit par la convention de Genève du Shalom.' },
        { status: 403 }
      )
    }
    const [state, gazette] = await Promise.all([readState(), readGazette()])
    if ((state.organizers || []).includes(member)) {
      return NextResponse.json(
        { success: false, message: '🤐 T\'es orga cette année, interdit de jouer ! Contente-toi de sourire mystérieusement.' },
        { status: 403 }
      )
    }
    if (!(await checkMemberCode(member, code))) {
      return NextResponse.json(
        { success: false, message: 'Alerte triche ! Ton code est aussi faux que les alibis de Matthias.' },
        { status: 401 }
      )
    }

    if (!state.location) {
      return NextResponse.json(
        { success: false, message: "Aucun lieu n'est encore scellé. Les orgas préparent le mystère..." },
        { status: 400 }
      )
    }
    if (state.solved) {
      return NextResponse.json(
        { success: false, message: `Enquête close ! Le lieu était ${state.location}. Trop tard, Sherlock.` },
        { status: 400 }
      )
    }

    const month = monthKey()
    const alreadyPlayed = gazette.some((g) => g.member === member && g.month === month)
    if (alreadyPlayed) {
      return NextResponse.json(
        { success: false, message: alreadyPlayedMsg(), alreadyPlayed: true },
        { status: 429 }
      )
    }

    const correct = isMatch(guess, state.location)
    const verdict = correct
      ? { emoji: '🎉', msg: "C'EST ÇA ! Dossier bouclé, légende du groupe !" }
      : wrongVerdict(guess)

    await addGazetteEntry({
      member,
      guess: String(guess).trim().slice(0, 100),
      month,
      correct,
      verdict: `${verdict.emoji} ${verdict.msg}`,
    })

    if (correct) {
      await saveState({ solved: true, winner: member, solvedAt: new Date().toISOString() })
    }

    return NextResponse.json({
      success: true,
      correct,
      verdict: verdict.msg,
      emoji: verdict.emoji,
      alreadyPlayed: false,
    })
  } catch (error) {
    console.error('Erreur guess enquête:', error)
    return NextResponse.json(
      { success: false, message: 'Le commissariat est en panne. Réessaie.' },
      { status: 500 }
    )
  }
}
