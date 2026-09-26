import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

/**
 * Universal, error-free clipboard copy helper that works on Desktop, Mobile
 * (iOS Safari, Android Chrome), and inside sandboxed iframes without throwing
 * unhandled NotAllowedError rejections.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern Async Clipboard API first
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback (common inside iframes or older mobile WebViews)
    }
  }

  // 2. Fallback to hidden textarea + document.execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.style.zIndex = '-1';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const succeeded = document.execCommand('copy');
      document.body.removeChild(textarea);
      return succeeded;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Resolves the live, working URL of the application.
 * Preserves the active `window.location.origin` (e.g., `ais-dev-...run.app` or deployed Cloud Run domain)
 * so links, QR codes, and new-tab launches never point to an unpublished `ais-pre-` 404 endpoint.
 */
export function resolvePublicShareUrl(customPublicUrl?: string, shareCode?: string): string {
  let baseOriginAndPath = '';

  if (
    customPublicUrl &&
    customPublicUrl.trim() &&
    !customPublicUrl.includes('ais-pre-')
  ) {
    baseOriginAndPath = customPublicUrl
      .trim()
      .replace(/#.*$/, '')
      .replace(/\?.*$/, '')
      .replace(/\/+$/, '');
  } else if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
    baseOriginAndPath = `${origin}${basePath}`;
  }

  if (!baseOriginAndPath) {
    return shareCode ? `?share=${encodeURIComponent(shareCode)}` : '/';
  }

  if (shareCode) {
    return `${baseOriginAndPath}/?share=${encodeURIComponent(shareCode)}`;
  }
  return `${baseOriginAndPath}/`;
}

/**
 * Triggers the native OS share sheet (Android, iOS, macOS, Windows) synchronously within
 * the user gesture, and seamlessly falls back to copying to the clipboard if Web Share API
 * is blocked (e.g., inside an iframe) or unsupported.
 */
export async function triggerNativeOrFallbackShare(payload: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'aborted'> {
  const fullCopyText = `${payload.text}\n\n${payload.url}`;

  const isInCrossOriginIframe = (() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  // Attempt native Web Share API first (before any async clipboard call so transient user activation is preserved)
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    !isInCrossOriginIframe
  ) {
    try {
      const shareData: ShareData = {
        title: payload.title,
        text: payload.text,
        url: payload.url,
      };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return 'shared';
      }
    } catch (err: any) {
      if (err && err.name === 'AbortError') {
        // Also copy to clipboard quietly so the user still has the link ready
        await safeCopyToClipboard(fullCopyText);
        return 'aborted';
      }
      // For NotAllowedError, DataError, TypeError, etc., fall through to clipboard copy
    }
  }

  await safeCopyToClipboard(fullCopyText);
  return 'copied';
}

/**
 * React Hook for PWA Installation across Chromium (Android/Desktop), iOS/iPadOS Safari,
 * and embedded iframe environments.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' && window.__deferredPwaPrompt ? window.__deferredPwaPrompt : null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect standalone mode (already installed on mobile home screen or desktop app window)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };
    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => checkStandalone();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    // 2. Detect iOS / iPadOS & Android devices
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Detect if currently running inside an iframe (such as AI Studio preview)
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // 4. Check if global stashed prompt already exists
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    // 5. Listen for beforeinstallprompt & appinstalled
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__deferredPwaPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Verify Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (reg) {
            setSwReady(true);
          } else {
            navigator.serviceWorker
              .register('/sw.js', { scope: '/' })
              .then(() => setSwReady(true))
              .catch(() => setSwReady(false));
          }
        })
        .catch(() => setSwReady(false));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);
    if (!promptToUse) return 'unavailable';
    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        window.__deferredPwaPrompt = null;
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch {
      return 'unavailable';
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    swReady,
    install,
  };
}

/**
 * React Hook for monitoring online/offline connectivity status.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Generates a self-contained portable Desktop/Mobile HTML App Launcher file
 * that students can save to their Desktop or Mobile Files to launch the app anytime.
 */
export function downloadPortableAppLauncherHtml(appUrl: string, projectTitle?: string) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YADAV MD/MS Thesis Studio — Portable App Launcher</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #1e1b4b 100%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: rgba(255, 255, 255, 0.97);
      color: #0f172a;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
      border: 3px solid #f59e0b;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: #065f46;
      color: #fef3c7;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 999px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 22px;
      margin: 14px 0 6px;
      color: #1e1b4b;
    }
    p {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 18px;
      padding: 14px 20px;
      background: #059669;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
    }
    .btn:hover { background: #047857; }
    .meta {
      margin-top: 16px;
      padding: 12px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 10px;
      font-size: 12px;
      color: #065f46;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">YADAV MD/MS Thesis Studio • Desktop &amp; Mobile Launcher</span>
    <h1>AI Assisted Open-Access MD/MS Thesis Co-Pilot</h1>
    <p>Active Study: <strong>${(projectTitle || 'MD/MS Clinical Dissertation').replace(/</g, '&lt;')}</strong></p>
    <a class="btn" href="${appUrl}">🚀 Launch YADAV MD/MS Thesis Studio</a>
    <div class="meta">
      <strong>Direct App URL:</strong><br/>
      ${appUrl}
    </div>
    <p style="margin-top: 14px; font-size: 11px; color: #64748b;">
      Tip: Open this link in Google Chrome, Microsoft Edge, or iOS Safari and tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong> for full standalone app mode.
    </p>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'YADAV_MD_MS_Thesis_Studio_Launcher.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
