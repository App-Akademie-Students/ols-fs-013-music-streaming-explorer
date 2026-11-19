# Music Streaming Explorer

Python-Projekt zur Analyse von Musik-Streaming-Daten. Das Backend ist für eine FastAPI-API mit SQLite-Datenbank vorbereitet. Eine Text-to-SQL-Anbindung ist vorgesehen.

## Aktueller Stand

Das Datenbankschema und die SQLite-Verbindung sind vorhanden. Die API in `backend/app/main.py`, die Analyse-Routen, die Pydantic-Schemas, der LLM-Service und `backend/seed.py` sind noch nicht implementiert. `init_db()` ist ebenfalls ein Platzhalter. Das Verzeichnis `frontend/` enthält derzeit keine Anwendung.

## Voraussetzungen und Installation

Benötigt werden Python 3 mit `venv` und `pip`. Die folgenden Befehle werden in PowerShell im Projektverzeichnis ausgeführt:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Die Befehle verwenden die virtuelle Umgebung direkt; eine Aktivierung ist nicht erforderlich.

## VS Code-Erweiterungen

Die folgenden Erweiterungen unterstützen die Arbeit mit Python und der SQLite-Datenbank. Installation über die Erweiterungsansicht (`Strg+Umschalt+X`); über die jeweilige Erweiterungs-ID lässt sich das passende Plugin eindeutig finden.

| Erweiterung | Herausgeber | Erweiterungs-ID | Zweck |
| --- | --- | --- | --- |
| [SQLite (SQLite Explorer)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) | alexcvzz | `alexcvzz.vscode-sqlite` | Datenbanken im SQLite Explorer durchsuchen und SQL-Abfragen ausführen |
| [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer) | Florian Klampfer | `qwtel.sqlite-viewer` | SQLite-Dateien öffnen und Tabelleninhalte anzeigen |
| [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) | Microsoft | `ms-python.python` | Python-Unterstützung und Auswahl des Interpreters |
| [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance) | Microsoft | `ms-python.vscode-pylance` | Codevervollständigung, Typprüfung und Codenavigation |
| [Python Debugger](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy) | Microsoft | `ms-python.debugpy` | Python-Code mit Haltepunkten debuggen |

