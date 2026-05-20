## Why

La route API `POST /clear` a été ajoutée côté backend, mais les utilisateurs finaux n'ont aucun moyen d'y accéder depuis l'interface utilisateur. Permettre à l'utilisateur de purger ses données directement depuis le frontend améliorera considérablement l'expérience en évitant des requêtes API manuelles.

## What Changes

- Ajout d'une fonction d'appel API `clearDatabase` dans `services/api.ts`.
- Ajout d'un bouton de suppression (icône `Trash2`) dans le header de l'application (à côté du sélecteur de serveur).
- Implémentation d'une modale de confirmation (boîte de dialogue React avec `framer-motion`) pour sécuriser l'action destructrice.
- Réinitialisation de l'état global du frontend (`results`, `query`, `file`, `ingestStatus`, `error`) suite au succès de la purge pour refléter un système vierge.

## Capabilities

### New Capabilities
- `ui-database-management`: Contrôle et interface de la gestion de la base de données (purge de l'historique et des vecteurs).

### Modified Capabilities

## Impact

- **Services**: Le fichier `services/api.ts` aura un nouvel appel API.
- **Interface Principale**: Le composant `App.tsx` gagnera une nouvelle action (bouton header), un state pour la modale, le composant visuel de modale, et une fonction gérant la réinitialisation de ses variables d'état locales.
