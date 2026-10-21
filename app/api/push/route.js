import { NextResponse } from 'next/server'
import { saveSubscription, listSubscribedMembers } from '@/lib/push'
import { isKnownMember } from '@/lib/investigation'

export async function POST(request) {
  try {
    const body = await request.json()
    const { member, subscription } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, message: 'Abonnement invalide.' },
        { status: 400 }
      )
    }

    if (member && !isKnownMember(member)) {
      return NextResponse.json(
        { success: false, message: 'Prénom inconnu au bataillon.' },
        { status: 401 }
      )
    }

    await saveSubscription(member || 'Anonyme', subscription)
    const subscribed = await listSubscribedMembers()
    return NextResponse.json({ success: true, subscribed })
  } catch (error) {
    console.error('Erreur abonnement push:', error)
    return NextResponse.json(
      { success: false, message: 'Impossible d\u2019enregistrer l\u2019abonnement.' },
      { status: 500 }
    )
  }
}
