
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