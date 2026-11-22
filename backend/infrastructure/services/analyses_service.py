from application.llm_dto_models.analyses import AnalysesResponse
from infrastructure.services.context_service import get_project_context
from persistance.services.sql_shema_service import get_sql_schema
from infrastructure.services.llm_service import send_query_to_ollama
from persistance.db.database import get_db_readonly_connection
from persistance.services.sql_service import execute_read_only_query

def analyze_query(query: str)->AnalysesResponse:
    """Steuert den Ablauf von der Analysefrage über die SQL-Erzeugung und -Ausführung bids zur ferligen AnalysesResponse."""
    # 1. Regeln für project und Schema anwenden (Platzhalter)
    project_context = get_project_context()
    schema_context = get_sql_schema()


    # 2. SQL-Abfrage generieren (Platzhalter)

    sql = send_query_to_ollama(
        question=query,
        project_rules=project_context,
        sql_schema=schema_context,
        sqlite_version="3.50.4"  # Beispielwert, ggf. dynamisch ermitteln
    )
    with get_db_readonly_connection() as conn:
       result= execute_read_only_query(conn, sql)
    return AnalysesResponse(
        question =query,
        generated_sql=sql,
        columns=result["columns"],
        rows=result["rows"]
    )