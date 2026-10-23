import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=141724&color=00e5ff&margin=2`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/15 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Install Rhyte on Android</h2>
              <p className="text-xs text-white/50">
                Native app experience, offline vocal writing, and zero address bar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Check size={20} />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-300 block">
                  Rhyte is Installed!
                </span>
                <span className="text-xs text-white/60">
                  You are running Rhyte as a standalone app with full offline capabilities.
                </span>
              </div>
            </div>
          ) : isInstallable ? (
            /* Direct 1-Click Install Button when browser triggers beforeinstallprompt */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles size={14} /> 1-Tap Direct Install Ready
              </div>
              <h3 className="text-base font-bold">Add to Your Phone's Home Screen</h3>
              <p className="text-xs text-white/60 max-w-md mx-auto">
                Tap below to install the official Rhyte app directly into your Android app drawer.
              </p>
              <button
                onClick={handleInstallClick}
                disabled={installSuccess}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
              >
                {installSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Installing Rhyte...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Install Rhyte App Now</span>
                  </>
                )}
              </button>
            </div>
          ) : null}

          {/* Android Chrome Step-by-Step Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
              <Zap size={14} className="text-amber-400" />
              <span>Android Chrome Step-by-Step</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-white block">Open in Chrome</span>
                <p className="text-[11px] text-white/50">
                  Open this link in Google Chrome or Samsung Internet on your Android phone.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-white block">Tap Menu (⋮)</span>
                <p className="text-[11px] text-white/50">
                  Tap the three vertical dots menu icon in the top right corner of Chrome.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-white block">Tap "Install App"</span>
                <p className="text-[11px] text-white/50">
                  Select <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
                </p>
              </div>
            </div>
          </div>

          {/* QR Code & Share Link Section */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code */}
            <div className="p-2 rounded-xl bg-[#141724] border border-cyan-500/30 shrink-0">
              <img
                src={qrCodeUrl}
                alt="Scan to open on Android"
                className="w-28 h-28 rounded-lg"
                loading="lazy"
              />
            </div>

            {/* Explanatory Text and Link Copy */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-xs uppercase tracking-wide text-cyan-400">
                On Desktop? Scan with Android Phone
              </h4>
              <p className="text-xs text-white/60">
                Point your phone camera at this QR code to open Rhyte instantly in Chrome, then tap
                <strong> "Install app"</strong>.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy App Link</span>
                    </>
                  )}
                </button>

                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1 transition"
                >
                  <span>Open URL</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Benefits of Android PWA */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <Wifi size={16} className="text-cyan-400 shrink-0" />
              <span className="text-white/80">Works offline anywhere</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span className="text-white/80">Fast local storage autosave</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
