'use client'

import { useEffect, useState, useCallback } from 'react'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushNotifications({ member = '' }) {
  const [supported, setSupported] = useState(true)
  const [status, setStatus] = useState('idle')
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false)
      return
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      setEnabled(Boolean(sub))
    } catch {}
  }, [])

  useEffect(() => { checkSubscription() }, [checkSubscription])

  const enable = async () => {
    setMessage('')
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false)
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('error')
      setMessage('Les notifs sont bloquées dans les réglages du navigateur (petite cloche 🔔 dans la barre d’adresse).')
      return
    }
    setStatus('busy')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('error')
        setMessage('Permission refusée. Réactive les notifications dans les réglages du site.')
        return
      }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      const { success, publicKey } = await fetch('/api/push/key').then((r) => r.json())
      if (!success) throw new Error('no key')
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member, subscription: sub.toJSON() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setEnabled(true)
      setStatus('done')
      setMessage('C’est bon, ton portable est sur écoute ! 📳')
      try {
        await reg.showNotification('🔔 Notifs Shalom activées', {
          body: 'Tu seras prévenu(e) de tout : enquête, jeu de rôle, surprises...',
          icon: '/shalom casquettev2.png',
          tag: 'shalom-test',
        })
      } catch {}
    } catch (error) {
      setStatus('error')
      setMessage('Bof, ça n’a pas marché. Réessaie, ou vérifie que tu es bien sur le site en HTTPS.')
    }
  }

  if (!supported) {
    return (
      <div className="text-xs text-gray-400 text-center px-4">
        📵 Ton navigateur ne gère pas les notifications push (essaie Chrome ou Safari récent).
      </div>
    )
  }

  if (enabled) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium px-4">
        <span>🔔 Notifications activées</span>
      </div>
    )
  }

  return (
    <div className="text-center px-4">
      <button onClick={enable} disabled={status === 'busy'}
        className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition">
        {status === 'busy' ? '⚡ Activation...' : '🔔 Activer les notifications'}
      </button>
      <p className="text-xs text-gray-400 mt-2">Pour recevoir les alertes de l’enquête et du jeu de rôle, directement sur ton portable.</p>
      {message && (
        <div className={`mt-2 px-4 py-2 rounded-xl text-xs ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}
    </div>
  )
}
