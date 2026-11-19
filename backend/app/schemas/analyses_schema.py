from typing import Any

from pydantic import BaseModel, Field

class AnalysesRequest(BaseModel):
    """Request für die Analysefrage"""
    question: str = Field(
        min_length=3,
        max_length=500,
        description="Natürlichsprachliche Frage für die Analyse",
        example="Welcher Künstler hat die meisten Streams?"
    )

class AnalysesResponse(BaseModel):
    """Antwort auf die Analysefrage inklusive generiertem SQL, Spalten und Zeilen"""
    question: str
    generated_sql: str
    columns: list[str]
    rows: list[dict[str, Any]]
