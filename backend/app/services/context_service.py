# Liest die fachlichen Vorgaben aus vier Markdown-Dateien und fasst sie als Text für das Sprachmodell zusammen.
from pathlib import Path



BASE_PATH = Path(__file__).resolve().parents[2]    # Gehe zwei Ebenen nach oben, um zum 'backend/app' Verzeichnis zu gelangen
CONTEXT_FILES = [
    BASE_PATH / "skills" / "text-to-sql"/ "SKILL.md",
    BASE_PATH / "context" / "business-rules.md",
    BASE_PATH / "context" / "examples.md",
    BASE_PATH / "context" / "sql-guidelines.md"
]


def get_project_context() -> str:
    sections = []
    for file_path in CONTEXT_FILES:
      context = file_path.read_text(encoding="utf-8").strip()
      sections.append(
         f"## {file_path.name}\n\n{context}"
      )
    return "\n\n".join(sections)