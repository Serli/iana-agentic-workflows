import requests
import time
import os
import subprocess
import os

def test_rag():
    # # Start the server in the background
    # print("Starting FastAPI server...")
    # server_process = subprocess.Popen(
    #     [".venv/Scripts/python", "-m", "uvicorn", "main:app", "--port", "8000"],
    #     stdout=subprocess.PIPE,
    #     stderr=subprocess.PIPE,
    #     text=True
    # )
    
    # # Give the server some time to start (model loading can be slow)
    # time.sleep(15)
    
    base_url = "http://127.0.0.1:8000"
    
    try:
        # 1. Ingest a document
        pdf_file = "pdf/maif-auto.pdf"
        if os.path.exists(pdf_file):
            print(f"Ingesting {pdf_file}...")
            with open(pdf_file, "rb") as f:
                response = requests.post(
                    f"{base_url}/ingest",
                    files={"file": (pdf_file, f, "application/pdf")}
                )
            print("Ingest Response:", response.json())
        else:
            print(f"Error: {pdf_file} not found locally.")
            return

        # 2. Query the RAG
        print("Querying the RAG...")
        query_data = {
            "question": "Quelles sont les garanties incluses dans le contrat ?",
            "top_k": 2
        }
        response = requests.post(f"{base_url}/query", json=query_data)
        
        print("\n--- Query Results ---")
        if response.status_code == 200:
            results = response.json()
            for i, res in enumerate(results["results"]):
                print(f"\nResult {i+1} (Score: {res['score']:.4f}):")
                print(f"Content: {res['content'][:200]}...")
                print(f"Metadata: {res['metadata']}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    finally:
        # Terminate the server
        print("\nStopping FastAPI server...")
        # server_process.terminate()

if __name__ == "__main__":
    test_rag()
