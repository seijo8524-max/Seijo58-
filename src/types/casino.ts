export type CasinoGameId = 
  | 'aviator'
  | 'mines'
  | 'penalty'
  | 'blackjack'
  | 'slots'
  | 'roulette'
  | 'hilo'
  | 'dice'
  | 'coinflip';

export type CasinoCategory = 'all' | 'crash' | 'table' | 'slots' | 'arcade';

export interface CasinoGameInfo {
  id: CasinoGameId;
  name: string;
  category: CasinoCategory;
  tagline: string;
  rtp: string;
  maxMultiplier: string;
  minStake: number;
  maxStake: number;
  playersCount: number;
  badge?: string;
  badgeColor?: string;
  icon: string;
  themeGradient: string;
}

export interface GameBetRecord {
  id: string;
  gameId: CasinoGameId;
  gameName: string;
  stake: number;
  multiplier: number;
  payout: number;
  status: 'WON' | 'LOST' | 'CASHOUT' | 'PUSH';
  timestamp: string;
  details?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS' | 'REFUND';
  title: string;
  amount: number;
  timestamp: string;
  balanceAfter: number;
  status?: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface VIPTier {
  id: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  minExp: number;
  cashbackPercent: number;
  dailyBonusTsh?: number;
  color: string;
  border: string;
  badge: string;
  perks: string[];
}
