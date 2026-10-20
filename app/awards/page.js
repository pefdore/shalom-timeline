'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { CATEGORIES, MEDALS, POINTS_BY_RANK, buildPalmares } from '@/lib/awards'

const PARTICIPANTS = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence'
]

const PHASES = [
  { label: 'Journées', emoji: '☀️', hint: 'Le meilleur du jour' },
  { label: 'Talents', emoji: '✨', hint: 'Ce que chacun·e fait de magique' },
  { label: 'Piquant léger', emoji: '🌶️', hint: 'Un petit pic, avec beaucoup d’amour' },
  { label: 'Grand Final', emoji: '🏆', hint: 'Les prix qui comptent vraiment' },
]
const PHASE_OF = (id) => (id <= 8 ? 0 : id <= 14 ? 1 : id <= 18 ? 2 : 3)

const PROGRESS_MESSAGES = [
  { threshold: 0, message: '🎉 C’est parti ! Prends ton temps, il n’y a pas de mauvais vote.' },
  { threshold: 10, message: '☕ On s’échauffe en douceur, comme un bon café du matin.' },
  { threshold: 25, message: '🔥 Tu es dans le rythme ! Le gîte est déjà fier de toi.' },
  { threshold: 40, message: '💪 Plus d’un tiers de la route. Les trophées se sentent observés.' },
  { threshold: 55, message: '⚖️ La moitié ! Rappel : on vote avec le cœur ET le rire.' },
  { threshold: 70, message: '🌟 Tes choix sont beaux. Non, vraiment, ils le sont.' },
  { threshold: 85, message: '🎭 Les podiums se remplissent, les souvenirs aussi !' },
  { threshold: 95, message: '🏆 Dernière ligne droite, tu es une légende de la persévérance.' },
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
  'SOUVENIR : personne n’a oublié le fameux {name2} de {name}… personne.',
]

const VOTER_PROFILES = [
  { key: 'generous', label: 'Le Cœur Sur la Main', blurb: 'Tu aimes tout le monde et le week-end le sait.', emoji: '💛' },
  { key: 'loyal', label: 'Le Pilier du Groupe', blurb: 'Fidèle en amitié comme au podium. Chapeau bas.', emoji: '🗿' },
  { key: 'adventurer', label: 'L’Explorateur des Talents', blurb: 'Tu vois le meilleur chez chacun·e, même dans la cave.', emoji: '🧭' },
]

const SFX = {
  drop: [523.25, 659.25],
  finish: [523.25, 659.25, 783.99, 1046.5],
  error: [196, 155.56],
}

