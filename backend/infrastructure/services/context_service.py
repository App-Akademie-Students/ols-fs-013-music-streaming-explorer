from pathlib import Path

BASE_PATH = Path(__file__).resolve().parent.parent #Gete zwei Ebene nach oben, um zum 'backend/' Verzeichnis zu gelangen
CONTEXT_FILES=[BASE_PATH / "llm" / "skills" / "text-to-sql" / "SKILL.md",
               BASE_PATH / "llm" / "context" / "business-rules.md",
               BASE_PATH / "llm" / "context" / "examples.md",
               BASE_PATH / "llm" / "context" / "sql_guidelines.md"]

def get_project_context() -> str:
    sections = []
    for file_path in CONTEXT_FILES:
      context = file_path.read_text(encoding="utf-8")
      sections.append(
         f"## {file_path.name}\n\n{context}"
      )
    return "\n\n".join(sections)