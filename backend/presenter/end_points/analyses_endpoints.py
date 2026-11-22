from fastapi import APIRouter, Depends
from application.llm_dto_models.analyses import AnalysesRequest, AnalysesResponse
from infrastructure.services.analyses_service import analyze_query

end_point = APIRouter(prefix="/analyses", tags=["analyses"])

@end_point.post("/",response_model=AnalysesResponse)
async def analyze(request: AnalysesRequest):
    # Hier würde die Logik zur Analyse der Frage implementiert werden
    # Für den Moment geben wir eine Dummy-Antwort zurück
    # return AnalysesResponse(
    #     question=request.question,
    #     generated_sql="--wird im nächsten Schritt generiert",
    #     columns=["column1", "column2"],
    #     rows=[{"column1": "value1", "column2": "value2"}]
    # )

    return analyze_query(request.question)