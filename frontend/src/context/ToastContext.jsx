import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    const toast = { id, title, message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toasts,
    showToast,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div id="toast-stack" className="toast-stack" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`} role="alert">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}