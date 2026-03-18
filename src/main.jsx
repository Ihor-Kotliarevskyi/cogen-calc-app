import React from 'react';
import ReactDOM from 'react-dom/client';
import { CalcProvider } from './context/CalcContext.jsx';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <CalcProvider>
    <App />
  </CalcProvider>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
