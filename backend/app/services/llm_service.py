# sendet die Frage zusammen mit den Projektregeln, dem Datenbankschema und der SQLite-Version an Ollama und gibt die erzeugte SQL-Abfrage oder UNSUPPORTED_QUERY als Text zurück.
import httpx
import os

from dotenv import load_dotenv
load_dotenv()
OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")

# FIXME impl
def send_query_to_ollama(question: str, project_rules: str, sql_schema: str, sqlite_version: str) -> str:
    payload = {
        "query": question,
        "project_rules": project_rules,
        "schema": sql_schema,
        "sqlite_version": sqlite_version
    }
    response = httpx.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    return response.text

