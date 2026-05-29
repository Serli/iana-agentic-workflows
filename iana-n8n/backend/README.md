# 🚀 API RAG Kreuzberg (Backend)

Ce répertoire contient le backend de **AtelierIANA**, qui fournit une API RAG (Retrieval-Augmented Generation) de haute performance. Il utilise **FastAPI**, **Kreuzberg** (pour l'extraction de texte de haute qualité et la génération d'embeddings multilingues) et **ChromaDB** (pour le stockage et la recherche vectorielle).

---

## 📋 Table des Matières

1. [Aperçu du Système](#-aperçu-du-système)
2. [Prérequis](#-prérequis)
3. [Démarrage Rapide](#-démarrage-rapide)
4. [Configuration](#%EF%B8%8F-configuration)
5. [Points d'Accès de l'API (Endpoints) & Exemples cURL](#-points-daccès-de-lapi-endpoints--exemples-curl)
6. [Structure des Fichiers](#-structure-des-fichiers)
7. [Dépannage (Troubleshooting)](#-dépannage-troubleshooting)

---

## 🔍 Aperçu du Système

Le backend de l'AtelierIANA est conçu pour traiter des documents PDF, les segmenter en portions de texte ("chunks") digestes, calculer leurs vecteurs de caractéristiques ("embeddings") à l'aide d'un modèle multilingue, puis les enregistrer dans une base de données vectorielle locale.

Lorsqu'une question est posée au système, elle est convertie en vecteur de la même manière pour trouver instantanément les segments de texte les plus proches en termes de sens (similarité cosinus calculée à partir de la distance L2 de ChromaDB).

---

## 🛠️ Prérequis

Pour exécuter le backend localement, vous devez disposer des éléments suivants :

*   **Python** : Version `>= 3.12` instée.
*   **Dépendances principales** :
    *   `fastapi` (Framework de développement API)
    *   `uvicorn` (Serveur web ASGI pour exécuter FastAPI)
    *   `chromadb` (Base de données vectorielle locale persistante)
    *   `kreuzberg[all,api]` (Moteur d'extraction, de découpage et de génération d'embeddings)
    *   `python-multipart` (Nécessaire pour la réception de fichiers via formulaires HTTP)

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

Nous vous recommandons d'utiliser le gestionnaire de paquets ultra-rapide `uv`. Depuis la racine du projet :

```bash
# Créez et activez l'environnement virtuel si ce n'est pas déjà fait
uv venv
.venv\Scripts\activate  # Sous Windows (PowerShell)

# Installez le projet avec toutes les dépendances déclarées
uv pip install -r pyproject.toml
```

*(Si vous n'utilisez pas `uv`, vous pouvez utiliser le traditionnel `pip install chromadb fastapi "kreuzberg[all,api]" python-multipart uvicorn`)*.

### 2. Lancement du serveur backend

Exécutez le script d'entrée du backend :

```bash
cd backend
python main.py
```

Le serveur démarrera par défaut à l'adresse **`http://localhost:8000`**.

### 3. Accès à la documentation interactive de l'API

FastAPI génère automatiquement une interface interactive de test. Ouvrez votre navigateur sur :
*   **Swagger UI** : [http://localhost:8000/docs](http://localhost:8000/docs) (Recommandé pour tester directement en un clic !)
*   **ReDoc** : [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## ⚙️ Configuration

Le backend s'initialise avec les configurations par défaut suivantes au démarrage :

| Paramètre | Valeur par défaut | Description |
|---|---|---|
| **Port de l'API** | `8000` | Port d'écoute du serveur FastAPI. |
| **Base Vectorielle** | `./chroma_db` | Dossier local de stockage persistant pour ChromaDB. |
| **Dossier d'Uploads** | `./uploads` | Dossier temporaire pour stocker les fichiers PDF ingérés. |
| **Modèle d'Embeddings** | `"multilingual"` (Preset) | Modèle de Kreuzberg utilisé pour encoder le texte en français et en anglais. |
| **Taille des Chunks** | `1000` caractères | Longueur maximale de chaque segment de texte extrait. |
| **Chevauchement (Overlap)**| `200` caractères | Nombre de caractères partagés entre deux segments consécutifs. |

---

## 📡 Points d'Accès de l'API (Endpoints) & Exemples cURL

### 1. Test de Santé (Health Check)
*   **Méthode** : `GET`
*   **Route** : `/`
*   **Description** : Vérifie que l'API tourne correctement.
*   **Commande de Test** :
    ```bash
    curl -X GET http://localhost:8000/
    ```
*   **Réponse Type** :
    ```json
    {
      "message": "Welcome to the Kreuzberg RAG API. See /docs for usage."
    }
    ```

### 2. Ingestion d'un Document PDF
*   **Méthode** : `POST`
*   **Route** : `/ingest`
*   **Type de contenu** : `multipart/form-data`
*   **Description** : Extrait, segmente, vectorise et stocke un fichier PDF dans la base de données ChromaDB.
*   **Commande de Test** (Remplacez `mon_document.pdf` par le chemin vers votre fichier) :
    ```bash
    curl -X POST http://localhost:8000/ingest \
      -H "Content-Type: multipart/form-data" \
      -F "file=@mon_document.pdf"
    ```
*   **Réponse Type** :
    ```json
    {
      "message": "Successfully ingested mon_document.pdf",
      "num_chunks": 42
    }
    ```

### 3. Recherche par Similarité (Query RAG)
*   **Méthode** : `POST`
*   **Route** : `/query`
*   **Type de contenu** : `application/json`
*   **Description** : Recherche les segments de texte les plus proches sémantiquement de la question.
*   **Corps de la Requête (JSON)** :
    *   `question` (str) : Votre question ou terme de recherche.
    *   `top_k` (int, optionnel) : Nombre de résultats pertinents à renvoyer (Défaut : `3`).
*   **Commande de Test** :
    ```bash
    curl -X POST http://localhost:8000/query \
      -H "Content-Type: application/json" \
      -d "{\"question\": \"Qu'est-ce que l'IANA ?\", \"top_k\": 3}"
    ```
*   **Réponse Type** :
    ```json
    {
      "question": "Qu'est-ce que l'IANA ?",
      "results": [
        {
          "content": "L'IANA (Internet Assigned Numbers Authority) est un département de l'ICANN chargé d'allouer globalement les adresses IP...",
          "metadata": {
            "source": "mon_document.pdf",
            "chunk_index": 0,
            "first_page": 1,
            "last_page": 1
          },
          "score": 0.9412
        }
      ]
    }
    ```

### 4. Purge Complète (Clear System)
*   **Méthode** : `POST`
*   **Route** : `/clear`
*   **Description** : Supprime la collection vectorielle ChromaDB et efface physiquement tous les fichiers PDF stockés dans le répertoire `uploads/`.
*   **Commande de Test** :
    ```bash
    curl -X POST http://localhost:8000/clear
    ```
*   **Réponse Type** :
    ```json
    {
      "message": "Base Chroma et fichiers uploadés supprimés avec succès"
    }
    ```

---

## 📁 Structure des Fichiers

Voici une vue d'ensemble du répertoire `backend` :

```text
backend/
├── main.py            # Point d'entrée de l'application FastAPI, configuration CORS et déclaration des routes.
├── rag_service.py     # Cœur logique : Intégration Kreuzberg, calcul des similarités et requêtes ChromaDB.
├── schemas.py         # Modèles de données Pydantic définissant la structure des requêtes et réponses API.
├── test_rag.py        # Suite de tests ou script utilitaire pour valider le bon fonctionnement de la base RAG.
└── README.md          # Ce fichier README (documentation du backend).
```

---

## ❓ Dépannage (Troubleshooting)

### 🔴 Erreur "Only PDF files are supported"
*   **Cause** : L'API `/ingest` refuse les formats autres que le PDF (comme `.docx` ou `.txt`).
*   **Solution** : Convertissez votre document en format PDF standard avant de l'envoyer.

### 🔴 Erreur au démarrage avec Kreuzberg
*   **Cause** : Kreuzberg télécharge automatiquement les modèles d'embedding lors de sa première exécution. Si vous n'avez pas de connexion internet ou si les ports système bloquent le téléchargement, l'API lèvera une exception.
*   **Solution** : Assurez-vous que votre machine dispose d'un accès internet au premier démarrage.

### 🔴 Base vectorielle corrompue ou verrous d'écriture
*   **Cause** : ChromaDB utilise une base SQLite en arrière-plan qui peut occasionnellement rester verrouillée si le serveur s'est éteint brutalement.
*   **Solution** : Supprimez simplement le dossier `./chroma_db` généré à la racine et relancez le backend pour le recréer à neuf.
