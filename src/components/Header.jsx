import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { fN } from '../lib/calc.js';

export default function Header() {
  const { P, result, marketMeta } = useCalc();

  const sourceLabel = marketMeta.updated
    ? `оновлено ${marketMeta.updated}`
    : 'дефолтні дані';

  return (
    <div className="hdr">
      <div className="hdr-inner">
        <div className="hdr-left">
          <h1>КГУ 1 МВт · Бізнес-центр</h1>
          <p>
            {fN(result.h)} год/рік · газ {fN(P.gp)} грн/тис.м³
            {marketMeta.region && (
              <span className="hdr-region"> · {marketMeta.region}</span>
            )}
          </p>
        </div>
        <div className="live">
          <div className="live-dot"></div>
          <span className="live-label">{sourceLabel}</span>
        </div>
      </div>
    </div>
  );
}
