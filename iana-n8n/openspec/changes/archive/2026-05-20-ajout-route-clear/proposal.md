## Why

L'application stocke actuellement les embeddings dans ChromaDB et les fichiers correspondants dans un répertoire local `uploads/`. Pour le moment, il n'existe pas de moyen programmatique de réinitialiser complètement le contexte de l'application. Cette fonctionnalité est cruciale pour le développement, les tests, et pour permettre à l'utilisateur de purger ses données vectorisées et ses fichiers source lorsqu'il souhaite repartir de zéro.

## What Changes

- Ajout d'une nouvelle route `POST /clear` dans l'API backend (`main.py`).
- Ajout d'une méthode de suppression complète de la base de données (ChromaDB) et de recréation de la collection dans le service RAG.
- Ajout d'une logique pour supprimer tous les fichiers PDF physiquement stockés dans le dossier `uploads/` côté backend afin de maintenir la synchronisation entre les fichiers et la base de données.
- La confirmation de suppression (mesure de sécurité) sera gérée exclusivement côté frontend.

## Capabilities

### New Capabilities
- `database-management`: Gestion globale de la persistance (purge de la base vectorielle et suppression des fichiers sources associés).

### Modified Capabilities

## Impact

- **Backend API (`main.py`)**: Nouvelle route `POST /clear`.
- **RAG Service (`rag_service.py`)**: Nouvelle méthode `clear_database()` pour la gestion de la suppression de la collection ChromaDB et des fichiers du dossier `uploads/`.
- **Système de fichiers**: Le dossier `uploads/` sera impacté par les suppressions de fichiers.
