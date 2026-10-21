'use client'

import { useEffect, useState, useCallback } from 'react'
import { isPushSupported, isPushEnabled, enablePush } from './push-client'

export default function PushNotifications({ member = '' }) {
  const [supported, setSupported] = useState(true)
  const [status, setStatus] = useState('idle')
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')

  const checkSubscription = useCallback(async () => {
    if (!isPushSupported()) {
      setSupported(false)
      return
    }
    setEnabled(await isPushEnabled())
  }, [])

  useEffect(() => { checkSubscription() }, [checkSubscription])

  const enable = async () => {
    setMessage('')
    if (!isPushSupported()) {
      setSupported(false)
      return
    }
    setStatus('busy')
    try {
      const res = await enablePush(member)
      if (res.ok) {
        setEnabled(true)
        setStatus('done')
        setMessage('C’est bon, ton portable est sur écoute ! 📳')
      } else if (res.reason === 'denied') {
        setStatus('error')
        setMessage('Notifs bloquées. Tape sur la petite cloche 🔔 à côté de la barre d’adresse → Autoriser.')
      } else {
        setStatus('error')
        setMessage('Activation refusée. Sans notifs, tu joueras à l’aveugle...')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Bof, ça n’a pas marché. Réessaie, ou vérifie que tu es bien sur le site en HTTPS.')
    }
  }

  if (!supported) {
    return (
      <div className="text-xs text-gray-400 text-center px-4">
        📵 Ton navigateur ne gère pas les notifications push (essaie Chrome ou Safari récent, ou installe la webapp sur iPhone).
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
      <p className="text-xs text-gray-400 mt-2">Obligatoire pour l’enquête et le jeu de rôle : tout passe par les notifs.</p>
      {message && (
        <div className={`mt-2 px-4 py-2 rounded-xl text-xs ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}
    </div>
  )
}
