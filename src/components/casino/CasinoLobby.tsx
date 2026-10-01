import React, { useState } from 'react';
import { CASINO_GAMES, LIVE_WINNERS_FEED } from '../../data/casinoGames';
import { CasinoCategory, CasinoGameId, CasinoGameInfo } from '../../types/casino';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  PlaneTakeoff, 
  Bomb, 
  Sparkles, 
  Layers, 
  Disc, 
  ArrowUpDown, 
  Dice5, 
  Coins, 
  Flame, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Zap, 
  Search,
  ChevronRight,
  Play,
  MessageCircle,
  Download,
  ArrowUpRight,
  Gamepad2,
  ArrowRight
} from 'lucide-react';

interface LobbyProps {
  onSelectGame: (gameId: CasinoGameId) => void;
  onOpenDeposit: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function CasinoLobby({ onSelectGame, onOpenDeposit, onNavigateTab }: LobbyProps) {
  const [selectedCategory, setSelectedCategory] = useState<CasinoCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const CATEGORIES: { id: CasinoCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Michezo Yote (9)', icon: '🎰' },
    { id: 'crash', label: 'Crash & Aviator', icon: '🚀' },
    { id: 'arcade', label: 'Fast Arcade & Mines', icon: '💣' },
    { id: 'table', label: 'Table Games (Blackjack & Roulette)', icon: '🃏' },
    { id: 'slots', label: 'Slots & Jackpots', icon: '💎' }
  ];

  const filteredGames = CASINO_GAMES.filter(g => {
    const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'PlaneTakeoff': return <PlaneTakeoff className="w-6 h-6 text-red-500" />;
      case 'Bomb': return <Bomb className="w-6 h-6 text-amber-500" />;
      case 'Goal': return <Award className="w-6 h-6 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'Layers': return <Layers className="w-6 h-6 text-blue-400" />;
      case 'Disc': return <Disc className="w-6 h-6 text-red-600" />;
      case 'ArrowUpDown': return <ArrowUpDown className="w-6 h-6 text-teal-400" />;
      case 'Dice5': return <Dice5 className="w-6 h-6 text-indigo-400" />;
      case 'Coins': return <Coins className="w-6 h-6 text-yellow-400" />;
      default: return <Sparkles className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* CASINO HERO JACKPOT BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-[#0f172a] to-amber-950 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-400" /> MEGA PROGRESSIVE JACKPOT
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            TSh <span className="text-amber-400">84,950,000</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cheza <strong>Aviator</strong>, <strong>Mines</strong>, <strong>Blackjack 21</strong> au <strong>Lucky Slots</strong> ujishindie malipo ya papo hapo kwenda <strong>M-Pesa</strong>, <strong>Tigo Pesa</strong>, <strong>Airtel Money</strong> na <strong>Halopesa</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectGame('aviator')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-red-950/80 flex items-center gap-2 transition-transform active:scale-95"
            >
              <PlaneTakeoff className="w-4 h-4" />
              <span>CHEZA AVIATOR SASA</span>
            </button>

            <button
              onClick={onOpenDeposit}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-950/80 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>WEKA PESA & PATA BONASI (+2k / +3k)</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* PROMOTIONAL DEPOSIT BONUS CARD */}
      <div 
        onClick={onOpenDeposit}
        className="cursor-pointer bg-gradient-to-r from-emerald-950/90 via-[#0a1626] to-amber-950/90 border-2 border-emerald-500/60 hover:border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> OFA MAALUM YA BONASI YA KUWEKA PESA
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              Weka TSh 5,000 Upate <span className="text-emerald-400">+2,000</span> | Weka TSh 10,000 Upate <span className="text-amber-400">+3,000</span>
            </h3>
            <p className="text-xs text-slate-300">
              Bonasi inaongezwa moja kwa moja kwenye pochi yako punde unapothibitisha malipo na kuweka activation code.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono font-black">
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-slate-400 block text-[10px]">Weka 5,000</span>
                <span className="text-emerald-400 font-bold">Pokea 7,000</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-slate-400 block text-[10px]">Weka 10,000</span>
                <span className="text-amber-400 font-bold">Pokea 13,000</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeposit();
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/80 active:scale-95 transition-all"
            >
              <span>Weka Sasa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LIVE TANZANIAN WINNERS TICKER */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-inner">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 shrink-0 uppercase tracking-wider pl-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>WASHINDI LIVE:</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap text-xs">
          {LIVE_WINNERS_FEED.map((w, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl text-slate-300 shrink-0"
            >
              <span className="font-mono text-slate-400 font-bold">{w.phone}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-bold">{w.game}</span>
              <span className="text-emerald-400 font-black font-mono">+{w.win}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono font-bold">
                {w.multi}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACCESS: SEIJO58 CASINO™ WHATSAPP GROUP & APP DOWNLOAD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* WHATSAPP GROUP CARD */}
        <a
          href="https://chat.whatsapp.com/HL87kuFZoeq2h2pHcYV8Qr?s=cl&p=a&mlu=0&ilr=4"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-emerald-950/70 via-[#0b1b14] to-slate-900 border border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wide text-emerald-400">
                  Official Community
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                Seijo58 Casino™ WhatsApp Group
              </h4>
              <p className="text-[11px] text-slate-400">Jiunge kupata codes, updates na washindi</p>
            </div>
          </div>
          <div className="bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0 shadow">
            <span>Jiunge</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* PWA DOWNLOAD APP CARD */}
        <div className="bg-gradient-to-r from-red-950/60 via-[#190d19] to-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wide text-amber-400">
                  Pakua Kwenye Simu
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                Sakinisha SEIJO58 BET App
              </h4>
              <p className="text-[11px] text-slate-400">Cheza kama Apps nyingine bila kivinjari</p>
            </div>
          </div>
          <div className="shrink-0">
            <PWAInstallButton variant="header" />
          </div>
        </div>
      </div>

      {/* FEATURED: SEIJO58 EFOOTBALL CAMP ™ SEMI-FINALS BANNER */}
      {onNavigateTab && (
        <div 
          onClick={() => onNavigateTab('efootball')}
          className="cursor-pointer bg-gradient-to-r from-red-950/90 via-[#150a22] to-amber-950/90 border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    NUSU FAINALI (SEMI-FINALS)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    12% Margin Odds
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  🎮 SEIJO58 EFOOTBALL CAMP ™ (I$AAC17, DOUBLE J, MSODOKII, MDUDU JR)
                </h3>
                <p className="text-xs text-slate-300">
                  Odds zilizokokotolewa kitaalamu kuanzia 1.65 hadi 3.90 • Kiwango cha chini: <strong>500 TSh</strong>
                </p>
              </div>
            </div>

            <button className="bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg group-hover:scale-[1.02] shrink-0">
              <span>FUNGUA EFOOTBALL MECHI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CATEGORY SELECTOR & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('efootball')}
              className="px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-amber-500/50 text-amber-300 hover:border-amber-400"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>🎮 SEIJO58 EFOOTBALL CAMP ™</span>
            </button>
          )}
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/60 scale-[1.02]'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tafuta mchezo (Aviator, Mines...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* GAMES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredGames.map(game => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`group cursor-pointer rounded-3xl bg-gradient-to-b ${game.themeGradient} p-5 border-2 hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between relative overflow-hidden`}
          >
            {/* Top Badges & Icon */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {getGameIcon(game.icon)}
                </div>

                <div className="flex items-center gap-1.5">
                  {game.badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${game.badgeColor}`}>
                      {game.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-slate-900/80 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-800">
                    RTP {game.rtp}
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                {game.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {game.tagline}
              </p>
            </div>

            {/* Bottom Meta & Play Button */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Max Ushindi:</div>
                <div className="text-sm font-black font-mono text-amber-400">{game.maxMultiplier}</div>
              </div>

              <button className="bg-gradient-to-r from-red-600 to-red-700 group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-slate-950 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>CHEZA</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
