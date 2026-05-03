import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';

export default function SolarCashflowScreen() {
  const { result } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 14 }}>Cashflow</div>
        <div className="card" style={{ padding: 12 }}>
          {result.cf.map((v, i) => (
            <div key={i} className="cf-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>{i === 0 ? 'Year 0' : `Year ${i}`}</span>
              <b style={{ color: v >= 0 ? 'var(--green)' : 'var(--red)' }}>{v.toFixed(2)} млн</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
