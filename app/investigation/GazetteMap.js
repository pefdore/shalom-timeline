'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function GazetteMap({ points, gazette }) {
  const found = points.filter((p) => p.found)
  if (found.length === 0) return null
  return (
    <MapContainer center={[46.6, 2.4]} zoom={5} scrollWheelZoom={false}
      className="rounded-2xl overflow-hidden" style={{ height: '340px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {found.map((p, i) => {
        const attempts = (gazette || []).filter((g) => g.guess === p.guess)
        const isCorrect = attempts.some((g) => g.correct)
        return (
          <Marker key={i} position={[p.lat, p.lng]} icon={isCorrect ? greenIcon : redIcon}>
            <Popup>
              <b>{p.label}</b><br />
              {attempts.map((a, j) => (
                <span key={j}>{a.member} : {a.correct ? '🎉 trouvé !' : '❌ raté'}<br /></span>
              ))}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
