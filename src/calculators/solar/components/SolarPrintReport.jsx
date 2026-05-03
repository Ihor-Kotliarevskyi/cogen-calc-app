import React from 'react';
import { calc } from '../lib/calc.js';
import { fM, fN, fG } from '../../../shared/lib/formatters.js';

export default function SolarPrintReport({ scenario }) {
  const P = scenario.P;
  const r = calc(P);
  const now = new Date(scenario.timestamp || Date.now());

  return (
    <div className="print-report">
      <div className="print-header">
        <h1>EnergyROI · СЕС</h1>
        <h2>{scenario.name || 'Поточний сценарій'}</h2>
        <div className="print-date">{now.toLocaleString('uk-UA')}</div>
      </div>

      <div className="print-section">
        <h3>Ключові показники</h3>
        <table className="print-table">
          <tbody>
            <tr><td>Генерація 1-го року</td><td>{fN(r.year1Gen, 0)} кВт·год</td></tr>
            <tr><td>Річний дохід</td><td>{fM(r.totalRevenue, 2)}</td></tr>
            <tr><td>Чистий прибуток / рік</td><td>{fM(r.net, 2)}</td></tr>
            <tr><td>Окупність</td><td>{r.pb ? `${r.pb.toFixed(1)} років` : '∞'}</td></tr>
            <tr><td>LCOE</td><td>{fG(r.lcoe, 2)}/кВт·год</td></tr>
            <tr><td>NPV за 15 років</td><td>{fN(r.cf[15], 1)} млн грн</td></tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <h3>Вхідні параметри</h3>
        <table className="print-table">
          <tbody>
            <tr><td>Потужність СЕС</td><td>{P.pvMW.toFixed(2)} МВт</td></tr>
            <tr><td>Питомий виробіток</td><td>{fN(P.specificYield, 0)} кВт·год/кВт·рік</td></tr>
            <tr><td>Деградація</td><td>{P.degradation.toFixed(2)}%/рік</td></tr>
            <tr><td>Власне споживання</td><td>{(P.selfUseShare * 100).toFixed(0)}%</td></tr>
            <tr><td>Ціна заміщення</td><td>{P.gridPrice.toFixed(2)} грн/кВт·год</td></tr>
            <tr><td>Тариф продажу</td><td>{P.feedInTariff.toFixed(2)} грн/кВт·год</td></tr>
            <tr><td>CAPEX</td><td>{fM(P.capex, 1)}</td></tr>
            <tr><td>OPEX</td><td>{P.opex.toFixed(1)}% від CAPEX</td></tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <h3>Кумулятивний CF по роках</h3>
        <table className="print-table print-cf">
          <thead>
            <tr>{r.cf.map((_, i) => <th key={i}>{i === 0 ? 'Ст.' : `р.${i}`}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              {r.cf.map((v, i) => (
                <td key={i} className={v >= 0 ? 'print-green' : 'print-red'}>{v.toFixed(1)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-footer">
        <p>Згенеровано: EnergyROI · {now.toLocaleDateString('uk-UA')}</p>
      </div>
    </div>
  );
}
