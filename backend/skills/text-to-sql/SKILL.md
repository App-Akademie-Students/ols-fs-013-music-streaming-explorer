---
name: text-to-sql
description: Generates SQLite queries from natural language questions using database context.
---

# Text-to-SQL Skill

## Ziel

Übersetze natürlichsprachliche Fragen in SQL-Abfragen für die Music-Streaming-Datenbank.

## Vorgehensweise

1. Analysiere die Benutzerfrage und identifiziere das gewünschte Analyseergebnis.
2. Ermittle anhand des vom Backend dynamisch bereitgestellten
   Datenbankschemas die relevanten Tabellen, Spalten und Beziehungen
   (Schema Linking).
3. Berücksichtige die fachlichen Definitionen aus `business-rules.md`.
4. Verwende die Regeln aus `sql-guidelines.md` für die SQL-Generierung.
5. Orientiere dich bei Bedarf an den Beispielen aus `examples.md`.
6. Generiere eine zur Benutzerfrage passende SQL-Abfrage.
7. Gib die SQL-Abfrage im festgelegten Ausgabeformat zurück.

## Einschränkungen

- Erfinde keine Tabellen, Spalten oder Beziehungen.
- Wenn die Frage nicht mit dem vorhandenen Datenbankschema beantwortet werden kann, gib `UNSUPPORTED_QUERY` zurück.
- Halte sämtliche Vorgaben aus `sql-guidelines.md` ein.