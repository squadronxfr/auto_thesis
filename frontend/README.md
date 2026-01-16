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
| `/admin` | `AdminDashboard` | 🔒 Privé | **Tableau de bord admin.** Espace principal pour l'admin. Affiche la liste des utilisateurs, permet de contacter l'utilisateur par mail et filtrer par role. (Accessible aussi publiquement temporairement selon configuration routes). |
| `/upload` | `UploadDocument` | 🔒 Privé | **Instruction pour la redaction du memoire** Espace pour l'utilisateur. Permet de donner les directives pour les agents tel que le sujet ainsi que le cahier des charges à upload en format PDF (Accessible aussi publiquement temporairement selon configuration routes). |
| `/error` | `Error` | 🌍 Public | **Page d'erreur.** Affichage générique des erreurs. |
| `*` | - | - | Redirection vers la page d'accueil `/`. |

 