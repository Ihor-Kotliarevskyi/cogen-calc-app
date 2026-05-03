import React, { useState, useMemo } from 'react';
import { useCalc } from './context/CogenContext.jsx';
import Header from '../../shared/components/Header.jsx';
import TabBar from '../../shared/components/TabBar.jsx';
import { useAutoSave } from '../../shared/hooks/useAutoSave.js';
import ParamsScreen from './components/ParamsScreen.jsx';
import DashboardScreen from './components/DashboardScreen.jsx';
import BalanceScreen from './components/BalanceScreen.jsx';
import CashflowScreen from './components/CashflowScreen.jsx';
import ScenariosScreen from './components/ScenariosScreen.jsx';
import SavedScenariosScreen from './components/SavedScenariosScreen.jsx';
import { CALC_MODES } from '../../lib/calcModes.js';
import { fN } from '../../shared/lib/formatters.js';

const TABS = [
  { key: 'params', label: 'Параметри' },
  { key: 'dash', label: 'Результат' },
  { key: 'balance', label: 'Баланси' },
  { key: 'cf', label: 'CF / Графік' },
  { key: 'sc', label: 'Сценарії' },
  { key: 'saved', label: 'Збережені' },
];

export default function CogenApp({ calcMode, onModeChange }) {
  const [activeTab, setActiveTab] = useState('params');
  const { P, result, marketMeta, loading } = useCalc();

  useAutoSave(P, 'cogen');

  const subtitle = useMemo(() => {
    const region = marketMeta.region ? ` · ${marketMeta.region}` : '';
    return `${P.projectName} · ${fN(result.h)} год/рік · КГУ ${P.elMW} МВт${region}`;
  }, [P.projectName, P.elMW, result.h, marketMeta.region]);

  if (loading) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text2)', fontSize: 'var(--fs-base)' }}>Завантаження ринкових даних…</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        calcMode={calcMode}
        onModeChange={onModeChange}
        modes={CALC_MODES}
        brand="EnergyROI"
        subtitle={subtitle}
        sourceLabel={marketMeta.updated ? `оновлено ${marketMeta.updated}` : 'дефолтні дані'}
      />
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

