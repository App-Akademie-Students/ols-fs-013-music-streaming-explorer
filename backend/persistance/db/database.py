import sqlite3
import pathlib

BASE_DIR = pathlib.Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db/musicdatabase.db" # .parent.parent->backend/persistance/
SCHEMA_PATH = BASE_DIR / "db/schema.sql"

def is_db_exists() -> bool:
    return DB_PATH.exists()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key support
    conn.execute("PRAGMA journal_mode = WAL")  # Enable Write-Ahead Logging
    return conn

def get_db_readonly_connection():
    """Gibt eine schreibgeschützte Verbindung zur SQLite-Datenbank zurück."""
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    if is_db_exists()==True :
        return

    with get_db_connection() as conn:
        sql = SCHEMA_PATH.read_text(encoding="utf-8")
        conn.executescript(sql)