import React from 'react';
import { X, Terminal, Globe, Send, MessageCircle, Check, Smartphone, BookOpen } from 'lucide-react';
import { CHANNEL_CONFIG } from '../data/mockMatches';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                SEIJO58 BET — Deployment & Channel Admin Guide
              </h3>
              <p className="text-xs text-slate-400">Quick setup for hosting and managing your prediction portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Quick Config Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
              Channel Integration Settings
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>• Mobile Money Number: <strong className="text-white">{CHANNEL_CONFIG.momoNumber}</strong></div>
              <div>• Telegram Link: <strong className="text-sky-400">{CHANNEL_CONFIG.telegramLink}</strong></div>
              <div>• WhatsApp VIP Support: <strong className="text-emerald-400">{CHANNEL_CONFIG.supportPhone}</strong></div>
              <div>• Win Rate Badge: <strong className="text-white">{CHANNEL_CONFIG.vipTipsWinRate}</strong></div>
            </div>
          </div>

          {/* Deployment Instructions */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              1. Deployment Options (Free & Fast)
            </h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
              <p className="text-slate-400">// Build production static files</p>
              <p className="text-emerald-400 font-bold">npm run build</p>
              <p className="text-slate-400">// Deploy to Vercel, Netlify, Cloud Run, or GitHub Pages</p>
              <p className="text-sky-300">vercel --prod</p>
            </div>
          </div>

          {/* Daily Match Management */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-sky-400" />
              2. How to Update Daily Tips
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Open <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">src/data/mockMatches.ts</code> to edit upcoming matches, odds, predictions, or past won slips. The UI auto-recalculates probabilities and multipliers dynamically.
            </p>
          </div>

          {/* Verification & Monetization */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              3. VIP Subscriptions & Mobile Money (0764220155)
            </h4>
            <p className="text-slate-300 leading-relaxed">
              When users send funds to <strong>0764220155</strong> and input their transaction reference number in the verification form, access is activated and safely stored locally. You also receive inquiries directly on your WhatsApp VIP desk.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition-colors"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
