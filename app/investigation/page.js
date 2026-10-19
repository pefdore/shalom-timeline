'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import dynamic from 'next/dynamic'

const GazatteMap = dynamic(() => import('./GazetteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      🗺️ Chargement de la carte...
    </div>
  ),
})

const MEMBRES = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence',
]

const TEASERS = [
  '🫖 La théière du groupe chauffe : quelqu\u2019un aurait une "intuition" ce mois-ci...',
  '📈 Pression en hausse : plus le temps passe, plus le gîte semble paradisiaque.',
  '🔍 Les orgas sourient de manière suspecte depuis 3 jours.',
  '📅 Un seul essai par mois. La sagesse, c\u2019est de bien le choisir.',
  '🧠 Astuce : plus les mois passent, plus les indices se dévoilent...',
]

export default function Investigation() {
  const [member, setMember] = useState('')
  const [code, setCode] = useState('')
  const [logged, setLogged] = useState(false)
  const [orgas, setOrgas] = useState(false)
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const [setupData, setSetupData] = useState({ code: '', location: '', clues: ['', '', ''], revealDate: '', organizers: [] })
  const isOrganizer = (state?.organizers || []).includes(member)
  const [teaser, setTeaser] = useState(TEASERS[0])
  const [mapPoints, setMapPoints] = useState([])
  const gazetteSig = (state?.gazette || []).map((g) => g.guess).join('|')
  useEffect(() => {
    if (!gazetteSig) { setMapPoints([]); return }
    const guesses = (state?.gazette || []).map((g) => g.guess)
    fetch('/api/investigation/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guesses }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMapPoints(data.points)
      })
      .catch(() => {})
  }, [gazetteSig])

  const refresh = useCallback(async () => {
    const params = logged ? `?member=${encodeURIComponent(member)}&code=${encodeURIComponent(code)}` : ''
    try {
      const res = await fetch(`/api/investigation${params}`)
      const data = await res.json()
      if (data.success) {
        setState(data)
        setOrgas(Boolean(data.orgas))
      }
    } catch {}
  }, [logged, member, code])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const t = setInterval(() => {
      setTeaser(TEASERS[Math.floor(Math.random() * TEASERS.length)])
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const alreadyPlayed = state?.myMonth === monthKeyNow()

  const submitGuess = async () => {
    if (!guess.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/investigation/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member, code, guess: guess.trim() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
        if (data.alreadyPlayed) await refresh()
        return
      }
      setResult(data)
      setGuess('')
      if (data.correct) {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#c9a227', '#e85d5d', '#2dd4bf'] })
      }
      await refresh()
    } catch {
      setError('Erreur réseau. Le commissariat ne répond pas.')
    } finally {
      setBusy(false)
    }
  }

  const submitSetup = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/investigation/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: setupData.code,
          location: setupData.location,
          clues: setupData.clues.filter(Boolean),
          revealDate: setupData.revealDate,
          organizers: setupData.organizers,
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setSetupOpen(false)
      await refresh()
    } catch {
      setError('Erreur réseau pendant le scellage.')
    } finally {
      setBusy(false)
    }
  }

  if (!logged) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="py-6 text-center px-4">
          <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700">
            ← Retour à l'accueil
          </Link>
        </header>
        <div className="max-w-md mx-auto px-4 pb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🕵️ L'Investigation Shalom</h1>
            <p className="text-center text-gray-500 mb-8">Le lieu secret du prochain week-end. Un essai par mois. À toi de jouer.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qui es-tu ?</label>
                <select value={member} onChange={(e) => setMember(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none">
                  <option value="">Sélectionne ton prénom...</option>
                  {MEMBRES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code secret (4 chiffres)</label>
                <input type="password" maxLength={4} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-center text-2xl tracking-widest" />
              </div>
              {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <button onClick={() => {
                if (!member || code.length !== 4) { setError('Choisis ton prénom et entre ton code secret'); return }
                setLogged(true); setError('')
              }} disabled={!member || code.length !== 4}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50">
                Entrer dans le Bureau des Enquêtes 🕵️
              </button>
              <p className="text-xs text-center text-gray-400">Membre des orgas ? Connecte-toi avec ton code spécial pour sceller le lieu.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="py-6 text-center px-4">
        <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700">
          ← Retour à l'accueil
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🕵️ L'Investigation Shalom</h1>
          {state?.hasLocation ? (
            state.ranking?.length > 0 && !state.revealed ? (
              <div className="mt-2">
                <p className="text-lg text-gray-700">
                  🎉 <b>{state.winner}</b> a démasqué le lieu en premier !
                </p>
                <p className="text-sm text-gray-500 mt-1">Mais l'enquête continue : {state.ranking.length} détective(s) ont trouvé, les autres cherchent encore... Le lieu reste secret jusqu'à la révélation des orgas 🤐</p>
              </div>
            ) : state.revealed ? (
              <p className="text-lg text-gray-700">🕵️ Mystère levé : le lieu était <b>{state.location}</b>.</p>
            ) : (
              <p className="text-gray-500">Un lieu est scellé. {state.attempts} tentatives déjà gravées dans la Gazette...</p>
            )
          ) : (
            <p className="text-gray-500">Les orgas n'ont pas encore scellé le lieu secret. La pression monte...</p>
          )}
          <div className="mt-4 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium italic">
            {teaser}
          </div>
        </div>

        {orgas && !state?.solved && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <button onClick={() => setSetupOpen(!setupOpen)}
              className="w-full flex items-center justify-between font-bold text-gray-800">
              <span>📦 Espace orgas : sceller le lieu</span>
              <span>{setupOpen ? '▲' : '▼'}</span>
            </button>
            {setupOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Qui sont les orgas de cette édition ? (ils ne pourront pas jouer)</p>
                  <div className="flex flex-wrap gap-2">
                    {MEMBRES.map((m) => (
                      <button key={m} type="button"
                        onClick={() => setSetupData((prev) => ({
                          ...prev,
                          organizers: prev.organizers.includes(m)
                            ? prev.organizers.filter((o) => o !== m)
                            : [...prev.organizers, m],
                        }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${setupData.organizers.includes(m) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <input value={setupData.code} onChange={(e) => setSetupData({ ...setupData, code: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  type="password" placeholder="Code orgas (4 chiffres)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none" />
                <input value={setupData.location} onChange={(e) => setSetupData({ ...setupData, location: e.target.value })}
                  placeholder="Lieu secret (ex: Rignac)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none" />
                {setupData.clues.map((clue, i) => (
                  <input key={i} value={clue} onChange={(e) => {
                    const clues = [...setupData.clues]
                    clues[i] = e.target.value
                    setSetupData({ ...setupData, clues })
                  }} placeholder={`Indice n°${i + 1} (dévoilé le mois ${i + 1})`}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
                ))}
                <input type="date" value={setupData.revealDate} onChange={(e) => setSetupData({ ...setupData, revealDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
                <button onClick={submitSetup} disabled={busy || !setupData.code || !setupData.location}
                  className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50">
                  Sceller le coffre 🔒
                </button>
              </div>
            )}
          </div>
        )}

        {state?.hasLocation && !state.revealed && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="font-bold text-gray-800 mb-2">🎯 Ta proposition du mois</h2>
            {isOrganizer ? (
              <div className="bg-slate-100 text-slate-600 px-4 py-4 rounded-xl text-sm">
                🤐 T'es orga cette année, interdit de jouer ! Contente-toi de sourire mystérieusement pendant que le groupe galère.
              </div>
            ) : alreadyPlayed ? (
              <div className="bg-slate-100 text-slate-600 px-4 py-4 rounded-xl text-sm">
                🔒 Essai déjà utilisé ce mois-ci. Contemple les indices et reviens le mois prochain...
              </div>
            ) : (
              <div className="flex space-x-2">
                <input value={guess} onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                  placeholder="Mon hypothèse de lieu..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none" />
                <button onClick={submitGuess} disabled={busy || !guess.trim()}
                  className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50">
                  {busy ? '...' : 'Tenter 🎲'}
                </button>
              </div>
            )}
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mt-3">{error}</div>}
            {result && (
              <div className={`mt-3 px-4 py-4 rounded-xl text-sm font-medium ${result.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <span className="text-2xl block mb-1">{result.emoji}</span>
                {result.verdict}
                {result.correct && result.rank && (
                  <span className="block mt-2 font-bold">🏅 Tu es détective n°{result.rank} du groupe !</span>
                )}
              </div>
            )}
          </div>
        )}

        {state?.ranking?.length > 0 && !state.revealed && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="font-bold text-gray-800 mb-1">🏆 Le Panthéon des Détectives</h2>
            <p className="text-xs text-gray-400 mb-3">Ils ont percé le mystère. Les autres... continuent de chercher.</p>
            <div className="space-y-2">
              {state.ranking.map((r, i) => (
                <div key={i} className={`px-4 py-3 rounded-xl text-sm flex items-center gap-3 ${i === 0 ? 'bg-amber-50 border border-amber-300' : 'bg-gray-50'}`}>
                  <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔎'}</span>
                  <span className="font-bold text-gray-800">{r.member}</span>
                  <span className="text-gray-400">{r.attempts} tentative{r.attempts > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state?.cluesPublished?.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="font-bold text-gray-800 mb-3">🧩 Indices dévoilés ({state.cluesPublished.length}/{state.cluesTotal})</h2>
            <div className="space-y-2">
              {state.cluesPublished.map((c, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                  <span className="font-bold mr-1">Indice {i + 1} :</span>{c}
                </div>
              ))}
              {state.cluesPublished.length < state.cluesTotal && (
                <div className="bg-gray-50 text-gray-400 px-4 py-3 rounded-xl text-sm">
                  🔒 {state.cluesTotal - state.cluesPublished.length} indice(s) encore verrouillé(s)... Patience.
                </div>
              )}
            </div>
          </div>
        )}

        {state?.hasLocation && mapPoints.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="font-bold text-gray-800 mb-1">🗺️ La Map des Ratés</h2>
            <p className="text-xs text-gray-400 mb-3">Toutes les propositions ratées du groupe, géolocalisées avec amour. Clique sur les marqueurs rouges pour rigoler. Le vrai lieu, lui, reste planqué quelque part...</p>
            <GazatteMap points={mapPoints} gazette={state?.gazette || []} />
            {mapPoints.some((p) => !p.found) && (
              <p className="text-xs text-gray-400 mt-2">
                ℹ️ {mapPoints.filter((p) => !p.found).length} proposition(s) introuvable(s) sur une carte — soit elles n'existent pas, soit c'est vraiment très grave.
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="font-bold text-gray-800 mb-3">📰 La Gazette des Ratés</h2>
          {state?.gazette?.length ? (
            <div className="space-y-2">
              {state.gazette.slice(0, 20).map((g, i) => (
                <div key={i} className={`px-4 py-3 rounded-xl text-sm ${g.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
                  <span className="font-bold">{g.member}</span> a osé proposer « <i>{g.guess}</i> »
                  {!g.correct && g.verdict && <span className="block text-gray-500 mt-1">{g.verdict}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune tentative pour l'instant. Sois le premier à oser...</p>
          )}
        </div>
      </div>
    </div>
  )
}

function monthKeyNow() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
