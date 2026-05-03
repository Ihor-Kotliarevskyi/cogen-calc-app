import React, { useCallback, useState } from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fM, fN, fG } from '../../../shared/lib/formatters.js';
import {
  deleteScenario,
  exportToCSV,
  exportToJSON,
  getScenarios,
  saveScenario,
} from '../../../shared/lib/scenarioStorage.js';
import SolarPrintReport from './SolarPrintReport.jsx';

export default function SolarSavedScenariosScreen() {
  const { P, result, dispatch } = useSolar();
  const [scenarios, setScenarios] = useState(() => getScenarios('solar'));
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [name, setName] = useState('');
  const [showPrint, setShowPrint] = useState(null);

  const refresh = useCallback(() => setScenarios(getScenarios('solar')), []);

  const handleSave = () => {
    if (!name.trim()) return;
    saveScenario(name.trim(), P, result, 'solar');
    setName('');
    setShowSaveModal(false);
    refresh();
  };

  const handleLoad = (scenario) => dispatch({ type: 'LOAD_STATE', state: scenario.P });

  const handleDelete = (id) => {
    deleteScenario(id, 'solar');
    refresh();
  };

  const handlePrint = (scenario) => {
    setShowPrint(scenario);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(null), 500);
    }, 100);
  };

  const handlePrintCurrent = () => {
    setShowPrint({
      name: 'Поточний сценарій',
      timestamp: Date.now(),
      P,
      metrics: {
        year1Gen: result.year1Gen,
        pb: result.pb,
        totalRevenue: result.totalRevenue,
        net: result.net,
        lcoe: result.lcoe,
      },
    });
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(null), 500);
    }, 100);
  };

  if (showPrint) return <SolarPrintReport scenario={showPrint} />;

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="title-row">
          <div className="scr-title">Збережені</div>
          <button className="reset-btn save-btn" onClick={() => setShowSaveModal(true)}>+ Зберегти</button>
        </div>

        {showSaveModal && (
          <div className="save-modal card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Зберегти поточний сценарій</div>
            <input
              className="save-input"
              type="text"
              placeholder="Назва сценарію..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn-primary" onClick={handleSave}>Зберегти</button>
              <button className="btn-secondary" onClick={() => { setShowSaveModal(false); setName(''); }}>Скасувати</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              LCOE: {fG(result.lcoe, 2)} · Окупність: {result.pb ? result.pb.toFixed(1) + ' р.' : '∞'} · Net: {fM(result.net, 2)}
            </div>
          </div>
        )}

        {scenarios.length > 0 && (
          <div className="export-bar">
            <button className="btn-export" onClick={() => exportToJSON(scenarios, 'solar')}>JSON</button>
            <button className="btn-export" onClick={() => exportToCSV(scenarios, 'solar')}>CSV</button>
            <button className="btn-export" onClick={handlePrintCurrent}>Друк</button>
          </div>
        )}

        {scenarios.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Збережених сценаріїв ще немає</div>
          </div>
        ) : (
          scenarios.map((s) => (
            <div key={s.id} className="card sc-saved-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="sc-saved-name">{s.name}</div>
                  <div className="sc-saved-date">{new Date(s.timestamp).toLocaleString('uk-UA')}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" title="Завантажити" onClick={() => handleLoad(s)}>DL</button>
                  <button className="btn-icon" title="Друк" onClick={() => handlePrint(s)}>PR</button>
                  <button className="btn-icon btn-icon-danger" title="Видалити" onClick={() => handleDelete(s.id)}>RM</button>
                </div>
              </div>
              <div className="sc-saved-metrics">
                <div className="sc-saved-metric"><span className="sc-saved-metric-label">Генерація</span><span>{fN(s.metrics.year1Gen, 0)} кВт·год</span></div>
                <div className="sc-saved-metric"><span className="sc-saved-metric-label">Окупність</span><span>{s.metrics.pb ? s.metrics.pb.toFixed(1) + ' р.' : '∞'}</span></div>
                <div className="sc-saved-metric"><span className="sc-saved-metric-label">Net</span><span>{fM(s.metrics.net, 2)}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