function playNotes(freqs) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.09 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.09)
      osc.stop(ctx.currentTime + i * 0.09 + 0.35)
    })
  } catch {}
}

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
  const [dragOverRank, setDragOverRank] = useState(null)
  const [justDroppedRank, setJustDroppedRank] = useState(null)
  const [tickerMessage, setTickerMessage] = useState('')
  const [votingOpen, setVotingOpen] = useState(true)
  const [votingDates, setVotingDates] = useState({ startDate: '', endDate: '' })
  const [soundOn, setSoundOn] = useState(true)
  const [liveResults, setLiveResults] = useState(null)
  const [celebration, setCelebration] = useState(false)
  const resultsTimer = useRef(null)

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

  useEffect(() => {
    if (step !== 'finished') return undefined
    const fetchLive = () => fetch('/api/results')
      .then(r => r.json())
      .then(data => { if (data.success) setLiveResults(data.results) })
      .catch(() => {})
    fetchLive()
    resultsTimer.current = setInterval(fetchLive, 10000)
    return () => clearInterval(resultsTimer.current)
  }, [step])

  const play = (name) => { if (soundOn) playNotes(SFX[name]) }

  const handleDragStart = (e, participant) => {
    setDragToken(participant)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, rank) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverRank(rank)
  }

  const handleDragLeave = (rank) => {
    if (dragOverRank === rank) setDragOverRank(null)
  }

  const handleDrop = (e, rank) => {
    e.preventDefault()
    setDragOverRank(null)
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
    setJustDroppedRank(rank)
    setTimeout(() => setJustDroppedRank(null), 450)
    play('drop')
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
      if (!data.success) { setError(data.message); play('error'); return }
      play('finish')
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#c9a227', '#e85d5d', '#2dd4bf', '#fdf6e3'] })
      setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#c9a227', '#e85d5d'] }), 400)
      setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#2dd4bf', '#fdf6e3'] }), 600)
      setCelebration(true)
      setStep('finished')
    } catch (err) { setError('Erreur lors de l\'envoi. Réessayez.'); play('error') }
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
      <div className="min-h-screen aw-bg relative">
        <header className="py-6 text-center px-4 relative z-10">
          <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm">
            ← Retour à l'accueil
          </Link>
        </header>
        <div className="max-w-md mx-auto px-4 pb-12 relative z-10">
          <div className="aw-card p-8 slide-up">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3 float-gentle">🏆</div>
              <p className="aw-kicker mb-2">Shalom Project</p>
              <h1 className="aw-title text-3xl text-gray-800 mb-1">Le Panthéon</h1>
              <p className="text-center text-gray-500 text-sm">des Trophées Shalom</p>
            </div>
            <p className="text-center text-sm text-gray-400 mb-8 italic">
              20 trophées pour revivre le week-end. On célèbre tout le monde : chaque podium est un câlin. 💛
            </p>
            {!votingOpen && (
              <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">
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
              {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm fade-in">{error}</div>}
              <button onClick={async () => {
                if (!selectedMember || code.length !== 4) { setError('Choisis ton prénom et entre le code secret'); return }
                try {
                  const res = await fetch(`/api/login?member=${selectedMember}&code=${code}`)
                  const data = await res.json()
                  if (data.success) { setStep('voting'); setError(''); play('drop') }
                  else { setError(data.message || 'Code invalide'); play('error') }
                } catch { setStep('voting') }
              }} disabled={!selectedMember || code.length !== 4 || !votingOpen}
                className="aw-btn aw-btn-primary w-full py-4 disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none">
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
    const phase = PHASE_OF(category.id)
    const votedCategories = Object.keys(votes).length

    return (
      <div className="min-h-screen aw-bg relative">
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                {PHASES.map((ph, i) => (
                  <span key={ph.label} className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${i === phase ? 'bg-amber-500 text-white shadow' : i < phase ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                    {ph.emoji} {ph.label}
                  </span>
                ))}
              </div>
              <button onClick={() => setSoundOn(s => !s)} className="text-lg" title="Son">{soundOn ? '🔊' : '🔇'}</button>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{votedCategories} / {CATEGORIES.length} catégor{votedCategories > 1 ? 'ies' : 'ie'} votée{votedCategories > 1 ? 's' : ''}</span>
              <span>{currentCategory + 1} / {CATEGORIES.length}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-amber-600 mt-2 font-medium">{progressMsg}</p>
          </div>
        </div>

        <div className="pt-32 pb-24 px-4 max-w-4xl mx-auto">
          <div key={category.id} className="fade-in">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 float-gentle">{category.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{category.title}</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">{category.desc}</p>
              <p className="text-amber-500 text-xs max-w-md mx-auto mt-2 italic">{category.hint}</p>
            </div>

            <div className="flex justify-center items-end gap-4 mb-4">
              {[2, 3, 1].map((rank) => {
                const occupant = Object.keys(categoryVotes).find(p => categoryVotes[p] === rank)
                const base = rank === 3 ? 'w-28 h-[140px] aw-podium-gold' : rank === 2 ? 'w-24 h-[100px] aw-podium-silver' : 'w-24 h-[70px] aw-podium-bronze'
                return (
                  <div key={rank}
                    className={`${base} aw-podium-step flex flex-col items-center justify-end pb-2 cursor-pointer transition-all duration-200 ${dragOverRank === rank ? 'scale-110 ring-4 ring-amber-300 brightness-105' : ''} ${justDroppedRank === rank ? 'podium-pop' : ''}`}
                    onDragOver={(e) => handleDragOver(e, rank)}
                    onDragLeave={() => handleDragLeave(rank)}
                    onDrop={(e) => handleDrop(e, rank)}>
                    {occupant ? (
                      <div className="text-center podium-step">
                        <div className="rounded-full bg-white/70 backdrop-blur flex items-center justify-center font-bold text-gray-700 text-xs px-3 py-2 shadow mb-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
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
                      className={`token aw-chip px-4 py-2 font-medium text-sm ${isOnPodium ? 'aw-chip-on cursor-not-allowed hover:transform-none hover:shadow-none' : 'cursor-grab'} ${dragToken === participant ? 'dragging' : ''}`}>
                      {participant}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {!isLast && (
                <button onClick={() => setCurrentCategory(prev => prev + 1)}
                  className="aw-btn aw-btn-ghost px-6 py-3 text-sm">
                  Passer cette catégorie →
                </button>
              )}
              {(canContinue || (!isLast && Object.keys(categoryVotes).length === 0)) && (
                <button onClick={() => isLast ? submitVotes() : setCurrentCategory(prev => prev + 1)}
                  className="aw-btn aw-btn-primary px-8 py-4">
                  {isLast ? 'Découvrir le palmarès 🎉' : <>Suivant <span className="ml-2">➡️</span></>}
                </button>
              )}
              {currentCategory > 0 && (
                <button onClick={() => setCurrentCategory(prev => Math.max(prev - 1, 0))}
                  className="aw-btn aw-btn-ghost px-6 py-3 text-sm">
                  ← Revenir
                  {Object.keys(categoryVotes).length > 0 && ' et modifier'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur text-white py-2 overflow-hidden">
          <div className="whitespace-nowrap animate-pulse">
            <span className="mx-4 text-sm text-gray-200">{tickerMessage}</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'finished') {
    const profile = getProfile()
    const podiums = liveResults || {}
    const palmares = buildPalmares(podiums)
    const topCats = Object.entries(podiums).slice(0, 6)

    return (
      <div className="min-h-screen aw-bg relative">
        <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
          <div className="aw-card p-8 text-center slide-up">
            <div className="text-6xl mb-6">{celebration ? '🎊' : '🏆'}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Verdicts Envoyés !</h1>
            <p className="text-gray-500 mb-2">Merci d'avoir participé au Panthéon des Trophées</p>
            <p className="text-sm text-gray-400 mb-8">Résultat garanti : 14 gagnant·e·s et zéro perdant·e. 💛</p>
            <div className="bg-[#fdf6e3] rounded-2xl p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">Ton profil de votant</p>
              <p className="text-4xl mb-2">{profile.emoji}</p>
              <p className="text-2xl font-bold text-amber-600">{profile.label}</p>
              <p className="text-sm text-gray-500 mt-2">{profile.blurb}</p>
            </div>
          </div>

          <div className="aw-card p-6 mb-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">📊 Palmarès live</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse inline-block" /> mise à jour automatique
              </span>
            </div>
            {palmares.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Les premiers votes tombent, le palmarès arrive… ⏳</p>
            ) : (
              <div className="space-y-2">
                {palmares.slice(0, 10).map((p, idx) => (
                  <div key={p.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <span className="w-7 text-center font-bold text-gray-400">{p.rank}</span>
                    <span className="font-semibold text-gray-700 flex-1">{p.name}</span>
                    <span className="text-sm">{p.gold > 0 && `🥇×${p.gold} `}{p.silver > 0 && `🥈×${p.silver} `}{p.bronze > 0 && `🥉×${p.bronze}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {topCats.length > 0 && (
            <div className="aw-card p-6 mb-8">
              <h2 className="aw-title text-xl text-gray-800 mb-4">🌟 Premiers podiums</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {topCats.map(([category, winners]) => (
                  <div key={category} className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{category}</p>
                    {winners.map((w, i) => (
                      <p key={w.name} className="text-sm text-gray-600 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                        {MEDALS[w.rank - 1] || '🎖️'} {w.name} <span className="text-gray-400">· {w.points} pts</span>
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="aw-card p-6 mb-8 text-center">
            <p className="text-sm text-gray-500">Le palmarès complet se dévoilera au gîte 🏡</p>
            <p className="text-sm text-gray-400 mt-1">En attendant : tu nous as déjà donné envie de revenir l'année prochaine. 💛</p>
            <div className="space-y-3 text-sm text-gray-500 mt-6">
              <p>🥇 3 points = 1re place</p>
              <p>🥈 2 points = 2e place</p>
              <p>🥉 1 point = 3e place</p>
            </div>
          </div>

          <Link href="/" className="aw-btn block w-full py-4 bg-gray-800 text-white rounded-full hover:bg-gray-900 text-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }
}
