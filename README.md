# Système de Gestion de Bibliothèque - Frontend

Application React + Vite pour la gestion d'une bibliothèque, connectée à une API Laravel backend.

## 🚀 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble avec statistiques
- **Gestion des livres** : Ajouter, modifier, supprimer et rechercher des livres
- **Gestion des membres** : Gérer les membres de la bibliothèque
- **Gestion des emprunts** : Suivre les emprunts et retours de livres

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm ou pnpm
- API Laravel en cours d'exécution

## 🛠️ Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
# ou
pnpm install
```

3. Créer un fichier `.env` à la racine du projet :
```bash
cp .env.example .env
```

4. Configurer l'URL de votre API Laravel dans `.env` :
```env
VITE_API_URL=http://localhost:8000/api
```

## 🚀 Lancement

```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔗 Endpoints API attendus

Votre API Laravel doit exposer les endpoints suivants :

### Livres
- `GET /api/books` - Liste de tous les livres
- `GET /api/books/{id}` - Détails d'un livre
- `POST /api/books` - Créer un nouveau livre
- `PUT /api/books/{id}` - Modifier un livre
- `DELETE /api/books/{id}` - Supprimer un livre

### Membres
- `GET /api/members` - Liste de tous les membres
- `GET /api/members/{id}` - Détails d'un membre
- `POST /api/members` - Créer un nouveau membre
- `PUT /api/members/{id}` - Modifier un membre
- `DELETE /api/members/{id}` - Supprimer un membre

### Emprunts
- `GET /api/loans` - Liste de tous les emprunts
- `GET /api/loans/{id}` - Détails d'un emprunt
- `POST /api/loans` - Créer un nouvel emprunt
- `POST /api/loans/{id}/return` - Marquer un livre comme retourné
- `DELETE /api/loans/{id}` - Supprimer un emprunt

### Statistiques
- `GET /api/stats` - Statistiques du tableau de bord

## 📊 Format des données

### Book
```json
{
  "id": "1",
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "978-2070612758",
  "category": "Jeunesse",
  "available": true
}
```

### Member
```json
{
  "id": "1",
  "name": "Marie Dupont",
  "email": "marie.dupont@email.com",
  "phone": "01 23 45 67 89",
  "membershipDate": "2024-01-15"
}
```

### Loan
```json
{
  "id": "1",
  "bookId": "1",
  "bookTitle": "Le Petit Prince",
  "memberId": "1",
  "memberName": "Marie Dupont",
  "loanDate": "2026-03-10",
  "dueDate": "2026-03-24",
  "returnedDate": null
}
```

### Stats
```json
{
  "totalBooks": 150,
  "totalMembers": 45,
  "activeLoans": 23,
  "overdueLoans": 3
}
```

## 🔧 Configuration CORS Laravel

N'oubliez pas de configurer CORS dans votre API Laravel :

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## 🏗️ Build pour production

```bash
npm run build
# ou
pnpm build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## 📝 Technologies utilisées

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Radix UI Components
- Lucide React (icônes)
- Sonner (notifications)
