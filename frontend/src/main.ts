import Chart from 'chart.js/auto'
import './style.css'
import { getSchema, postAnalysis } from './api'
import type { AnalysisResponse } from './api'

const examples = [
  { label: 'Top Künstler', question: 'Welche fünf Künstler haben die meisten Streams?' },
  { label: 'Genres', question: 'Wie viele Streams gibt es pro Genre?' },
  { label: 'Tracks', question: 'Welche Tracks werden am häufigsten gestreamt?' },
]

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Das Element #app fehlt.')

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Music Streaming Explorer – Dashboard">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/></svg>
      </span>
      <span>Music Streaming Explorer</span>
    </a>
    <nav class="navigation" aria-label="Hauptnavigation">
      <button class="nav-button active" type="button" data-view="dashboard-view" aria-current="page">Dashboard</button>
      <button class="nav-button" type="button" data-view="data-view">Daten</button>
      <button class="nav-button" type="button" data-view="examples-view">Beispiele</button>
    </nav>
  </header>

  <main class="page-shell">
    <section class="hero">
      <p class="eyebrow">Deine Musikdaten, auf einen Blick</p>
      <h1>Music Streaming Explorer</h1>
      <p class="hero-copy">Musikdaten per Sprache analysieren</p>
    </section>

    <section class="question-card" aria-labelledby="question-title">
      <form id="analysis-form">
        <label id="question-title" for="question">Frage stellen</label>
        <div class="question-row">
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <input id="question" name="question" type="text" minlength="3" maxlength="500" required value="${examples[0].question}" autocomplete="off">
          </div>
          <button id="analyze-button" class="primary-button" type="submit">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7V5Z" fill="currentColor"/></svg>
            <span>Analysieren</span>
          </button>
        </div>
      </form>
      <div class="example-strip">
        <span>Beispiele:</span>
        ${examples.map((example, index) => `<button class="example-chip" type="button" data-example="${index}">${example.label}</button>`).join('')}
      </div>
      <p id="app-status" class="status-message" role="status" aria-live="polite" hidden></p>
    </section>

    <section id="dashboard-view" class="view-panel">
      <div class="dashboard-grid">
        <div class="left-column">
          <article class="card results-card">
            <div class="card-heading">
              <div>
                <p class="card-kicker">Analyse</p>
                <h2>Ergebnisse</h2>
              </div>
              <span id="result-count" class="result-count">Noch keine Abfrage</span>
            </div>
            <div id="results-table" class="table-scroll">
              <div class="empty-state">Stelle eine Frage, um deine Streaming-Daten zu entdecken.</div>
            </div>
          </article>

          <article class="card sql-card">
            <div class="card-heading">
              <div>
                <p class="card-kicker">Nachvollziehbar</p>
                <h2>Generierte SQL-Abfrage</h2>
              </div>
              <button id="copy-sql" class="icon-button" type="button" aria-label="SQL-Abfrage kopieren" title="SQL kopieren" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
              </button>
            </div>
            <pre class="sql-scroll"><code id="sql-output">Die generierte Abfrage erscheint hier.</code></pre>
          </article>
        </div>

        <article class="card chart-card">
          <div class="card-heading chart-heading">
            <div>
              <p class="card-kicker">Visualisierung</p>
              <h2 id="chart-title">Ergebnisse im Diagramm</h2>
            </div>
          </div>
          <div class="chart-controls">
            <label>
              <span>Kategorie</span>
              <select id="category-select" disabled aria-label="Kategorie für Diagramm"></select>
            </label>
            <label>
              <span>Messwert</span>
              <select id="metric-select" disabled aria-label="Messwert für Diagramm"></select>
            </label>
          </div>
          <div class="chart-viewport">
            <canvas id="results-chart" aria-label="Diagramm der Analyseergebnisse" hidden></canvas>
            <p id="chart-empty" class="empty-state">Ein Diagramm wird angezeigt, sobald numerische Ergebnisse vorliegen.</p>
          </div>
          <p id="chart-caption" class="chart-caption" hidden></p>
        </article>
      </div>
    </section>

    <section id="data-view" class="view-panel content-view" hidden>
      <article class="card schema-card">
        <div class="card-heading">
          <div>
            <p class="card-kicker">Live aus SQLite</p>
            <h2>Datenbankschema</h2>
          </div>
          <button id="refresh-schema" class="secondary-button" type="button">Schema aktualisieren</button>
        </div>
        <p class="section-copy">Das Backend liest Tabellen und Spalten direkt aus der Datenbank aus. Dieses Schema wird zusammen mit den Markdown-Kontextregeln für die SQL-Generierung verwendet.</p>
        <pre id="schema-output" class="schema-scroll" aria-live="polite">Schema wird geladen …</pre>
      </article>
    </section>

    <section id="examples-view" class="view-panel content-view" hidden>
      <div class="section-intro">
        <p class="eyebrow">Fragen zum Ausprobieren</p>
        <h2>Beispiele</h2>
        <p>Wähle eine Frage aus oder passe sie im Dashboard an.</p>
      </div>
      <div id="examples-list" class="examples-grid">
        ${examples.map((example, index) => `
          <button class="card example-card" type="button" data-example="${index}">
            <span class="example-icon" aria-hidden="true">↗</span>
            <span class="example-label">${example.label}</span>
            <span class="example-question">${example.question}</span>
          </button>
        `).join('')}
      </div>
    </section>
  </main>
  <footer class="footer">Music Streaming Explorer <span>·</span> Unterstützt durch SQLite und Ollama</footer>
