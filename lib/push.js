import webpush from 'web-push'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const PUSH_SHEET = 'PushSubs'
const DEV_MODE = !process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:orgas@shalom.example'

function getDevSubs() {
  if (!globalThis.__shalomPushSubs) globalThis.__shalomPushSubs = []
  return globalThis.__shalomPushSubs
}

function getDevKeys() {
  if (!globalThis.__shalomVapidKeys) {
    globalThis.__shalomVapidKeys = webpush.generateVAPIDKeys()
  }
  return globalThis.__shalomVapidKeys
}

function getVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    }
  }
  return getDevKeys()
}

function configureWebPush() {
  const keys = getVapidKeys()
  webpush.setVapidDetails(VAPID_SUBJECT, keys.publicKey, keys.privateKey)
  return keys
}

export function getPushPublicKey() {
  return configureWebPush().publicKey
}

export async function saveSubscription(member, subscription) {
  const endpoint = subscription.endpoint
  if (DEV_MODE) {
    const subs = getDevSubs()
    const idx = subs.findIndex((s) => s.endpoint === endpoint)
    if (idx !== -1) subs[idx] = { member, endpoint, data: JSON.stringify(subscription), at: new Date().toISOString() }
    else subs.push({ member, endpoint, data: JSON.stringify(subscription), at: new Date().toISOString() })
    return
  }
  const { getSheetData, updateSheetCell, appendToSheet } = await import('@/lib/sheets')
  const rows = await getSheetData(SPREADSHEET_ID, PUSH_SHEET, 'A:A')
  const header = rows[0] && rows[0][0]
  const startIdx = header === 'Membre' ? 1 : 0
  const bodyRows = rows.slice(startIdx)
  const idx = bodyRows.findIndex((r) => r[0] === member)
  const values = [member, endpoint, JSON.stringify(subscription), new Date().toISOString()]
  if (idx === -1) {
    if (header !== 'Membre') await appendToSheet(SPREADSHEET_ID, PUSH_SHEET, ['Membre', 'Endpoint', 'Subscription', 'Date'])
    await appendToSheet(SPREADSHEET_ID, PUSH_SHEET, values)
  } else {
    await updateSheetRange(SPREADSHEET_ID, PUSH_SHEET, `A${startIdx + idx + 1}:D${startIdx + idx + 1}`, [values])
  }
}

export async function removeSubscription(endpoint) {
  if (DEV_MODE) {
    const subs = getDevSubs()
    const idx = subs.findIndex((s) => s.endpoint === endpoint)
    if (idx !== -1) subs.splice(idx, 1)
    return
  }
  const { getSheetData, updateSheetRange } = await import('@/lib/sheets')
  const rows = await getSheetData(SPREADSHEET_ID, PUSH_SHEET, 'A:A')
  const header = rows[0] && rows[0][0]
  const startIdx = header === 'Membre' ? 1 : 0
  const bodyRows = rows.slice(startIdx)
  const idx = bodyRows.findIndex((r) => r[1] === endpoint)
  if (idx !== -1) {
    await updateSheetRange(SPREADSHEET_ID, PUSH_SHEET, `A${startIdx + idx + 1}:D${startIdx + idx + 1}`, [['', '', '', '']])
  }
}

export async function listSubscriptions() {
  if (DEV_MODE) return getDevSubs()
  const { getAllSheetData } = await import('@/lib/sheets')
  const rows = await getAllSheetData(SPREADSHEET_ID, PUSH_SHEET)
  const start = rows[0] && rows[0][0] === 'Membre' ? 1 : 0
  return rows.slice(start)
    .filter((r) => r[0] && r[2])
    .map((r) => ({ member: r[0], endpoint: r[1], data: r[2], at: r[3] || '' }))
}

export async function listSubscribedMembers() {
  const subs = await listSubscriptions()
  return [...new Set(subs.map((s) => s.member).filter(Boolean))]
}

async function sendToSubscription(subscriptionJson, payload) {
  try {
    await webpush.sendNotification(JSON.parse(subscriptionJson), JSON.stringify(payload))
    return { ok: true }
  } catch (error) {
    const gone = error.statusCode === 404 || error.statusCode === 410
    return { ok: false, gone }
  }
}

export async function sendPushToMembers(members, { title, body, url }) {
  configureWebPush()
  const target = new Set((members || []).filter(Boolean))
  const subs = await listSubscriptions()
  const relevant = subs.filter((s) => target.size === 0 || target.has(s.member))
  const payload = {
    title,
    body,
    url: url || '/',
  }
  let sent = 0
  const expired = []
  for (const sub of relevant) {
    const res = await sendToSubscription(sub.data, payload)
    if (res.ok) sent += 1
    else if (res.gone) expired.push(sub)
  }
  for (const sub of expired) {
    await removeSubscription(sub.endpoint)
  }
  return { sent, total: relevant.length, expired: expired.length }
}
