import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function renderApp() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    document.body.innerHTML = '<div style="padding:2rem;color:red;">Error: #root not found</div>';
    return;
  }

  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('React render error:', err);
    rootEl.innerHTML = `<div style="padding:2rem;color:red;font-family:sans-serif;">Render Error: ${err.message}</div>`;
  }
}

renderApp();
