'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { CATEGORIES, MEDALS, POINTS_BY_RANK } from '@/lib/awards'

const PARTICIPANTS = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence'
]

const RANK_LABELS = ['🥇 1re place · 3 pts', '🥈 2e place · 2 pts', '🥉 3e place · 1 pt']

const PROGRESS_MESSAGES = [
  { threshold: 0, message: '🎉 C\'est parti ! Prends ton temps, il n\'y a pas de mauvais vote.' },
  { threshold: 10, message: '☕ On s\'échauffe en douceur, comme un bon café du matin.' },
  { threshold: 25, message: '🔥 Tu es dans le rythme ! Le gîte est déjà fier de toi.' },
  { threshold: 40, message: '💪 Plus d\'un tiers de la route. Les trophées se sentent observés.' },
  { threshold: 50, message: '⚖️ La moitié ! Rappel : ici, on vote avec le cœur ET le rire.' },
  { threshold: 65, message: '🌟 Tes choix sont beaux. Non, vraiment, ils le sont.' },
  { threshold: 75, message: '🎭 Les podiums se remplissent, les souvenirs aussi !' },
  { threshold: 90, message: '🏆 Dernière ligne droite, tu es une légende de la persévérance.' },
  { threshold: 100, message: '✨ Dernière catégorie ! Encore un effort, tout le groupe t\'applaudit.' },
]

const TICKER_PHRASES = [
  'FLASH : {name} vient de voter avec le cœur, le gîte est fier !',
  'MÉTÉO SHALOM : ensoleillé avec 100% de chances de rires ce week-end.',
  'RUMEUR : {name} et {name2} auraient ri en même temps à 3 km de distance.',
  'BREAKING : {name} vient de recevoir 3 compliments virtuels pour sa gentillesse.',
  'INFO : le coffee-shop local déclare le week-end « officiellement excellent ».',
  'EXCLUSIF : {name} hésite entre {name2} et... {name3}. Décision impossible.',
  'ALERTE BONHEUR : le gîte a atteint un niveau record de bienveillance.',
  'SPORT : {name} mène la course aux sourires, {name2} talonne avec panache.',
]

const VOTER_PROFILES = [
  {
    key: 'generous',
    label: 'Le Cœur Sur la Main',
    blurb: 'Tu aimes tout le monde et le week-end le sait.',
    emoji: '💛',
  },
  {
    key: 'loyal',
    label: 'Le Pilier du Groupe',
    blurb: 'Fidèle en amitié comme au podium. Chapeau bas.',
    emoji: '🗿',
  },
  {
    key: 'adventurer',
    label: 'L\'Explorateur des Talents',
    blurb: 'Tu vois le meilleur chez chacun·e, même dans la cave.',
    emoji: '🧭',
  },
]

function pickRandom(arr, exclude = []) {
  const pool = arr.filter(x => !exclude.includes(x))
  return pool[Math.floor(Math.random() * pool.length)] || arr[0]
}

