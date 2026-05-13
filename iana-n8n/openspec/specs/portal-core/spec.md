# Spécification portal-core

## Purpose
Fournit l'interface utilisateur principale, intégrant le design system "Bleu MAIF", des mises en page réactives et la gestion interactive de l'état pour les fonctionnalités RAG.

## Requirements

### Requirement: Afficher l'interface principale
Le système SHALL rendre une mise en page réactive avec un en-tête, une section de téléchargement de fichiers et une interface de recherche.

#### Scenario: État initial
- **GIVEN** l'utilisateur navigue sur l'application
- **WHEN** l'application se charge
- **THEN** l'en-tête s'affiche avec le titre du projet et la zone de contenu principal montre les sections de téléchargement et de recherche

#### Scenario: État vide
- **GIVEN** aucun document n'a été indexé et aucune recherche n'a été effectuée
- **WHEN** la zone de résultats de recherche est affichée
- **THEN** un message invite l'utilisateur à indexer un PDF ou à poser une question

### Requirement: Retour visuel et animations
Le système SHALL fournir un retour visuel en temps réel pour les opérations asynchrones à l'aide de Framer Motion.

#### Scenario: États de chargement
- **GIVEN** un processus d'ingestion ou de recherche est en cours
- **WHEN** en attente de la réponse de l'API
- **THEN** un indicateur de chargement et un texte approprié sont affichés sur le bouton respectif

#### Scenario: Animations des résultats
- **GIVEN** une recherche renvoie des résultats avec succès
- **WHEN** les résultats sont rendus
- **THEN** ils apparaissent séquentiellement avec une animation d'apparition progressive (fade-in)
