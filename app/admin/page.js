'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PushAdmin from '../PushAdmin'

const MEMBRES = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence',
]

export default function AdminPage() {
  const [code, setCode] = useState('')
  const [logged, setLogged] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('shalom-admin-code')
    if (saved) { setCode(saved); setLogged(true) }
  }, [])

  const login = async () => {
    if (!code || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/push/send?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('shalom-admin-code', code)
        setLogged(true)
      } else {
        setError(data.message)
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setBusy(false)
    }
  }

  if (!logged) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="py-6 text-center px-4">
          <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm">
            ← Retour à l’accueil
          </Link>
        </header>
        <div className="max-w-md mx-auto px-4 pb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🔐 Console Admin</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">Gestion des notifications push du site. Réservée à l’admin, pas aux orgas (eux, ça change tous les ans).</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code admin (4 chiffres)</label>
                <input type="password" maxLength={4} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-center text-2xl tracking-widest" />
              </div>
              {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <button onClick={login} disabled={code.length !== 4 || busy}
                className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50">
                {busy ? '⏳ Vérification...' : 'Ouvrir la console 🔐'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="py-6 text-center px-4">
        <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm">
          ← Retour à l’accueil
        </Link>
      </header>
      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔐 Console Admin</h1>
          <p className="text-gray-500 text-sm">Envoie des notifications push à tout le groupe ou à des personnes précises.</p>
        </div>
        <PushAdmin code={code} membres={MEMBRES} />
      </div>
    </div>
  )
}
