import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { calc, fN, fM, fG } from '../lib/calc.js';

export default function ScenariosScreen() {
  const { P, result: r } = useCalc();

  const sc = (ov) => calc({ ...P, ...ov });
  const scenarios = [
    {
      title: 'Консервативний',
      badge: 'Мережа не бере влітку',
      bc: 'var(--bg3)',
      tc: 'var(--text2)',
      r: sc({ sh: 0, hp: 800 }),
      best: false,
    },
    {
      title: 'Базовий (поточний)',
      badge: 'Ваші параметри',
      bc: 'var(--green-bg)',
      tc: 'var(--green)',
      r,
      best: true,
    },
    {
      title: 'Оптимістичний',
      badge: 'РДН 8грн, газ -10%, тепло 2500',
      bc: 'var(--blue-bg)',
      tc: 'var(--blue)',
      r: sc({
        rdm: 8000,
        gp: Math.round(P.gp * 0.9),
        hp: 2500,
        sh: 1,
        av: 0.95,
      }),
      best: false,
    },
    {
      title: 'Тільки електрика',
      badge: 'Без продажу тепла',
      bc: 'var(--amber-bg)',
      tc: 'var(--amber)',
      r: sc({ hp: 0, sh: 0 }),
      best: false,
    },
  ];

  const metrics = [
    { l: 'Собів. ел.', f: (s) => fG(s.ecg, 2) },
    { l: 'Дохід, млн', f: (s) => fM(s.tot, 1) },
    { l: 'Прибуток, млн', f: (s) => fM(s.net, 1) },
    { l: 'Окупність', f: (s) => (s.pb ? s.pb.toFixed(1) + ' р.' : '∞') },
    { l: 'NPV 15р.', f: (s) => fN(s.cf[15], 1) + ' млн' },
  ];

  return (
    <div className="screen active">
      <div className="scr-title" style={{ marginBottom: 14 }}>Сценарії</div>

      {scenarios.map((s, i) => (
        <div key={i} className={`card${s.best ? ' best' : ''}`}>
          <div className="sc-badge" style={{ background: s.bc, color: s.tc }}>{s.badge}</div>
          <div className="sc-title">{s.title}</div>
          <div className="sc-row">
            <span className="sc-k">Собів. ел.</span>
            <span className="sc-v" style={{ color: s.r.ecg < s.r.ep ? 'var(--green)' : 'var(--red)' }}>
              {fG(s.r.ecg)}
            </span>
          </div>
          <div className="sc-row">
            <span className="sc-k">Тепло в мережу</span>
            <span className="sc-v">{fN(s.r.gcT, 0)} Гкал</span>
          </div>
          <div className="sc-row">
            <span className="sc-k">Прибуток / рік</span>
            <span className="sc-v" style={{ color: s.r.net > 0 ? 'var(--green)' : 'var(--red)' }}>
              {fM(s.r.net)}
            </span>
          </div>
          <div className="sc-row">
            <span className="sc-k">Окупність</span>
            <span className="sc-v" style={{ color: s.r.pb ? (s.r.pb < 5 ? 'var(--green)' : 'var(--amber)') : 'var(--red)' }}>
              {s.r.pb ? s.r.pb.toFixed(1) + ' р.' : '∞'}
            </span>
          </div>
        </div>
      ))}

      <div className="sec">Порівняльна таблиця</div>
      <div className="card" style={{ padding: 12 }}>
        <table className="st">
          <thead>
            <tr>
              <th></th>
              {scenarios.map((s, i) => (
                <th key={i} style={{ color: s.tc, fontSize: 10 }}>{s.title.split(' ')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, mi) => (
              <tr key={mi}>
                <td>{m.l}</td>
                {scenarios.map((s, si) => (
                  <td key={si}>{m.f(s.r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
