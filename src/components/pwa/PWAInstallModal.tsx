import React from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        if (showToast) showToast('✓ Programu ya SEIJO58 BET imewekwa kwenye kifaa chako!');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0f172a] via-[#0a101d] to-[#06080e] border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-5 sm:p-7 space-y-5 shadow-2xl shadow-amber-950/80 relative my-auto text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER & APP ICON */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-amber-500 p-0.5 shadow-xl shadow-red-950/80 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <span className="font-teko text-3xl font-black text-red-500 tracking-tighter">58</span>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
              <Download className="w-3 h-3" /> OFFICIAL APP DOWNLOAD
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              SEIJO<span className="text-red-500">58</span> <span className="text-amber-400">BET APP</span>
            </h3>
            <p className="text-[11px] text-slate-400">Pakua na usakinishe kwenye simu yako kama Apps nyingine</p>
          </div>
        </div>

        {/* ALREADY INSTALLED STATUS */}
        {isInstalled ? (
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-white">APP TAYARI IMEWEKWA KWENYE KIFAA HIKI!</h4>
            <p className="text-xs text-slate-300">
              Tayari unatumia toleo rasmi lililosakinishwa la SEIJO58 BET. Unaweza kuipata moja kwa moja kwenye skrini ya simu yako.
            </p>
          </div>
        ) : (
          <>
            {/* APP ADVANTAGES */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="text-amber-400 flex items-center gap-1.5 font-bold text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> Ufunguzi wa Haraka
                </div>
                <p className="text-[10px] text-slate-400">Haufungui kivinjari (browser), inafunguka papo hapo kwa 1-click.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="text-emerald-400 flex items-center gap-1.5 font-bold text-[11px]">
                  <Smartphone className="w-3.5 h-3.5" /> Full-Screen Native
                </div>
                <p className="text-[10px] text-slate-400">Muonekano mpana kama Play Store au App Store app bila usumbufu.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="text-sky-400 flex items-center gap-1.5 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Salama
                </div>
                <p className="text-[10px] text-slate-400">Ulinzi wa data 256-bit na miamala ya moja kwa moja ya M-Pesa na Tigo.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="text-amber-300 flex items-center gap-1.5 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> Bonasi za Kipekee
                </div>
                <p className="text-[10px] text-slate-400">Pata arifa za kwanza za kodi za bonasi na matukio ya odds za juu.</p>
              </div>
            </div>

            {/* ACTION SECTION ACCORDING TO DEVICE TYPE */}
            {isInstallable ? (
              /* NATIVE CHROMIUM / ANDROID 1-CLICK PROMPT */
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>PAKUA NA SAKINISHA SASA (INSTALL APP)</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Inashirikiana na vifaa vyote vya Android, Kompyuta (Chrome, Edge) na vidonge.
                </p>
              </div>
            ) : isIOS ? (
              /* IOS SAFARI GUIDED INSTRUCTIONS */
              <div className="space-y-3 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>JINSI YA KUPAKUA KWENYE IPHONE / IPAD (SAFARI):</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 pl-1 list-decimal list-inside">
                  <li>
                    Bofya kitufe cha <strong className="text-white">Share</strong>{' '}
                    <span className="inline-flex items-center text-amber-300 font-mono text-[11px]">
                      <Share2 className="w-3.5 h-3.5 inline mx-1" />
                    </span>{' '}
                    kwenye upau wa chini wa Safari.
                  </li>
                  <li>
                    Shuka chini kidogo kisha bofya{' '}
                    <strong className="text-amber-400 font-black">"Add to Home Screen"</strong>{' '}
                    <span className="inline-flex items-center text-white">
                      <PlusSquare className="w-3.5 h-3.5 inline mx-1" />
                    </span>
                    (Weka kwenye Skrini ya Nyumbani).
                  </li>
                  <li>
                    Bofya <strong className="text-emerald-400">"Add"</strong> juu kulia. App itatokea moja kwa moja kwenye skrini ya simu yako!
                  </li>
                </ol>
              </div>
            ) : (
              /* GENERIC MANUAL INSTALL INSTRUCTIONS FOR BROWSERS WHERE PROMPT HASN'T AUTO-TRIGGERED */
              <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>SAKINISHA KWA NJIA YA KIVINJARI (BROWSER):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bofya menyu ya dots 3 <strong className="text-white font-mono">(⋮)</strong> juu kulia kwenye kivinjari chako (Chrome, Opera, au Edge), kisha chagua{' '}
                  <strong className="text-amber-400">"Install app"</strong> au{' '}
                  <strong className="text-emerald-400">"Add to Home Screen / Weka kwenye Skrini ya Kwanza"</strong>.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Nimeelewa, Endelea na Mchezo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <div className="text-center pt-1 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
          >
            Funga dirisha hili
          </button>
        </div>
      </div>
    </div>
  );
};
