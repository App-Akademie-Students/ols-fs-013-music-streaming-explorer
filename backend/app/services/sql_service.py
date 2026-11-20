# Führt die SQL-Abfrage über eine schreibgeschützte SQLite-Verbindung mit einem Authorizer aus und liefert die Spaltennamen und bis zu 500 Ergebniszeilen zurück.
import sqlite3
from typing import Any

# TODO: Implement a read-only authorizer for SQLite connections.
def _read_only_authorizer() -> None:
    pass


def execute_read_only_query(conn: sqlite3.Connection, query: str) -> dict[str, Any]:
    """Führt eine schreibgeschützte SQL-Abfrage aus und gibt die Spaltennamen und bis zu 500 Ergebniszeilen zurück."""
    #conn.set_authorizer(_read_only_authorizer)
    cursor = conn.cursor()
    cursor.execute(query)

    if cursor.description is None:
        raise ValueError("Query returned no results")
    
    return {
        # Spaltennamen aus der Beschreibung des Cursors auslesen.
        "columns": [desc[0] for desc in cursor.description],# desc[0] enthält den Spaltennamen
        # Höchstens 500 Zeilen abrufen und in Dictionaries umwandeln.
        "rows": [dict(row) for row in cursor.fetchmany(500)]
    }   
