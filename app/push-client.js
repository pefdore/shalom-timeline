export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function isPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

export async function isPushEnabled() {
  if (!isPushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return false
    const sub = await reg.pushManager.getSubscription()
    return Boolean(sub) && Notification.permission === 'granted'
  } catch {
    return false
  }
}

export function isStandalonePWA() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}

// registers the service worker unconditionally so Chrome treats the
// site as installable (icons from the manifest on the home screen)
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch {}
}

export async function enablePush(member) {
  if (!isPushSupported()) {
    return { ok: false, reason: 'unsupported' }
  }
  if (Notification.permission === 'denied') {
    return { ok: false, reason: 'denied' }
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, reason: permission === 'denied' ? 'denied' : 'dismissed' }
  }
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  const keyRes = await fetch('/api/push/key').then((r) => r.json())
  if (!keyRes.success) throw new Error('no key')
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyRes.publicKey),
    })
  }
  const res = await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member, subscription: sub.toJSON() }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message)
  try {
    await reg.showNotification('🔔 Notifs Shalom activées', {
      body: 'Tu seras prévenu(e) de tout : enquête, jeu de rôle, surprises...',
      icon: '/shalom casquettev2.png',
      tag: 'shalom-test',
    })
  } catch {}
  return { ok: true }
}
