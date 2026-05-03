import React from 'react';
import { CogenProvider } from './context/CogenContext.jsx';
import CogenApp from './CogenApp.jsx';

export default function CogenCalculator({ calcMode, onModeChange }) {
  return (
    <CogenProvider>
      <CogenApp calcMode={calcMode} onModeChange={onModeChange} />
    </CogenProvider>
  );
}
