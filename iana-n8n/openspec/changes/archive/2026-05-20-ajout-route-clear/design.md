## Context

L'application utilise ChromaDB pour stocker les embeddings de documents PDF et conserve les fichiers originaux dans le répertoire `uploads/`. Lors des phases de test ou lorsque l'utilisateur veut réinitialiser son environnement de travail, il n'y a pas de route API dédiée pour purger les données. Une solution manuelle est fastidieuse et source d'erreurs (désynchronisation entre les fichiers physiques et la base vectorielle).

## Goals / Non-Goals

**Goals:**
- Fournir un endpoint unique (`POST /clear`) permettant de vider le système RAG.
- Assurer la consistance entre la base de données vectorielle et le stockage de fichiers locaux.
- Réutiliser l'instance de la collection existante sans nécessiter un redémarrage du backend.

**Non-Goals:**
- Implémenter une authentification ou autorisation complexe au niveau du backend (la sécurité est déléguée au frontend dans cette itération).
- Archiver ou sauvegarder les données avant suppression (le "clear" est définitif).

## Decisions

**Approche de la suppression ChromaDB : Drop & Recreate Collection**
- *Alternative envisagée* : Utiliser `client.reset()` (nécessite `ALLOW_RESET=TRUE`) ou `collection.delete(where={})`.
- *Décision* : Supprimer la collection complète et la recréer.
- *Raisonnement* : Cette approche est souvent plus propre et rapide que de supprimer les entités individuellement. Elle garantit qu'aucun état résiduel ne pollue les futures ingestions.

**Synchronisation du dossier `uploads/`**
- *Alternative envisagée* : Ne pas supprimer les fichiers et nettoyer uniquement ChromaDB.
- *Décision* : Le service backend itérera sur le dossier `uploads/` et supprimera tous les fichiers `.pdf`.
- *Raisonnement* : Évite l'accumulation de fichiers orphelins et garantit que le système repart à zéro.

## Risks / Trade-offs

- **Risque de corruption si requêtes concurrentes :** Si des requêtes d'ingestion ou de recherche sont exécutées en même temps que la suppression, la recréation de la collection peut provoquer des erreurs.
- *Mitigation :* En environnement local/monoutilisateur, ce risque est faible. Si l'application passe en production, un mécanisme de verrou (lock) sur le RAGService pourrait être nécessaire. Pour le moment, nous assumons un usage séquentiel.
