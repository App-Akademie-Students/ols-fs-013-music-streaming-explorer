from fastapi import APIRouter, Depends
from app.schemas.analyses_schema import AnalysesRequest, AnalysesResponse
from app.services.analysis_service import analyze_query
router = APIRouter(prefix="/analyses",tags=["analyses"])

@router.post("/", response_model=AnalysesResponse)
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

    
