from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 3

class ChunkResponse(BaseModel):
    content: str
    metadata: Dict[str, Any]
    score: float

class QueryResponse(BaseModel):
    question: str
    results: List[ChunkResponse]

class IngestResponse(BaseModel):
    message: str
    num_chunks: int
