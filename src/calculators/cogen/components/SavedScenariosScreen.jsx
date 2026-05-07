import React, { useCallback, useRef, useState } from 'react';
import { useCalc } from '../context/CogenContext.jsx';
import { fG, fM } from '../../../shared/lib/formatters.js';
import Icon from '../../../shared/components/Icon.jsx';
import {
  deleteScenario,
  downloadScenarioJSON,
  exportToCSV,
  exportToJSON,
  getScenarios,
  importFromJSON,
  saveScenario,
} from '../../../shared/lib/scenarioStorage.js';
import { printCogenScenarioReport } from '../lib/printReport.js';

export default function SavedScenariosScreen({ onLoadScenario }) {
  const { P, result, dispatch } = useCalc();
  const [scenarios, setScenarios] = useState(() => getScenarios('cogen'));
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const refresh = useCallback(() => setScenarios(getScenarios('cogen')), []);
  const defaultScenarioName = P.projectName?.trim?.() || '';

  const buildCurrentScenario = () => ({
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

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Вкажіть назву сценарію.');
      return;
    }

    saveScenario(trimmed, P, result, 'cogen');
    setName('');
    setError('');
    setShowSaveModal(false);
    refresh();
  };

  const handleDelete = (id) => {
    deleteScenario(id, 'cogen');
    refresh();
  };

  const handleApply = (scenario) => {
    dispatch({ type: 'LOAD_STATE', state: scenario.P });
    onLoadScenario?.();
  };

  const handlePrint = (scenario) => {
    try {
      printCogenScenarioReport(scenario);
      setError('');
    } catch (err) {
      setError(err?.message || 'Не вдалося відкрити вікно друку.');
    }
  };

  const handlePrintCurrent = () => handlePrint(buildCurrentScenario());

  const openSaveModal = () => {
    setName(defaultScenarioName);
    setError('');
    setShowSaveModal(true);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importFromJSON(text, 'cogen');
      refresh();
      setError('');
    } catch (err) {
      setError(err?.message || 'Не вдалося імпортувати JSON.');
    } finally {
      event.target.value = '';
    }
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="screen active">
      <div className="page-wrap">
        {showSaveModal && (
          <div className="save-modal card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Зберегти поточний сценарій</div>
            <input
              className="save-input"
              type="text"
              placeholder="Назва сценарію..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn-primary" onClick={handleSave}>Зберегти</button>
              <button className="btn-secondary" onClick={() => {
                setShowSaveModal(false);
                setName('');
                setError('');
              }}
              >
                Скасувати
              </button>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              Собів.: {fG(result.ecg)} · Окупність: {result.pb ? `${result.pb.toFixed(1)} р.` : '∞'} · Прибуток: {fM(result.net)}
            </div>
          </div>
        )}

        <div className="card">
          <div className="saved-toolbar">
            <button className="btn-primary" onClick={openSaveModal}>Зберегти сценарій</button>
            <button className="btn-export" onClick={() => exportToJSON(scenarios, 'cogen')}>JSON</button>
            <button className="btn-export" onClick={() => exportToCSV(scenarios, 'cogen')}>CSV</button>
            <button className="btn-export" onClick={handleImportClick}>Імпорт JSON</button>
            <button className="btn-export" onClick={handlePrintCurrent}>Друк</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>

        {scenarios.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon"><Icon name="files" /></div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Збережених сценаріїв ще немає</div>
          </div>
        ) : (
          scenarios.map((scenario) => {
            const pbColor = scenario.metrics.pb
              ? (scenario.metrics.pb < 4 ? 'var(--green)' : scenario.metrics.pb < 7 ? 'var(--amber)' : 'var(--red)')
              : 'var(--red)';
            const netColor = scenario.metrics.net > 0 ? 'var(--green)' : 'var(--red)';

            return (
              <div key={scenario.id} className="card sc-saved-card">
                <div className="saved-card-head">
                  <div className="saved-card-title-wrap">
                    <div className="sc-saved-name">{scenario.name}</div>
                    <div className="sc-saved-date">{formatDate(scenario.timestamp)}</div>
                  </div>
                  <div className="saved-card-tools">
                    <button className="btn-icon" title="Завантажити JSON" onClick={() => downloadScenarioJSON(scenario, 'cogen')}><Icon name="download" /></button>
                    <button className="btn-icon" title="Друк" onClick={() => handlePrint(scenario)}><Icon name="print" /></button>
                    <button className="btn-icon btn-icon-danger" title="Видалити" onClick={() => handleDelete(scenario.id)}><Icon name="trash" /></button>
                  </div>
                </div>
                <div className="sc-saved-metrics">
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Собів.</span><span style={{ color: scenario.metrics.ecg < scenario.metrics.ep ? 'var(--green)' : 'var(--red)' }}>{fG(scenario.metrics.ecg)}</span></div>
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Окупн.</span><span style={{ color: pbColor }}>{scenario.metrics.pb ? `${scenario.metrics.pb.toFixed(1)} р.` : '∞'}</span></div>
                  <div className="sc-saved-metric"><span className="sc-saved-metric-label">Прибуток</span><span style={{ color: netColor }}>{fM(scenario.metrics.net)}</span></div>
                </div>
                <div className="saved-card-actions">
                  <button className="btn-secondary" onClick={() => handleApply(scenario)}>Застосувати в калькулятор</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
