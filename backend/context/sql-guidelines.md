# SQL Guidelines – Music Streaming Explorer

## SQL-Dialekt

- Verwende ausschließlich SQLite-SQL.
- Berücksichtige die vom Backend übergebene SQLite-Version.
- Verwende nur Syntax und Funktionen, die von dieser Version unterstützt werden.

## Erlaubte Abfragen

- Generiere genau eine lesende `SELECT`-Abfrage.
- Verwende ausschließlich Tabellen und Spalten aus dem bereitgestellten Schema.
- Verwende keine schreibenden oder schemaändernden SQL-Anweisungen.

## SQL-Syntax und Lesbarkeit

- Verwende explizite `JOIN`-Bedingungen.
- Verwende bei Bedarf `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY` und `LIMIT`.
- Verwende aussagekräftige Tabellen- und Spaltenaliase.
- Achte auf syntaktisch korrektes SQLite-SQL.

## Effizienz

- Rufe ausschließlich benötigte Spalten ab.
- Vermeide `SELECT *`.
- Vermeide unnötige JOINs und Unterabfragen.
- Begrenze große Ergebnislisten sinnvoll, ohne die fachliche Aussage zu verfälschen.

## Datumsverarbeitung

- `played_at` enthält ISO-8601-Zeitpunkte in UTC.
- Verwende SQLite-Funktionen wie `date()`, `datetime()` und `strftime()`.

## Ausgabeformat

- Gib ausschließlich SQL ohne Markdown-Codeblock aus.
- Füge keine Erklärungen oder Kommentare hinzu.
- Generiere keine zusätzlichen SQL-Anweisungen.
- Wenn die Frage mit den bereitgestellten Daten nicht beantwortbar ist,
  gib ausschließlich UNSUPPORTED_QUERY zurück, ohne SQL oder Erklärung.