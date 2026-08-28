import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { AppLayout } from './components/Layout/AppLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Modals } from './components/Modals/Modals';
import { useEffect } from 'react';

function AppContent() {
  const { token, data, loading, logout } = useAuth();
  const { showToast, dismissToast, toasts } = useToast();

  useEffect(() => {
    // Suppress Razorpay errors
    window.suppressRazorpayErrors = true;
    const originalError = console.error;
    console.error = function(...args) {
      const msg = String(args[0] || '');
      if (msg.includes('Refused to get unsafe header') ||
          msg.includes('Permissions policy') ||
          msg.includes('localhost:7070') ||
          msg.includes('sardine')) {
        return;
      }
      return originalError.apply(console, args);
    };

    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = String(args[0] || '');
      if (url.includes('localhost:7070') || url.includes('localhost:37857') ||
          url.includes('sardine.ai') || url.includes('fingerprint')) {
        return Promise.reject(new Error('Blocked'));
      }
      return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (String(url).includes('localhost:7070') || String(url).includes('sardine')) {
        this.abort();
        return;
      }
      return originalOpen.apply(this, arguments);
    };

    return () => {
      console.error = originalError;
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
    };
  }, []);

  if (!token) {
    return <AuthScreen />;
  }

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading Command Center...</div>
          <div style={{ color: 'var(--text-muted)' }}>Connecting to MySQL and loading your dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout>
        <Dashboard />
      </AppLayout>
      <Modals />
      <div id="toast-stack" className="toast-stack" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`} role="alert">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;