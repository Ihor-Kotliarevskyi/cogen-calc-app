import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fN } from '../../../shared/lib/formatters.js';

export default function SolarCashflowScreen() {
  const { result } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 16 }}>CF / Графік</div>
        <div className="card" style={{ padding: 12 }}>
          {result.cf.map((v, i) => (
            <div key={i} className="cf-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="cf-yr">{i === 0 ? 'Старт' : `Рік ${i}`}</span>
              <b className={v >= 0 ? 'cg' : 'cr'}>{fN(v, 2)} млн</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
