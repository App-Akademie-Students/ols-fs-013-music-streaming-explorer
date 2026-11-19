from contextlib import closing

from app.database import get_readonly_connection


def get_sql_schema() -> str:
    """Beschreibt die Anwendungstabellen aus dem aktuellen SQLite-Schema."""
    lines = []

    with closing(get_readonly_connection()) as connection:
        tables = connection.execute(
            """
            SELECT name
            FROM main.sqlite_schema
            WHERE type = 'table' AND name NOT GLOB 'sqlite_*'
            ORDER BY name COLLATE NOCASE, name
            """
        )

        for table in tables:
            table_name = table["name"]
            lines.append(f"Tabelle: {table_name}")
            columns = connection.execute(
                """
                SELECT name, type, "notnull", pk
                FROM pragma_table_xinfo(?, 'main')
                WHERE hidden != 1
                ORDER BY cid
                """,
                (table_name,),
            )

            for column in columns:
                declared_type = column["type"] or "kein deklarierter Typ"
                details = [declared_type]
                if column["pk"]:
                    details.append(f"PRIMARY KEY (Position {column['pk']})")
                if column["notnull"]:
                    details.append("NOT NULL")
                lines.append(f"  - {column['name']}: {', '.join(details)}")

    return "\n".join(lines)
