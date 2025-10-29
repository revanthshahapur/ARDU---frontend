// ✅ src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

import { AuthProvider } from './features/Auth/AuthContext';  // Import directly from AuthContext

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap your App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
