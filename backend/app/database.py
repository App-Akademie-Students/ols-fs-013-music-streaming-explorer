import sqlite3
import pathlib


DB_PATH = pathlib.Path(__file__).parent / "music.db"

def get_connection():
    conn =sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
def init_db():
    pass