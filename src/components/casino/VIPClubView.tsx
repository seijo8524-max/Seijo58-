import React from 'react';
import { VIP_TIERS } from '../../data/casinoGames';
import { Crown, Sparkles, MessageCircle, CheckCircle2, Award, ShieldCheck, Zap } from 'lucide-react';

interface VIPClubProps {
  userExp: number;
  onOpenDeposit?: () => void;
  showToast: (msg: string) => void;
}

export function VIPClubView({ userExp, onOpenDeposit, showToast }: VIPClubProps) {
  // Determine current VIP tier based on userExp
  const currentTier = [...VIP_TIERS].reverse().find(t => userExp >= t.minExp) || VIP_TIERS[0];
  const nextTierIndex = VIP_TIERS.findIndex(t => t.id === currentTier.id) + 1;
  const nextTier = nextTierIndex < VIP_TIERS.length ? VIP_TIERS[nextTierIndex] : null;

  const progressPercent = nextTier
    ? Math.min(100, Math.floor(((userExp - currentTier.minExp) / (nextTier.minExp - currentTier.minExp)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* TOP VIP HERO CARD */}
      <div className="bg-gradient-to-r from-amber-950 via-[#0f172a] to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
              <Crown className="w-4 h-4" /> SEIJO58 VIP LOYALTY CLUB
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              DARAJA LAKO: <span className={currentTier.color}>{currentTier.name}</span>
            </h2>
            <p className="text-xs text-slate-300">
              Pata <strong>Cashback ya {currentTier.cashbackPercent}%</strong>, msaada wa kipaumbele, na huduma ya meneja binafsi wa WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/255764220155?text=Habari%20Meneja%20wa%20VIP%20SEIJO58%2C%20nahitaji%20msaada%20wa%20akaunti%20yangu%20ya%20VIP%3A"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-500 to-[#25D366] hover:from-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-xl shadow-emerald-950/80 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>WASILIANA NA VIP DESK</span>
            </a>
          </div>
        </div>

        {/* EXP PROGRESS BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">
              EXP Points: <strong className="text-amber-400 font-mono">{userExp.toLocaleString()} PTS</strong>
            </span>
            <span className="text-slate-400">
              {nextTier ? `Daraja Linalofuata: ${nextTier.name} (${nextTier.minExp.toLocaleString()} PTS)` : 'Daraja la Juu Zaidi! 👑'}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* VIP TIERS COMPARISON GRID */}
      <div className="space-y-3">
        <h3 className="font-black text-white text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> NGAZI ZA VIP & MANUFAA YAKE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIP_TIERS.map(tier => {
            const isCurrent = tier.id === currentTier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-3xl p-5 border-2 space-y-4 shadow-xl flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#131b2e] border-amber-400 shadow-amber-950/40 ring-1 ring-amber-400'
                    : 'bg-[#0f172a] border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-white">{tier.badge}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        DARAJA LAKO
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Weekly Cashback:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{tier.cashbackPercent}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Kiwango cha EXP:</span>
                      <strong className="text-slate-300 font-mono">{tier.minExp.toLocaleString()} PTS</strong>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tier.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIP WHATSAPP DESK BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0b1222] to-slate-950 border border-emerald-500/40 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-black text-white text-base flex items-center justify-center md:justify-start gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" /> MENEJA WA WHATSAPP VIP (24/7)
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Kwa wateja wote wa VIP, unapewa namba maalum ya WhatsApp kupokea huduma ya haraka, huduma maalum, na ushauri wa kutoa pesa bila kikomo.
          </p>
        </div>

        <a
          href="https://wa.me/255764220155?text=Habari%20Meneja%20wa%20VIP%20SEIJO58%2C%20nahitaji%20msaada%20kuhusu%20akaunti%20yangu%20ya%20Casino%3A"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-emerald-950/80 active:scale-95 transition-all shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>Wasiliana na VIP Desk</span>
        </a>
      </div>
    </div>
  );
}
