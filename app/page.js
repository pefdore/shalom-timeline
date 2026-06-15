'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SHALOMS = [
  {
    year: '2024',
    edition: 'Shalom I',
    location: 'Touraine · Luynes',
    dates: '7-9 Juin',
    color: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-900',
    emoji: '🌟',
    description: 'La première édition! Puy du Fou, Vino, et tellement plus...'
  },
  {
    year: '2025',
    edition: 'Shalom II',
    location: 'Vendée · Les Sables',
    dates: '27-30 Juin',
    color: 'from-blue-400 to-cyan-500',
    textColor: 'text-blue-900',
    emoji: '🌊',
    description: 'Acrobranche, kayak, et concert aux arènes!'
  },
  {
    year: '2026',
    edition: 'Shalom III',
    location: 'Loire-Atlantique · Saint Lyphard',
    dates: '5-8 Juin',
    color: 'from-green-400 to-emerald-500',
    textColor: 'text-green-900',
    emoji: '🍀',
    description: 'Escape Game, médiéval, et 1★ Michelin!'
  }
]

const AWARDS_INFO = {
  year: '2026',
  status: 'open',
  dates: '14-21 Juin',
  participants: 14,
  categories: 20
}

export default function Home() {
  const [votingOpen, setVotingOpen] = useState(true)
  const [votingDates, setVotingDates] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setVotingOpen(data.open)
        setVotingDates({ startDate: data.startDate, endDate: data.endDate })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-shalom-gold-light to-white">
      {/* Header */}
      <header className="py-12 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          🏠 Le Projet Shalom
        </h1>
        <p className="text-gray-500 text-lg">Les souvenirs d'un week-end inoubliable entre amis</p>
      </header>

      {/* Shalom Awards Banner */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-sm font-semibold opacity-80 mb-1">
                🏆 Shalom Awards {AWARDS_INFO.year}
              </div>
              <h2 className="text-3xl font-bold mb-2">Le Pantheon des Trophées</h2>
              <p className="opacity-90">
                {votingOpen 
                  ? `Votes ouverts du ${votingDates.startDate} au ${votingDates.endDate}` 
                  : 'Les votes sont fermés'}
              </p>
              <p className="text-sm opacity-75 mt-2">
                {AWARDS_INFO.participants} participants • {AWARDS_INFO.categories} catégories
              </p>
            </div>
            <Link 
              href="/awards"
              className={`px-8 py-4 bg-white text-amber-600 font-bold rounded-full shadow-lg hover:scale-105 transition-transform ${
                !votingOpen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {votingOpen ? 'Voter maintenant 🗳️' : 'Votes fermés 🔒'}
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline des Shaloms */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📅 Les Éditions
        </h2>
        
        <div className="grid gap-6">
          {SHALOMS.map((shalom, index) => (
            <Link 
              key={shalom.year}
              href={`/timeline?year=${shalom.year}`}
              className="block group"
            >
              <div className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 ${index !== SHALOMS.length - 1 ? 'border-b-4 border-gray-100' : ''}`}>
                <div className={`bg-gradient-to-r ${shalom.color} p-4`}>
                  <div className="flex justify-between items-center">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {shalom.edition}
                    </span>
                    <span className={`font-bold ${shalom.textColor}`}>{shalom.year}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{shalom.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {shalom.location}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">{shalom.dates}</p>
                      <p className="text-gray-600">{shalom.description}</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-gray-600 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Fait avec ❤️ pour les amis du Shalom</p>
      </footer>
    </div>
  )
}