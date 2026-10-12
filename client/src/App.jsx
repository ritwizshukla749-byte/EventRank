import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CompareProvider>
            <AppRoutes />
          </CompareProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
