import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fN, fM } from '../../../shared/lib/formatters.js';

export default function SolarGenerationScreen() {
  const { result } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="mg">
          <div className="m">
            <div className="ml">1-й рік</div>
            <div className="mv cb">{fN(result.year1Gen, 0)}</div>
            <div className="ms">кВт·год</div>
          </div>
          <div className="m">
            <div className="ml">15 років</div>
            <div className="mv cb">{fN(result.yearly.reduce((sum, y) => sum + y.gen, 0), 0)}</div>
            <div className="ms">Сукупна генерація</div>
          </div>
        </div>

        <div className="sec">Генерація по роках</div>
        <div className="card" style={{ padding: 12 }}>
          <table className="st">
            <thead>
              <tr><th>Рік</th><th>Генерація, кВт·год</th><th>Net, млн грн</th><th>Деградація</th></tr>
            </thead>
            <tbody>
              {result.yearly.map((y) => (
                <tr key={y.year}>
                  <td>{y.year}</td>
                  <td>{fN(y.gen, 0)}</td>
                  <td>{fM(y.net, 2)}</td>
                  <td>{fN((1 - y.degFactor) * 100, 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
