const MODULE_KEYS = {
  cogen: {
    scenarios: 'cogen-scenarios',
    current: 'cogen-current',
  },
  solar: {
    scenarios: 'solar-scenarios',
    current: 'solar-current',
  },
};

function keysFor(mode = 'cogen') {
  return MODULE_KEYS[mode] ?? MODULE_KEYS.cogen;
}

export function saveCurrentState(P, mode = 'cogen') {
  try {
    const { current } = keysFor(mode);
    localStorage.setItem(current, JSON.stringify(P));
  } catch (e) {
    console.warn('[storage] save current failed:', e);
  }
}

export function loadCurrentState(mode = 'cogen') {
  try {
    const { current } = keysFor(mode);
    const raw = localStorage.getItem(current);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[storage] load current failed:', e);
    return null;
  }
}

function getAll(mode = 'cogen') {
  try {
    const { scenarios } = keysFor(mode);
    const raw = localStorage.getItem(scenarios);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(mode, scenarios) {
  const { scenarios: scenariosKey } = keysFor(mode);
  localStorage.setItem(scenariosKey, JSON.stringify(scenarios));
}

export function getScenarios(mode = 'cogen') {
  return getAll(mode).sort((a, b) => b.timestamp - a.timestamp);
}

export function saveScenario(name, P, result, mode = 'cogen') {
  const scenarios = getAll(mode);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    mode,
    timestamp: Date.now(),
    P: { ...P },
    metrics: mode === 'solar'
      ? {
          year1Gen: result.year1Gen,
          pb: result.pb,
          totalRevenue: result.totalRevenue,
          net: result.net,
          lcoe: result.lcoe,
        }
      : {
          ecg: result.ecg,
          ep: result.ep,
          pb: result.pb,
          tot: result.tot,
          net: result.net,
          gcT: result.gcT,
        },
  };
  scenarios.push(entry);
  setAll(mode, scenarios);
  return entry;
}

export function deleteScenario(id, mode = 'cogen') {
  const scenarios = getAll(mode).filter((s) => s.id !== id);
  setAll(mode, scenarios);
}

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

export function exportToJSON(scenarios, mode = 'cogen') {
  const data = scenarios.map((s) => ({
    mode,
    name: s.name,
    date: new Date(s.timestamp).toLocaleDateString('uk-UA'),
    parameters: s.P,
    metrics: s.metrics,
  }));
  downloadFile(JSON.stringify(data, null, 2), `${mode}-scenarios.json`, 'application/json');
}

export function exportToCSV(scenarios, mode = 'cogen') {
  if (mode === 'solar') {
    const headers = ['Назва', 'Дата', 'Потужність, МВт', 'Генерація 1-го року, кВт·год', 'Окупність, р.', 'Дохід, грн', 'Net, грн', 'LCOE, грн/кВт·год'];
    const rows = scenarios.map((s) => [
      s.name,
      new Date(s.timestamp).toLocaleDateString('uk-UA'),
      s.P.pvMW,
      s.metrics.year1Gen?.toFixed(0),
      s.metrics.pb ? s.metrics.pb.toFixed(1) : '∞',
      s.metrics.totalRevenue?.toFixed(0),
      s.metrics.net?.toFixed(0),
      s.metrics.lcoe?.toFixed(3),
    ]);
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    downloadFile('\uFEFF' + csv, 'solar-scenarios.csv', 'text/csv;charset=utf-8');
    return;
  }

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
    s.metrics.tot?.toFixed(0), s.metrics.net?.toFixed(0), s.metrics.gcT?.toFixed(0),
  ]);
  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  downloadFile('\uFEFF' + csv, 'cogen-scenarios.csv', 'text/csv;charset=utf-8');
}
