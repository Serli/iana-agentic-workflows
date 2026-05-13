# Spécification document-ingestion

## Purpose
Gère le téléchargement, l'extraction, le découpage et la vectorisation des documents PDF à l'aide de Kreuzberg, et stocke les vecteurs et métadonnées résultants dans ChromaDB.

## Requirements

### Requirement: Traiter les PDF téléchargés
Le système SHALL ingérer les fichiers PDF téléchargés et les traiter en segments consultables.

#### Scenario: Ingestion réussie d'un PDF
- **GIVEN** un fichier PDF valide téléchargé via le point de terminaison `/ingest`
- **WHEN** le processus d'ingestion se termine avec succès
- **THEN** le système renvoie un message de succès ainsi que le nombre de segments générés

#### Scenario: Type de fichier non valide
- **GIVEN** un fichier avec une extension autre que `.pdf`
- **WHEN** le fichier est téléchargé sur le point de terminaison `/ingest`
- **THEN** le système renvoie une erreur 400 Bad Request indiquant que seuls les fichiers PDF sont pris en charge

#### Scenario: Erreur de traitement
- **GIVEN** un fichier PDF valide
- **WHEN** une erreur inattendue se produit lors de l'extraction du texte ou de la vectorisation via Kreuzberg
- **THEN** le système renvoie une erreur 500 Internal Server Error avec les détails de l'erreur

### Requirement: Segmenter et vectoriser le document
Le système SHALL diviser le document en segments qui se chevauchent et calculer les embeddings multilingues.

#### Scenario: Configuration du découpage
- **GIVEN** un PDF téléchargé
- **WHEN** le document est traité
- **THEN** il est divisé en segments d'un maximum de 1000 caractères avec un chevauchement de 200 caractères

#### Scenario: Stockage dans la base de données vectorielle
- **GIVEN** les embeddings et les segments générés
- **WHEN** le traitement est terminé
- **THEN** les segments, les embeddings et les métadonnées (fichier source, index du segment, numéros de page) sont stockés dans ChromaDB
