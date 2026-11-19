import sqlite3
import pathlib
BASE_DIR = pathlib.Path(__file__).parent.parent
DB_PATH = BASE_DIR / "music.db" #.parent.parent → backend/
SCHEMA_PATH = BASE_DIR / "schema.sql"

def get_connection():
    conn =sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_connection() as conn:
        sql = SCHEMA_PATH.read_text(encoding="utf-8")
        conn.executescript(sql)