Nach dem Anlegen der virtuellen Umgebung über `Strg+Umschalt+P` den Befehl `Python: Select Interpreter` aufrufen und `backend/.venv/Scripts/python.exe` auswählen. Hinweise zur Python-Einrichtung bietet die [offizielle VS Code-Anleitung](https://code.visualstudio.com/docs/python/python-tutorial).

Nach der Datenbankinitialisierung lässt sich `backend/app/music.db` mit SQLite Viewer öffnen. Für SQL-Abfragen über die Befehlspalette `SQLite: Open Database` auswählen und dieselbe Datei im SQLite Explorer laden.

## Datenbank anlegen

Die Datenbank wird unter `backend/app/music.db` gespeichert. Bis `init_db()` implementiert ist, lässt sich das Schema aus dem Verzeichnis `backend/` so einspielen:

```powershell
.\.venv\Scripts\python.exe -c "from pathlib import Path; from app.database import get_connection; conn = get_connection(); conn.executescript(Path('schema.sql').read_text(encoding='utf-8')); conn.commit(); conn.close()"
```

`CREATE TABLE IF NOT EXISTS` erlaubt das erneute Ausführen, ohne vorhandene Tabellen neu anzulegen. Bestehende Tabellenstrukturen werden dadurch nicht aktualisiert. Beispieldaten werden aktuell nicht erzeugt, da `seed.py` noch leer ist.

Das Schema enthält drei Tabellen:

| Tabelle | Spalten | Beziehung |
| --- | --- | --- |
| `artists` | `id`, `name`, `genre` | Künstler und Künstlerinnen |
| `tracks` | `id`, `title`, `artist_id`, `duration` | `artist_id` verweist auf `artists.id` |
| `streams` | `id`, `track_id`, `played_at`, `country` | `track_id` verweist auf `tracks.id` |

`get_connection()` liefert Zeilen als `sqlite3.Row` und aktiviert die Fremdschlüsselprüfung für jede Verbindung.

## Backend starten

Sobald in `backend/app/main.py` eine FastAPI-Instanz namens `app` implementiert ist, startet der Entwicklungsserver aus dem Verzeichnis `backend/` mit:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Danach ist die API standardmäßig unter <http://127.0.0.1:8000> erreichbar, die interaktive API-Dokumentation unter <http://127.0.0.1:8000/docs>. Im aktuellen Stand funktioniert dieser Startbefehl noch nicht, da die FastAPI-Instanz fehlt.

## Module und Abhängigkeiten

Die externen Pakete sind in `backend/requirements.txt` aufgeführt und für den weiteren Ausbau vorgesehen:

| Modul / Paket | Zweck |
| --- | --- |
| `fastapi` | HTTP-API und Routing |
| `uvicorn[standard]` | ASGI-Server zum Ausführen der API |
| `pydantic` | Validierung und Definition von Datenmodellen |
| `python-dotenv` | Laden lokaler Umgebungsvariablen aus `.env`-Dateien |
| `httpx` | HTTP-Anfragen, beispielsweise an einen LLM-Dienst |
| `sqlite3` | SQLite-Zugriff; Bestandteil der Python-Standardbibliothek |
| `pathlib` | Dateipfade; Bestandteil der Python-Standardbibliothek |

SQLAlchemy ist in `requirements.txt` nur als auskommentierte Idee enthalten und wird nicht installiert. Aktuell sind keine Umgebungsvariablen oder API-Schlüssel im Code eingerichtet. Lokale `.env`-Dateien sind über `.gitignore` ausgeschlossen.

## Projektstruktur

```text
├── .gitignore
├── .vscode/
│   └── settings.json
├── AGENTS.md
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI-Einstiegspunkt
│   │   ├── database.py              # SQLite-Verbindung und Initialisierung
│   │   ├── routers/
│   │   │   └── analyses_router.py    # Analyse-Endpunkt
│   │   ├── schemas/
│   │   │   └── analyses.py           # Pydantic-Modelle für Anfrage und Antwort
│   │   └── services/
│   │       ├── analysis_service.py  # Steuert den Analyseablauf
│   │       ├── context_service.py   # Lädt die Projektregeln und Beispiele
│   │       ├── llm_service.py       # Erzeugt SQL mit Ollama
│   │       ├── sql_schema_service.py # Liest das SQLite-Schema zur Laufzeit
│   │       └── sql_service.py       # Prüft und führt Leseabfragen aus
│   ├── context/
│   │   ├── business-rules.md
│   │   ├── examples.md
│   │   └── sql-guidelines.md
│   ├── skills/
│   │   └── text-to-sql/
│   │       └── SKILL.md
│   ├── music.db                     # SQLite-Datenbank
│   ├── requirements.txt             # Python-Abhängigkeiten
│   ├── schema.sql                   # Tabellendefinitionen
│   └── seed.py                      # Erzeugt Beispieldaten
├── frontend/                        # Platzhalter für das Frontend
└── learning/                        # Begleitmaterial und Lernprotokoll
    ├── learning-info.md
    ├── Plan.pdf
    ├── prompts.md
    ├── schema-linking.png
    └── workflow.png
```

## Service-Dateien

| Datei | Verantwortlichkeit |
|---|---|
| [analysis_service.py](backend/app/services/analysis_service.py) | **Steuert den Analyseablauf.** `analyze_question()` lädt die Projektregeln und das Datenbankschema, lässt SQL erzeugen und prüft auf die Modellantwort `UNSUPPORTED_QUERY`. Anschließend führt der Service die Abfrage über eine schreibgeschützte Verbindung aus und baut die `AnalysisResponse` mit Frage, erzeugtem SQL, Spalten und Zeilen. |
| [context_service.py](backend/app/services/context_service.py) | **Lädt die fachlichen Vorgaben für das Modell.** `get_project_context()` liest vier Markdown-Dateien ein: die Text-to-SQL-Anleitung, die Geschäftsregeln, die SQL-Richtlinien und die Beispiele. Die Funktion überspringt leere Dateien und fasst die übrigen Inhalte zu einem Text zusammen. |
| [sql_schema_service.py](backend/app/services/sql_schema_service.py) | **Liest das aktuelle Datenbankschema.** `get_schema_context()` ermittelt die Anwendungstabellen, Spalten, Datentypen, Primär- und Fremdschlüssel sowie `NOT NULL`-Angaben direkt aus SQLite. Daraus erzeugt die Funktion eine Textbeschreibung für das Modell. |
| [llm_service.py](backend/app/services/llm_service.py) | **Übersetzt die Frage in SQL.** `generate_sql()` baut aus Projektregeln, SQLite-Version und Schema den Systemprompt und sendet die Frage an Ollama. Die Funktion gibt den Antworttext des Modells zurück und meldet HTTP-Fehler oder eine leere Antwort. |
| [sql_service.py](backend/app/services/sql_service.py) | **Führt die erzeugte Abfrage aus.** `execute_read_query()` setzt einen SQLite-Authorizer mit einer Liste erlaubter Aktionen. Die Funktion gibt die Spaltennamen und bis zu 500 Ergebniszeilen als Dictionaries zurück. |
