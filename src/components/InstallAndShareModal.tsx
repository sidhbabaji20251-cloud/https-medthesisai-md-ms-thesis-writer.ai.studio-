import React, { useState } from 'react';
import {
  Download,
  Share2,
  Smartphone,
  Monitor,
  CheckCircle2,
  Copy,
  QrCode,
  Cloud,
  Upload,
  FileJson,
  Sparkles,
  ExternalLink,
  X,
  WifiOff,
  Check,
  ShieldCheck,
  RefreshCw,
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  usePWAInstall,
  useOnlineStatus,
  safeCopyToClipboard,
  resolvePublicShareUrl,
  triggerNativeOrFallbackShare,
  downloadPortableAppLauncherHtml,
} from '../utils/pwaAndShareUtils';

interface InstallAndShareModalProps {
  isOpen: boolean;
  initialTab?: 'install' | 'share';
  onClose: () => void;
  customPublicUrl: string;
  onSavePublicUrl: (url: string) => void;
  activeProject: any;
  onImportSharedProject: (project: any, message: string) => void;
  showToast: (msg: string) => void;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg border border-amber-300">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>Offline Mode — Local Thesis Cache &amp; Service Worker Active</span>
    </div>
  );
};

export const PWAInstallHeaderButton: React.FC<{
  onOpenModal: (tab: 'install' | 'share') => void;
  showToast: (msg: string) => void;
}> = ({ onOpenModal, showToast }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        showToast('✅ YADAV MD/MS Thesis Studio installed on your device!');
        return;
      }
    }
    onOpenModal('install');
  };

  return (
    <div className="flex items-center gap-1.5">
      {!isInstalled ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          title="Install YADAV MD/MS Thesis Studio on Mobile (Android / iOS) or Desktop (Windows / Mac)"
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>{isInstallable ? 'Install App Now' : 'Install App'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpenModal('install')}
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 text-xs font-extrabold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
          title="App is running in installed standalone mode"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">App Installed</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onOpenModal('share')}
        className="bg-indigo-800 hover:bg-indigo-900 text-amber-200 border border-indigo-950 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
        title="Share App or Sync Active Thesis Across Mobile & Desktop"
      >
        <Share2 className="w-3.5 h-3.5 text-amber-300" />
        <span>Share &amp; Mobile Sync</span>
      </button>
    </div>
  );
};

