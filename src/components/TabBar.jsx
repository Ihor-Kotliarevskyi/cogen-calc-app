import React from 'react';

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <div
          key={t.key}
          className={`tab${active === t.key ? ' active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
