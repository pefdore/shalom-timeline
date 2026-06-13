# 🏆 Shalom Project - Le Panthéon des Votes

Système de vote interactif pour élire les trophées du week-end Shalom.

## Fonctionnalités

- 🎯 Interface de vote par catégorie (20 catégories)
- 🎮 Système de Podium 3D avec drag & drop
- 📊 Barre de progression avec messages humoristiques
- 📰 Ticker "Flash Infos" en temps réel
- 🎉 Confettis et écran de fin personnalisé
- 🔐 Authentification par prénom + code secret
- ☁️ Stockage votes via Google Sheets (optionnel)

## Installation Locale

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Déploiement sur Vercel

1. Crée un compte [Vercel](https://vercel.com)
2. Connecte ton repo GitHub
3. Les variables d'environnement sont optionnelles (mode dev activé par défaut)
4. Déploie !

## Structure des votes

Chaque catégorie reçoit 3 votes:
- 🥇 1ère place: 3 points
- 🥈 2e place: 2 points  
- 🥉 3e place: 1 point

## Configuration Google Sheets (Optionnel)

Pour activer le stockage dans Google Sheets:

1. Crée un Google Sheet avec l'onglet "Membres" contenant:
   - Colonne A: Prénom
   - Colonne B: Code secret
   - Colonne C: A déjà voted (TRUE/FALSE)

2. Crée un onglet "Votes" pour enregistrer les votes

3. Configure les variables d'environnement dans Vercel

## Personnalisation

- Modifie `PARTICIPANTS` dans `app/page.js` pour changer les votants
- Modifie `CATEGORIES` pour ajouter/retirer des catégories
- Modifie `PROGRESS_MESSAGES` pour personnaliser les messages
- Modifie `TICKER_PHRASES` pour le bandeau d'actualités

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Canvas Confetti
- Google Sheets API (optionnel)