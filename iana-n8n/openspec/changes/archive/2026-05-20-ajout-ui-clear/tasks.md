## 1. Services API

- [x] 1.1 Ajouter la fonction `clearDatabase` effectuant un appel `api.post('/clear')` dans `frontend/src/services/api.ts`

## 2. Intégration UI

- [x] 2.1 Importer `Trash2` depuis `lucide-react` et `clearDatabase` dans `frontend/src/App.tsx`
- [x] 2.2 Créer les variables d'état React pour gérer la modale de confirmation (`showClearConfirm`, `isClearing`)
- [x] 2.3 Ajouter le bouton "Purger la base" dans le `<header>`, à côté du composant de sélection du serveur
- [x] 2.4 Créer la méthode asynchrone `onClearDatabase` qui gère l'appel API `clearDatabase()` et réinitialise les états (`setResults([])`, `setQuery('')`, etc.)

## 3. Composant Modale

- [x] 3.1 Créer la structure JSX conditionnelle (`<AnimatePresence>`) pour la modale de confirmation à la racine du composant `App`
- [x] 3.2 Styliser l'overlay (arrière-plan noir semi-transparent) et la carte de la boîte de dialogue (boutons de validation rouges / annulation)
- [x] 3.3 Relier les boutons de la modale pour fermer ou déclencher `onClearDatabase`
