import React from 'react';
import { SolarProvider } from './context/SolarContext.jsx';
import SolarApp from './SolarApp.jsx';

export default function SolarCalculator({ calcMode, onModeChange }) {
  return (
    <SolarProvider>
      <SolarApp calcMode={calcMode} onModeChange={onModeChange} />
    </SolarProvider>
  );
}
