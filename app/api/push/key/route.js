import { NextResponse } from 'next/server'
import { getPushPublicKey } from '@/lib/push'

export async function GET() {
  try {
    return NextResponse.json({ success: true, publicKey: getPushPublicKey() })
  } catch (error) {
    console.error('Erreur clé VAPID:', error)
    return NextResponse.json(
      { success: false, message: 'Clé push indisponible.' },
      { status: 500 }
    )
  }
}
