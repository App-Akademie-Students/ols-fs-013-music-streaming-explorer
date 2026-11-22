
import sqlite3

from infrastructure.services.context_service import get_project_context
from infrastructure.services.llm_service import send_query_to_ollama
from persistance.services import get_sql_schema
from persistance.db.database import get_readonly_connection
from persistance.services.sql_service import execute_read_only_query

def test():
    print("Testing context...")# Test the project context retrieval
    project_context = get_project_context()
    print(project_context)
    print("Testing SQL schema...")# Test the SQL schema retrieval
    sql_schema = get_sql_schema()
    print(sql_schema)


    print("Testing LLM service...")# Test the LLM service with a sample query

    sql= send_query_to_ollama(
        question="Zeige mir die fünf Künstler mit den meisten Streams",
        project_rules=  project_context,
        sql_schema=sql_schema,
        sqlite_version=sqlite3.sqlite_version
    )
    print(sql)


    print("execute sql...")# Test executing the generated SQL query
    result=execute_read_only_query(get_readonly_connection(),sql)
    print(result)



if __name__ == "__main__":
    test()