# Steuert den Ablauf von der Analysefrage über die SQL-Erzeugung und -Ausführung bis zur fertigen AnalysisResponse.

from backend.app.schemas.analyses_schema import AnalysesResponse
from backend.app.services.context_service import get_project_context
from backend.app.services.sql_schema_service import get_sql_schema


def analyze_query(query: str) -> AnalysesResponse:
    """Steuert den Ablauf von der Analysefrage über die SQL-Erzeugung und -Ausführung bis zur fertigen AnalysesResponse."""

    # 1. Regeln für Projekt und Schema anwenden (Platzhalter)

    project_context = get_project_context()
    schema_context = get_sql_schema()


    # 2. SQL-Abfrage generieren (Platzhalter)