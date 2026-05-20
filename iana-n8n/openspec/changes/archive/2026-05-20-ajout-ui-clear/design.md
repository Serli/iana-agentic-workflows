## Context

L'API backend dispose désormais de la route `POST /clear` pour vider complètement le système RAG. L'interface (frontend) doit donc s'adapter pour offrir cette capacité de gestion de la base à l'utilisateur de manière sécurisée et ergonomique, sans perturber le reste de l'application.

## Goals / Non-Goals

**Goals:**
- Intégrer un bouton dans l'entête global de la page qui déclenche la purge.
- Gérer un système de validation via modale pour empêcher une suppression accidentelle.
- Permettre à l'UI de retrouver un état "zéro" parfait post-purge.

**Non-Goals:**
- Un système de permissions complexe (tout visiteur accédant au front local ou remote peut purger, par conception).
- Un système "Undo" / "Annuler" (la suppression backend étant immédiate et destructrice).

## Decisions

**Positionnement UI du bouton**
- *Décision* : Ajouter un bouton subtil (icône de suppression rouge ou secondaire) dans la `div` du header qui contient déjà le sélecteur de l'API distante/locale.
- *Raisonnement* : Regroupe les paramètres "système" (Serveur + Purge de DB) au même endroit.

**Modale de confirmation**
- *Décision* : Utiliser une simple `div` stylisée en surcouche (overlay) avec fond semi-transparent et composants Framer Motion (dont la dépendance est déjà présente) pour animer l'apparition (`<AnimatePresence>`).
- *Raisonnement* : Evite l'appel à une lib tierce pour un besoin unique, tout en gardant l'esthétique du projet.

**Réinitialisation des variables d'état**
- *Décision* : La fin du bloc `try` de la fonction de purge s'occupera d'appeler tous les setters (`setResults([])`, `setQuery('')`, etc.).

## Risks / Trade-offs

- **Risque d'erreurs réseau :** Si la route backend retourne une 500 ou si la connexion échoue, la purge frontend ne doit pas vider l'UI.
- *Mitigation :* On englobe l'appel API dans un `try/catch`. On ne réinitialise les états visuels qu'après le succès (code HTTP 2xx) garanti de la requête.
