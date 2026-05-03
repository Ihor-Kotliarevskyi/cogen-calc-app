import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';

export default function SolarScenariosScreen() {
  const { dispatch } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 14 }}>Сценарії СЕС</div>
        <div className="sc-cards-grid">
          <button className="card" onClick={() => {
            dispatch({ type: 'SET_PARAM', key: 'gridPrice', value: 8.5 });
            dispatch({ type: 'SET_PARAM', key: 'feedInTariff', value: 4.8 });
          }}>
            <div className="sc-title">Оптимістичний</div>
            <div className="sc-row">Вищі ціни та тариф продажу</div>
          </button>
          <button className="card" onClick={() => {
            dispatch({ type: 'SET_PARAM', key: 'selfUseShare', value: 0.8 });
            dispatch({ type: 'SET_PARAM', key: 'degradation', value: 0.6 });
          }}>
            <div className="sc-title">Self-use фокус</div>
            <div className="sc-row">Більше власного споживання</div>
          </button>
          <button className="card" onClick={() => {
            dispatch({ type: 'SET_PARAM', key: 'feedInTariff', value: 2.5 });
            dispatch({ type: 'SET_PARAM', key: 'gridPrice', value: 6.2 });
          }}>
            <div className="sc-title">Консервативний</div>
            <div className="sc-row">Низькі ринкові ціни</div>
          </button>
        </div>
      </div>
    </div>
  );
}