`

const questionInput = requireElement<HTMLInputElement>('#question')
const analyzeButton = requireElement<HTMLButtonElement>('#analyze-button')
const statusMessage = requireElement<HTMLParagraphElement>('#app-status')
const resultsTable = requireElement<HTMLDivElement>('#results-table')
const resultCount = requireElement<HTMLSpanElement>('#result-count')
const sqlOutput = requireElement<HTMLElement>('#sql-output')
const copySqlButton = requireElement<HTMLButtonElement>('#copy-sql')
const chartCanvas = requireElement<HTMLCanvasElement>('#results-chart')
const chartEmpty = requireElement<HTMLParagraphElement>('#chart-empty')
const chartCaption = requireElement<HTMLParagraphElement>('#chart-caption')
const categorySelect = requireElement<HTMLSelectElement>('#category-select')
const metricSelect = requireElement<HTMLSelectElement>('#metric-select')
const schemaOutput = requireElement<HTMLPreElement>('#schema-output')
let currentAnalysis: AnalysisResponse | null = null
let chart: Chart | null = null
let schemaLoaded = false

function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`UI-Element nicht gefunden: ${selector}`)
  return element
}

function showStatus(message: string, isError = false): void {
  statusMessage.textContent = message
  statusMessage.classList.toggle('is-error', isError)
  statusMessage.hidden = false
}

function clearStatus(): void {
  statusMessage.textContent = ''
  statusMessage.classList.remove('is-error')
  statusMessage.hidden = true
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value)
  }
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein'
  return String(value)
}

function renderResults(result: AnalysisResponse): void {
  resultsTable.replaceChildren()
  resultCount.textContent = `${result.rows.length} ${result.rows.length === 1 ? 'Zeile' : 'Zeilen'}`
  sqlOutput.textContent = result.generated_sql
  copySqlButton.disabled = false

  if (result.columns.length === 0 || result.rows.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.textContent = 'Die Abfrage hat keine Ergebniszeilen geliefert.'
    resultsTable.append(empty)
    renderChart(result)
    return
  }

  const table = document.createElement('table')
  const head = document.createElement('thead')
  const headerRow = document.createElement('tr')
  for (const column of result.columns) {
    const header = document.createElement('th')
    header.scope = 'col'
    header.textContent = column
    headerRow.append(header)
  }
  head.append(headerRow)

  const body = document.createElement('tbody')
  for (const row of result.rows) {
    const tableRow = document.createElement('tr')
    for (const column of result.columns) {
      const cell = document.createElement('td')
      cell.textContent = formatCell(row[column])
      tableRow.append(cell)
    }
    body.append(tableRow)
  }
  table.append(head, body)
  resultsTable.append(table)
  renderChart(result)
}

function setSelectOptions(select: HTMLSelectElement, values: string[], selected: string): void {
  select.replaceChildren()
  for (const value of values) {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    option.selected = value === selected
    select.append(option)
  }
  select.disabled = values.length === 0
}

function renderChart(result: AnalysisResponse): void {
  chart?.destroy()
  chart = null

  const numericColumns = result.columns.filter((column) =>
    result.rows.some((row) => typeof row[column] === 'number' && Number.isFinite(row[column])),
  )

  if (numericColumns.length === 0 || result.rows.length === 0) {
    chartCanvas.hidden = true
    chartEmpty.hidden = false
    chartEmpty.textContent = 'Für diese Ergebnisse gibt es keinen numerischen Messwert zum Diagramm.'
    categorySelect.disabled = true
    metricSelect.disabled = true
    chartCaption.hidden = true
    return
  }

  const categories = result.columns.filter((column) => column !== numericColumns[0])
  const categoryChoices = categories.length > 0 ? categories : result.columns
  const defaultCategory = categoryChoices[0]
  const defaultMetric = numericColumns[0]
  setSelectOptions(categorySelect, categoryChoices, defaultCategory)
  setSelectOptions(metricSelect, numericColumns, defaultMetric)
  chartEmpty.hidden = true
  chartCanvas.hidden = false

  const updateChart = (): void => {
    const category = categorySelect.value
    const metric = metricSelect.value
    const chartRows = result.rows.slice(0, 30)
    const labels = chartRows.map((row, index) => {
      const value = category ? row[category] : null
      return value === null || value === undefined ? `Zeile ${index + 1}` : String(value)
    })
    const values = chartRows.map((row) => {
      const value = row[metric]
      return typeof value === 'number' && Number.isFinite(value) ? value : 0
    })

    chart?.destroy()
    chart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: metric,
          data: values,
          backgroundColor: '#4aa66d',
          borderRadius: 5,
          maxBarThickness: 64,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${metric}: ${formatCell(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#59635d', maxRotation: 0, autoSkip: true },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#59635d' },
            grid: { color: '#e8ede9' },
          },
        },
      },
    })
    chartCaption.textContent = `Die ersten ${chartRows.length} Ergebnisse · ${metric}`
    chartCaption.hidden = false
  }

  categorySelect.onchange = updateChart
  metricSelect.onchange = updateChart
  updateChart()
}

function setActiveView(viewId: string): void {
  document.querySelectorAll<HTMLButtonElement>('.nav-button').forEach((button) => {
    const active = button.dataset.view === viewId
    button.classList.toggle('active', active)
    if (active) button.setAttribute('aria-current', 'page')
    else button.removeAttribute('aria-current')
  })
  document.querySelectorAll<HTMLElement>('.view-panel').forEach((panel) => {
    panel.hidden = panel.id !== viewId
  })
  if (viewId === 'data-view' && !schemaLoaded) void loadSchema()
}

async function loadSchema(): Promise<void> {
  schemaOutput.textContent = 'Schema wird geladen …'
  const refreshButton = requireElement<HTMLButtonElement>('#refresh-schema')
  refreshButton.disabled = true
  try {
    const response = await getSchema()
    schemaOutput.textContent = response.schema || 'Das Datenbankschema ist leer.'
    schemaLoaded = true
  } catch (error) {
    schemaOutput.textContent = error instanceof Error ? error.message : 'Das Schema konnte nicht geladen werden.'
  } finally {
    refreshButton.disabled = false
  }
}

async function handleAnalysis(event: SubmitEvent): Promise<void> {
  event.preventDefault()
  clearStatus()
  const question = questionInput.value.trim()
  if (question.length < 3 || question.length > 500) {
    showStatus('Die Frage muss zwischen 3 und 500 Zeichen lang sein.', true)
    return
  }

  analyzeButton.disabled = true
  analyzeButton.classList.add('is-loading')
  analyzeButton.querySelector('span')!.textContent = 'Analysiere …'
  try {
    const result = await postAnalysis(question)
    currentAnalysis = result
    renderResults(result)
    showStatus(`Analyse abgeschlossen: ${result.rows.length} Ergebniszeilen.`)
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Die Analyse ist fehlgeschlagen.', true)
  } finally {
    analyzeButton.disabled = false
    analyzeButton.classList.remove('is-loading')
    analyzeButton.querySelector('span')!.textContent = 'Analysieren'
  }
}

document.querySelector<HTMLFormElement>('#analysis-form')!.addEventListener('submit', (event) => {
  void handleAnalysis(event)
})

document.querySelectorAll<HTMLButtonElement>('.nav-button').forEach((button) => {
  button.addEventListener('click', () => setActiveView(button.dataset.view ?? 'dashboard-view'))
})

document.querySelectorAll<HTMLButtonElement>('[data-example]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.example)
    const example = examples[index]
    if (!example) return
    questionInput.value = example.question
    setActiveView('dashboard-view')
    questionInput.focus()
  })
})

requireElement<HTMLButtonElement>('#refresh-schema').addEventListener('click', () => {
  void loadSchema()
})

copySqlButton.addEventListener('click', async () => {
  if (!currentAnalysis) return
  try {
    await navigator.clipboard.writeText(currentAnalysis.generated_sql)
    showStatus('SQL-Abfrage in die Zwischenablage kopiert.')
  } catch (error) {
    showStatus(error instanceof Error ? `Kopieren fehlgeschlagen: ${error.message}` : 'Kopieren fehlgeschlagen.', true)
  }
})
