# Spécification semantic-search

## Purpose
Traite les questions des utilisateurs pour trouver les segments de document les plus pertinents dans ChromaDB en utilisant la similarité sémantique, et renvoie les résultats avec des scores de pertinence et des métadonnées.

## Requirements

### Requirement: Interroger les documents
Le système SHALL accepter les requêtes en langage naturel et renvoyer les segments de documents sémantiquement similaires.

#### Scenario: Recherche réussie
- **GIVEN** une requête soumise au point de terminaison `/query`
- **WHEN** la recherche se termine avec succès
- **THEN** le système renvoie les 4 segments les plus pertinents

#### Scenario: Gestion d'une requête vide
- **GIVEN** une requête vide ou contenant uniquement des espaces
- **WHEN** soumise via l'interface utilisateur
- **THEN** la requête de recherche est bloquée et le bouton de recherche est désactivé

#### Scenario: Erreur de recherche
- **GIVEN** une requête soumise
- **WHEN** une erreur inattendue se produit dans le processus de vectorisation ou la requête à la base de données
- **THEN** le système renvoie une erreur 500 Internal Server Error avec les détails de l'erreur

### Requirement: Notation et formatage des résultats
Le système SHALL calculer et présenter les scores de pertinence et les métadonnées pour chaque résultat.

#### Scenario: Conversion de la distance en similarité
- **GIVEN** les métriques brutes de distance L2 de ChromaDB
- **WHEN** les résultats sont traités
- **THEN** les distances sont converties en un score de similarité (1.0 / (1.0 + distance))

#### Scenario: Trier les résultats
- **GIVEN** plusieurs segments pertinents
- **WHEN** les résultats sont renvoyés
- **THEN** ils sont triés par ordre décroissant de leur score de similarité
