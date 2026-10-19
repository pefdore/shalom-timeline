'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 8)
    } else {
      map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 9 })
    }
  }, [points, map])
  return null
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function dateLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`
}

export default function GazetteMap({ points, gazette }) {
  const found = points.filter((p) => p.found)
  if (found.length === 0) {
    return (
      <div className="h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm px-6 text-center">
        😶 Aucune proposition n'a été localisée sur une carte.<br />Soit le groupe est très mauvais en géographie, soit c'est volontaire.
      </div>
    )
  }
  return (
    <MapContainer center={[46.6, 2.4]} zoom={5} scrollWheelZoom={false}
      className="rounded-2xl overflow-hidden" style={{ height: '340px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={found} />
      {found.map((p, i) => {
        const attempts = (gazette || []).filter((g) => g.guess === p.guess)
        return (
          <Marker key={i} position={[p.lat, p.lng]} icon={redIcon}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <b>{p.label}</b>
                {attempts.map((a, j) => (
                  <div key={j} style={{ marginTop: 4 }}>
                    😂 <b>{a.member}</b> a osé « {a.guess} »{a.at ? ` (${dateLabel(a.at)})` : ''}
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
