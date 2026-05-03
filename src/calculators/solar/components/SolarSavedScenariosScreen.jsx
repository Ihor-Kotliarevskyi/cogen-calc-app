import React, { useCallback, useState } from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fM, fN } from '../../../shared/lib/formatters.js';
import {
  deleteScenario,
  exportToCSV,
  exportToJSON,
  getScenarios,
  saveScenario,
} from '../../../shared/lib/scenarioStorage.js';

export default function SolarSavedScenariosScreen() {
  const { P, result, dispatch } = useSolar();
  const [scenarios, setScenarios] = useState(() => getScenarios('solar'));
  const [name, setName] = useState('');

  const refresh = useCallback(() => setScenarios(getScenarios('solar')), []);

  const handleSave = () => {
    if (!name.trim()) return;
    saveScenario(name.trim(), P, result, 'solar');
    setName('');
    refresh();
  };

  const handleLoad = (scenario) => dispatch({ type: 'LOAD_STATE', state: scenario.P });
  const handleDelete = (id) => {
    deleteScenario(id, 'solar');
    refresh();
  };

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="title-row">
          <div className="scr-title">Збережені (СЕС)</div>
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div className="sr-head">
            <span className="sr-label">Назва сценарію</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="save-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Назва..." />
            <button className="btn-primary" onClick={handleSave}>Зберегти</button>
          </div>
        </div>

        {scenarios.length > 0 && (
          <div className="export-bar">
            <button className="btn-export" onClick={() => exportToJSON(scenarios, 'solar')}>JSON</button>
            <button className="btn-export" onClick={() => exportToCSV(scenarios, 'solar')}>CSV</button>
          </div>
        )}

        {scenarios.map((s) => (
          <div key={s.id} className="card sc-saved-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="sc-saved-name">{s.name}</div>
                <div className="sc-saved-date">{new Date(s.timestamp).toLocaleString('uk-UA')}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-icon" onClick={() => handleLoad(s)}>📥</button>
                <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(s.id)}>🗑</button>
              </div>
            </div>
            <div className="sc-saved-metrics">
              <div className="sc-saved-metric"><span className="sc-saved-metric-label">Генерація</span><span>{fN(s.metrics.year1Gen, 0)} кВт·год</span></div>
              <div className="sc-saved-metric"><span className="sc-saved-metric-label">Окупність</span><span>{s.metrics.pb ? s.metrics.pb.toFixed(1) + ' р.' : '∞'}</span></div>
              <div className="sc-saved-metric"><span className="sc-saved-metric-label">Net</span><span>{fM(s.metrics.net, 2)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
