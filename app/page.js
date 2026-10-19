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
    emoji: '🌟',
    description: 'La première édition! Puy du Fou, Vino, et tellement plus...'
  },
  {
    year: '2025',
    edition: 'Shalom II',
    location: 'Vendée · Les Sables',
    dates: '27-30 Juin',
    color: 'from-blue-400 to-cyan-500',
    emoji: '🌊',
    description: 'Acrobranche, kayak, et concert aux arènes!'
  },
  {
    year: '2026',
    edition: 'Shalom III',
    location: 'Loire-Atlantique · Saint Lyphard',
    dates: '5-8 Juin',
    color: 'from-green-400 to-emerald-500',
    emoji: '🍀',
    description: 'Escape Game, médiéval, et 1★ Michelin!'
  },
  {
    year: '2027',
    edition: 'Shalom SP',
    location: 'Vendée · La Millière',
    dates: '31 Déc - 02 Jan',
    color: 'from-purple-400 to-fuchsia-500',
    emoji: '🎉',
    description: 'Hors série : réveillon du Nouvel An à La Millière !'
  }
]

export default function Home() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [votingOpen, setVotingOpen] = useState(true)
  const [votingDates, setVotingDates] = useState({ startDate: '', endDate: '' })
  const [selectedYear, setSelectedYear] = useState('2027')

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setVotingOpen(data.open)
        setVotingDates({ startDate: data.startDate, endDate: data.endDate })
      })
      .catch(() => {})

    const targetDate = new Date('2026-12-31T20:00:00')
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const selectedShalom = SHALOMS.find(s => s.year === selectedYear)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-100">
      {/* Header avec titre principal */}
      <header className="py-8 text-center px-4">
        <h1 className="text-5xl font-bold text-amber-800 mb-2">
          🏠 Le Projet Shalom
        </h1>
        <p className="text-amber-600 text-lg">Les souvenirs d'un week-end inoubliable entre amis</p>
      </header>

      {/* Timeline horizontale */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex justify-center items-center gap-4 overflow-x-auto pb-4">
          {SHALOMS.map((shalom, index) => (
            <button
              key={shalom.year}
              onClick={() => setSelectedYear(shalom.year)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl transition-all ${
                selectedYear === shalom.year 
                  ? `bg-gradient-to-r ${shalom.color} text-white shadow-xl scale-105` 
                  : 'bg-white/50 text-amber-800 hover:bg-white'
              }`}
            >
              <span className="text-2xl mr-2">{shalom.emoji}</span>
              <span className="font-bold">{shalom.edition}</span>
              <span className="ml-2 opacity-75">({shalom.year})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Carte du Shalom sélectionné */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${selectedShalom?.color} p-6`}>
            <div className="flex justify-between items-center">
              <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-white">
                {selectedShalom?.edition}
              </span>
              <span className="text-white font-bold text-xl">{selectedShalom?.year}</span>
            </div>
          </div>
          
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              📍 {selectedShalom?.location}
            </h2>
            <p className="text-gray-500 mb-4">{selectedShalom?.dates}</p>
            <p className="text-gray-600 text-lg mb-6">{selectedShalom?.description}</p>
            
            <Link 
              href={`/timeline?year=${selectedYear}`}
              className="inline-block px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
            >
              Voir le détail →
            </Link>
          </div>
        </div>
      </div>

      {/* Compte à rebours */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-6">⏰ Prochain Shalom SP · Réveillon</h3>
          <div className="flex justify-center gap-4">
            <div className="bg-amber-100 rounded-xl p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-amber-600">{countdown.days}</div>
              <div className="text-xs text-amber-800">jours</div>
            </div>
            <div className="bg-amber-100 rounded-xl p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-amber-600">{countdown.hours}</div>
              <div className="text-xs text-amber-800">heures</div>
            </div>
            <div className="bg-amber-100 rounded-xl p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-amber-600">{countdown.minutes}</div>
              <div className="text-xs text-amber-800">min</div>
            </div>
            <div className="bg-amber-100 rounded-xl p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-amber-600">{countdown.seconds}</div>
              <div className="text-xs text-amber-800">sec</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Shalom Awards - Bouton d'accès */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">🏆 Shalom Awards {votingDates.startDate ? votingDates.startDate.split('-')[0] : '2026'}</h2>
              <p className="opacity-90">
                {votingOpen 
                  ? `Votes ouverts du ${votingDates.startDate} au ${votingDates.endDate}` 
                  : 'Les votes sont fermés'}
              </p>
              <p className="text-sm opacity-75 mt-2">
                14 participants • 20 catégories
              </p>
            </div>
            <Link 
              href="/awards"
              className={`px-8 py-4 bg-white text-amber-600 font-bold rounded-full shadow-lg hover:scale-105 transition-transform ${!votingOpen ? 'opacity-50' : ''}`}
            >
              {votingOpen ? 'Participer aux Awards 🗳️' : 'Votes fermés 🔒'}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-amber-400 text-sm">
        <p>Fait avec ❤️ pour les amis du Shalom</p>
      </footer>
    </div>
  )
}