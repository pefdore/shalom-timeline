import './globals.css'
import PushPopup from './PushPopup'

export const metadata = {
  title: 'Shalom Project - Le Pantheon des Votes',
  description: 'Votez pour les trophées du week-end',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shalom',
  },
}

export const viewport = {
  themeColor: '#f59e0b',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <PushPopup />
      </body>
    </html>
  )
}
