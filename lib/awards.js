export const CATEGORIES = [
  { id: 1, emoji: '💨', title: 'Le Grand Prix de la Soufflerie', desc: "Champion·ne toute catégorie du gaz vert. Une contribution discrète mais mémorable à l'atmosphère du gîte.", hint: 'Pas de honte : c’est du compostage humain.' },
  { id: 2, emoji: '😴', title: 'Sommeil Sacrifié', desc: "Celui ou celle qui profite de chaque minute sans jamais être à plat. Le week-end est trop court, alors on le remplit.", hint: 'Chaque minute compte, et tu en prends soin.' },
  { id: 3, emoji: '☕', title: "L'Award de la Marmotte", desc: "Les autres prennent le café, cette personne prend son temps. Une matinée réussie commence par une grasse matinée méritée.", hint: 'La grasse matinée est un art de vivre.' },
  { id: 4, emoji: '🏃', title: "Le Poumon d'Or", desc: "Toujours partant·e pour une rando, un vélo ou un plongeon, quel que soit le temps. Notre énergie solaire préférée.", hint: 'Ton cardio nous impressionne, sincèrement.' },
  { id: 5, emoji: '🃏', title: 'Le MVP des Jeux de Société', desc: "Stratège de génie, tricheur magnanime ou novice enthousiaste : peu importe, la table vous adore.", hint: 'Règle d’or : on rigole, on ne râle pas.' },
  { id: 6, emoji: '🍳', title: 'Le Cordon Bleu', desc: "Braises maîtrisées, sauces divines, œufs parfaits : nourrir 14 personnes, c'est déjà un acte d'amour.", hint: 'Cuisiner pour 14, c’est déjà gagner.' },
  { id: 7, emoji: '🧽', title: 'La Fée du Logis', desc: "Lave-vaisselle vidé avant même qu’on ose le demander, table nettoyée, tout remis en place. L’ange discret du gîte.", hint: 'Le super-pouvoir le plus sous-coté.' },
  { id: 8, emoji: '🚗', title: "Le Chauffeur de l'Ombre", desc: "Patient·e comme un moine, ponctuel·le comme une horloge suisse, souriant·e même avec les pires copilotes.", hint: 'Sans toi, on marcherait.' },
  { id: 9, emoji: '💬', title: 'La Machine à Private Jokes', desc: "Sniper de la punchline : une phrase, et tout le gîte pleure de rire. Certains sketches sont déjà cultes.", hint: 'Nos memories te doivent tout.' },
  { id: 10, emoji: '🎧', title: 'Le DJ Moisi', desc: "Playlists étonnantes mais ambiance garantie : même les titres improbables finissent en chorale.", hint: 'On danse quand même, avouons-le.' },
  { id: 11, emoji: '🍺', title: 'Le Pilier de Comptoir', desc: "Cloué·e à la même chaise tout le week-end, mais c’est autour d’elle que tout le monde se retrouve. Le centre social du gîte.", hint: 'Ton stabulum, notre phare.' },
  { id: 12, emoji: '🎬', title: 'La Tête d’Affiche', desc: "Une piqûre de moustique devient une épopée digne d’Hollywood. Merci pour le spectacle, toujours gratuit.", hint: 'Chaque week-end a sa saga.' },
  { id: 13, emoji: '😂', title: 'Le Rire Contagieux', desc: "Quand cette personne rigole, tout le gîte suit, effet domino garanti. La meilleure médecine du week-end.", hint: 'Ton rire, notre dopamine.' },
  { id: 14, emoji: '🩹', title: 'La Victime du Malentendu', desc: "Glisse dans la boue, se trompe de chemin, rate le dessert. Mais toujours avec un panache admirable.", hint: 'Le week-end aurait moins d’histoires sans toi.' },
  { id: 15, emoji: '🤥', title: "L'Award de la Mauvaise Foi", desc: "« Le GPS a menti », « les dés sont pipés »… Plaidoirie héroïque, défaite élégante. On vous aime même en pleine mauvaise foi.", hint: 'Le tribunal du Shalom applaudit.' },
  { id: 16, emoji: '🔍', title: 'Où est mon... ?', desc: "Deux jours à chercher lunettes/téléphone/clés qui étaient dans votre poche. Vos airs perplexes nous amusent beaucoup.", hint: 'Objets perdus, sourires trouvés.' },
  { id: 17, emoji: '💼', title: 'Le VRP d’un produit random', desc: "Une appli, un gadget, un vélo électrique : cette personne est convaincue, et en trois jours, tout le groupe l’est aussi.", hint: 'Notre meilleur commercial bénévole.' },
  { id: 18, emoji: '👟', title: 'Le Fashion Crime', desc: "Claquettes-chaussettes, vieux pull mythique, combinaison improbable : le confort avant tout, et on respecte ça.", hint: 'La mode passe, le style reste.' },
  { id: 19, emoji: '🕵️', title: 'Le Nostradamus du Groupe', desc: "Analyse chaque indice, croise chaque hypothèse, et finit presque par deviner le lieu secret. Sherlock du Shalom.", hint: 'L’enquête n’a plus de secret pour toi.' },
  { id: 20, emoji: '🏆', title: "L'Award des Orgas", desc: "Sans eux/elles, pas de gîte, pas de week-end, rien. Votez avec le cœur (spoiler : ils/elles gagnent déjà).", hint: 'Un merci géant, en forme de podium.' },
]

