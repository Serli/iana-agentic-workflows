# Project Context

## Purpose
A complete, high-performance, and modern Retrieval-Augmented Generation (RAG) solution. It combines a robust API powered by Kreuzberg for document intelligence and a React UI for indexing and semantic search.

## Tech Stack
### Frontend
- React 19
- Vite
- TypeScript
- Framer Motion
- Lucide React

### Backend
- Python 3.12+
- FastAPI
- Kreuzberg (text extraction and multilingual embeddings via ONNX)
- ChromaDB (vector database)

### Infrastructure
- uv (Python package manager)
- npm (Node package manager)

## Project Conventions
### Code Style
- Vanilla CSS with a specific "MAIF Blue" theme.
- Modern typography and micro-animations for a premium user experience.

### Architecture Patterns
- **Decoupled Architecture**: FastApi asynchronous backend and Vite/React/TypeScript frontend.
- **Service Layer Pattern**: Separation of routing (`main.py`) and business logic (`rag_service.py`).

### Testing Strategy
- Manual test scripts (e.g., `test_rag.py`) for validating the RAG chain without UI.

## Important Constraints
- Only supports PDF files for ingestion.
- Multilingual preset used for embeddings (Kreuzberg).
- In-memory persistence through ChromaDB (`./chroma_db` directory).
- Fast and asynchronous components to maintain UI responsiveness.
