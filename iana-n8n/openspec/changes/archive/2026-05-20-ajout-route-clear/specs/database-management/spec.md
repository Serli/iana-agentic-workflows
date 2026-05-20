## ADDED Requirements

### Requirement: Purge complète du système
Le système doit fournir un moyen de purger l'intégralité de la base de données vectorielle et des fichiers sources uploadés pour permettre de réinitialiser l'environnement de travail.

#### Scenario: Appel à la route de nettoyage
- **WHEN** un client effectue une requête `POST /clear` sur l'API backend
- **THEN** la collection ChromaDB est complètement supprimée puis recréée à vide
- **THEN** tous les fichiers `.pdf` présents dans le répertoire `uploads/` sont supprimés
- **THEN** l'API renvoie un message de succès
