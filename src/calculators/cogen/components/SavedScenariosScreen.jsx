import React, { useState, useCallback } from 'react';
import { useCalc } from '../context/CogenContext.jsx';
import { fN, fM, fG } from '../../../shared/lib/formatters.js';
import {
  getScenarios,
  saveScenario,
  deleteScenario,
  exportToJSON,
  exportToCSV,
} from '../../../shared/lib/scenarioStorage.js';
import PrintReport from './PrintReport.jsx';

export default function SavedScenariosScreen() {
  const { P, result, dispatch } = useCalc();
  const [scenarios, setScenarios] = useState(() => getScenarios('cogen'));
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [name, setName] = useState('');
  const [showPrint, setShowPrint] = useState(null);

  const refresh = useCallback(() => setScenarios(getScenarios('cogen')), []);

  const handleSave = () => {
    if (!name.trim()) return;
    saveScenario(name.trim(), P, result, 'cogen');
    setName('');
    setShowSaveModal(false);
    refresh();
  };

  const handleDelete = (id) => {
    deleteScenario(id, 'cogen');
    refresh();
  };

  const handleLoad = (scenario) => {
    dispatch({ type: 'LOAD_STATE', state: scenario.P });
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
        ecg: result.ecg,
        ep: result.ep,
        pb: result.pb,
        tot: result.tot,
        net: result.net,
        gcT: result.gcT,
      },
    });
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(null), 500);
    }, 100);
  };

  const fDate = (ts) => new Date(ts).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  if (showPrint) {
    return <PrintReport scenario={showPrint} />;
  }

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
              Собів.: {fG(result.ecg)} · Окупність: {result.pb ? result.pb.toFixed(1) + ' р.' : '∞'} · Прибуток: {fM(result.net)}
            </div>
          </div>
        )}

        {scenarios.length > 0 && (
          <div className="export-bar">
            <button className="btn-export" onClick={() => exportToJSON(scenarios, 'cogen')}>JSON</button>
            <button className="btn-export" onClick={() => exportToCSV(scenarios, 'cogen')}>CSV</button>
            <button className="btn-export" onClick={handlePrintCurrent}>Друк</button>
          </div>
        )}

        {scenarios.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Збережених сценаріїв ще немає</div>
          </div>
        ) : (
          scenarios.map((s) => {
            const pbColor = s.metrics.pb
              ? (s.metrics.pb < 4 ? 'var(--green)' : s.metrics.pb < 7 ? 'var(--amber)' : 'var(--red)')
              : 'var(--red)';
            const netColor = s.metrics.net > 0 ? 'var(--green)' : 'var(--red)';

            return (
              <div key={s.id} className="card sc-saved-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="sc-saved-name">{s.name}</div>
                    <div className="sc-saved-date">{fDate(s.timestamp)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" title="Завантажити" onClick={() => handleLoad(s)}>DL</button>
                    <button className="btn-icon" title="Друк" onClick={() => handlePrint(s)}>PR</button>
                    <button className="btn-icon btn-icon-danger" title="Видалити" onClick={() => handleDelete(s.id)}>RM</button>
                  </div>
                </div>
                <div className="sc-saved-metrics">
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Собів.</span><span style={{ color: s.metrics.ecg < s.metrics.ep ? 'var(--green)' : 'var(--red)' }}>{fG(s.metrics.ecg)}</span></div>
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Окупн.</span><span style={{ color: pbColor }}>{s.metrics.pb ? s.metrics.pb.toFixed(1) + ' р.' : '∞'}</span></div>
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Прибуток</span><span style={{ color: netColor }}>{fM(s.metrics.net)}</span></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

