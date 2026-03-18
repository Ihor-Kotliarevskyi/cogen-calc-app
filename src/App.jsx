import React, { useState } from 'react';
import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import ParamsScreen from './components/ParamsScreen.jsx';
import DashboardScreen from './components/DashboardScreen.jsx';
import BalanceScreen from './components/BalanceScreen.jsx';
import CashflowScreen from './components/CashflowScreen.jsx';
import ScenariosScreen from './components/ScenariosScreen.jsx';
import SavedScenariosScreen from './components/SavedScenariosScreen.jsx';
import { useCalc } from './context/CalcContext.jsx';
import { useAutoSave } from './hooks/useAutoSave.js';

const TABS = [
  { key: 'params', label: 'Параметри' },
  { key: 'dash', label: 'Результат' },
  { key: 'balance', label: 'Баланси' },
  { key: 'cf', label: 'CF / Графік' },
  { key: 'sc', label: 'Сценарії' },
  { key: 'saved', label: 'Збережені' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('params');
  const { P, loading } = useCalc();

  // Auto-save current parameters to localStorage
  useAutoSave(P);

  if (loading) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text2)', fontSize: 14 }}>Завантаження ринкових даних…</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div className="content">
        {activeTab === 'params' && <ParamsScreen />}
        {activeTab === 'dash' && <DashboardScreen />}
        {activeTab === 'balance' && <BalanceScreen />}
        {activeTab === 'cf' && <CashflowScreen />}
        {activeTab === 'sc' && <ScenariosScreen />}
        {activeTab === 'saved' && <SavedScenariosScreen />}
      </div>
    </div>
  );
}
