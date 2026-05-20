## 1. Backend Core (RAG Service)

- [x] 1.1 Implémenter la méthode `clear_database()` dans `RAGService` (`backend/rag_service.py`)
- [x] 1.2 Ajouter la suppression de la collection ChromaDB (`delete_collection`) puis la recréation de la collection (`get_or_create_collection`) dans `clear_database()`
- [x] 1.3 Ajouter la suppression de tous les fichiers `.pdf` dans le répertoire `uploads/` au sein de `clear_database()`

## 2. API Endpoint

- [x] 2.1 Ajouter la route `POST /clear` dans `backend/main.py`
- [x] 2.2 Appeler `rag_service.clear_database()` depuis la route `/clear`
- [x] 2.3 Gérer les exceptions et retourner un message de confirmation de succès dans la réponse JSON
