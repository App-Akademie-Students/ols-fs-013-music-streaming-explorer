import Chart from 'chart.js/auto';
import './style.css';

interface AnalysisResponse {
  question: string;
  generated_sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

function element<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

const form = element<HTMLFormElement>('analysis-form');
const question = element<HTMLTextAreaElement>('question');
const submit = element<HTMLButtonElement>('submit');
const status = element('status');
const result = element('result');
const chartSection = element('chart-section');
const category = element<HTMLSelectElement>('category');
const metric = element<HTMLSelectElement>('metric');
const chartType = element<HTMLSelectElement>('chart-type');
const canvas = element<HTMLCanvasElement>('chart');
const chartLimit = 30;
const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 12 });

let analysis: AnalysisResponse | undefined;
let chart: Chart<'bar' | 'line', (number | null)[], string> | undefined;

function formatValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'number') return numberFormat.format(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function renderChart() {
  chart?.destroy();
  chart = undefined;
  if (!analysis || chartSection.hidden) return;

  const categoryColumn = category.value === '' ? undefined : analysis.columns[Number(category.value)];
  const metricColumn = analysis.columns[Number(metric.value)];
  const rows = analysis.rows.slice(0, chartLimit);
  const labels = rows.map((row, index) => categoryColumn === undefined
    ? String(index + 1)
    : formatValue(row[categoryColumn]));
  const data = rows.map((row) => {
    const value = row[metricColumn];
    return isNumber(value) ? value : null;
  });
  const type = chartType.value === 'line' ? 'line' : 'bar';

  element('chart-note').textContent = analysis.rows.length > chartLimit
    ? `Erste ${chartLimit} von ${analysis.rows.length} Zeilen in Abfragereihenfolge.`
    : '';
  canvas.setAttribute('aria-label', `${metricColumn} nach ${categoryColumn ?? 'Zeilennummer'}. Werte stehen in der Ergebnistabelle.`);

  chart = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        label: metricColumn,
        data,
        backgroundColor: '#b8f36b',
        borderColor: '#b8f36b',
        borderRadius: 5,
        tension: 0.15,
      }],
    },
    options: {
      indexAxis: type === 'bar' ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#c3c8d6' }, grid: { color: '#303746' }, beginAtZero: type === 'bar' },
        y: { ticks: { color: '#c3c8d6', autoSkip: type === 'line' }, grid: { color: '#303746' }, beginAtZero: type === 'line' },
      },
    },
  });
}

function renderResponse(response: AnalysisResponse) {
  analysis = response;
  element('analyzed-question').textContent = response.question;
  const count = response.rows.length;
  element('row-count').textContent = count === 500 ? '500 Zeilen · API-Limit erreicht' : `${count} ${count === 1 ? 'Zeile' : 'Zeilen'}`;
  element('sql').textContent = response.generated_sql;
  element('empty').hidden = count > 0;
  element('table-frame').hidden = count === 0;

  const table = element<HTMLTableElement>('results-table');
  table.replaceChildren();
  const header = table.createTHead().insertRow();
  for (const column of response.columns) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = column;
    header.append(cell);
  }
  const body = table.createTBody();
  for (const row of response.rows) {
    const tableRow = body.insertRow();
    for (const column of response.columns) {
      tableRow.insertCell().textContent = formatValue(row[column]);
    }
  }

  category.replaceChildren(new Option('Zeilennummer', ''));
  metric.replaceChildren();
  let defaultCategory = '';
  response.columns.forEach((column, index) => {
    const columnIndex = String(index);
    category.add(new Option(column, columnIndex));
    const values = response.rows.map((row) => row[column]).filter((value) => value != null);
    if (values.length && values.every(isNumber)) metric.add(new Option(column, columnIndex));
    if (!defaultCategory && values.some((value) => typeof value === 'string')) defaultCategory = columnIndex;
  });
  category.value = defaultCategory;
  chartSection.hidden = metric.options.length === 0;
  result.hidden = false;
  renderChart();
}

for (const control of [category, metric, chartType]) {
  control.addEventListener('change', renderChart);
}

function updateCount() {
  element('count').textContent = `${question.value.length} / 500`;
}
question.addEventListener('input', updateCount);

for (const example of document.querySelectorAll<HTMLButtonElement>('[data-question]')) {
  example.addEventListener('click', () => {
    question.value = example.dataset.question ?? '';
    updateCount();
    question.focus();
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  const input = question.value.trim();
  if (input.length < 3 || input.length > 500) {
    status.textContent = 'Gib eine Frage mit 3 bis 500 Zeichen ein.';
    question.focus();
    return;
  }

  submit.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Die Frage wird analysiert …';
  try {
    const response = await fetch('/api/analyses/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input }),
      signal: AbortSignal.timeout(150_000),
    });
    if (!response.ok) {
      const message = response.status === 422
        ? 'Die API konnte die Frage nicht verarbeiten. Prüfe die Eingabe.'
        : `Die Analyse ist fehlgeschlagen (HTTP ${response.status}). Prüfe FastAPI und Ollama.`;
      status.textContent = message;
      return;
    }

    renderResponse(await response.json() as AnalysisResponse);
    status.textContent = 'Analyse abgeschlossen.';
  } catch (error) {
    status.textContent = error instanceof DOMException && error.name === 'TimeoutError'
      ? 'Die Analyse hat zu lange gedauert. Versuche es erneut.'
      : 'Die Analyse konnte nicht geladen werden. Prüfe die Verbindung zur API.';
  } finally {
    submit.disabled = false;
    form.setAttribute('aria-busy', 'false');
  }
});

