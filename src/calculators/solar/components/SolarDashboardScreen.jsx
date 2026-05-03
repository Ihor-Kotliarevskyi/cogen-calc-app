import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fN, fM, fG } from '../../../shared/lib/formatters.js';

export default function SolarDashboardScreen() {
  const { result } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 14 }}>Результат СЕС</div>
        <div className="sc-cards-grid">
          <div className="card"><div className="metric-title">Генерація 1-го року</div><div className="metric-val">{fN(result.year1Gen, 0)} кВт·год</div></div>
          <div className="card"><div className="metric-title">Річний дохід</div><div className="metric-val">{fM(result.totalRevenue, 2)}</div></div>
          <div className="card"><div className="metric-title">Чистий потік</div><div className="metric-val">{fM(result.net, 2)}</div></div>
          <div className="card"><div className="metric-title">Окупність</div><div className="metric-val">{result.pb ? `${result.pb.toFixed(1)} р.` : '∞'}</div></div>
          <div className="card"><div className="metric-title">LCOE</div><div className="metric-val">{fG(result.lcoe, 2)}/кВт·год</div></div>
        </div>
      </div>
    </div>
  );
}
