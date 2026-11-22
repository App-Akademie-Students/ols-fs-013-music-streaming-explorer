# sendet die Frage zusammen mit den Projektregeln, dem Datenbankschema und der SQLite-Version an Ollama und gibt die erzeugte SQL-Abfrage oder UNSUPPORTED_QUERY als Text zurück.
import httpx
import os

from dotenv import load_dotenv
load_dotenv()
OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")

# FIXME impl
def send_query_to_ollama(question: str, project_rules: str, sql_schema: str, sqlite_version: str) -> str:
    system_prompt = (
        
        f"Project rules: {project_rules}\n"
        f"SQL-Schema: {sql_schema}\n"
        f"SQLite-Version: {sqlite_version}\n"
        
    )
    json ={
        "model": OLLAMA_MODEL,
        "system": system_prompt,
        "stream": False,
        "prompt": question,
        "options": {
            "temperature": 0,
           # "num_predict": 500,
           # "num_ctx": 4096
        }
      
    }
    with httpx.Client(timeout=120) as client:
        response = client.post(f"{OLLAMA_URL}/api/generate", json=json)
        response.raise_for_status()
        response_json =  response.json()
        return response_json["response"].strip()
