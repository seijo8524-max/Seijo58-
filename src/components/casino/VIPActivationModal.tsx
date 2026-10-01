import React, { useState } from 'react';
import { X, Crown, CheckCircle2, MessageCircle, Copy, Check } from 'lucide-react';

interface ActivationProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateSuccess: (tierName: string) => void;
  showToast: (msg: string) => void;
}

export function VIPActivationModal({ isOpen, onClose, onActivateSuccess, showToast }: ActivationProps) {
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('+255764220155');
    setCopiedNumber(true);
    showToast('✓ Namba ya Malipo Imenakiliwa!');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
            <Crown className="w-4 h-4" /> SEIJO58 VIP HIGH ROLLER PASS
          </div>
          <h3 className="text-xl font-black text-white">UPGRADE KWENDA VIP BLACK ELITE</h3>
          <p className="text-xs text-slate-300">
            Fungua <strong>20% Daily Cashback</strong>, Meneja binafsi wa WhatsApp, na utoaji wa papo hapo bila kikomo.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="text-slate-400 font-bold">Lipa TSh 25,000 kuwezesha VIP Pass:</div>
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="font-mono font-black text-emerald-400 text-base">+255 764 220 155</span>
            <button
              onClick={handleCopy}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-xs"
            >
              {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'Imenakiliwa' : 'Nakili'}</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400">Jina la Akaunti: <strong className="text-white">SEIJO58</strong></div>
        </div>

        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kurejeshewa 20% ya dau lililopotea kila siku (Cashback)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Meneja Maalum wa WhatsApp (24/7 Priority Support)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kutoa pesa kwa kipaumbele cha juu bila kikomo cha siku</span>
          </li>
        </ul>

        <div className="space-y-2 pt-2">
          <a
            href="https://wa.me/255764220155?text=Habari%20Admin%20SEIJO58%2C%20nahitaji%20kuwezesha%20VIP%20Black%20Elite%20Pass%20kwa%20ajili%20ya%20Casino%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-950/80 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WEZESHA VIP SASA KWA WHATSAPP</span>
          </a>
        </div>
      </div>
    </div>
  );
}
