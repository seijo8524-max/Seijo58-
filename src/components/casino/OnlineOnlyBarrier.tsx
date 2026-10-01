import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldAlert, RefreshCw, Radio } from 'lucide-react';

export const OnlineOnlyBarrier: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const checkConnection = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await fetch('/', { method: 'HEAD', cache: 'no-store' });
        setIsOnline(true);
        return;
      } catch {
        setIsOnline(false);
        return;
      }
    }
    setIsOnline(true);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      checkConnection();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      checkConnection();
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline) return null;

  const handleRetry = () => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#090d16]/98 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-gradient-to-b from-[#1e1111] via-[#130b0b] to-[#0a0505] border-2 border-red-600 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-red-950">
        
        {/* Pulsing Offline Warning Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping"></div>
          <div className="relative w-full h-full rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500">
            <WifiOff className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-600/40 text-red-400 text-xs font-black tracking-wider uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> MFUMO WA MTANDAONI TU (ONLINE ONLY)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            UKO NJE YA MTANDAO (OFFLINE)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            SEIJO58 BET inafanya kazi <strong>MTANDAONI PEKEE (Exclusively Online)</strong>. Michezo yote ya kasino, usahihi wa matokeo na miamala ya wallet vimezuiwa kwa usalama hadi utakapounganisha intaneti.
          </p>
        </div>

        <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-2xl text-[11px] text-red-200/90 text-left space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>KWANINI MTANDAO WA MOJA KWA MOJA NI WA LAZIMA?</span>
          </div>
          <p>
            Kulingana na kanuni za Betway na OneWin, kuzuia offline inahakikisha data zote za hisabati za kasino na pochi ya mteja zinalindwa bila hatari ya udanganyifu.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-950 active:scale-98 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>JARIBU KUUNGANISHA TENA</span>
        </button>
      </div>
    </div>
  );
};
