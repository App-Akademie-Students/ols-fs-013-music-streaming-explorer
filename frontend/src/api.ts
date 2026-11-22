export interface AnalysisResponse {
  question: string
  generated_sql: string
  columns: string[]
  rows: Record<string, unknown>[]
}

export interface SchemaResponse {
  schema: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAnalysisResponse(value: unknown): value is AnalysisResponse {
  return isRecord(value)
    && typeof value.question === 'string'
    && typeof value.generated_sql === 'string'
    && Array.isArray(value.columns)
    && value.columns.every((column) => typeof column === 'string')
    && Array.isArray(value.rows)
    && value.rows.every(isRecord)
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error('Die API hat keine gültige JSON-Antwort geliefert.', { cause: error })
  }
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  const payload = parseJson(text)
  if (!response.ok) {
    const detail = isRecord(payload) ? payload.detail : undefined
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail ?? payload)
    throw new Error(`API-Fehler (${response.status}): ${message}`)
  }
  return payload
}

export async function postAnalysis(question: string): Promise<AnalysisResponse> {
  const response = await fetch('/api/analyses/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const payload = await readResponse(response)
  if (!isAnalysisResponse(payload)) {
    throw new Error('Die API-Antwort entspricht nicht dem erwarteten Analyseformat.')
  }
  return payload
}

export async function getSchema(): Promise<SchemaResponse> {
  const response = await fetch('/api/schema')
  const payload = await readResponse(response)
  if (!isRecord(payload) || typeof payload.schema !== 'string') {
    throw new Error('Die API-Antwort enthält kein gültiges Datenbankschema.')
  }
  return { schema: payload.schema }
}
