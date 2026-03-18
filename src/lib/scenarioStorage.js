const SCENARIOS_KEY = 'cogen-scenarios';
const CURRENT_KEY = 'cogen-current';

// ── Current state persistence ──

export function saveCurrentState(P) {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(P));
  } catch (e) {
    console.warn('[storage] Помилка збереження поточного стану:', e);
  }
}

export function loadCurrentState() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[storage] Помилка завантаження стану:', e);
    return null;
  }
}

// ── Saved scenarios ──

function getAll() {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(scenarios) {
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
}

export function getScenarios() {
  return getAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function saveScenario(name, P, result) {
  const scenarios = getAll();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    timestamp: Date.now(),
    P: { ...P },
    metrics: {
      ecg: result.ecg,
      ep: result.ep,
      pb: result.pb,
      tot: result.tot,
      net: result.net,
      gcT: result.gcT,
    },
  };
  scenarios.push(entry);
  setAll(scenarios);
  return entry;
}

export function deleteScenario(id) {
  const scenarios = getAll().filter((s) => s.id !== id);
  setAll(scenarios);
}

// ── Export utilities ──

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON(scenarios) {
  const data = scenarios.map((s) => ({
    name: s.name,
    date: new Date(s.timestamp).toLocaleDateString('uk-UA'),
    parameters: s.P,
    metrics: s.metrics,
  }));
  downloadFile(JSON.stringify(data, null, 2), 'кгу-сценарії.json', 'application/json');
}

export function exportToCSV(scenarios) {
  const headers = [
    'Назва', 'Дата',
    'Газ (грн/тис.м³)', 'РДН (грн/МВт·год)', 'Передача', 'Розподіл',
    'Тепло (грн/Гкал)', 'Літо тепло', 'База ел. (МВт)', 'VRF зима', 'VRF літо',
    'CAPEX (грн)', 'OPEX (%)', 'Доступність',
    'Собів. ел.', 'Ціна мережі', 'Окупність (р.)', 'Дохід (грн)', 'Прибуток (грн)', 'Тепло (Гкал)',
  ];
  const rows = scenarios.map((s) => [
    s.name,
    new Date(s.timestamp).toLocaleDateString('uk-UA'),
    s.P.gp, s.P.rdm, s.P.trans, s.P.distr,
    s.P.hp, s.P.sh, s.P.elB, s.P.vrfW, s.P.vrfS,
    s.P.capex, s.P.opex, s.P.av,
    s.metrics.ecg?.toFixed(2), s.metrics.ep?.toFixed(2),
    s.metrics.pb?.toFixed(1) || '∞',
    s.metrics.tot?.toFixed(0), s.metrics.net?.toFixed(0),
    s.metrics.gcT?.toFixed(0),
  ]);
  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  downloadFile('\uFEFF' + csv, 'кгу-сценарії.csv', 'text/csv;charset=utf-8');
}
