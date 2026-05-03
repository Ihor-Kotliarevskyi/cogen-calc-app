import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fN, fM } from '../../../shared/lib/formatters.js';

export default function SolarGenerationScreen() {
  const { result } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 14 }}>Генерація по роках</div>
        <div className="card" style={{ padding: 12 }}>
          <table className="st">
            <thead>
              <tr><th>Рік</th><th>Генерація, кВт·год</th><th>Net, млн грн</th></tr>
            </thead>
            <tbody>
              {result.yearly.map((y) => (
                <tr key={y.year}>
                  <td>{y.year}</td>
                  <td>{fN(y.gen, 0)}</td>
                  <td>{fM(y.net, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
