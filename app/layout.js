import './globals.css'

export const metadata = {
  title: 'Shalom Project - Le Pantheon des Votes',
  description: 'Votez pour les trophées du week-end',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}