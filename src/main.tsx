import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Capture PWA beforeinstallprompt and purge any legacy mobile service worker caches
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    (window as any).__deferredPwaPrompt = e;
  });

  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {
          // Ignore registration errors inside restricted sandbox iframes
        });
    });
  }
}

class MobileSafeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMsg: error instanceof Error ? error.message : String(error),
    };
  }

  handleResetAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50 p-6 text-slate-900">
          <div className="max-w-md w-full bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-xl text-center space-y-4">
            <h1 className="text-lg font-extrabold text-indigo-950 font-serif">
              YADAV MD/MS Thesis Studio™
            </h1>
            <p className="text-xs font-serif italic font-bold text-rose-900">
              Courtesy : Prof R S Yadav Biochemistry NIMS Jaipur
            </p>
            <p className="text-xs text-slate-600">
              Refreshing mobile workspace cache for clean startup...
            </p>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs cursor-pointer shadow-md"
            >
              Tap to Refresh &amp; Launch App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileSafeErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </MobileSafeErrorBoundary>
  </StrictMode>,
);
