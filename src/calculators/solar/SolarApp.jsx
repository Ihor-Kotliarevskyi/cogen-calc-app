import React, { useState } from 'react';
import Header from '../../shared/components/Header.jsx';
import TabBar from '../../shared/components/TabBar.jsx';
import { CALC_MODES } from '../../lib/calcModes.js';
import { useSolar } from './context/SolarContext.jsx';
import { useAutoSave } from '../../shared/hooks/useAutoSave.js';
import SolarParamsScreen from './components/SolarParamsScreen.jsx';
import SolarDashboardScreen from './components/SolarDashboardScreen.jsx';
import SolarGenerationScreen from './components/SolarGenerationScreen.jsx';
import SolarCashflowScreen from './components/SolarCashflowScreen.jsx';
import SolarScenariosScreen from './components/SolarScenariosScreen.jsx';
import SolarSavedScenariosScreen from './components/SolarSavedScenariosScreen.jsx';
import SolarFaqScreen from './components/SolarFaqScreen.jsx';

const TABS = [
  { key: 'params', label: 'Параметри' },
  { key: 'dash', label: 'Результат' },
  { key: 'gen', label: 'Генерація' },
  { key: 'cf', label: 'Графік' },
  { key: 'sc', label: 'Сценарії' },
  { key: 'saved', label: 'Збережені' },
  { key: 'faq', label: 'FAQ' },
];

export default function SolarApp({ calcMode, onModeChange }) {
  const [activeTab, setActiveTab] = useState('params');
  const { P, loading } = useSolar();

  useAutoSave(P, 'solar');

  if (loading) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text2)', fontSize: 'var(--fs-base)' }}>Завантаження ринкових даних…</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header calcMode={calcMode} onModeChange={onModeChange} modes={CALC_MODES} title="Сонячна електростанція" />
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div className="content">
        {activeTab === 'params' && <SolarParamsScreen />}
        {activeTab === 'dash' && <SolarDashboardScreen />}
        {activeTab === 'gen' && <SolarGenerationScreen />}
        {activeTab === 'cf' && <SolarCashflowScreen />}
        {activeTab === 'sc' && <SolarScenariosScreen />}
        {activeTab === 'saved' && <SolarSavedScenariosScreen onLoadScenario={() => setActiveTab('params')} />}
        {activeTab === 'faq' && <SolarFaqScreen />}
      </div>
    </div>
  );
}
