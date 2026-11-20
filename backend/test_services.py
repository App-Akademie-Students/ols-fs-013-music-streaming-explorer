
import sqlite3

from app.services.context_service import get_project_context
from app.services.llm_service import send_query_to_ollama
from app.services.sql_schema_service import get_sql_schema
from app.database import get_readonly_connection
from app.services.sql_service import execute_read_only_query

def test():
    print("Testing context...")
    project_context = get_project_context()
    print(project_context)
    print("Testing SQL schema...")
    sql_schema = get_sql_schema()
    print(sql_schema)


    print("Testing LLM service...")

    sql= send_query_to_ollama(
        question="Zeige mir die fünf Künstler mit den meisten Streams",
        project_rules=  project_context, 
        sql_schema=sql_schema, 
        sqlite_version=sqlite3.sqlite_version
    )
    print(sql)


    print("execute sql...")
    result=execute_read_only_query(get_readonly_connection(),sql)
    print(result)
   


if __name__ == "__main__":
    test()