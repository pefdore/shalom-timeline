import { NextResponse } from 'next/server'

const DEV_MODE = !process.env.GOOGLE_GEO_KEY
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

export async function POST(request) {
  try {
    const { guesses } = await request.json()
    if (!Array.isArray(guesses) || guesses.length === 0) {
      return NextResponse.json({ success: true, points: [] })
    }
    if (guesses.length > 60) {
      return NextResponse.json({ success: false, message: 'Trop de requêtes' }, { status: 400 })
    }

    const unique = [...new Set(guesses.map((g) => String(g || '').trim()).filter(Boolean))]

    const points = await Promise.all(unique.slice(0, 30).map(async (guess) => {
      try {
        const url = `${NOMINATIM}?q=${encodeURIComponent(guess)}&format=json&limit=1&countrycodes=fr`
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'shalom-timeline/1.0 (jeu entre amis)',
            'Accept-Language': 'fr',
          },
        })
        if (!res.ok) return { guess, found: false }
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return { guess, found: false }
        return {
          guess,
          found: true,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          label: data[0].display_name?.split(',').slice(0, 2).join(',') || guess,
        }
      } catch {
        return { guess, found: false }
      }
    }))

    return NextResponse.json({ success: true, points })
  } catch (error) {
    console.error('Erreur géocodage:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur de géocodage' },
      { status: 500 }
    )
  }
}
