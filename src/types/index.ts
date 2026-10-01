export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type TipCategory = 'free' | 'vip';
export type VIPLevel = 'standard' | 'mega_odds' | 'platinum';
export type BetOutcome = 'WON' | 'LOST' | 'VOID' | 'PENDING';
export type ActivationStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type UserRole = 'user' | 'admin';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface MarketOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  over15?: number;
  bttsYes: number;
  bttsNo: number;
  doubleChance1X: number;
  doubleChanceX2: number;
  doubleChance12: number;
  correctScore?: { [score: string]: number };
}

export interface MatchTip {
  id: string;
  league: string;
  leagueCountry: string;
  leagueBadge: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamRank?: number;
  awayTeamRank?: number;
  matchDate: string;
  matchTime: string;
  status: MatchStatus;
  isVIP: boolean;
  vipLevel?: VIPLevel;
  category: TipCategory;
  isBanker?: boolean;
  predictionType: string;
  predictionSelection: string;
  odds: number;
  confidence: number;
  marketOdds: MarketOdds;
  aiAnalysis: string;
  keyInsights: string[];
  h2hSummary: string;
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  result?: {
    homeScore: number;
    awayScore: number;
    outcome: BetOutcome;
    settledAt: string;
  };
}

export interface BetSlipItem {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  predictionType: string;
  selection: string;
  odds: number;
}

export interface VIPPlan {
  id: string;
  name: string;
  price: string;
  priceUgx?: string;
  priceTsh?: string;
  amountTsh: number;
  durationDays: number;
  durationLabel: string;
  badge: string;
  oddsTarget: string;
  winRateTarget: string;
  features: string[];
  isPopular?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  withdrawalPin?: string;
  role: UserRole;
  isPremium: boolean;
  premiumPlanId?: string;
  premiumPlanName?: string;
  premiumActivatedAt?: string;
  premiumExpiresAt?: string;
  activationStatus: ActivationStatus;
  walletBalance?: number;
  isFrozen?: boolean;
  status?: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt?: string;
}

export interface PlacedTicket {
  id: string;
  bookingCode: string;
  items: BetSlipItem[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  placedAt: string;
  settledAt?: string;
  paidOut?: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  transactionRef: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  submittedAt: string;
  status: PaymentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
  generatedCode?: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  planId: string;
  planName: string;
  durationDays: number;
  assignedUserId?: string;
  assignedUserEmail?: string;
  isUsed: boolean;
  usedByUserId?: string;
  usedByUserEmail?: string;
  usedAt?: string;
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
}

export interface SubscriptionConfig {
  paymentPhone: string;
  paymentRaw: string;
  paymentRecipient: string;
  whatsappSupport: string;
  whatsappMessage: string;
  instructions: string[];
  plans: VIPPlan[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface VIPSubscription {
  isActive: boolean;
  planId?: string;
  planName?: string;
  unlockedAt?: string;
  expiresAt?: string;
  transactionRef?: string;
  phone?: string;
}

export interface ChannelSettings {
  brandName: string;
  tagline: string;
  momoNumber: string;
  momoAccountName: string;
  telegramLink: string;
  whatsappLink: string;
  whatsappGroupLink?: string;
  supportPhone: string;
  vipOddsAverage: string;
  freeTipsWinRate: string;
  vipTipsWinRate: string;
}
