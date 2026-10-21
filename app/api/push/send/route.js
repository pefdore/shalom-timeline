import { NextResponse } from 'next/server'
import { sendPushToMembers, listSubscribedMembers } from '@/lib/push'
import { checkOrgasCode } from '@/lib/investigation'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!checkOrgasCode(code)) {
    return NextResponse.json(
      { success: false, message: 'Réservé aux orgas. Montre patte blanche \ud83d\udd75\ufe0f' },
      { status: 401 }
    )
  }

  try {
    const subscribed = await listSubscribedMembers()
    return NextResponse.json({ success: true, subscribed })
  } catch (error) {
    console.error('Erreur liste abonnés:', error)
    return NextResponse.json(
      { success: false, message: 'Impossible de lire les abonnés.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { code, members, title, body: message, url } = body

    if (!checkOrgasCode(code)) {
      return NextResponse.json(
        { success: false, message: 'Code orgas invalide. Les notifications sont un pouvoir trop grand pour toi.' },
        { status: 401 }
      )
    }

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Il faut un titre et un message. Même Nostradamus annonce des trucs précis.' },
        { status: 400 }
      )
    }

    const result = await sendPushToMembers(Array.isArray(members) ? members : [], {
      title: String(title).slice(0, 100),
      body: String(message).slice(0, 300),
      url,
    })

    return NextResponse.json({
      success: true,
      ...result,
      message: `Notification envoyée à ${result.sent} portable(s) \ud83d\udcf3`,
    })
  } catch (error) {
    console.error('Erreur envoi push:', error)
    return NextResponse.json(
      { success: false, message: 'Le satellite de la NASA est occupé. R\u00e9essaie.' },
      { status: 500 }
    )
  }
}
