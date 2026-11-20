
# SQL Schema und Daten



### 2.3 seed.py Daten


| Tabelle   | Anzahl | Inhalt                                  |
| --------- | ------ | --------------------------------------- |
| `artists` | 15     | Künstler mit unterschiedlichen Genres   |
| `tracks`  | 50     | Musiktitel mit Künstler und Dauer       |
| `streams` | 1.000  | Streaming-Ereignisse mit Datum und Land |




# Dateien



| Datei               | Verantwortung                                                          | Konkreter Inhalt                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SKILL.md`          | **Prozesssteuerung** – Wie soll das LLM vorgehen?                      | Arbeitsschritte von der Analyse der Benutzerfrage über Schema Linking bis zur SQL-Generierung; Reihenfolge der Kontextnutzung; Umgang mit nicht beantwortbaren Fragen |
| `schema.md`         | **Technisches Datenbankwissen** – Welche Daten stehen zur Verfügung?   | Tabellen, Spalten, Datentypen, Primär- und Fremdschlüssel, Beziehungen zwischen `artists`, `tracks` und `streams`; keine erfundenen Felder                            |
| `business-rules.md` | **Fachliche Semantik** – Was bedeuten die Daten und Kennzahlen?        | Definition eines Streams; Bedeutung von Künstler, Track und Genre; Berechnung von Streamingzahlen; Interpretation von Zeiträumen und Rankings                         |
| `sql-guidelines.md` | **Technische SQL-Vorgaben** – Wie muss gültiges SQL aussehen?          | SQLite-Dialekt und Version, erlaubte Abfragetypen, JOINs, Aliase, Aggregationen, Datumsfunktionen, Effizienzregeln und SQL-Ausgabeformat                              |
| `examples.md`       | **Few-Shot-Beispiele** – Wie werden typische Fragen korrekt übersetzt? | Paare aus natürlichsprachlichen Fragen und passenden SQL-Abfragen, beispielsweise Top-5-Künstler, Streams pro Genre und monatliche Streamingzahlen                    |




> [!NOTE]
> Merksatz 
> 
> **SKILL.md** – Vorgehensweise
> 
> **schema.md** – Datenstruktur (wir können auf diese verzichten, wenn wir das Schema dynamisch einlesen)
> 
> **business-rules.md** – Fachwissen
> 
> **sql-guidelines.md** – SQL-Vorgaben
> 
> **examples.md** – Musterlösungen



# Datenstrukturen
## AnalysisRequest

| Eigenschaft | Frontend | Backend (FastAPI) | LLM |
|---|---|---|---|
| `question: str` | Liest die Frage aus dem Eingabefeld und sendet sie als JSON. | Liest und validiert den Request mit Pydantic. Anschließend baut es aus der Frage und dem SQLite-Schema den Prompt. | Liest die Frage im Prompt und erzeugt die passende SQL-Abfrage. |

{
  "question": "Welche zwei Künstler wurden am häufigsten gestreamt?"
}

## AnalysisResponse

| Eigenschaft | LLM | Backend und SQLite | Frontend |
|---|---|---|---|
| `question` | Liest die Benutzerfrage im Prompt und leitet daraus die SQL-Abfrage ab. | Nimmt die Frage aus dem Request, übergibt sie ans LLM und übernimmt sie in die Antwort. | Sendet die Frage und kann sie über dem Ergebnis anzeigen. |
| `generated_sql` | Erzeugt die SQL-Abfrage. | Prüft die Abfrage, führt sie in SQLite aus und gibt sie in der Antwort zurück. | Kann die SQL-Abfrage zur Nachvollziehbarkeit anzeigen. |
| `columns` | Kann die Namen durch SQL-Aliase wie `AS stream_count` festlegen. | Liest die Spaltennamen aus dem SQLite-Ergebnis. | Nutzt die Namen für die Tabellenüberschriften und die Spaltenreihenfolge. |
| `rows` | Kann die Ergebniswerte in einem optionalen zweiten Aufruf zusammenfassen. | SQLite liefert die Ergebniszeilen. Das Backend ordnet pro Zeile jedem Spaltennamen seinen Wert zu. | Liest daraus die Werte für die Tabellenzellen, etwa `Daft Punk` und `1280`. |
```
{
  "columns": ["artist_name", "stream_count"],
  "rows": [
    {"artist_name": "Daft Punk", "stream_count": 1280},
    {"artist_name": "Massive Attack", "stream_count": 940}
  ]
}
```

# Datenbank

| Datei | Aufgabe | Ergebnis |
|---|---|---|
| `schema_service.py` | Liest Tabellen, Spalten und Beziehungen aus SQLite aus. | Schema-Kontext für das LLM |
| `sql_service.py` | Prüft die erzeugte SQL-Abfrage und führt sie aus, etwa mit `execute_read_query()`. | `columns` und `rows` für das Frontend |


## Service-Dateien

| Datei | Verantwortlichkeit |
|---|---|
| [analysis_service.py](backend/app/services/analysis_service.py) | **Steuert den Analyseablauf.** `analyze_question()` lädt die Projektregeln und das Datenbankschema, lässt SQL erzeugen und prüft auf die Modellantwort `UNSUPPORTED_QUERY`. Anschließend führt der Service die Abfrage über eine schreibgeschützte Verbindung aus und baut die `AnalysisResponse` mit Frage, erzeugtem SQL, Spalten und Zeilen. |
| [context_service.py](backend/app/services/context_service.py) | **Lädt die fachlichen Vorgaben für das Modell.** `get_project_context()` liest vier Markdown-Dateien ein: die Text-to-SQL-Anleitung, die Geschäftsregeln, die SQL-Richtlinien und die Beispiele. Die Funktion überspringt leere Dateien und fasst die übrigen Inhalte zu einem Text zusammen. |
| [sql_schema_service.py](backend/app/services/sql_schema_service.py) | **Liest das aktuelle Datenbankschema.** `get_schema_context()` ermittelt die Anwendungstabellen, Spalten, Datentypen, Primär- und Fremdschlüssel sowie `NOT NULL`-Angaben direkt aus SQLite. Daraus erzeugt die Funktion eine Textbeschreibung für das Modell. |
| [llm_service.py](backend/app/services/llm_service.py) | **Übersetzt die Frage in SQL.** `generate_sql()` baut aus Projektregeln, SQLite-Version und Schema den Systemprompt und sendet die Frage an Ollama. Die Funktion gibt den Antworttext des Modells zurück und meldet HTTP-Fehler oder eine leere Antwort. |
| [sql_service.py](backend/app/services/sql_service.py) | **Führt die erzeugte Abfrage aus.** `execute_read_query()` setzt einen SQLite-Authorizer mit einer Liste erlaubter Aktionen. Die Funktion gibt die Spaltennamen und bis zu 500 Ergebniszeilen als Dictionaries zurück. |

## Ollama API für Text-to-SQL

- **Lokale API.** In `backend/.env.example` steht `OLLAMA_URL` auf `http://localhost:11434`. An diese Serveradresse kommt der Endpunktpfad `/api/generate`. Der Wert aus `OLLAMA_MODEL` gehört als `model` in den JSON-Request. [API-Einstieg](https://docs.ollama.com/api/introduction)
- **SQL aus einer einzelnen Frage erzeugen.** Für `POST /api/generate` kommt die Nutzerfrage in `prompt`. Die Projektregeln, das zur Laufzeit gelesene SQLite-Schema und die SQLite-Version bilden den Text für `system`. Aus dem JSON-Feld `response` liest das Backend die erzeugte SQL-Abfrage oder `UNSUPPORTED_QUERY`. Danach prüft das Backend die Abfrage vor der Ausführung in SQLite. [Referenz zu /api/generate](https://docs.ollama.com/api/generate)
- **Antwort vollständig empfangen.** Mit `"stream": false` liefert Ollama ein einzelnes JSON-Objekt. So kann `llm_service.py` den Modelltext mit `response.json()["response"]` auslesen und die vollständige Abfrage an die SQL-Prüfung weitergeben. Standardmäßig liefert der Endpunkt einzelne JSON-Zeilen (NDJSON). [Streaming-Referenz](https://docs.ollama.com/api/streaming)
- **Modell und API-Fehler prüfen.** `GET /api/tags` zeigt, welche Modelle lokal verfügbar sind. Damit lässt sich der konfigurierte Modellname abgleichen. Ollama liefert Fehlerdetails im JSON-Feld `error`, etwa bei einem ungültigen Request (HTTP 400) oder einem fehlenden Modell (HTTP 404). [Modellliste](https://docs.ollama.com/api/tags) · [Fehlerreferenz](https://docs.ollama.com/api/errors)
- **Chat-Verlauf bei späteren Rückfragen.** Falls Folgefragen frühere Nachrichten berücksichtigen sollen, nimmt `POST /api/chat` den Verlauf als `messages` mit Rollen wie `system`, `user` und `assistant` entgegen. Der Modelltext steht dort in `message.content`. [Referenz zu /api/chat](https://docs.ollama.com/api/chat)

Der aktuelle Entwurf in [llm_service.py](../backend/app/services/llm_service.py) sendet eigene Payload-Felder direkt an `OLLAMA_URL` und gibt den HTTP-Antworttext zurück. Die Felder oben beschreiben die geplante Anbindung an die native Ollama-API.
