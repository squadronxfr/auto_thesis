# Documentation de l'API Auto Thesis

Cette documentation décrit les endpoints de l'API disponibles pour l'authentification et la gestion des utilisateurs, ainsi que leur intégration dans le frontend.

## Authentification (`/api/v1/auth`)

Ce module gère l'inscription, la connexion, la vérification de session et la déconnexion.

### 1. Inscription (`POST /register`)

Crée un nouvel utilisateur.

*   **Intégration Front:** Oui (`Register.tsx`)
*   **Payload Attendus:**
    ```json
    {
      "first_name": "Jean",      // Requis, min 2 caractères
      "last_name": "Dupont",     // Requis, min 2 caractères
      "email": "jean@mail.com", // Requis, format email valide
      "password": "securePass"   // Requis, min 6 caractères
    }
    ```
*   **Réponse (Succès - 200):**
    ```json
    {
      "message": "Utilisateur créé avec succès",
      "token": "eyJhbGciOiJIUz...",
      "user_id": 1
    }
    ```

### 2. Connexion (`POST /login`)

Authentifie un utilisateur et renvoie un token JWT.

*   **Intégration Front:** Oui (`Login.tsx`)
*   **Payload Attendus:**
    ```json
    {
      "email": "jean@mail.com", // Requis
      "password": "securePass"   // Requis
    }
    ```
*   **Réponse (Succès - 200):**
    ```json
    {
      "message": "Connexion réussie",
      "token": "eyJhbGciOiJIUz...",
      "user": {
        "id": 1,
        "email": "jean@mail.com",
        "first_name": "Jean",
        "last_name": "Dupont"
      }
    }
    ```

### 3. Récupérer l'utilisateur courant (`GET /me`)

Renvoie les informations du profil de l'utilisateur connecté via son token.

*   **Intégration Front:** Oui (`useGetCurrentUser` dans `authQueries.ts`)
*   **Headers Requis:** `Authorization: Bearer <votre_token>`
*   **Payload:** Aucun
*   **Réponse (Succès - 200):**
    ```json
    {
      "id": 1,
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean@mail.com",
      "role": "USER"
    }
    ```

### 4. Déconnexion (`POST /logout`)

Invalide le token de session en le supprimant de la base de données.

*   **Intégration Front:** Oui (`useLogout` dans `authQueries.ts` / `Navbar.tsx`)
*   **Headers Requis:** `Authorization: Bearer <votre_token>`
*   **Payload:** Aucun
*   **Réponse (Succès - 200):**
    ```json
    {
      "message": "Déconnexion réussie"
    }
    ```

## Autres Endpoints (Liste non exhaustive)

Bien que non couverts en détail ci-dessus, voici les préfixes des autres modules de l'API (définis dans `main.py`) :

*   `/api/v1/judge`: Endpoints pour l'agent de jugement.
*   `/api/v1/writer`: Endpoints pour l'agent de rédaction.
*   `/api/v1/research`: Endpoints pour l'agent de recherche.
*   `/api/v1/artifact`: Endpoints pour la gestion des artéfacts.
*   `/api/v1/mcp`: Endpoints pour les outils MCP (Model Context Protocol).

Pour une documentation interactive complète et pour tester les endpoints, lancez le serveur backend et visitez : **`http://localhost:8000/docs`** (Swagger UI).
