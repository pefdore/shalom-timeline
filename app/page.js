'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SHALOMS = {
  '2024': {
    edition: 'Shalom I',
    year: '2024',
    location: 'Touraine · Luynes',
    organizers: 'Anne-Clémence & Pierre-François',
    video: 'https://www.youtube.com/embed/VzcGup8aSY0?si=IWg_d1m5WgZor3cY',
    quotes: [],
    program: [
      { day: 'Vendredi 07/06', items: [
        { time: 'Matin', title: 'Départ de Rennes', desc: 'Direction le Puy du Fou' },
        { time: '9h', title: 'Arrivée au Puy du Fou', desc: 'Journée complète au parc' },
        { time: 'Soir', title: 'Direction Luynes', desc: 'Propriété "La Bennerie Tours Loire Valley"' }
      ]},
      { day: 'Samedi 08/06', items: [
        { time: 'Matin', title: 'Matinée chill', desc: 'Relax à la maison' },
        { time: 'Déjeuner', title: 'Pause Vietnamienne', desc: 'Repas saveurs Vietnam' },
        { time: 'Après-midi', title: 'Sortie vélo', desc: 'Direction château d\'Azay-le-Rideau' },
        { time: 'Soir', title: 'Dégustation vin', desc: 'Château de l\'Aulée' }
      ]},
      { day: 'Dimanche 09/06', items: [
        { time: '3h', title: 'Départ matinal', desc: 'Direction les Ballons' },
        { time: 'Matin', title: 'Mongolfières', desc: 'Domaine des Pierrettes - Lamantin des Vignes' },
        { time: 'Midi', title: 'Brunch Babette', desc: 'Tours' },
        { time: 'Aprem', title: 'Retour Rennes', desc: 'Fin du Shalom I' }
      ]}
    ]
  },
  '2025': {
    edition: 'Shalom II',
    year: '2025',
    location: 'Vendée · Les Sables d\'Olonne',
    organizers: 'Caroline & Jérémy',
    video: 'https://www.youtube.com/embed/exQo-ULpR9o?si=YhFVe_I_dNovypyn',
    quotes: [],
    program: [
      { day: 'Vendredi 27/06', items: [
        { time: 'Soir', title: 'Accueil', desc: '300 impasse des Loirs, Les Sables d\'Olonne' }
      ]},
      { day: 'Samedi 28/06', items: [
        { time: 'Matin', title: 'Acrobranche', desc: 'Parc deloisirs - Le Grand Défi' },
        { time: 'Midi', title: 'BBQ', desc: 'Déjeuner barbecue' },
        { time: 'Aprem', title: 'Chill', desc: 'Piscine, Palet' },
        { time: 'Fin APM', title: 'Apéro', desc: 'Bar de Sauvertère, route de la mer' }
      ]},
      { day: 'Dimanche 29/06', items: [
        { time: 'Matin', title: 'Kayak', desc: 'Sur les berges' },
        { time: 'Aprem', title: 'Chill', desc: 'Piscine, repos, lecture' },
        { time: 'Soir', title: 'Concert', desc: 'Black Eyed Peas - Aréna des Sables d\'Olonne' }
      ]},
      { day: 'Lundi 30/06', items: [
        { time: 'Midi', title: 'Brunch iodé', desc: 'Le Park - La Guittière, chemin du Grand Marais' }
      ]}
    ]
  },
  '2026': {
    edition: 'Shalom III',
    year: '2026',
    location: 'Loire-Atlantique · Saint Lyphard',
    organizers: 'Coraline & Arnaud',
    video: 'https://www.youtube.com/embed/Tgaqf_0Ocb4?si=aOZsl0RlKf6xaBDR',
    quotes: ['"Top intervention"', '"Schneckenbush"', '"Laetitia Laetitia Laetitia"', '"Mystifier"', '"Churros"'],
    program: [
      { day: 'Vendredi 05/06', items: [
        { time: '21h', title: 'Accueil', desc: 'Soirée galettes' }
      ]},
      { day: 'Samedi 06/06', items: [
        { time: 'Matin', title: 'Escape Game', desc: 'Hommes: Ratatouille / Filles: Sherlock Holmes' },
        { time: 'Aprem', title: 'Chill', desc: 'Tournante ping pong, spa, swim volley' },
        { time: 'Soir', title: 'Sortie', desc: 'Fête médiévale de Guérande' }
      ]},
      { day: 'Dimanche 07/06', items: [
        { time: 'Matin', title: 'Sport', desc: 'Footing ou renforcement' },
        { time: 'Midi', title: 'Sortie vélo', desc: '22km → picnic étang de Sandun' },
        { time: 'Soir', title: 'Dîner', desc: 'La Mare aux Oiseaux (1★ Michelin)' }
      ]},
      { day: 'Lundi 08/06', items: [
        { time: 'Matin', title: 'Balade', desc: 'Pouliguen' },
        { time: 'Midi', title: 'Fin', desc: 'QG Beach' }
      ]}
    ]
  },'2027': {
    edition: 'Shalom SP · Hors Série',
    year: '2027',
    location: 'Vendée · La Millière',
    organizers: 'Tout le groupe',
    video: null,
    quotes: [],
    program: [
      { day: 'Jeudi 31/12', items: [
        { time: 'Soir', title: 'Réveillon du Nouvel An', desc: 'La Millière' }
      ]},
      { day: 'Vendredi 01/01', items: [
        { time: 'Matin', title: 'Chill', desc: 'Repos et récupération' }
      ]},
      { day: 'Samedi 02/01', items: [
        { time: 'Matin', title: 'Départ', desc: 'Fin du SP Hors Série' }
      ]}
    ]
  }
}

