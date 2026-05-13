# Atelier IANA - RAG Intelligence Documentaire

Une solution de RAG (Retrieval-Augmented Generation) complète, performante et moderne. Ce projet combine une API robuste propulsée par **Kreuzberg** et une interface utilisateur "Premium" pour l'indexation et la recherche sémantique.

## 🚀 Fonctionnalités

- **Interface Utilisateur Moderne** : Dashboard React élégant avec le thème "Bleu MAIF", animations fluides et retour d'état en temps réel.
- **Ingestion Intelligente** : Extraction de texte, chunking optimisé et génération d'embeddings multilingues à partir de fichiers PDF via **Kreuzberg**.
- **Recherche Sémantique Avancée** : Recherche ultra-rapide avec calcul de score de similarité et tri par pertinence.
- **Métadonnées Enrichies** : Affichage de la source et des numéros de pages pour chaque résultat trouvé.
- **Architecture Découplée** : Backend FastAPI asynchrone et Frontend Vite/React/TypeScript.

## 🛠️ Stack Technique

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** : Framework web Python haute performance.
- **[Kreuzberg](https://github.com/Goldziher/kreuzberg)** : Bibliothèque d'intelligence documentaire (extraction de texte et embeddings multilingues via ONNX).
- **[ChromaDB](https://www.trychroma.com/)** : Base de données vectorielle pour la persistance des documents.

### Frontend
- **[React](https://reactjs.org/)** + **[Vite](https://vitejs.dev/)** : Rapidité de développement et de rendu.
- **[Framer Motion](https://www.framer.com/motion/)** : Micro-animations pour une expérience utilisateur premium.
- **[Lucide React](https://lucide.dev/)** : Iconographie moderne.
- **Axios** : Communication fluide avec l'API.

## 📋 Prérequis

- Python 3.12+
- Node.js 18+ & npm/pnpm/yarn
- [uv](https://github.com/astral-sh/uv) (fortement recommandé pour le Python)

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <votre-depot>
cd AtelierIANA
```

### 2. Backend
```powershell
# Avec uv (recommandé)
uv sync

# Avec pip
python -m venv .venv
.\.venv\Scripts\activate
pip install -r pyproject.toml
```

### 3. Frontend
```powershell
cd frontend
npm install
cd ..
```

## 🏃 Lancement

Le projet nécessite de lancer simultanément le backend et le frontend.

### 1. Démarrer le backend (API)
Depuis la racine :
```powershell
# Utiliser uv run (le plus simple)
uv run --project . --cwd backend python -m uvicorn main:app --reload --port 8000

# OU manuellement avec le venv
# .\.venv\Scripts\activate  (si pas déjà fait)
# cd backend
# python -m uvicorn main:app --reload --port 8000
```
L'API sera disponible sur `http://localhost:8000`. Documentation Swagger sur `/docs`.

### 2. Démarrer le frontend
Ouvrez un nouveau terminal :
```powershell
cd frontend
npm run dev
```
L'interface sera disponible sur `http://localhost:5173`.

## 📁 Structure du Projet

```text
AtelierIANA/
├── backend/            # Logique Python & FastAPI
│   ├── main.py         # Point d'entrée de l'API & Middleware CORS
│   ├── rag_service.py  # Service RAG (Kreuzberg & ChromaDB)
│   ├── schemas.py      # Modèles Pydantic
│   └── chroma_db/      # Stockage de la DB vectorielle
├── frontend/           # Application React
│   ├── src/
│   │   ├── App.tsx     # Composant principal (UI RAG)
│   │   └── index.css   # Design System & Thème Bleu MAIF
│   └── vite.config.ts  # Configuration Vite
├── uploads/            # Fichiers PDF temporaires
└── README.md           # Ce document
```

## 🧪 Tests Backend

Pour valider uniquement la chaîne RAG sans l'interface :
```powershell
python backend/test_rag.py
```
