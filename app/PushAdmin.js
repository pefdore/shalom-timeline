'use client'

import { useEffect, useState } from 'react'

export default function PushAdmin({ code, membres }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [url, setUrl] = useState('/investigation')
  const [targets, setTargets] = useState([])
  const [subscribed, setSubscribed] = useState([])
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const refresh = async () => {
    try {
      const res = await fetch(`/api/push/send?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.success) setSubscribed(data.subscribed || [])
    } catch {}
  }

  useEffect(() => { if (open) refresh() }, [open])

  const toggleTarget = (m) => {
    setTargets((prev) => prev.includes(m) ? prev.filter((t) => t !== m) : [...prev, m])
  }

  const send = async () => {
    if (!title.trim() || !message.trim() || busy) return
    setBusy(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, members: targets, title: title.trim(), body: message.trim(), url }),
      })
      const data = await res.json()
      setFeedback({ ok: data.success, text: data.message })
      if (data.success) {
        setTitle('')
        setMessage('')
        await refresh()
      }
    } catch {
      setFeedback({ ok: false, text: 'Erreur réseau. Le pigeon voyageur est perdu.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between font-bold text-gray-800">
        <span>📣 Espace orgas : envoyer une notification</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-gray-400">
            📳 {subscribed.length} portable(s) sur écoute
            {subscribed.length > 0 && ` : ${subscribed.join(', ')}`}
          </p>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Destinataires (aucun sélectionné = tout le groupe)</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTargets([])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${targets.length === 0 ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'}`}>
                Tous
              </button>
              {membres.map((m) => (
                <button key={m} type="button" onClick={() => toggleTarget(m)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${targets.includes(m) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre (ex: 🕵️ Nouvel indice !)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (ex: Un nouvel indice vient d'être dévoilé...)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm" />
          <input value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="Lien à ouvrir au clic (ex: /investigation)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm" />
          <button onClick={send} disabled={busy || !title.trim() || !message.trim()}
            className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50">
            {busy ? '📡 Envoi...' : 'Envoyer 📣'}
          </button>
          {feedback && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${feedback.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {feedback.text}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
