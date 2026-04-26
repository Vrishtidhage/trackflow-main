import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // ✅ Tailwind import (KEEP THIS)

import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);