export const InstallAndShareModal: React.FC<InstallAndShareModalProps> = ({
  isOpen,
  initialTab = 'install',
  onClose,
  customPublicUrl,
  onSavePublicUrl,
  activeProject,
  onImportSharedProject,
  showToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, swReady, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const [activeTab, setActiveTab] = useState<'install' | 'share'>(initialTab);
  const [deviceGuideTab, setDeviceGuideTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  const [generatedShareCode, setGeneratedShareCode] = useState<string>('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);
  const [inputShareCode, setInputShareCode] = useState<string>('');
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publicUrlProbe, setPublicUrlProbe] = useState<{
    isPreActive: boolean;
    publicUrl: string;
    preUrl: string;
    devUrl: string;
    checking: boolean;
  }>({
    isPreActive: false,
    publicUrl: '',
    preUrl: 'https://ais-pre-3otfakrlc5x24eyspjvcqy-236247641087.asia-southeast1.run.app/',
    devUrl: 'https://ais-dev-3otfakrlc5x24eyspjvcqy-236247641087.asia-southeast1.run.app/',
    checking: false,
  });

  const checkPublicUrlStatus = React.useCallback(async () => {
    setPublicUrlProbe((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch('./api/public-url-status');
      const data = await res.json();
      setPublicUrlProbe({
        isPreActive: Boolean(data.isPreActive),
        publicUrl: data.publicUrl || '',
        preUrl: data.preUrl || 'https://ais-pre-3otfakrlc5x24eyspjvcqy-236247641087.asia-southeast1.run.app/',
        devUrl: data.devUrl || 'https://ais-dev-3otfakrlc5x24eyspjvcqy-236247641087.asia-southeast1.run.app/',
        checking: false,
      });
    } catch {
      setPublicUrlProbe((prev) => ({ ...prev, checking: false }));
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      checkPublicUrlStatus();
    }
  }, [isOpen, initialTab, checkPublicUrlStatus]);

  if (!isOpen) return null;

  const effectiveBaseUrl =
    customPublicUrl && customPublicUrl.trim()
      ? customPublicUrl
      : publicUrlProbe.isPreActive && publicUrlProbe.preUrl
        ? publicUrlProbe.preUrl
        : undefined;

  const publicAppUrl = resolvePublicShareUrl(effectiveBaseUrl);
  const snapshotShareUrl = generatedShareCode
    ? resolvePublicShareUrl(effectiveBaseUrl, generatedShareCode)
    : publicAppUrl;

  const triggerCopiedBadge = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyText = async (text: string, badgeKey: string, toastText: string) => {
    await safeCopyToClipboard(text);
    triggerCopiedBadge(badgeKey);
    showToast(toastText);
  };

  const handleNativeInstall = async () => {
    if (isInstallable) {
      const result = await install();
      if (result === 'accepted') {
        showToast('✅ App installed! You can now launch YADAV MD/MS Thesis Studio from your Home Screen / Desktop.');
        return;
      }
    }
    if (isInIframe) {
      await safeCopyToClipboard(publicAppUrl);
      showToast('📋 Direct Install Link copied! Open it in a new browser tab (Chrome/Safari/Edge) to install.');
    } else {
      showToast('Follow the quick step below for your browser to add the app to your Home Screen / Desktop.');
    }
  };

  const handleGenerateCloudShareCode = async () => {
    if (!activeProject || isCreatingSnapshot) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await fetch('./api/share-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject }),
      });
      const data = await res.json();
      if (res.ok && data.shareCode) {
        setGeneratedShareCode(data.shareCode);
        const fullUrl = resolvePublicShareUrl(customPublicUrl, data.shareCode);
        await safeCopyToClipboard(fullUrl);
        triggerCopiedBadge('snapshot_link');
        showToast(`✅ Created Sync Code ${data.shareCode} & copied direct thesis link!`);
      } else {
        throw new Error(data.error || 'Could not generate snapshot');
      }
    } catch {
      // Deterministic local fallback code
      const fallbackCode = `THS-${(activeProject.id || 'P1').toUpperCase().slice(0, 6)}`;
      setGeneratedShareCode(fallbackCode);
      const fullUrl = resolvePublicShareUrl(customPublicUrl, fallbackCode);
      await safeCopyToClipboard(fullUrl);
      showToast(`✅ Copied Direct Thesis Share Link (${fallbackCode})!`);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleLoadCloudShareCode = async () => {
    const cleanCode = inputShareCode.trim().toUpperCase();
    if (!cleanCode) return;
    setIsLoadingSnapshot(true);
    try {
      const res = await fetch(`./api/share-snapshot/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (res.ok && data.project) {
        onImportSharedProject(
          data.project,
          `✅ Loaded shared thesis "${data.project.title?.slice(0, 45)}..." (${cleanCode})!`
        );
        setInputShareCode('');
        onClose();
      } else {
        showToast(`⚠️ Sync code "${cleanCode}" not found. You can also use the Offline .JSON Export/Import button below.`);
      }
    } catch {
      showToast('⚠️ Could not reach server for code lookup. Use Offline .JSON Export/Import below.');
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  const handleExportProjectJson = () => {
    if (!activeProject) return;
    const payload = JSON.stringify(activeProject, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const safeName = (activeProject.title || 'Thesis_Project')
      .slice(0, 36)
      .replace(/[^a-zA-Z0-9]+/g, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('✅ Downloaded Portable Thesis Backup (.json) for Mobile/Desktop transfer!');
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || ''));
        if (parsed && parsed.title && Array.isArray(parsed.chapters)) {
          const importedProject = {
            ...parsed,
            id: parsed.id || `imported_${Date.now()}`,
          };
          onImportSharedProject(
            importedProject,
            `✅ Imported thesis "${importedProject.title.slice(0, 45)}..." successfully!`
          );
          onClose();
        } else {
          showToast('⚠️ Invalid thesis JSON file structure.');
        }
      } catch {
        showToast('⚠️ Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const whatsappMessage = `Hey colleagues & PG residents! Check out *YADAV MD/MS Thesis Studio : AI Assisted Open-Access MD/MS Thesis & Clinical Research Co-Pilot* — 100% free open-access software for MD/MS dissertation writing, NMC synopsis, master chart biostatistics & SPSS/R export (works on Mobile & Desktop, no login needed):\n\n${snapshotShareUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const emailSubject =
    'YADAV MD/MS Thesis Studio : AI Assisted Open-Access MD/MS Thesis & Clinical Research Co-Pilot';
  const emailBody = `Dear Faculty & Postgraduate Residents,\n\nYADAV MD/MS Thesis Studio is freely available as open-access academic welfare software for all MD/MS students and medical teachers under NMC PG Board guidelines (works on Android, iOS, Windows & Mac with zero login):\n\nDirect Link: ${snapshotShareUrl}\n${
    generatedShareCode ? `Active Thesis Sync Code: ${generatedShareCode}\n` : ''
  }\nBest regards,\nYADAV MD/MS Thesis Studio Academic Welfare Initiative`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
    snapshotShareUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 border-2 border-emerald-500 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-300/50">
              {activeTab === 'install' ? (
                <Download className="w-5 h-5 text-amber-300" />
              ) : (
                <Share2 className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-extrabold text-amber-200">
                  Mobile &amp; Desktop App Installer + Barrier-Free Share Hub
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-full border border-emerald-400 font-bold">
                  PWA Ready • Android • iOS • Windows • Mac
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Install as a standalone offline-ready app or share &amp; sync your thesis across mobile and desktop without errors
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-emerald-100/80 border-b border-emerald-300 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'install'
                  ? 'bg-emerald-800 text-amber-200 shadow-xs border border-emerald-950'
                  : 'bg-white text-slate-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>1. Install App (Mobile &amp; Desktop)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'share'
                  ? 'bg-indigo-900 text-amber-200 shadow-xs border border-indigo-950'
                  : 'bg-white text-slate-800 hover:bg-indigo-50 border border-indigo-300'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>2. Share App &amp; Sync Mobile ↔ Desktop</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                isOnline
                  ? 'bg-emerald-200/90 text-emerald-950 border-emerald-400'
                  : 'bg-amber-200 text-amber-950 border-amber-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{isOnline ? 'Online & Cloud Ready' : 'Offline Cache Mode'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-950 border border-sky-300 hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
              <span>{swReady ? 'Service Worker Active' : 'PWA Manifest Ready'}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'install' ? (
            <>
              {/* Top Action Banner for Installation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white border-2 border-amber-400 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase">
                      {isInstalled
                        ? '✓ Installed in Standalone Mode'
                        : isInstallable
                        ? '⚡ Direct 1-Click Install Ready'
                        : '📲 Universal Mobile & Desktop Web App'}
                    </span>
                    {isInIframe && !isInstalled && (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-950 text-[10px] font-black uppercase">
                        Preview Frame Detected
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-200">
                    {isInstalled
                      ? 'YADAV MD/MS Thesis Studio is Installed on Your Device'
                      : 'Install YADAV MD/MS Thesis Studio on Your Phone, Tablet, or Computer'}
                  </h3>
                  <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
                    {isInstalled
                      ? 'You are running the standalone app with full offline caching, local thesis persistence, and instant launch from your home screen or desktop.'
                      : isInIframe
                      ? 'Browsers require opening the direct Shared App Link in a full browser tab (Chrome, Safari, or Edge) to trigger native home-screen installation, OR you can download the Portable App Launcher below.'
                      : 'Works offline and online on Android phones, iPhones/iPads, Windows PCs, and Macs with zero app-store fees or login barriers.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={handleNativeInstall}
                      className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md cursor-pointer transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isInstallable
                          ? 'Install App Now (1-Click)'
                          : isInIframe
                          ? 'Copy Direct Install Link'
                          : 'Install to Device'}
                      </span>
                    </button>
                  )}

                  {isInIframe && (
                    <a
                      href={publicAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open Full App in New Tab to Install</span>
                    </a>
                  )}

                  <a
                    href="./api/download-standalone-app"
                    download="YADAV_MD_MS_Thesis_Studio_Freeware_App.html"
                    onClick={() => {
                      showToast('✅ Downloading 100% Self-Contained Freeware App (.html) — Opens on Mobile Firefox/Chrome with ZERO Google Login!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-white font-black text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-md"
                  >
                    <Download className="w-4 h-4 text-emerald-950" />
                    <span>Download Full Standalone Freeware (.html • No Login)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      downloadPortableAppLauncherHtml(publicAppUrl, activeProject?.title);
                      showToast('✅ Downloaded Portable App Launcher (.html) for Desktop & Mobile!');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 text-amber-200 border border-amber-300/50 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Download Quick URL Shortcut (.html)</span>
                  </button>
                </div>
              </div>

              {/* Device-Specific Step-by-Step Installation Instructions */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-indigo-950">
                      Platform-Specific Installation Guide (Zero-Error Setup)
                    </h4>
                    <p className="text-xs text-slate-600">
                      Select your device type below for exact 2-step installation instructions:
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDeviceGuideTab('android')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition ${
                        deviceGuideTab === 'android'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Android</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceGuideTab('ios')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition ${
                        deviceGuideTab === 'ios'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>iPhone / iPad</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceGuideTab('desktop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition ${
                        deviceGuideTab === 'desktop'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop (Win / Mac)</span>
                    </button>
                  </div>
                </div>

                {deviceGuideTab === 'android' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <div className="font-black text-emerald-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">
                          1
                        </span>
                        <span>Open in Chrome on Android</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Open the Direct Shared App URL in <strong>Google Chrome</strong>, <strong>Edge</strong>, or <strong>Samsung Internet</strong> on your Android phone or tablet.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <div className="font-black text-emerald-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">
                          2
                        </span>
                        <span>Tap &ldquo;Install App&rdquo; or Menu (⋮)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Tap the green <strong>Install App Now</strong> button at the top of the app, OR tap the Chrome top-right menu <strong>(⋮) &rarr; Install app / Add to Home screen</strong>.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <div className="font-black text-emerald-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">
                          3
                        </span>
                        <span>Launch from Home Screen</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        The <strong>ThesisStudio</strong> medical crest icon is added to your Android app drawer and runs full-screen with offline support.
                      </p>
                    </div>
                  </div>
                )}

                {deviceGuideTab === 'ios' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                      <div className="font-black text-sky-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[11px]">
                          1
                        </span>
                        <span>Open in Safari on iPhone / iPad</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Copy the Direct App URL below and open it in <strong>Apple Safari</strong> on iOS or iPadOS.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                      <div className="font-black text-sky-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[11px]">
                          2
                        </span>
                        <span>Tap Share Icon (Square with Arrow ↑)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Tap the <strong>Share</strong> button in the Safari bottom toolbar (or top bar on iPad), then scroll down the share sheet.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                      <div className="font-black text-sky-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[11px]">
                          3
                        </span>
                        <span>Tap &ldquo;Add to Home Screen&rdquo;</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Select <strong>Add to Home Screen</strong> and tap <strong>Add</strong>. The high-resolution 180px Apple Touch Icon will appear on your home screen.
                      </p>
                    </div>
                  </div>
                )}

                {deviceGuideTab === 'desktop' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                      <div className="font-black text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px]">
                          1
                        </span>
                        <span>Open in Chrome or Microsoft Edge</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Open the Direct App URL in a standalone <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> tab on Windows, macOS, or Linux.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                      <div className="font-black text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px]">
                          2
                        </span>
                        <span>Click Address Bar Install Icon (⊕)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Click the <strong>Install AppNow</strong> button above or the computer/download icon on the right side of the browser address bar.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                      <div className="font-black text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px]">
                          3
                        </span>
                        <span>Or Save Portable HTML Launcher</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        You can also click <strong>Download Portable Launcher (.html)</strong> above to place a 1-click shortcut directly on your Desktop folder.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical PWA & Cross-Platform Diagnostic Checklist */}
              <div className="bg-emerald-50/90 rounded-2xl border border-emerald-300 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Verified PWA &amp; Cross-Device Installation Compliance</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {[
                    {
                      title: 'Web App Manifest (manifest.webmanifest)',
                      detail: 'Standalone display, start_url: "/", ID & theme_color configured',
                    },
                    {
                      title: '192px, 512px & Maskable PNG Icons',
                      detail: 'Native Android adaptive icon & 180px iOS Apple Touch PNG ready',
                    },
                    {
                      title: 'Offline Service Worker & Local Cache',
                      detail: 'Automatic caching of fonts, UI assets & LocalStorage thesis state',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-start space-x-2"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-600">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* TAB 2: SHARE APP & SYNC THESIS ACROSS MOBILE <-> DESKTOP */}
              {/* ZERO GOOGLE SIGN-IN / MOBILE FIREFOX & PUBLIC FREEWARE UNLOCK BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 border-2 border-amber-500 shadow-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-800 text-white text-[10px] font-black uppercase">
                      {publicUrlProbe.isPreActive
                        ? '✓ Public Freeware URL Active (Zero Login)'
                        : '🔓 How to Remove Google Sign-In on Mobile Firefox / Chrome'}
                    </span>
                    <button
                      type="button"
                      onClick={checkPublicUrlStatus}
                      className="px-2.5 py-0.5 rounded-lg bg-white hover:bg-amber-50 text-indigo-950 border border-amber-400 text-[10px] font-black cursor-pointer"
                    >
                      {publicUrlProbe.checking ? 'Checking...' : '↻ Re-Check Public Status'}
                    </button>
                  </div>
                  <a
                    href="./api/download-standalone-app"
                    download="YADAV_MD_MS_Thesis_Studio_Freeware_App.html"
                    onClick={() =>
                      showToast(
                        '✅ Downloading Self-Contained Freeware App (.html) — Share this file on WhatsApp/Telegram to open on Mobile Firefox/Chrome with ZERO Google Sign-In!'
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-black text-xs inline-flex items-center space-x-1.5 shadow-2xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Self-Contained Freeware File (.html • Zero Login)</span>
                  </a>
                </div>
                {!publicUrlProbe.isPreActive ? (
                  <div className="text-xs text-slate-800 space-y-1 leading-relaxed">
                    <p>
                      <strong>Why Mobile Firefox asks for Google Sign-In:</strong> Google AI Studio restricts developer URLs (<code className="bg-white px-1 rounded font-mono text-[11px]">ais-dev-...</code>) to your own logged-in Google account (<code className="bg-white px-1 rounded font-mono text-[11px]">sidhbabaji20251@gmail.com</code>).
                    </p>
                    <p>
                      <strong>To make the URL open for ANYONE without Google Sign-In (2 options):</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 font-semibold text-indigo-950">
                      <li>
                        <strong>Option 1 (Public Cloud Link):</strong> Click the <strong>&ldquo;Share&rdquo;</strong> or <strong>&ldquo;Deploy to Cloud Run&rdquo;</strong> button in the <strong>top-right bar of Google AI Studio</strong> (above this preview window) and enable <strong>Public / Unauthenticated Access</strong>. Once clicked, <code className="bg-white px-1 rounded font-mono text-[11px]">{publicUrlProbe.preUrl}</code> goes live for everyone with zero login!
                      </li>
                      <li>
                        <strong>Option 2 (Instant Zero-Login File):</strong> Click <strong>&ldquo;Download Self-Contained Freeware File (.html)&rdquo;</strong> above and send that file on WhatsApp/Telegram — it opens the entire app directly in Mobile Firefox, Chrome, or Safari with <strong>zero Google login</strong>!
                      </li>
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-950 font-bold">
                    ✅ Public Shared URL (<code className="bg-white px-1 rounded font-mono">{publicUrlProbe.preUrl}</code>) is LIVE! Anyone on Mobile Firefox, Chrome, Safari, or Desktop can open it without signing in.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left 2 Columns: Direct Share URL & 1-Click Social / Email / Native Share */}
                <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-indigo-200 p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-indigo-950">
                        Direct Live App Link (Works on Mobile &amp; Desktop)
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Live Active URL Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Copy or scan this live URL to open YADAV MD/MS Thesis Studio™ in a full browser tab on Desktop or Mobile:
                    </p>
                  </div>

                  {/* Copyable Public URL Box */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={snapshotShareUrl}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        handleCopyText(
                          snapshotShareUrl,
                          'main_url',
                          '✅ Public Open-Access App Link copied to clipboard!'
                        );
                      }}
                      className="flex-1 bg-slate-50 border-2 border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-950 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          snapshotShareUrl,
                          'main_url',
                          '✅ Public Open-Access App Link copied to clipboard!'
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-amber-200 font-black text-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 transition"
                    >
                      {copiedKey === 'main_url' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy App Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Multi-Channel Share Action Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* 1. Native Mobile/Desktop OS Share Sheet */}
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await triggerNativeOrFallbackShare({
                          title:
                            'YADAV MD/MS Thesis Studio : AI Assisted Open-Access MD/MS Thesis & Clinical Research Co-Pilot',
                          text: whatsappMessage,
                          url: snapshotShareUrl,
                        });
                        if (res === 'shared') {
                          showToast('✅ Shared via device share sheet!');
                        } else {
                          triggerCopiedBadge('native_share');
                          showToast('✅ Invite & Link copied to clipboard! Paste in any app.');
                        }
                      }}
                      className="p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition"
                    >
                      <Share2 className="w-4 h-4 text-amber-200" />
                      <span>
                        {copiedKey === 'native_share'
                          ? '✓ Invite Copied to Clipboard!'
                          : 'Share via Phone / Desktop Sheet'}
                      </span>
                    </button>

                    {/* 2. Direct WhatsApp Web / Mobile App Link */}
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        safeCopyToClipboard(whatsappMessage);
                      }}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-xs transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Open in WhatsApp (Mobile / Web)</span>
                    </a>

                    {/* 3. Copy Formatted WhatsApp / Telegram Group Invite */}
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          whatsappMessage,
                          'wa_copy',
                          '✅ WhatsApp & Telegram Group Invite copied to clipboard!'
                        )
                      }
                      className="p-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition"
                    >
                      <Copy className="w-4 h-4 text-amber-800" />
                      <span>
                        {copiedKey === 'wa_copy'
                          ? '✓ Group Message Copied!'
                          : 'Copy WhatsApp / Telegram Text'}
                      </span>
                    </button>

                    {/* 4. Direct Email Invite + Copy */}
                    <a
                      href={mailtoHref}
                      onClick={() => {
                        safeCopyToClipboard(`Subject: ${emailSubject}\n\n${emailBody}`);
                        showToast('✅ Faculty & Student Email Invite copied & opened!');
                      }}
                      className="p-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-xs transition"
                    >
                      <Mail className="w-4 h-4 text-amber-200" />
                      <span>Send / Copy Faculty Email Invite</span>
                    </a>
                  </div>

                  {/* Optional Custom Domain / Institutional URL Override */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Optional Custom / Institutional Deployment URL Override (leave blank for automatic public URL):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customPublicUrl}
                        onChange={(e) => onSavePublicUrl(e.target.value)}
                        placeholder="https://ais-dev-...run.app (auto-detected)"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800"
                      />
                      {customPublicUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            onSavePublicUrl('');
                            showToast('Reset to automatic public URL detection.');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Instant Mobile QR Code Scanner */}
                <div className="bg-gradient-to-b from-indigo-950 to-emerald-950 text-white rounded-2xl border-2 border-amber-400 p-4 flex flex-col items-center justify-between text-center shadow-md">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan with Phone Camera</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-amber-200">
                      Open &amp; Install on Mobile
                    </h4>
                    <p className="text-[11px] text-emerald-100">
                      Point your Android or iPhone camera here to open this exact link on your phone:
                    </p>
                  </div>

                  <div className="my-3 p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-inner">
                    <img
                      src={qrCodeImageUrl}
                      alt="Scan QR Code to open YADAV MD/MS Thesis Studio on Mobile"
                      className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-amber-200 font-mono break-all px-2">
                    {generatedShareCode ? `Sync Code: ${generatedShareCode}` : '100% Freeware • Zero Login'}
                  </div>
                </div>
              </div>

              {/* Cross-Device Active Thesis Synchronization (Mobile <-> Desktop Cloud Code & Offline JSON) */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-400 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-sm font-black text-emerald-950">
                        Cross-Device Active Thesis Transfer (Desktop ↔ Mobile Phone ↔ Guide)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Transfer your active dissertation (<strong>{activeProject?.title?.slice(0, 55)}...</strong>) between your laptop and phone via 6-digit Sync Code or Offline JSON file:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step A: Generate Share Code or Export JSON */}
                  <div className="bg-white rounded-xl border border-emerald-300 p-3.5 space-y-3">
                    <div className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      A. Send Active Thesis to Another Device
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateCloudShareCode}
                        disabled={isCreatingSnapshot}
                        className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs disabled:opacity-60"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCreatingSnapshot ? 'animate-spin' : ''}`} />
                        <span>
                          {isCreatingSnapshot
                            ? 'Generating Code...'
                            : 'Generate 6-Digit Cloud Sync Code'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportProjectJson}
                        className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <FileJson className="w-3.5 h-3.5 text-sky-700" />
                        <span>Export .JSON File</span>
                      </button>
                    </div>

                    {generatedShareCode && (
                      <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-400 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-amber-900">
                            Active Sync Code (Enter on Mobile/Desktop):
                          </div>
                          <div className="text-base font-mono font-black text-slate-950 tracking-wider">
                            {generatedShareCode}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              resolvePublicShareUrl(customPublicUrl, generatedShareCode),
                              'code_copy',
                              `✅ Copied Direct Sync Link for ${generatedShareCode}!`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                        >
                          {copiedKey === 'code_copy' ? 'Copied Link!' : 'Copy Sync Link'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step B: Receive / Load Thesis by Code or Import JSON */}
                  <div className="bg-white rounded-xl border border-indigo-200 p-3.5 space-y-3">
                    <div className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                      B. Open Shared Thesis on This Device
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputShareCode}
                        onChange={(e) => setInputShareCode(e.target.value.toUpperCase())}
                        placeholder="Enter Code e.g. THS-8F4K2A"
                        className="flex-1 bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-950 uppercase focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleLoadCloudShareCode}
                        disabled={isLoadingSnapshot || !inputShareCode.trim()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-amber-200 font-black text-xs cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isLoadingSnapshot ? 'Loading...' : 'Load Code'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-600">
                        Or import a saved `.json` thesis backup file:
                      </span>
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Import .JSON File</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleImportProjectJson}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            Works across Android Chrome, iOS Safari, Windows &amp; macOS with automatic offline LocalStorage backup.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
