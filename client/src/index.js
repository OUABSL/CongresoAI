// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import i18n (needs to be bundled ;)) 
import './utils/i18n';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <React.Suspense fallback="loading...">
      <App />
    </React.Suspense>
  </React.StrictMode>
);

reportWebVitals();
