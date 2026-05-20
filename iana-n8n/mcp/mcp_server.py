import os
import httpx
from fastmcp import FastMCP
from typing import Optional, List, Dict, Any

# Create the MCP server instance
mcp = FastMCP("IANA RAG")

# Backend configuration
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

@mcp.tool()
async def query_rag(question: str, top_k: int = 3) -> str:
    """
    Search the IANA RAG knowledge base for information related to the given question.
    
    Args:
        question: The natural language question to search for.
        top_k: The number of top relevant chunks to retrieve (default is 3).
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/query",
                json={"question": question, "top_k": top_k},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            # Format the results into a readable string for the model
            if not data.get("results"):
                return "No relevant information found in the knowledge base."
            
            formatted_results = [f"Question searched: {data['question']}\n"]
            for i, result in enumerate(data["results"], 1):
                content = result.get("content", "")
                metadata = result.get("metadata", {})
                score = result.get("score", 0.0)
                
                source = metadata.get("source", "Unknown source")
                formatted_results.append(
                    f"Result {i} (Score: {score:.4f}, Source: {source}):\n"
                    f"{content}\n"
                )
            
            return "\n".join(formatted_results)
            
        except httpx.HTTPStatusError as e:
            return f"Error querying backend API: {e.response.status_code} - {e.response.text}"
        except Exception as e:
            return f"An unexpected error occurred: {str(e)}"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"Le backend est à l'adresse {BACKEND_URL}")
    mcp.run(transport="streamable-http", host="0.0.0.0", port=port)
