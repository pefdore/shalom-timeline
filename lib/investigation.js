const MEMBERS_DEV = {
  'Jeremy': '0001',
  'Caroline': '0002',
  'Arnaud': '0003',
  'Coraline': '0004',
  'Matthias': '0005',
  'Laetitia': '0006',
  'Toby': '0007',
  'Margaux': '0008',
  'Martin': '0009',
  'Julie': '0010',
  'Damien': '0011',
  'Jessica': '0012',
  'Pierre-François': '0013',
  'Anne-Clémence': '0014',
}

const ORGAS_CODE = process.env.ORGAS_CODE || '9999'
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const ENQUETE_SHEET = 'Enquete'
const GAZETTE_SHEET = 'Gazette'

const DEFAULT_DEV_STATE = () => ({
  location: '',
  organizers: [],
  clues: [],
  revealDate: '',
  solved: false,
  winner: '',
  solvedAt: '',
  gazette: [],
})

function getDevState() {
  if (!globalThis.__shalomInvestigation) {
    globalThis.__shalomInvestigation = DEFAULT_DEV_STATE()
  }
  return globalThis.__shalomInvestigation
}

export function isDevMode() {
  return DEV_MODE
}

export function checkOrgasCode(code) {
  return code === ORGAS_CODE
}

export function checkMemberCode(member, code) {
  if (DEV_MODE) return MEMBERS_DEV[member] === code
  return true
}

export function isKnownMember(member) {
  return Boolean(MEMBERS_DEV[member])
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
}

export function isMatch(guess, location) {
  const g = normalize(guess)
  const l = normalize(location)
  if (!g || !l) return false
  if (g === l) return true
  const core = (s) => s.split(/\s+/).filter((w) => w.length > 3 && !['dans', 'les', 'sur', 'pres', 'ile'].includes(w))
  const gw = core(g)
  const lw = core(l)
  if (lw.length === 0) return false
  const hits = lw.filter((w) => gw.some((w2) => w2 === w || w2.startsWith(w) || w.startsWith(w2)))
  return hits.length >= Math.max(1, Math.ceil(lw.length * 0.6))
}

export function monthsSince(setDate, now = new Date()) {
  const start = new Date(setDate)
  if (isNaN(start)) return 0
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
}



export { wrongVerdict } from './verdicts.js'

export const ALREADY_PLAYED_MSGS = [
  "😤 Un essai par mois, on avait dit ! Le SUSPENDS-toi de spéculer jusqu'au mois prochain.",
  '🔒 Ton essai mensuel est déjà épuisé. Contemple les indices et médite.',
  '🙈 Re-tenter ne marchera pas : le grand ordinateur du Shalom a une mémoire d\u2019éléphant.',
  '⏳ La sagesse des orgas dit : un essai par mois. Reviens quand la lune changera.',
]

export function alreadyPlayedMsg() {
  return ALREADY_PLAYED_MSGS[Math.floor(Math.random() * ALREADY_PLAYED_MSGS.length)]
}

export async function readState() {
  if (DEV_MODE) return getDevState()
  const { getAllSheetData } = await import('@/lib/sheets')
  const rows = await getAllSheetData(SPREADSHEET_ID, ENQUETE_SHEET)
  const state = DEFAULT_DEV_STATE()
  for (const [key, ...rest] of rows) {
    const value = rest.join(',')
    if (key === 'location') state.location = value
    if (key === 'organizers') state.organizers = value ? value.split('||') : []
    if (key === 'revealDate') state.revealDate = value
    if (key === 'solved') state.solved = value === 'TRUE'
    if (key === 'winner') state.winner = value
    if (key === 'solvedAt') state.solvedAt = value
    if (key === 'clues') state.clues = value ? value.split('||') : []
  }
  return state
}

async function writeKey(key, value) {
  const { getSheetData, updateSheetCell, appendToSheet } = await import('@/lib/sheets')
  const rows = await getSheetData(SPREADSHEET_ID, ENQUETE_SHEET, 'A:B')
  const idx = rows.findIndex((r) => r[0] === key)
  if (idx === -1) {
    await appendToSheet(SPREADSHEET_ID, ENQUETE_SHEET, [key, value])
  } else {
    await updateSheetCell(SPREADSHEET_ID, ENQUETE_SHEET, `B${idx + 1}`, value)
  }
}

export async function saveState(patch) {
  if (DEV_MODE) {
    Object.assign(getDevState(), patch)
    return
  }
  for (const [key, value] of Object.entries(patch)) {
    const stored = (key === 'clues' || key === 'organizers') ? (value || []).join('||') : value
    await writeKey(key, stored)
  }
}

export async function readGazette() {
  if (DEV_MODE) return getDevState().gazette
  const { getAllSheetData } = await import('@/lib/sheets')
  const rows = await getAllSheetData(SPREADSHEET_ID, GAZETTE_SHEET)
  return rows.slice(1).map((r) => ({
    member: r[0],
    guess: r[1],
    month: r[2],
    correct: r[3] === 'TRUE',
    verdict: r[4],
    at: r[5] || '',
  })).reverse()
}

export async function addGazetteEntry(entry) {
  if (DEV_MODE) {
    getDevState().gazette.unshift({ ...entry, at: new Date().toISOString() })
    return
  }
  const { appendToSheet } = await import('@/lib/sheets')
  await appendToSheet(SPREADSHEET_ID, GAZETTE_SHEET, [
    entry.member,
    entry.guess,
    entry.month,
    entry.correct ? 'TRUE' : 'FALSE',
    entry.verdict,
    new Date().toISOString(),
  ])
}

export function publicState(state, gazette) {
  const now = new Date()
  const revealDate = state.revealDate ? new Date(state.revealDate) : null
  const revealed = revealDate ? now > revealDate : false
  const finished = revealed
  const solvedAtIso = state.solvedAt || gazette.find((g) => g.correct)?.at || new Date().toISOString()
  const elapsedMonths = monthsSince(solvedAtIso)
  const cluesPublished = finished
    ? state.clues
    : state.clues.slice(0, Math.min(state.clues.length, 1 + elapsedMonths))

  const seen = new Set()
  const ranking = gazette
    .filter((g) => g.correct)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .filter((g) => {
      if (seen.has(g.member)) return false
      seen.add(g.member)
      return true
    })
    .map((g) => ({ member: g.member, at: g.at }))

  const attemptsByMember = {}
  for (const g of gazette) {
    attemptsByMember[g.member] = (attemptsByMember[g.member] || 0) + 1
  }

  return {
    hasLocation: Boolean(state.location),
    organizers: state.organizers || [],
    revealDate: state.revealDate,
    revealed,
    solved: ranking.length > 0,
    winner: ranking[0]?.member || '',
    ranking: ranking.map((r) => ({ ...r, attempts: attemptsByMember[r.member] || 1 })),
    location: revealed ? state.location : '',
    cluesPublished,
    cluesTotal: state.clues.length,
    gazette: gazette.map((g) => ({
      member: g.member,
      guess: g.guess,
      correct: g.correct,
      verdict: g.verdict,
      at: g.at,
    })),
    attempts: gazette.length,
  }
}
