import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'compact' | 'banner' | 'pill';
  className?: string;
  showToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
  showToast
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        if (showToast) showToast('✓ Programu ya SEIJO58 BET imewekwa kwenye kifaa chako!');
        return;
      }
    }
    // If not installable via prompt (e.g. iOS Safari or browser needing manual action), open instructions modal
    setIsModalOpen(true);
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Pakua SEIJO58 BET App kwenye Simu Yako"
          className={`flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs shadow-md shadow-red-950/70 active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">Pakua App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleClick}
          title="Pakua App"
          className={`p-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 hover:bg-slate-800 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>PAKUA APP KWENYE SIMU</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pakua App</span>
        </button>
      )}

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showToast={showToast}
      />
    </>
  );
};
