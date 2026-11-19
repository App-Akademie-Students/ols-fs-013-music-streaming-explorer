from contextlib import closing

from app.database import get_readonly_connection as get_connection
def get_schema_context() -> str:
    """Liest Tabellen, Spalten und Fremdschlüssel aus der SQLite-Datenbank."""
    schema_context = ""
    with closing(get_connection()) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for table in tables:
            table_name = table[0]
            schema_context += f"Table: {table_name}\n"
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            for column in columns:
                schema_context += f"  Column: {column[1]} ({column[2]})\n"
            cursor.execute(f"PRAGMA foreign_key_list({table_name});")
            fks = cursor.fetchall()
            for fk in fks:
                schema_context += f"  Foreign Key: {fk[3]} -> {fk[2]}({fk[4]})\n"
    return schema_context