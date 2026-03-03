import React, { useState, useCallback } from 'react';
import './Toast.css';

const toastContext = React.createContext();

export function useToast() {
  const context = React.useContext(toastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <toastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            onClick={() => removeToast(t.id)}
          >
            <div className="toast-content">
              <span className="toast-icon">
                {t.type === 'success' && '✓'}
                {t.type === 'error' && '✕'}
                {t.type === 'info' && 'ⓘ'}
                {t.type === 'warning' && '⚠'}
              </span>
              <span className="toast-message">{t.message}</span>
            </div>
            <button 
              className="toast-close" 
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </toastContext.Provider>
  );
}

export default useToast;
