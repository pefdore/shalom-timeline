'use client'

import { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

// Les 14 participants
const PARTICIPANTS = [
  'Jeremy', 'Caroline', 'Arnaud', 'Coraline', 'Matthias', 'Laetitia',
  'Toby', 'Margaux', 'Martin', 'Julie', 'Damien', 'Jessica',
  'Pierre-François', 'Anne-Clémence'
]

// Les 20 catégories avec descriptions
const CATEGORIES = [
  { id: 1, emoji: '💨', title: 'Le Grand Prix de la Soufflerie', desc: 'Celui qui a confondu le gîte avec un site de production de gaz vert et d\'éolienne humaine.' },
  { id: 2, emoji: '💤', title: 'Sommeil Sacrifié', desc: 'Le gardien de la nuit, celui qui refuse de voir le week-end se terminer.' },
  { id: 3, emoji: '☕', title: 'L\'Award de la Marmotte', desc: 'Le fantôme du matin. Disparu après minuit, réapparu quand le café est déjà froid.' },
  { id: 4, emoji: '🏃‍♂️', title: 'Le Poumon d\'Or', desc: 'L\'aventurier du grand air qui court un trail à 8h du mat sous la pluie.' },
  { id: 5, emoji: '🃏', title: 'Le MVP des Jeux de Société', desc: 'Le stratège de génie, le tricheur magnifique, ou celui qui n\'a pas compris les règles.' },
  { id: 6, emoji: '🍳', title: 'Le Cordon Bleu', desc: 'Le maître absolu des braises ou des fourneaux.' },
  { id: 7, emoji: '🧼', title: 'La Fée du Logis', desc: 'Le héros de l\'ombre qui vide le lave-vaisselle et ramasse les bouteilles.' },
  { id: 8, emoji: '🚗', title: 'Le Chauffeur de l\'Ombre', desc: 'Sam le survivant, d\'une patience d\'ange face aux pires copilotes.' },
  { id: 9, emoji: '💬', title: 'La Machine à Private Jokes', desc: 'Le sniper officiel de la punchline de l\'année.' },
  { id: 10, emoji: '🎧', title: 'Le DJ Moisi', desc: 'Le criminel du Bluetooth qui coupe un son incroyable à 2h du mat.' },
  { id: 11, emoji: '🍻', title: 'Le Pilier de Comptoir', desc: 'Celui qui n\'a pas bougé de sa chaise haute mais tout le monde est venu.' },
  { id: 12, emoji: '👑', title: 'Le Drama King/Queen', desc: 'Celui pour qui une piqûre de moustique devient un récit digne d\'Hollywood.' },
  { id: 13, emoji: '😂', title: 'Le Rire Contagieux', desc: 'Celui dont le rire déclenche des fous rires collectifs par effet domino.' },
  { id: 14, emoji: '🩹', title: 'La Victime du Malentendu', desc: 'Le chat noir du week-end (glisse dans la boue, se trompe de chambre).' },
  { id: 15, emoji: '🤥', title: 'L\'Award de la Mauvaise Foi', desc: 'Le Calimero qui accuse les dés d\'être pipés ou le GPS d\'avoir menti.' },
  { id: 16, emoji: '🔍', title: 'Où est mon... ?', desc: 'Le distrait chronique qui passe 48h à chercher son téléphone ou ses lunettes.' },
  { id: 17, emoji: '💼', title: 'Le VRP d\'un produit random', desc: 'Le monomaniaque qui a découvert une appli et veut convaincre tout le monde.' },
  { id: 18, emoji: '🩴', title: 'Le Fashion Crime', desc: 'Le roi du confort absolu (claquettes/chaussettes, vieux pull élimé).' },
  { id: 19, emoji: '🕵️‍♂️', title: 'Le Nostradamus du Groupe', desc: 'L\'enquêteur qui analyse chaque indice pour deviner le lieu secret.' },
  { id: 20, emoji: '🥇', title: 'L\'Award des Orgas', desc: 'Le vote ultime pour noter le couple d\'orgas (ils sont d\'office 1ers).' },
]

// Messages humoristiques selon l'avancement
const PROGRESS_MESSAGES = [
  { threshold: 0, message: '🎯 L\'échauffement commence... Que la force soit avec toi !' },
  { threshold: 10, message: '🌡️ On entre dans le vif du sujet !' },
  { threshold: 25, message: '🔥 Échauffement des esprits...' },
  { threshold: 40, message: '💪 La moitié du gîte est habillée pour l\'hiver.' },
  { threshold: 50, message: '⚖️ Attention, les amitiés se brisent à ce stade !' },
  { threshold: 65, message: '🤔 Tu commences à avoir des préférences, hein ?' },
  { threshold: 75, message: '🎭 Les masques tombent, les votes aussi !' },
  { threshold: 90, message: '🏆 Plus que quelques décisions cruciales...' },
  { threshold: 100, message: '✨ Presque là, dernier sprint vers la glory !' },
]

// Phrases pour le ticker
const TICKER_PHRASES = [
  'FLASH: Un vote anonyme vient de propulser {name} en tête !',
  'MÉTÉO: Nuage de methane suspect détecté au-dessus du salon...',
  'RUMEUR: {name} aurait triché en votant 3 fois pour {name2}...',
  'BREAKING: {name} surprise en train de voter pour {name2} !',
  'INFO: Le coffee-shop local lance une offre spéciale "voteurs réguliers"',
  'EXCLUSIF: {name} hésite encore entre {name2} et {name3}...',
  'ALERTE: {name} semble avoir une préférence secrete pour {name2} !',
  'SPORT: {name} mène la course aux trophées, {name2} talonne !',
]

export default function Home() {
  const [step, setStep] = useState('login') // login, voting, finished
  const [selectedMember, setSelectedMember] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [currentCategory, setCurrentCategory] = useState(0)
  const [votes, setVotes] = useState({})
  const [dragToken, setDragToken] = useState(null)
  const [tickerMessage, setTickerMessage] = useState('')

  // Gestion du ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const phrase = TICKER_PHRASES[Math.floor(Math.random() * TICKER_PHRASES.length)]
      const randomName = PARTICIPANTS[Math.floor(Math.random() * PARTICIPANTS.length)]
      const randomName2 = PARTICIPANTS[Math.floor(Math.random() * PARTICIPANTS.length)]
      const randomName3 = PARTICIPANTS[Math.floor(Math.random() * PARTICIPANTS.length)]
      setTickerMessage(phrase
        .replace(/{name}/g, randomName)
        .replace(/{name2}/g, randomName2)
        .replace(/{name3}/g, randomName3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Gestion du drag & drop
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

    // Vérifier si le participant est déjà sur une autre marche
    const existingEntry = Object.entries(currentVotes).find(([p, r]) => p === dragToken && r !== rank)
    if (existingEntry) {
      const newVotes = { ...votes }
      delete newVotes[categoryId][existingEntry[0]]
      setVotes(newVotes)
    }

    // Vérifier si la position est déjà prise par quelqu'un d'autre
    const occupiedBy = Object.entries(currentVotes).find(([p, r]) => r === rank)
    if (occupiedBy) {
      const newVotes = { ...votes }
      delete newVotes[categoryId][occupiedBy[0]]
      setVotes(newVotes)
    }

    // Ajouter le vote
    setVotes(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [dragToken]: rank
      }
    }))
    setDragToken(null)
  }

  const removeVote = (participant) => {
    const categoryId = CATEGORIES[currentCategory].id
    const newCategoryVotes = { ...votes[categoryId] }
    delete newCategoryVotes[participant]
    setVotes(prev => ({
      ...prev,
      [categoryId]: newCategoryVotes
    }))
  }

  // Soumettre les votes
  const submitVotes = async () => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: selectedMember,
          votes: votes
        })
      })
      const data = await response.json()
      
      if (!data.success) {
        setError(data.message)
        return
      }

      // Confettis!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9a227', '#e85d5d', '#2dd4bf', '#fdf6e3']
      })

      setStep('finished')
    } catch (err) {
      setError('Erreur lors de l\'envoi. Réessayez.')
    }
  }

  // Calcul du profil
  const getProfile = () => {
    const selfVotes = Object.values(votes).filter(cat => cat[selectedMember]).length
    if (selfVotes >= 15) return "L'Insolent Narcissique"
    const scoreVariance = Object.values(votes).reduce((acc, cat) => {
      const scores = Object.values(cat)
      return acc + (Math.max(...scores) - Math.min(...scores))
    }, 0)
    if (scoreVariance > 20) return "Le Sniper de l'Ombre"
    return "Le Diplomate Équilibré"
  }

  // Login screen
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shalom-gold-light to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-[float_3s_ease-in-out_infinite]">
          <h1 className="font-display text-3xl font-bold text-center text-shalom-text mb-2">
            🏆 Le Pantheon
          </h1>
          <p className="text-center text-shalom-textMuted mb-8">des Trophées Shalom</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-shalom-text mb-2">
                Qui es-tu ?
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-shalom-gold focus:outline-none transition-colors"
              >
                <option value="">Sélectionne ton prénom...</option>
                {PARTICIPANTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shalom-text mb-2">
                Code secret (4 chiffres)
              </label>
              <input
                type="password"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-shalom-gold focus:outline-none text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={async () => {
                if (!selectedMember || code.length !== 4) {
                  setError('Choisis ton prénom et entre le code secret')
                  return
                }
                
                // Valider via l'API
                try {
                  const res = await fetch(`/api/login?member=${selectedMember}&code=${code}`)
                  const data = await res.json()
                  if (data.success) {
                    setStep('voting')
                    setError('')
                  } else {
                    setError(data.message || 'Code invalide')
                  }
                } catch {
                  // Pour le développement, on permet l'accès sans validation
                  setStep('voting')
                }
              }}
              disabled={!selectedMember || code.length !== 4}
              className="w-full py-4 bg-shalom-gold text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entrer dans l'Arène ⚔️
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Voting screen
  if (step === 'voting') {
    const category = CATEGORIES[currentCategory]
    const categoryVotes = votes[category.id] || {}
    const progress = ((currentCategory + 1) / CATEGORIES.length) * 100
    const progressMsg = PROGRESS_MESSAGES.find(m => progress >= m.threshold)?.message || ''

    const canContinue = Object.keys(categoryVotes).length >= 3

    return (
      <div className="min-h-screen bg-shalom-bg">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between text-sm text-shalom-textMuted mb-2">
              <span>Progression</span>
              <span>{currentCategory + 1} / {CATEGORIES.length}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-shalom-gold to-shalom-teal progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-shalom-gold mt-2 font-medium">
              {progressMsg}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-28 pb-24 px-4 max-w-4xl mx-auto">
          {/* Category header */}
          <div className="text-center mb-8 animate-[slideUp_0.5s_ease-out]">
            <div className="text-6xl mb-4">{category.emoji}</div>
            <h2 className="font-display text-2xl font-bold text-shalom-text mb-2">
              {category.title}
            </h2>
            <p className="text-shalom-textMuted text-sm max-w-md mx-auto">
              {category.desc}
            </p>
          </div>

          {/* Podium */}
          <div className="flex justify-center items-end gap-4 mb-12">
            {/* 2nd place */}
            <div 
              className="podium-step w-24 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex flex-col items-center justify-end pb-2 cursor-pointer"
              style={{ height: '100px' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 2)}
            >
              {categoryVotes[Object.keys(categoryVotes).find(p => categoryVotes[p] === 2)] ? (
                <div className="text-center">
                  <div 
                    className="w-10 h-10 rounded-full bg-shalom-teal flex items-center justify-center text-white font-bold text-sm mb-1"
                    onClick={() => removeVote(Object.keys(categoryVotes).find(p => categoryVotes[p] === 2))}
                  >
                    {Object.keys(categoryVotes).find(p => categoryVotes[p] === 2)?.slice(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-gray-500">2</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">2 pts</span>
              )}
            </div>

            {/* 1st place */}
            <div 
              className="podium-step w-28 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg flex flex-col items-center justify-end pb-2 cursor-pointer"
              style={{ height: '140px' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 3)}
            >
              {categoryVotes[Object.keys(categoryVotes).find(p => categoryVotes[p] === 3)] ? (
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full bg-shalom-gold flex items-center justify-center text-white font-bold mb-1"
                    onClick={() => removeVote(Object.keys(categoryVotes).find(p => categoryVotes[p] === 3))}
                  >
                    {Object.keys(categoryVotes).find(p => categoryVotes[p] === 3)?.slice(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-yellow-700">1er</span>
                </div>
              ) : (
                <span className="text-xs text-yellow-700">3 pts</span>
              )}
            </div>

            {/* 3rd place */}
            <div 
              className="podium-step w-24 bg-gradient-to-t from-orange-300 to-orange-200 rounded-t-lg flex flex-col items-center justify-end pb-2 cursor-pointer"
              style={{ height: '70px' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 1)}
            >
              {categoryVotes[Object.keys(categoryVotes).find(p => categoryVotes[p] === 1)] ? (
                <div className="text-center">
                  <div 
                    className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm mb-1"
                    onClick={() => removeVote(Object.keys(categoryVotes).find(p => categoryVotes[p] === 1))}
                  >
                    {Object.keys(categoryVotes).find(p => categoryVotes[p] === 1)?.slice(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-orange-700">3</span>
                </div>
              ) : (
                <span className="text-xs text-orange-400">1 pt</span>
              )}
            </div>
          </div>

          {/* Tokens */}
          <div className="mb-8">
            <p className="text-center text-sm text-shalom-textMuted mb-4">
              Glisse les copains sur le podium 👇
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PARTICIPANTS.map(participant => {
                const isOnPodium = Object.values(categoryVotes).includes(participant) || Object.keys(categoryVotes).includes(participant)
                return (
                  <div
                    key={participant}
                    draggable={!isOnPodium}
                    onDragStart={(e) => handleDragStart(e, participant)}
                    className={`token px-4 py-2 rounded-full font-medium text-sm transition-all
                      ${isOnPodium 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white shadow-md hover:shadow-lg hover:scale-105 cursor-grab active:cursor-grabbing'
                      }`}
                  >
                    {participant}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next button */}
          {canContinue && (
            <div className="text-center animate-[slideUp_0.5s_ease-out]">
              <button
                onClick={() => {
                  if (currentCategory < CATEGORIES.length - 1) {
                    setCurrentCategory(prev => prev + 1)
                  } else {
                    submitVotes()
                  }
                }}
                className="px-8 py-4 bg-shalom-gold text-white font-bold rounded-full hover:bg-yellow-600 transition-all hover:scale-105 shadow-lg"
              >
                {currentCategory < CATEGORIES.length - 1 ? (
                  <>Suivant <span className="ml-2">➡️</span></>
                ) : (
                  <>Envoyer mes verdicts 🎉</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Ticker */}
        <div className="fixed bottom-0 left-0 right-0 bg-shalom-text text-white py-2 overflow-hidden">
          <div className="ticker-wrap">
            <div className="ticker">
              <span className="mx-4">{tickerMessage}</span>
              <span className="mx-4">{tickerMessage}</span>
              <span className="mx-4">{tickerMessage}</span>
              <span className="mx-4">{tickerMessage}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Finished screen
  if (step === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shalom-goldLight to-white flex items-center justify-center p-4">
        <canvas id="confetti-canvas" />
        
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-[slideUp_0.5s_ease-out]">
          <div className="text-6xl mb-6">🎊</div>
          <h1 className="font-display text-3xl font-bold text-shalom-text mb-4">
            Votes Envoyés !
          </h1>
          <p className="text-shalom-textMuted mb-8">
            Merci d'avoir participé au Pantheon des Trophées
          </p>

          <div className="bg-shalom-goldLight rounded-2xl p-6 mb-8">
            <p className="text-sm text-shalom-textMuted mb-2">Ton profil de votant</p>
            <p className="font-display text-2xl font-bold text-shalom-gold">
              {getProfile()}
            </p>
          </div>

          <div className="space-y-3 text-sm text-shalom-textMuted">
            <p>🥇 3 points = 1ère place</p>
            <p>🥈 2 points = 2e place</p>
            <p>🥉 1 point = 3e place</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-4 bg-shalom-text text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }
}