export default function Awards() {
  const [step, setStep] = useState('login')
  const [selectedMember, setSelectedMember] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [currentCategory, setCurrentCategory] = useState(0)
  const [votes, setVotes] = useState({})
  const [dragToken, setDragToken] = useState(null)
  const [tickerMessage, setTickerMessage] = useState('')
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

    const interval = setInterval(() => {
      const phrase = TICKER_PHRASES[Math.floor(Math.random() * TICKER_PHRASES.length)]
      setTickerMessage(phrase
        .replace(/{name}/g, () => pickRandom(PARTICIPANTS))
        .replace(/{name2}/g, () => pickRandom(PARTICIPANTS))
        .replace(/{name3}/g, () => pickRandom(PARTICIPANTS)))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleDragStart = (e, participant) => {
    setDragToken(participant)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, rank) => {
    e.preventDefault()
    if (!dragToken) return
    const categoryId = CATEGORIES[currentCategory].id
    const currentVotes = votes[categoryId] || {}
    const newCategoryVotes = { ...currentVotes }

    for (const [p, r] of Object.entries(currentVotes)) {
      if (p === dragToken && r !== rank) delete newCategoryVotes[p]
      else if (r === rank && p !== dragToken) delete newCategoryVotes[p]
    }
    newCategoryVotes[dragToken] = rank

    setVotes(prev => ({ ...prev, [categoryId]: newCategoryVotes }))
    setDragToken(null)
  }

  const removeVote = (participant) => {
    const categoryId = CATEGORIES[currentCategory].id
    const newCategoryVotes = { ...votes[categoryId] }
    delete newCategoryVotes[participant]
    setVotes(prev => ({ ...prev, [categoryId]: newCategoryVotes }))
  }

  const submitVotes = async () => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: selectedMember, votes })
      })
      const data = await response.json()
      if (!data.success) { setError(data.message); return }
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#c9a227', '#e85d5d', '#2dd4bf', '#fdf6e3'] })
      setStep('finished')
    } catch (err) { setError('Erreur lors de l\'envoi. Réessayez.') }
  }

  const getProfile = () => {
    const totalMentions = Object.values(votes).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
    const uniquePeople = new Set(Object.values(votes).flatMap(cat => Object.keys(cat)))
    const uniqueRatio = uniquePeople.size / Math.max(totalMentions, 1)
    if (uniqueRatio >= 0.55) return VOTER_PROFILES[2]
    if (totalMentions >= 40) return VOTER_PROFILES[1]
    return VOTER_PROFILES[0]
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <header className="py-6 text-center px-4">
          <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700">
            ← Retour à l'accueil
          </Link>
        </header>
        <div className="max-w-md mx-auto px-4 pb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🏆 Le Panthéon</h1>
            <p className="text-center text-gray-500 mb-4">des Trophées Shalom</p>
            <p className="text-center text-sm text-gray-400 mb-8 italic">
              Ici, on célèbre tout le monde. Chaque trophée est un câlin en forme de podium. 💛
            </p>
            {!votingOpen && (
              <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl text-sm mb-6">
                <p className="font-bold">⏰ Votes fermés</p>
                <p>Les votes rouvriront du {votingDates.startDate} au {votingDates.endDate}</p>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qui es-tu ?</label>
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none">
                  <option value="">Sélectionne ton prénom...</option>
                  {PARTICIPANTS.map(p => <option key={p} value={p}>{p}</option>)}
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
              <button onClick={async () => {
                if (!selectedMember || code.length !== 4) { setError('Choisis ton prénom et entre le code secret'); return }
                try {
                  const res = await fetch(`/api/login?member=${selectedMember}&code=${code}`)
                  const data = await res.json()
                  if (data.success) { setStep('voting'); setError('') }
                  else { setError(data.message || 'Code invalide') }
                } catch { setStep('voting') }
              }} disabled={!selectedMember || code.length !== 4 || !votingOpen}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50">
                {votingOpen ? 'Entrer dans l\'Arène ⚔️' : 'Votes fermés 🔒'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'voting') {
    const category = CATEGORIES[currentCategory]
    const categoryVotes = votes[category.id] || {}
    const progress = (currentCategory / CATEGORIES.length) * 100
    const progressMsg = [...PROGRESS_MESSAGES].reverse().find(m => progress >= m.threshold)?.message || ''
    const canContinue = Object.keys(categoryVotes).length >= 3
    const isLast = currentCategory === CATEGORIES.length - 1

    return (
      <div className="min-h-screen bg-yellow-50">
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progression</span>
              <span>{currentCategory + 1} / {CATEGORIES.length}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-amber-600 mt-2 font-medium">{progressMsg}</p>
          </div>
        </div>

        <div className="pt-28 pb-24 px-4 max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
            ← Quitter
          </Link>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{category.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{category.title}</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">{category.desc}</p>
            <p className="text-amber-500 text-xs max-w-md mx-auto mt-2 italic">{category.hint}</p>
          </div>

          <div className="flex justify-center items-end gap-4 mb-4">
            {[2, 3, 1].map((rank) => {
              const occupant = Object.keys(categoryVotes).find(p => categoryVotes[p] === rank)
              const base = rank === 3 ? 'w-28 h-[140px] from-yellow-400 to-yellow-300' : rank === 2 ? 'w-24 h-[100px] from-gray-300 to-gray-200' : 'w-24 h-[70px] from-orange-300 to-orange-200'
              return (
                <div key={rank} className={`${base} bg-gradient-to-t rounded-t-lg flex flex-col items-center justify-end pb-2 cursor-pointer`}
                  onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, rank)}>
                  {occupant ? (
                    <div className="text-center">
                      <div className="rounded-full bg-white/70 backdrop-blur flex items-center justify-center font-bold text-gray-700 text-xs px-3 py-2 shadow mb-1 cursor-pointer"
                        onClick={() => removeVote(occupant)} title="Clique pour retirer">
                        {occupant}
                      </div>
                      <span className="text-xs font-bold text-gray-600">{MEDALS[rank - 1]}</span>
                    </div>
                  ) : <span className="text-xs text-gray-500">{MEDALS[rank - 1]} {POINTS_BY_RANK[rank - 1]} pt{POINTS_BY_RANK[rank - 1] > 1 ? 's' : ''}</span>}
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mb-8">🥇 3 pts · 🥈 2 pts · 🥉 1 pt — glisse, échange, ou clique sur un nom pour le retirer.</p>

          <div className="mb-8">
            <p className="text-center text-sm text-gray-500 mb-4">Glisse les copains sur le podium 👇 (toi inclus·e, le self-love est autorisé)</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PARTICIPANTS.map(participant => {
                const isOnPodium = participant in categoryVotes
                return (
                  <div key={participant} draggable={!isOnPodium} onDragStart={(e) => handleDragStart(e, participant)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${isOnPodium ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white shadow-md hover:shadow-lg hover:scale-105 cursor-grab'}`}>
                    {participant}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {!isLast && (
              <button onClick={() => setCurrentCategory(prev => prev + 1)}
                className="px-6 py-3 text-gray-500 rounded-full hover:bg-gray-200 transition-all text-sm font-medium">
                Passer cette catégorie →
              </button>
            )}
            {(canContinue || (!isLast && Object.keys(categoryVotes).length === 0)) && (
              <button onClick={() => isLast ? submitVotes() : setCurrentCategory(prev => prev + 1)}
                className="px-8 py-4 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-all hover:scale-105 shadow-lg">
                {isLast ? 'Envoyer mes verdicts 🎉' : <>Suivant <span className="ml-2">➡️</span></>}
              </button>
            )}
            {currentCategory > 0 && (
              <button onClick={() => setCurrentCategory(prev => Math.max(prev - 1, 0))}
                className="px-6 py-3 text-gray-500 rounded-full hover:bg-gray-200 transition-all text-sm font-medium">
                ← Revenir
                {Object.keys(categoryVotes).length > 0 && ' et modifier'}
              </button>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2 overflow-hidden">
          <div className="whitespace-nowrap animate-pulse">
            <span className="mx-4">{tickerMessage}</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'finished') {
    const profile = getProfile()
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">🎊</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Votes Envoyés !</h1>
          <p className="text-gray-500 mb-2">Merci d'avoir participé au Panthéon des Trophées</p>
          <p className="text-sm text-gray-400 mb-8">Résultat garanti : 14 gagnant·e·s et zéro perdant·e. 💛</p>
          <div className="bg-amber-50 rounded-2xl p-6 mb-8">
            <p className="text-sm text-gray-500 mb-2">Ton profil de votant</p>
            <p className="text-4xl mb-2">{profile.emoji}</p>
            <p className="text-2xl font-bold text-amber-600">{profile.label}</p>
            <p className="text-sm text-gray-500 mt-2">{profile.blurb}</p>
          </div>
          <div className="space-y-3 text-sm text-gray-500 mb-8">
            <p>🥇 3 points = 1re place</p>
            <p>🥈 2 points = 2e place</p>
            <p>🥉 1 point = 3e place</p>
          </div>
          <Link href="/" className="block w-full py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }
}
