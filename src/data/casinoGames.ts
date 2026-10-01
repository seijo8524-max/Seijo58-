import { CasinoGameInfo, VIPTier } from '../types/casino';

export const CASINO_GAMES: CasinoGameInfo[] = [
  {
    id: 'aviator',
    name: 'Aviator Crash',
    category: 'crash',
    tagline: 'Ndege inapaa! Toa fedha kabla haijapaa mbali.',
    rtp: '97.0%',
    maxMultiplier: '5,000x',
    minStake: 500,
    maxStake: 500000,
    playersCount: 1420,
    badge: 'HOT 🔥',
    badgeColor: 'bg-red-600',
    icon: 'PlaneTakeoff',
    themeGradient: 'from-red-600/30 via-slate-900 to-slate-950 border-red-500/40'
  },
  {
    id: 'mines',
    name: 'Mines Bahati',
    category: 'arcade',
    tagline: 'Tafuta Almasi 💎 ukiepuka mabomu 💣 kwenye gridi 5x5.',
    rtp: '98.5%',
    maxMultiplier: '1,000x',
    minStake: 500,
    maxStake: 500000,
    playersCount: 890,
    badge: 'POPULAR ⭐',
    badgeColor: 'bg-amber-500 text-slate-950',
    icon: 'Bomb',
    themeGradient: 'from-amber-600/30 via-slate-900 to-slate-950 border-amber-500/40'
  },
  {
    id: 'penalty',
    name: 'Penalty Shootout',
    category: 'arcade',
    tagline: 'Piga penalti 5 mfululizo uvune hadi 30.72x!',
    rtp: '96.8%',
    maxMultiplier: '30.72x',
    minStake: 500,
    maxStake: 250000,
    playersCount: 650,
    badge: 'ARCADE ⚽',
    badgeColor: 'bg-emerald-600',
    icon: 'Goal',
    themeGradient: 'from-emerald-600/30 via-slate-900 to-slate-950 border-emerald-500/40'
  },
  {
    id: 'slots',
    name: 'Lucky Slots 777',
    category: 'slots',
    tagline: 'Zungusha reels 3 uvune Triple 7 Jackpot ya 250x!',
    rtp: '96.5%',
    maxMultiplier: '250x',
    minStake: 500,
    maxStake: 200000,
    playersCount: 520,
    badge: 'JACKPOT 🎰',
    badgeColor: 'bg-purple-600',
    icon: 'Sparkles',
    themeGradient: 'from-purple-600/30 via-slate-900 to-slate-950 border-purple-500/40'
  },
  {
    id: 'blackjack',
    name: 'Blackjack 21',
    category: 'table',
    tagline: 'Fikisha alama 21 umshinde Casino Dealer na malipo ya 3:2.',
    rtp: '99.5%',
    maxMultiplier: '2.5x',
    minStake: 500,
    maxStake: 1000000,
    playersCount: 410,
    badge: 'TABLE 🃏',
    badgeColor: 'bg-blue-600',
    icon: 'Layers',
    themeGradient: 'from-blue-600/30 via-slate-900 to-slate-950 border-blue-500/40'
  },
  {
    id: 'roulette',
    name: 'European Roulette',
    category: 'table',
    tagline: 'Chagua Namba (36x), Rangi Nyekundu/Nyeusi au Even/Odd.',
    rtp: '97.3%',
    maxMultiplier: '36.0x',
    minStake: 500,
    maxStake: 500000,
    playersCount: 380,
    badge: 'CLASSIC 🎡',
    badgeColor: 'bg-red-700',
    icon: 'Disc',
    themeGradient: 'from-red-700/30 via-slate-900 to-slate-950 border-red-600/40'
  },
  {
    id: 'hilo',
    name: 'Hi-Lo Cards',
    category: 'arcade',
    tagline: 'Tabiri ikiwa karata inayofuata ni ya Juu au ya Chini.',
    rtp: '98.0%',
    maxMultiplier: '100x',
    minStake: 500,
    maxStake: 300000,
    playersCount: 290,
    badge: 'FAST 🎴',
    badgeColor: 'bg-teal-600',
    icon: 'ArrowUpDown',
    themeGradient: 'from-teal-600/30 via-slate-900 to-slate-950 border-teal-500/40'
  },
  {
    id: 'dice',
    name: 'Dice Roll 0-100',
    category: 'arcade',
    tagline: 'Chagua lengo la kete na kurekebisha odds zako mwenyewe.',
    rtp: '99.0%',
    maxMultiplier: '990x',
    minStake: 500,
    maxStake: 500000,
    playersCount: 340,
    badge: 'PROVABLY FAIR 🎲',
    badgeColor: 'bg-indigo-600',
    icon: 'Dice5',
    themeGradient: 'from-indigo-600/30 via-slate-900 to-slate-950 border-indigo-500/40'
  },
  {
    id: 'coinflip',
    name: 'Coin Flip (Head / Tail)',
    category: 'arcade',
    tagline: 'Chagua Sarafu: Kichwa au Mkia kwa ushindi wa haraka wa 1.96x.',
    rtp: '98.0%',
    maxMultiplier: '1.96x',
    minStake: 500,
    maxStake: 500000,
    playersCount: 460,
    badge: 'INSTANT 🪙',
    badgeColor: 'bg-yellow-500 text-slate-950',
    icon: 'Coins',
    themeGradient: 'from-yellow-600/30 via-slate-900 to-slate-950 border-yellow-500/40'
  }
];