export const MEDALS = ['🥇', '🥈', '🥉']

export const POINTS_BY_RANK = [3, 2, 1]

export function tallyRows(rows) {
  const results = {}
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || []
    const category = row[1]
    const voteString = row[2]
    if (!category || !voteString) continue
    const acc = results[category] || (results[category] = {})
    String(voteString).split(',').forEach(v => {
      const match = v.trim().match(/^(.+):(\d+)$/)
      if (match) {
        const name = match[1].trim()
        const points = parseInt(match[2], 10)
        acc[name] = (acc[name] || 0) + points
      }
    })
  }
  return results
}

export function rankCategory(pointsByName) {
  const sorted = Object.entries(pointsByName).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr')
  )
  const ranked = []
  let lastPoints = null
  let lastRank = 0
  sorted.forEach(([name, points], idx) => {
    const rank = points === lastPoints ? lastRank : idx + 1
    lastPoints = points
    lastRank = rank
    if (rank <= MEDALS.length) {
      ranked.push({ name, points, rank, medal: MEDALS[rank - 1] })
    }
  })
  return ranked
}

export function buildPodiums(results) {
  const podiums = {}
  for (const [category, pointsByName] of Object.entries(results)) {
    podiums[category] = rankCategory(pointsByName)
  }
  return podiums
}

export function countVoters(rows) {
  const voters = new Set()
  for (let i = 1; i < rows.length; i++) {
    const voter = rows[i] && rows[i][0]
    if (voter) voters.add(voter)
  }
  return voters.size
}

export function buildPalmares(podiums) {
  const people = {}
  const ensure = (name) => {
    if (!people[name]) people[name] = { name, gold: 0, silver: 0, bronze: 0, total: 0 }
    return people[name]
  }
  for (const winners of Object.values(podiums)) {
    for (const entry of winners) {
      const person = ensure(entry.name)
      if (entry.rank === 1) person.gold++
      else if (entry.rank === 2) person.silver++
      else person.bronze++
      person.total++
    }
  }
  const leaderboard = Object.values(people).sort(
    (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total || a.name.localeCompare(b.name, 'fr')
  )
  leaderboard.forEach((p, idx) => { p.rank = idx + 1 })
  return leaderboard
}

export function categoryTitleById(id) {
  const category = CATEGORIES.find(c => c.id === id)
  return category ? category.title : `Catégorie ${id}`
}
