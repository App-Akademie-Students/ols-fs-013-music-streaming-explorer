

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