export default function Home() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [selectedYear, setSelectedYear] = useState('2026')
  const [showModal, setShowModal] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
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

    const targetDate = new Date('2027-06-10T20:30:00')
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

  const selectedShalom = SHALOMS[selectedYear]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="py-16 text-center px-4">
        <h1 className="text-5xl font-bold text-amber-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Shalom <span className="text-amber-600">Project</span>
        </h1>
        <p className="text-amber-600 uppercase tracking-widest text-sm">Les week-ends annuels du groupe</p>
        <div className="flex justify-center gap-12 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">4</div>
            <div className="text-xs text-amber-400 uppercase tracking-wider mt-1">Éditions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">14</div>
            <div className="text-xs text-amber-400 uppercase tracking-wider mt-1">Copains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">∞</div>
            <div className="text-xs text-amber-400 uppercase tracking-wider mt-1">Souvenirs</div>
          </div>
        </div>
      </header>

      {/* Countdown */}
      <div className="max-w-xl mx-auto px-4 mb-8">
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Prochain Shalom IV</div>
          <div className="text-sm text-amber-500 mb-4">10-13 Juin 2027 · Laetitia & Matthias</div>
          <div className="flex justify-center gap-4">
            <div className="bg-white rounded-xl p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-amber-700">{countdown.days}</div>
              <div className="text-xs text-amber-400">jours</div>
            </div>
            <div className="bg-white rounded-xl p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-amber-700">{countdown.hours}</div>
              <div className="text-xs text-amber-400">h</div>
            </div>
            <div className="bg-white rounded-xl p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-amber-700">{countdown.minutes}</div>
              <div className="text-xs text-amber-400">min</div>
            </div>
            <div className="bg-white rounded-xl p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-amber-700">{countdown.seconds}</div>
              <div className="text-xs text-amber-400">s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pb-16 relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-teal-400 opacity-30 transform -translate-x-1/2 hidden md:block"></div>

        {/* Shalom Awards Banner */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">🏆 Shalom Awards 2026</h2>
              <p className="opacity-90 text-sm">
                {votingOpen 
                  ? `Votes ouverts du ${votingDates.startDate} au ${votingDates.endDate}` 
                  : 'Les votes sont fermés'}
              </p>
            </div>
            <Link 
              href="/awards"
              className={`px-6 py-3 bg-white text-amber-600 font-bold rounded-full shadow-lg hover:scale-105 transition-transform ${!votingOpen ? 'opacity-50' : ''}`}
            >
              {votingOpen ? 'Participer 🗳️' : 'Fermés 🔒'}
            </Link>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-12 relative">
          {Object.entries(SHALOMS).map(([year, shalom]) => (
            <div key={year} className="relative flex items-center justify-center md:justify-start md:grid md:grid-cols-2 gap-8">
              {/* Dot */}
              <div className="absolute left-1/2 w-4 h-4 bg-amber-400 rounded-full transform -translate-x-1/2 z-10 shadow-md hidden md:block" 
                   style={{ top: '28px' }}></div>
              
              {/* Card */}
              <div 
                className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all border-2 border-transparent hover:border-amber-300 w-full md:col-start-${year === '2024' ? '1' : year === '2025' ? '2' : '1'}`}
                onClick={() => { setSelectedYear(year); setShowModal(true); }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {shalom.edition}
                  </span>
                  <span className="text-amber-400 font-semibold">{year}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{shalom.location}</h3>
                <p className="text-gray-500 text-sm mb-4">Organisé par {shalom.organizers}</p>
                <div className="flex items-center justify-between">
                  {year === '2026' && shalom.quotes[0] && (
                    <span className="text-gray-400 text-sm italic">{shalom.quotes[0]}</span>
                  )}
                  {year !== '2026' && <span></span>}
                  <span className="text-amber-500 text-sm font-medium flex items-center gap-1">
                    Voir plus <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-5 right-5 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => setShowModal(false)}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
              {selectedShalom.edition}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-1">{selectedShalom.year} · {selectedShalom.location}</h2>
            <p className="text-gray-500 mb-6">Organisé par {selectedShalom.organizers}</p>

            {/* Program */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-4">Programme</h3>
              {selectedShalom.program.map((day, i) => (
                <div key={i} className="mb-4">
                  <div className="text-amber-600 font-semibold text-sm pb-2 border-b border-amber-100 mb-3">{day.day}</div>
                  {day.items.map((item, j) => (
                    <div key={j} className="flex gap-3 mb-2 p-2 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors">
                      <span className="text-amber-600 text-xs font-semibold min-w-[50px] bg-amber-100 px-2 py-1 rounded text-center">{item.time}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-800">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Quotes */}
            {selectedShalom.quotes.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Expressions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedShalom.quotes.map((q, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm italic">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-amber-400 text-sm">
        <p>Shalom Project · 14 copains · Depuis 2024</p>
      </footer>
    </div>
  )
}