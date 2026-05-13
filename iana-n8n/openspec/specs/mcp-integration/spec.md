# Spécification mcp-integration

## Purpose
Expose les fonctionnalités de l'Atelier IANA sous forme d'un serveur Model Context Protocol (MCP), permettant aux modèles d'IA d'interroger directement la base de connaissances.

## Requirements

### Requirement: Fournir l'outil de recherche RAG
Le système SHALL exposer un outil MCP `query_rag` permettant d'interroger le backend.

#### Scenario: Recherche fructueuse
- **GIVEN** une question et un paramètre optionnel `top_k` fournis à l'outil `query_rag`
- **WHEN** le backend renvoie des résultats valides
- **THEN** le système formate ces résultats en texte lisible (incluant la question, le contenu, le score et la source) et le retourne au modèle

#### Scenario: Aucun résultat trouvé
- **GIVEN** une question fournie à l'outil `query_rag`
- **WHEN** le backend ne renvoie aucun résultat pertinent
- **THEN** le système retourne un message indiquant qu'aucune information pertinente n'a été trouvée

#### Scenario: Erreur de communication avec le backend
- **GIVEN** une requête envoyée au backend via l'outil `query_rag`
- **WHEN** le backend est inaccessible ou renvoie une erreur HTTP
- **THEN** le système capture l'erreur et retourne un message d'erreur contenant le code HTTP et le texte de l'erreur

#### Scenario: Erreur inattendue
- **GIVEN** une requête envoyée à l'outil `query_rag`
- **WHEN** une exception Python inattendue se produit lors du traitement
- **THEN** le système retourne un message d'erreur générique contenant les détails de l'exception
