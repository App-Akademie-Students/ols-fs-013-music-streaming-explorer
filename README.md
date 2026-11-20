# Music Streaming Explorer

Stelle Fragen zu Musik-Streaming-Daten und sieh dir die Ergebnisse als Tabelle oder Diagramm an. FastAPI lässt die Frage von Ollama in SQL übersetzen und liest die Daten aus SQLite. Die Oberfläche verwendet TypeScript, Vite und Chart.js.

## Frontend starten

Vorausgesetzt sind Node.js mit npm und ein laufendes FastAPI-Backend unter `http://127.0.0.1:8000`. Wenn du das Backend zum ersten Mal startest, folge zuerst der [Backend-Anleitung](#backend-und-ollama-starten).

Öffne ein eigenes PowerShell-Terminal im Projektstamm und führe diese Befehle aus:

```powershell
cd frontend
npm ci
npm run dev
```

Öffne im Browser [http://localhost:5173](http://localhost:5173). Falls Vite einen anderen Port ausgibt, verwende die Adresse aus dem Terminal. Lass beide Terminals geöffnet. Vite leitet die Analyseanfragen automatisch an FastAPI weiter.

Führe `npm ci` bei der ersten Einrichtung und nach Änderungen an `package-lock.json` aus. Für spätere Starts genügt `npm run dev` im Ordner `frontend/`.

## Backend und Ollama starten

Du brauchst Python 3 mit `venv` und `pip` sowie Zugriff auf einen laufenden Ollama-Dienst mit einem verfügbaren Modell. Die Beispiele verwenden den lokalen Ollama-Port `11434`.

1. Öffne PowerShell im Projektstamm und installiere die Python-Abhängigkeiten:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

2. Lege bei der ersten Einrichtung die Ollama-Konfiguration an:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

   Trage in `backend/.env` bei `OLLAMA_URL` die Adresse des laufenden Dienstes ein, lokal üblicherweise `http://localhost:11434`. Setze `OLLAMA_MODEL` auf den vollständigen Namen eines verfügbaren Modells. Bei einer lokalen Ollama-Installation zeigt `ollama list` die installierten Modelle. Ein fehlendes Modell kannst du mit `ollama pull <modellname>` laden. Läuft der lokale Dienst noch nicht, starte ihn in einem weiteren Terminal mit `ollama serve`.

3. Starte FastAPI aus dem Ordner `backend/`:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
   ```

   Unter [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) sollte `{"status":"healthy"}` erscheinen. Die interaktive API-Dokumentation findest du unter [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Die SQLite-Datei `backend/music.db` liegt bereits im Repository. Falls sie fehlt oder die Tabellen leer sind, kannst du aus `backend/` Beispieldaten einspielen:

```powershell
.\.venv\Scripts\python.exe seed.py
```

## Anwendung benutzen

1. Gib eine Frage mit 3 bis 500 Zeichen ein, etwa „Wie viele Streams gibt es pro Land?“, oder wähle eine der Beispielfragen.
2. Klicke auf **Analysieren**. Die Tabelle zeigt bis zu 500 Ergebniszeilen.
3. Bei numerischen Ergebnissen kannst du Kategorie, Messwert und Diagrammtyp wählen. Das Diagramm zeigt bis zu 30 Zeilen in Abfragereihenfolge.
4. Öffne **Erzeugtes SQL anzeigen**, um die ausgeführte Abfrage einzusehen.

Wenn die Analyse fehlschlägt, prüfe zuerst den FastAPI-Endpunkt `/health`. Wenn er erreichbar ist, prüfe die FastAPI-Ausgabe sowie die Ollama-Adresse und den Modellnamen in `backend/.env`.

## Frontend-Build

Führe im Ordner `frontend/` nach der Installation `npm run build` aus. Der Befehl prüft die TypeScript-Typen und schreibt die Dateien nach `frontend/dist/`. Mit `npm run preview` kannst du den Build lokal öffnen. Auf einem Webserver muss `/api` an FastAPI weitergeleitet werden.
