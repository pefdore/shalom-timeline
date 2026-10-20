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

Chaque catégorie propose un podium à 3 places (glisser-déposer, échange de places possible) :
- 🥇 1ère place : 3 points
- 🥈 2e place : 2 points
- 🥉 3e place : 1 point

On peut passer une catégorie ou revenir en arrière pour modifier ses votes.
Les égalités sont gérées : deux personnes à égalité partagent le même rang.
Esprit des trophées : drôle, bienveillant et inclusif — ici, personne n'est un perdant. ❤️

## Résultats

- `GET /api/results` retourne le podium par catégorie (rang, médaille, points).
- `GET /api/vote` (mode production) retourne les mêmes podiums.
- Les catégories sont définies une seule fois dans `lib/awards.js` (partagé entre la page de vote et les API).

## Configuration Google Sheets (Optionnel)

Pour activer le stockage dans Google Sheets:

1. Crée un Google Sheet avec l'onglet "Membres" contenant:
   - Colonne A: Prénom
   - Colonne B: Code secret
   - Colonne C: A déjà voted (TRUE/FALSE)

2. Crée un onglet "Votes" pour enregistrer les votes

3. Configure les variables d'environnement dans Vercel

## Personnalisation

- Modifie `PARTICIPANTS` dans `app/awards/page.js` pour changer les votants
- Modifie `CATEGORIES` dans `lib/awards.js` pour ajouter/retirer des catégories (source unique, utilisée aussi par les API)
- Modifie `PROGRESS_MESSAGES` et `TICKER_PHRASES` dans `app/awards/page.js` pour personnaliser les messages
- Modifie `VOTER_PROFILES` dans `app/awards/page.js` pour les profils de fin

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Canvas Confetti
- Google Sheets API (optionnel)