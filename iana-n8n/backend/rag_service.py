import os
import chromadb
import kreuzberg
from kreuzberg import ExtractionConfig, ChunkingConfig, EmbeddingConfig, EmbeddingModelType

class RAGService:
    def __init__(self, db_path: str = "./chroma_db"):
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma_client.get_or_create_collection(name="documents")
        
        # Configure Kreuzberg 4.6+
        # EmbeddingConfig doit être dans ChunkingConfig.embedding (pas dans ExtractionConfig)
        self.embedding_config = EmbeddingConfig(
            model=EmbeddingModelType.preset("multilingual")
        )
        # Config pour l'ingestion : découpe en chunks + embeddings
        self.chunking_config = ChunkingConfig(
            max_chars=1000,
            max_overlap=200,
            embedding=self.embedding_config
        )
        self.extraction_config = ExtractionConfig(
            chunking=self.chunking_config
        )
        # Config pour la requête : pas de limite de taille pour ne garder qu'1 chunk
        self.query_chunking_config = ChunkingConfig(
            embedding=self.embedding_config
        )
        self.query_extraction_config = ExtractionConfig(
            chunking=self.query_chunking_config
        )

    def ingest_file(self, file_path: str):
        # Process the file with Kreuzberg
        result = kreuzberg.extract_file_sync(file_path, config=self.extraction_config)
        
        ids = []
        embeddings = []
        documents = []
        metadatas = []
        
        filename = os.path.basename(file_path)
        
        if not result.chunks:
            return 0
            
        for i, chunk in enumerate(result.chunks):
            chunk_id = f"{filename}_{i}"
            ids.append(chunk_id)
            embeddings.append(chunk.embedding)
            documents.append(chunk.content)
            # Merge chunk metadata with source info
            meta = {
                "source": filename,
                "chunk_index": i,
                "first_page": chunk.metadata.get("first_page", 0),
                "last_page": chunk.metadata.get("last_page", 0)
            }
            metadatas.append(meta)
            
        if ids:
            # ChromaDB expects a list of embeddings (lists of floats)
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            
        return len(ids)

    def query(self, question: str, top_k: int = 3):
        # Embed the query using Kreuzberg's extract_bytes_sync
        # extract_bytes_sync(data, mime_type, config) — mime_type est obligatoire en 4.6+
        query_result = kreuzberg.extract_bytes_sync(
            question.encode("utf-8"),
            "text/plain",
            self.query_extraction_config
        )
        
        if not query_result.chunks:
            return []
        
        # Prendre le premier chunk (la question entière)
        query_embedding = query_result.chunks[0].embedding
        if query_embedding is None:
            return []
        
        # Search in ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        formatted_results = []
        for i in range(len(results["ids"][0])):
            distance = results["distances"][0][i] if "distances" in results else 0.0
            # ChromaDB retourne par défaut une distance L2 (plus la distance est petite, plus c'est pertinent)
            # On la convertit en un score de similarité (plus grand = plus pertinent)
            similarity = 1.0 / (1.0 + distance)
            
            formatted_results.append({
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": similarity
            })
            
        # S'assurer que les résultats sont bien triés du plus pertinent (score le plus haut) au moins pertinent
        formatted_results.sort(key=lambda x: x["score"], reverse=True)
            
        return formatted_results
