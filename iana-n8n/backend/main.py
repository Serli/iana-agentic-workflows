import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from schemas import QueryRequest, QueryResponse, IngestResponse, ChunkResponse
from rag_service import RAGService

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Kreuzberg RAG API", description="A high-performance RAG API powered by Kreuzberg and ChromaDB")

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only, restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG Service 
# Persistence path is ./chroma_db
rag_service = RAGService(db_path="./chroma_db")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Kreuzberg RAG API. See /docs for usage."}

@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(file: UploadFile = File(...)):
    """Ingère un document PDF, le découpe en segments et génère les embeddings via Kreuzberg."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Save file temporarily or permanently
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Step 2: Extract, Chunk, Embed and Store
        num_chunks = rag_service.ingest_file(file_path)
        return IngestResponse(
            message=f"Successfully ingested {file.filename}",
            num_chunks=num_chunks
        )
    except Exception as e:
        # Log error in actual app
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """Recherche les segments les plus pertinents pour une question donnée."""
    try:
        results = rag_service.query(request.question, request.top_k)
        
        # Transform results to schema
        chunk_responses = []
        for r in results:
            chunk_responses.append(ChunkResponse(
                content=r["content"],
                metadata=r["metadata"],
                score=r["score"]
            ))
            
        return QueryResponse(
            question=request.question,
            results=chunk_responses
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
