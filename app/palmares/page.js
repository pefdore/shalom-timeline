'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES, MEDALS, buildPalmares } from '@/lib/awards'

const CATEGORY_ORDER = new Map(CATEGORIES.map(c => [c.title, c.id]))

export default function Palmares() {
  const [results, setResults] = useState(null)
  const [voterCount, setVoterCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchResults = () => fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.success) return
        setResults(data.results || {})
        setVoterCount(data.voters || 0)
        setLastUpdate(new Date().toLocaleTimeString('fr-FR'))
        setLoading(false)
      })
      .catch(() => {})
    fetchResults()
    const interval = setInterval(fetchResults, 10000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const palmares = results ? buildPalmares(results) : []
  const podiums = results || {}
  const sortedCategories = Object.entries(podiums).sort(
    (a, b) => (CATEGORY_ORDER.get(a[0]) || 999) - (CATEGORY_ORDER.get(b[0]) || 999)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <header className="py-6 text-center px-4">
        <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700">
          ← Retour à l&apos;accueil
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center slide-up">
          <div className="text-6xl mb-3 float-gentle">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Le Palmarès Live</h1>
          <p className="text-gray-500 mb-4">des Trophées Shalom</p>
          <p className="text-sm text-gray-400 italic mb-6">
            Le classement bouge à chaque vote. Ici, on ne perd pas : on attend son trophée. 💛
          </p>
          {loading ? (
            <p className="text-gray-400 text-sm py-4">Les votes tombent, on compte tout ça… ⏳</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div>
                <p className="text-2xl font-bold text-amber-600 count-beat" key={voterCount}>{voterCount || '—'}</p>
                <p className="text-xs text-gray-400">votant·e·s</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{Object.keys(podiums).length}</p>
                <p className="text-xs text-gray-400">catégories lancées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{palmares.length}</p>
                <p className="text-xs text-gray-400">lauréat·e·s en lice</p>
              </div>
            </div>
          )}
          {lastUpdate && (
            <p className="text-xs text-gray-300 mt-4">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse inline-block mr-1" />
              Mis à jour à {lastUpdate} · rafraîchissement auto
            </p>
          )}
        </div>

        {palmares.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👑 Classement général</h2>
            <div className="space-y-2">
              {palmares.slice(0, 10).map((p, idx) => (
                <div key={p.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <span className="w-7 text-center font-bold text-gray-400">{p.rank}</span>
                  <span className="font-semibold text-gray-700 flex-1">{p.name}</span>
                  <span className="text-sm whitespace-nowrap">{p.gold > 0 && `🥇×${p.gold} `}{p.silver > 0 && `🥈×${p.silver} `}{p.bronze > 0 && `🥉×${p.bronze}`}</span>
                  <span className="text-xs text-gray-400">{p.total} podium{p.total > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedCategories.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎊 Podiums par catégorie</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sortedCategories.map(([category, winners]) => {
                const cat = CATEGORIES.find(c => c.title === category)
                return (
                  <div key={category} className="bg-gray-50 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {cat ? `${cat.emoji} ` : '🏅 '}{category}
                    </p>
                    {winners.map((w) => (
                      <p key={w.name} className="text-sm text-gray-600">
                        {MEDALS[w.rank - 1] || '🎖️'} {w.name} <span className="text-gray-400">· {w.points} pts</span>
                      </p>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && sortedCategories.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p className="text-gray-500">Aucun vote pour l&apos;instant. Sois la première légende à voter ! 🎉</p>
            <Link href="/awards" className="inline-block mt-4 px-6 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600">
              Voter maintenant ⚔️
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
