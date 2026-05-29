# 🔌 Serveur MCP IANA RAG

Ce répertoire contient le **Serveur MCP IANA RAG**, qui agit comme une passerelle sécurisée entre un agent d'intelligence artificielle (comme Claude Desktop ou Cursor) et l'API backend RAG de l'AtelierIANA. Il permet à l'IA d'interroger directement votre base de connaissances en temps réel pendant vos conversations à l'aide du protocole MCP (Model Context Protocol).

---

## 📋 Table des Matières

1. [Aperçu du Fonctionnement](#-aperçu-du-fonctionnement)
2. [Prérequis](#-prérequis)
3. [Démarrage Rapide](#-démarrage-rapide)
4. [Outils Disponibles (MCP Tools)](#-outils-disponibles-mcp-tools)
5. [Intégration avec les Clients IA (Claude Desktop, Cursor, etc.)](#-intégration-avec-les-clients-ia-claude-desktop-cursor-etc)
6. [Dépannage (Troubleshooting)](#-dépannage-troubleshooting)

---

## 🔍 Aperçu du Fonctionnement

L'architecture s'organise selon le schéma suivant :

```text
┌─────────────────┐         Standard Input/Output         ┌────────────────┐
│   Client IA     ├──────────────────────────────────────▶│  Serveur MCP   │
│(Claude Desktop, │◀──────────────────────────────────────┤  (FastMCP)     │
│  Cursor, etc.)  │            ou Transport HTTP          └───────┬────────┘
└─────────────────┘                                               │
                                                                  │ Requête HTTP POST
                                                                  │ à /query
                                                                  ▼
                                                          ┌────────────────┐
                                                          │  API Backend   │
                                                          │ (FastAPI, Port │
                                                          │     8000)      │
                                                          └────────────────┘
```

---

## 🛠️ Prérequis

Avant de lancer le serveur MCP, assurez-vous d'avoir :

1.  **Python** version `>= 3.10` installé.
2.  Le **Backend RAG** démarré et fonctionnel à l'adresse **`http://localhost:8000`** (voir le [README Backend](../backend/README.md)).
3.  Installé les paquets requis pour le serveur MCP :
    ```bash
    pip install fastmcp httpx
    ```

---

## 🚀 Démarrage Rapide

### 1. Lancement du serveur MCP
Déplacez-vous dans le répertoire `mcp/` et exécutez le script :

```bash
cd mcp
python mcp_server.py
```

Le serveur démarrera par défaut en mode **streamable-http** sur le port **`10000`**.

---

## 🛠️ Outils Disponibles (MCP Tools)

Le serveur MCP expose un outil principal que l'agent IA peut utiliser de manière autonome :

### `query_rag`
Recherche dans la base de connaissances de l'AtelierIANA des informations pertinentes par rapport à la question posée.

*   **Arguments** :
    *   `question` (str, obligatoire) : La question en langage naturel à rechercher.
    *   `top_k` (int, optionnel) : Le nombre de segments de texte pertinents à extraire (Défaut : `3`).
*   **Format de la réponse** : Une chaîne structurée contenant les morceaux de textes trouvés, les scores de pertinence correspondants, ainsi que la source (le nom du document PDF).

---

## 💻 Intégration avec les Clients IA (Claude Desktop, Cursor, etc.)

Le Model Context Protocol permet à différents outils de se connecter dynamiquement à votre serveur. Voici comment le configurer :

### 1. Claude Desktop (Windows)
Pour donner à l'application officielle Claude Desktop l'accès à votre base de connaissances IANA RAG, modifiez votre fichier de configuration `claude_desktop_config.json`.

*   **Chemin du fichier** : `%APPDATA%\Claude\claude_desktop_config.json`
*   **Configuration à ajouter** :

```json
{
  "mcpServers": {
    "iana-rag": {
      "command": "python",
      "args": [
        "/chemin/vers/le/projet/iana-n8n/mcp/mcp_server.py"
      ],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

*(Pensez à redémarrer Claude Desktop après avoir enregistré le fichier de configuration)*.

### 2. Cursor
Pour ajouter le serveur MCP dans l'éditeur Cursor :
1.  Allez dans **Settings** ⚙️ (Paramètres) -> **Features** -> **MCP**.
2.  Cliquez sur **+ Add New MCP Server**.
3.  Configurez les champs comme suit :
    *   **Name** : `IANA RAG`
    *   **Type** : `command` (si lancé directement) ou `sse` (si le serveur tourne déjà en arrière-plan)
    *   **Command** : `python /chemin/vers/le/projet/iana-n8n/mcp/mcp_server.py`
4.  Cliquez sur **Save**. L'outil apparaîtra instantanément dans le panneau de chat Cursor !

---

## ❓ Dépannage (Troubleshooting)

### 🔴 L'outil renvoie une erreur de connexion au Backend
*   **Message d'erreur** : `An unexpected error occurred` ou `Failed to connect to the backend server`.
*   **Cause** : Le serveur backend sur le port `8000` est éteint ou inaccessible.
*   **Solution** :
    1.  Vérifiez que le backend tourne en ouvrant [http://localhost:8000/](http://localhost:8000/) dans votre navigateur.
    2.  Si le backend écoute sur une autre adresse, modifiez la constante `BACKEND_URL` au début de `mcp_server.py`.

### 🔴 Le port 10000 est déjà utilisé
*   **Cause** : Un autre service (ou une ancienne instance du serveur MCP) tourne déjà sur le port `10000`.
*   **Solution** : Modifiez le paramètre de port à la fin du fichier `mcp_server.py` :
    ```python
    mcp.run(transport="streamable-http", port=10001)  # Changez 10000 par 10001
    ```

### 🔴 Commande `python` introuvable dans la configuration du client IA
*   **Cause** : Le client IA n'arrive pas à résoudre l'exécutable `python`.
*   **Solution** : Remplacez `"command": "python"` par le chemin absolu de votre exécutable Python (ou celui de votre environnement virtuel) dans le fichier de configuration. Exemple :
    *   `"/chemin/vers/le/projet/iana-n8n/.venv/bin/python"` (macOS/Linux) ou `"/chemin/vers/le/projet/iana-n8n/.venv/Scripts/python.exe"` (Windows)
