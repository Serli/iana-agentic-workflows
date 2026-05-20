# Spécification ui-database-management

## Purpose
Gère l'interface utilisateur pour la réinitialisation et la purge complète de l'application, incluant la confirmation de l'action.

## Requirements

### Requirement: Purge de l'environnement depuis l'interface
L'interface doit permettre à l'utilisateur de purger complètement les données de l'application et de retrouver un environnement vide.

#### Scenario: Purge réussie de la base
- **WHEN** l'utilisateur clique sur le bouton de purge dans le header
- **THEN** une modale de confirmation demande s'il est certain de son choix
- **WHEN** l'utilisateur confirme dans la modale
- **THEN** un appel API est effectué vers `POST /clear`
- **THEN** si la réponse est en succès, tous les formulaires (recherche, upload) sont vidés
- **THEN** l'état des résultats (`results`) est réinitialisé et l'interface affiche l'écran de bienvenue "Commencez par indexer un PDF"
- **THEN** la modale de confirmation est fermée

#### Scenario: Annulation de la purge
- **WHEN** l'utilisateur clique sur le bouton de purge
- **THEN** une modale de confirmation apparaît
- **WHEN** l'utilisateur clique sur "Annuler"
- **THEN** la modale disparaît et l'état de l'application n'est pas modifié
