'use client'

import { useState } from 'react'
import Link from 'next/link'

const participants = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence'
]

const timelineData = {
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
        { time: 'Après-midi', title: 'Sortie vélo', desc: 'direction château d\'Azay-le-Rideau' },
        { time: 'Soir', title: 'Dégustation vin', desc: 'Château de l\'Aulée' }
      ]},
      { day: 'Dimanche 09/06', items: [
        { time: '3h', title: 'Départ matinal', desc: 'Direction les Ballons' },
        { time: 'Matin', title: 'Mongolfières', desc: 'Domaine des Pierrettes - Lamantin des Vignes' },
        { time: '-midi', title: 'Brunch Babette', desc: 'Tours' },
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
  }
}

export default function Timeline() {
  const [selectedYear, setSelectedYear] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <header className="py-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 hover:text-amber-500 transition">
            🏆 Votez maintenant !
          </h1>
        </Link>
        <p className="text-gray-500">Le Panthéon des Trophées Shalom</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid gap-8">
          {Object.entries(timelineData).map(([year, data]) => (
            <div key={year} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-4">
                <div className="flex justify-between items-center">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold text-amber-900">
                    {data.edition}
                  </span>
                  <span className="text-amber-900 font-bold">{year}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{data.location}</h2>
                <p className="text-gray-500 mb-4">Organisé par {data.organizers}</p>
                
                {data.program && (
                  <div className="space-y-4">
                    {data.program.map((day, i) => (
                      <div key={i} className="border-l-4 border-amber-300 pl-4">
                        <h3 className="font-semibold text-amber-600 mb-2">{day.day}</h3>
                        {day.items.map((item, j) => (
                          <div key={j} className="text-sm text-gray-600 py-1">
                            <span className="font-medium">{item.time}:</span> {item.title} - {item.desc}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}