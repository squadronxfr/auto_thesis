# Auto Thesis - Frontend

Ce dossier contient le code source de l'interface utilisateur de l'application **Auto Thesis**, une plateforme permettant la génération de mémoires académiques assistée par des agents d'intelligence artificielle.

## 🗺️ Pages et Routes

Voici le recensement exhaustif des pages, leur contenu et les routes associées définies dans l'application.

| Route | Composant | Accès | Description & Contenu |
|-------|-----------|-------|-----------------------|
| `/` | `LandingPage` | 🌍 Public | **Page d'accueil.** Présentation du produit, fonctionnalités, indicateurs d'étapes, et liens vers authentification. Utilise des animations Framer Motion. |
| `/login` | `Login` | 🌍 Public | **Connexion.** Formulaire permettant aux utilisateurs existants de se connecter. Liens vers récupération de mot de passe et inscription. |
| `/register` | `Register` | 🌍 Public | **Inscription.** Processus de création de compte pour les nouveaux utilisateurs. Formulaire multi-étapes. |
| `/forgot-password` | `ForgotPassword` | 🌍 Public | **Mot de passe oublié.** Formulaire pour initier la procédure de réinitialisation du mot de passe. |
| `/dashboard` | `DashboardCustomer` | 🔒 Privé | **Tableau de bord client.** Espace principal pour l'utilisateur. Affiche la liste des mémoires générés, permet la prévisualisation PDF et le téléchargement. (Accessible aussi publiquement temporairement selon configuration routes). |
| `/app` | - | 🔒 Privé | Redirection automatique vers `/profile`. |
| `/profile` | `Profile` | 🔒 Privé | **Profil utilisateur.** Affiche les informations de l'utilisateur connecté (Email, Nom, Prénom, Rôles). |
| `/users` | `Users` | 🔒 Privé | **Gestion des utilisateurs.** (Probablement Admin). Liste des utilisateurs avec recherche, filtres et pagination infinie. |
| `/error` | `Error` | 🌍 Public | **Page d'erreur.** Affichage générique des erreurs. |
| `*` | - | - | Redirection vers la page d'accueil `/`. |

## 🏗️ Structure des Dossiers Clés

- **`src/features`** : Contient les composants de pages regroupés par fonctionnalité (auth, landing, documents, user, users).
- **`src/components`** : Composants réutilisables (UI kit, Layouts, etc.).
- **`src/routes`** : Définition des routes (AppRoutes) et guards (PrivateRoutes, PublicRoutes).
- **`src/api`** : Services pour les appels API backend.
- **`src/stores`** : Gestion d'état global (Zustand).

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18+ recommandé)
- pnpm (recommandé) ou npm

### Installation des dépendances
```bash
cd frontend
pnpm install
```

### Lancer le serveur de développement
```bash
pnpm dev
```
L'application sera accessible sur `http://localhost:5173` (port par défaut de Vite).

### Construction pour la production
```bash
pnpm build
```