export const VIP_TIERS: VIPTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Player',
    minExp: 0,
    cashbackPercent: 5,
    color: 'text-amber-600',
    border: 'border-amber-700/50',
    badge: '🥉 Bronze',
    perks: ['Cashback 5% ya hasara kila wiki', 'Usaidizi wa kawaida 24/7', 'Utoaji wa haraka wa M-Pesa na Tigo']
  },
  {
    id: 'silver',
    name: 'Silver VIP',
    minExp: 1000,
    cashbackPercent: 8,
    color: 'text-slate-300',
    border: 'border-slate-400/50',
    badge: '🥈 Silver',
    perks: ['Cashback 8% ya hasara kila wiki', 'Kutoa pesa kwa kipaumbele', 'Msaada wa WhatsApp VIP Desk']
  },
  {
    id: 'gold',
    name: 'Gold High-Roller',
    minExp: 5000,
    cashbackPercent: 12,
    color: 'text-amber-400',
    border: 'border-amber-400/60',
    badge: '🥇 Gold',
    perks: ['Cashback 12% ya hasara kila wiki', 'Meneja binafsi wa WhatsApp VIP', 'Kutoa kiasi kikubwa cha pesa papo hapo']
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    minExp: 15000,
    cashbackPercent: 15,
    color: 'text-cyan-400',
    border: 'border-cyan-400/60',
    badge: '💎 Platinum',
    perks: ['Cashback 15% ya hasara kila wiki', 'Vikomo vya juu vya kubeti', 'Utoaji wa haraka ndani ya dakika 1']
  },
  {
    id: 'diamond',
    name: 'Diamond King',
    minExp: 50000,
    cashbackPercent: 20,
    color: 'text-fuchsia-400',
    border: 'border-fuchsia-400/70',
    badge: '👑 Diamond',
    perks: ['Cashback 20% ya hasara kila wiki', 'Kutoa fedha bila kikomo papo hapo', 'Mwaliko kwenye VIP Luxury Club']
  }
];

export const LIVE_WINNERS_FEED = [
  { phone: '0764***155', game: 'Aviator Crash', win: 'TSh 142,500', multi: '14.25x' },
  { phone: '0655***890', game: 'Mines Bahati', win: 'TSh 85,000', multi: '8.50x' },
  { phone: '0782***334', game: 'Penalty Shootout', win: 'TSh 153,600', multi: '15.36x' },
  { phone: '0714***612', game: 'Lucky Slots 777', win: 'TSh 250,000', multi: '250.0x' },
  { phone: '0743***901', game: 'Blackjack 21', win: 'TSh 50,000', multi: '2.50x' },
  { phone: '0688***742', game: 'European Roulette', win: 'TSh 180,000', multi: '36.00x' },
  { phone: '0754***221', game: 'Dice Roll 0-100', win: 'TSh 95,000', multi: '9.50x' },
  { phone: '0769***440', game: 'Hi-Lo Cards', win: 'TSh 64,000', multi: '6.40x' }
];
