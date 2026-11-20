import httpx
import os
import json

from dotenv import load_dotenv
load_dotenv()
OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")

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
    payload ={
        "model": OLLAMA_MODEL,
        "system": system_prompt,
        "stream": False,
        "prompt": question,
        "format": {
            "type": "object",
            "properties": {
                "sql": {"type": "string"}
            },
            "required": ["sql"],
            "additionalProperties": False
        },
        "options": {
            "temperature": 0,
           # "num_predict": 500,
           # "num_ctx": 4096
        }

    }
    with httpx.Client(timeout=120) as client:
        response = client.post(f"{OLLAMA_URL}/api/generate", json=payload)
        response.raise_for_status()
        model_response = response.json()["response"]
        try:
            output = json.loads(model_response)
        except json.JSONDecodeError as exc:
            raise ValueError("Ollama returned invalid JSON.") from exc
        if not isinstance(output, dict) or not isinstance(output.get("sql"), str):
            raise ValueError("Ollama JSON response must contain a string 'sql' field.")
        return output["sql"].strip()