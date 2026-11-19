# sendet die Frage zusammen mit den Projektregeln, dem Datenbankschema und der SQLite-Version an Ollama und gibt die erzeugte SQL-Abfrage oder UNSUPPORTED_QUERY als Text zurück.
import httpx
import os


OLLAMA_API_URL = os.getenv("OLLAMA_API_URL")
# FIXME impl
def send_query_to_ollama(question: str, project_rules: str, schema: str, sqlite_version: str) -> str:
    payload = {
        "query": question,
        "project_rules": project_rules,
        "schema": schema,
        "sqlite_version": sqlite_version
    }
    response = httpx.post(OLLAMA_API_URL, json=payload)
    response.raise_for_status()
    return response.text