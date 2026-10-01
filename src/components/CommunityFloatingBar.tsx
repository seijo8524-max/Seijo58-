import React from 'react';
import { Send, MessageCircle, Ticket, Crown, Phone } from 'lucide-react';
import { CHANNEL_CONFIG } from '../data/mockMatches';
import { VIPSubscription } from '../types';

interface CommunityFloatingBarProps {
  betSlipCount: number;
  onOpenBetSlip: () => void;
  vipSub: VIPSubscription;
  onOpenPayment: () => void;
}

export const CommunityFloatingBar: React.FC<CommunityFloatingBarProps> = ({
  betSlipCount,
  onOpenBetSlip,
  vipSub,
  onOpenPayment,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-3 z-30 sm:hidden">
      <div className="bg-[#090d16]/95 backdrop-blur-lg border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-2">
        {/* Telegram Join Channel */}
        <a
          href={CHANNEL_CONFIG.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-950/40 transition-transform active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Telegram</span>
        </a>

        {/* WhatsApp Channel / VIP */}
        <a
          href={CHANNEL_CONFIG.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* Bet Slip trigger button */}
        <button
          onClick={onOpenBetSlip}
          className="relative bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700 transition-transform active:scale-95"
        >
          <Ticket className="w-4 h-4 text-emerald-400" />
          <span>Slip</span>
          {betSlipCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-bounce">
              {betSlipCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
