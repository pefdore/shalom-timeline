'use client'

import { useEffect, useState } from 'react'
import { isPushSupported, isPushEnabled, isStandalonePWA, isIOS } from './push-client'

export default function PushPopup() {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState('intro')
  const [unsupported, setUnsupported] = useState(false)
  const [pwaNeeded, setPwaNeeded] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const supported = isPushSupported()
      setUnsupported(!supported)
      setStandalone(isStandalonePWA())
      setIos(isIOS())
      if (!supported) {
        if (isIOS() && !isStandalonePWA()) {
          if (sessionStorage.getItem('shalom-push-dismissed')) return
          setPwaNeeded(true)
          setVisible(true)
        }
        return
      }
      if (await isPushEnabled()) return
      if (localStorage.getItem('shalom-push-dismissed')) return
      if (!cancelled) setVisible(true)
    }
    check()
    return () => { cancelled = true }
  }, [])

  const close = () => {
    setVisible(false)
    try { localStorage.setItem('shalom-push-dismissed', '1') } catch {}
  }

  const accept = async () => {
    setBusy(true)
    try {
      const { enablePush } = await import('./push-client')
      const res = await enablePush('')
      if (res.ok) {
        setState('done')
      } else if (res.reason === 'denied') {
        setState('denied')
      } else if (res.reason === 'dismissed') {
        setState('denied')
      } else if (res.reason === 'unsupported') {
        if (ios && !standalone) { setPwaNeeded(true); setState('intro') }
        else { setUnsupported(true); setState('intro') }
      }
    } catch {
      setState('error')
    } finally {
      setBusy(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative slide-up">
        {state === 'done' ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Ton portable est sur écoute !</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tu recevras les notifications de l’enquête et du jeu de rôle, même le site fermé. Ne désinstalle rien, tout est prêt 📳
            </p>
            <button onClick={close}
              className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600">
              Parfait, à fond les notifs 🔔
            </button>
          </div>
        ) : state === 'denied' ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Notifs bloquées...</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tu as refusé les notifications. Sans elles, tu vas rater les indices de l’enquête, les coups d’envoi du jeu de rôle et les annonces surprises.
            </p>
            <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-xs text-left mb-6">
              <b>Pour réactiver :</b> tape sur la petite cloche 🔔 (ou le cadenas 🔒) à côté de la barre d’adresse → Autoriser les notifications.
            </div>
            <button onClick={close}
              className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black">
              J’ai compris
            </button>
          </div>
        ) : state === 'error' ? (
          <div className="text-center">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Petit raté technique</h2>
            <p className="text-sm text-gray-500 mb-6">
              L’activation n’a pas abouti. Recharge la page et réessaie — ou vérifie que tu es bien sur le site en HTTPS.
            </p>
            <button onClick={() => setState('intro')}
              className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600">
              Réessayer
            </button>
          </div>
        ) : unsupported ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📵</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Navigateur non compatible</h2>
            <p className="text-sm text-gray-500 mb-6">
              Ton navigateur ne gère pas les notifications push. Essaie avec Chrome ou Safari récent — c’est indispensable pour jouer.
            </p>
            <button onClick={close}
              className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black">
              OK
            </button>
          </div>
        ) : pwaNeeded ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📲</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Installe la webapp, c’est 30 secondes</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sur iPhone, les notifications ne marchent que si le site est installé comme app. C’est LA condition pour recevoir les indices de l’enquête et le lancement du jeu de rôle.
            </p>
            <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-4 text-sm text-left space-y-2 mb-6">
              <p><b>1.</b> Ouvre ce site dans <b>Safari</b> (pas Chrome)</p>
              <p><b>2.</b> Tape sur le bouton <b>Partager</b> en bas : <span className="font-mono bg-white px-2 py-0.5 rounded border">⬆️</span></p>
              <p><b>3.</b> Choisis <b>« Sur l’écran d’accueil »</b></p>
              <p><b>4.</b> Ouvre la webapp depuis l’icône et active les notifs 🔔</p>
            </div>
            <button onClick={close}
              className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600">
              C’est bon, j’installe !
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Attends, ça concerne ton portable !</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              <b className="text-gray-700">L’enquête et le jeu de rôle de ce site fonctionnent avec des notifications push.</b> C’est comme ça que tu sauras qu’un nouvel indice est dévoilé, que le jeu de rôle démarre, ou qu’une annonce surprise tombe.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex gap-2"><span>🕵️</span> <span>Un essai par mois pour l’enquête : sois prévenu(e) à l’ouverture du mois</span></li>
              <li className="flex gap-2"><span>🎲</span> <span>Jeu de rôle : les coups d’envoi se font par notification</span></li>
              <li className="flex gap-2"><span>📵</span> <span>Sans notifs = jouer à l’aveugle et rater les moments cultes</span></li>
            </ul>
            <div className="space-y-3">
              <button onClick={accept} disabled={busy}
                className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50 text-lg">
                {busy ? '⏳ Activation...' : 'J’active les notifs 🔔'}
              </button>
              <button onClick={close} disabled={busy}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 underline">
                Plus tard (mais tu vas rater des trucs...)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
