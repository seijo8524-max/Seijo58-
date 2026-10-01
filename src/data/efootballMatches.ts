export interface TournamentTeam {
  id: string;
  name: string;
  tagline: string;
  championOdds: number;
  powerRating: number;
  tier: 'FAVORITE' | 'CONTENDER' | 'UNDERDOG';
  recentForm: ('W' | 'D' | 'L')[];
  description: string;
}

export const TOURNAMENT_TEAMS: TournamentTeam[] = [
  {
    id: 'team-double-j',
    name: 'DOUBLE J',
    tagline: '👑 Reigning Champion • Unbeaten Record',
    championOdds: 3.50,
    powerRating: 9.8,
    tier: 'FAVORITE',
    recentForm: ['W', 'W', 'D', 'W', 'W'],
    description: 'Bingwa mtetezi mwenye rekodi ya kutofungwa na uzoefu mkubwa wa fainali.'
  },
  {
    id: 'team-msodoki',
    name: 'MSODOKI',
    tagline: '🥈 Grand Finalist • Lethal Strike Force',
    championOdds: 4.00,
    powerRating: 9.4,
    tier: 'FAVORITE',
    recentForm: ['W', 'D', 'W', 'W', 'L'],
    description: 'Mshambuliaji hatari mwenye wastani wa juu wa magoli kwenye kila mchezo.'
  },
  {
    id: 'team-isaac17',
    name: 'ISAAC17',
    tagline: '🎯 Master Tactician • Elite Contender',
    championOdds: 4.50,
    powerRating: 9.1,
    tier: 'FAVORITE',
    recentForm: ['W', 'W', 'W', 'L', 'W'],
    description: 'Ufundi wa pasi fupi na umakini wa juu katika safu ya kiungo.'
  },
  {
    id: 'team-master-plan',
    name: 'MASTER PLAN',
    tagline: '🧠 Strategic Powerhouse',
    championOdds: 5.50,
    powerRating: 8.6,
    tier: 'CONTENDER',
    recentForm: ['W', 'W', 'D', 'W', 'L'],
    description: 'Mpangilio makini wa mbinu na kuzuia mashambulizi ya adui mapema.'
  },
  {
    id: 'team-kimtan',
    name: 'KIMTAN',
    tagline: '⚡ High Pressing & Rapid Counters',
    championOdds: 6.00,
    powerRating: 8.2,
    tier: 'CONTENDER',
    recentForm: ['W', 'D', 'W', 'L', 'W'],
    description: 'Kasi ya ajabu ya mawinga na mashambulizi ya kushtukiza yenye madhara.'
  },
  {
    id: 'team-mdudu-jr',
    name: 'MDUDU JR',
    tagline: '🛡️ Resilient Fighter • Clutch Plays',
    championOdds: 6.50,
    powerRating: 8.0,
    tier: 'CONTENDER',
    recentForm: ['L', 'W', 'W', 'W', 'D'],
    description: 'Mstahimilivu asiyekata tamaa, hatari katika vipindi vya lala salama.'
  },
  {
    id: 'team-man-u',
    name: 'MAN U',
    tagline: '🔴 Historic Giant • Dangerous Strikes',
    championOdds: 7.20,
    powerRating: 7.6,
    tier: 'CONTENDER',
    recentForm: ['W', 'L', 'W', 'D', 'W'],
    description: 'Timu yenye historia na ubora wa kupiga mashuti makali kutoka mbali.'
  },
  {
    id: 'team-gwacky55',
    name: 'GWACKY55',
    tagline: '⚔️ Aggressive Enforcer',
    championOdds: 8.00,
    powerRating: 7.2,
    tier: 'UNDERDOG',
    recentForm: ['W', 'L', 'D', 'W', 'L'],
    description: 'Uchezaji wa nguvu na ukabaji thabiti katika robo fainali.'
  },
  {
    id: 'team-benfica',
    name: 'BENFICA',
    tagline: '🦅 Flying Wings & Quick Transitions',
    championOdds: 8.50,
    powerRating: 7.0,
    tier: 'UNDERDOG',
    recentForm: ['L', 'W', 'D', 'L', 'W'],
    description: 'Wachezaji wenye wepesi na mikwaju mikali inayolenga lango.'
  },
  {
    id: 'team-gibwa',
    name: 'GIBWA',
    tagline: '🌪️ Dark Horse Precision',
    championOdds: 9.50,
    powerRating: 6.5,
    tier: 'UNDERDOG',
    recentForm: ['D', 'W', 'L', 'L', 'W'],
    description: 'Uwezo mkubwa wa kuzishangaza timu pinzani na kuibuka na ushindi.'
  },
  {
    id: 'team-suranono',
    name: 'SURANONO',
    tagline: '🔥 Fearless Underdog Attack',
    championOdds: 10.50,
    powerRating: 6.0,
    tier: 'UNDERDOG',
    recentForm: ['L', 'D', 'W', 'L', 'D'],
    description: 'Wachezaji wasioogopa kushambulia kwa ujasiri muda wote.'
  },
  {
    id: 'team-manjiboe08',
    name: 'MANJIBOE08',
    tagline: '🎲 High Payout Underdog Striker',
    championOdds: 12.00,
    powerRating: 5.5,
    tier: 'UNDERDOG',
    recentForm: ['L', 'L', 'W', 'D', 'L'],
    description: 'Odds kubwa zaidi zenye malipo makubwa sana akitwaa ubingwa.'
  }
];

export function calculateFinalistPairOdds(teamA: string, teamB: string): number {
  const tA = TOURNAMENT_TEAMS.find(t => t.name.toLowerCase() === teamA.toLowerCase());
  const tB = TOURNAMENT_TEAMS.find(t => t.name.toLowerCase() === teamB.toLowerCase());
  if (!tA || !tB || tA.name === tB.name) return 15.00;

  const names = [tA.name, tB.name].sort();
  const pairKey = `${names[0]}&${names[1]}`;
  const customOdds: Record<string, number> = {
    'DOUBLE J&MSODOKI': 8.50,
    'DOUBLE J&ISAAC17': 9.50,
    'ISAAC17&MSODOKI': 10.50,
    'DOUBLE J&MASTER PLAN': 11.50,
    'MASTER PLAN&MSODOKI': 12.00,
    'DOUBLE J&KIMTAN': 13.00,
    'DOUBLE J&VA.MO.SI': 13.00,
    'DOUBLE J&MDUDU JR': 13.50,
    'ISAAC17&MASTER PLAN': 14.00,
    'ISAAC17&KIMTAN': 15.00,
    'ISAAC17&VA.MO.SI': 15.00,
    'DOUBLE J&MAN U': 15.50,
    'GWACKY55&MSODOKI': 16.50,
    'BENFICA&DOUBLE J': 17.50,
    'BENFICA&ISAAC17': 18.50,
    'GWACKY55&MDUDU JR': 20.50,
    'GIBWA&SURANONO': 22.00,
    'MANJIBOE08&SURANONO': 25.00
  };

  if (customOdds[pairKey]) {
    return customOdds[pairKey];
  }

  const base = 8.50;
  const additive = ((tA.championOdds + tB.championOdds) - 7.5) * 1.05;
  const calculated = Math.min(25.00, Math.max(8.50, Number((base + additive).toFixed(2))));
  return calculated;
}

export const FEATURED_FINALIST_PAIRS = [
  { team1: 'DOUBLE J', team2: 'MSODOKI', odds: 8.50, label: 'Grand Final Rematch (Favorites)' },
  { team1: 'DOUBLE J', team2: 'ISAAC17', odds: 9.50, label: 'Clash of Champions' },
  { team1: 'MSODOKI', team2: 'ISAAC17', odds: 10.50, label: 'Super Offensive Duel' },
  { team1: 'DOUBLE J', team2: 'MASTER PLAN', odds: 11.50, label: 'Tactical Showdown' },
  { team1: 'DOUBLE J', team2: 'KIMTAN', odds: 13.00, label: 'Speed vs Defense' },
  { team1: 'ISAAC17', team2: 'BENFICA', odds: 18.50, label: 'Classic Rivalry' },
  { team1: 'MDUDU JR', team2: 'GWACKY55', odds: 20.50, label: 'Fierce Battle' },
  { team1: 'SURANONO', team2: 'MANJIBOE08', odds: 25.00, label: 'Maximum Underdog Payout' }
];

export interface EFootballPlayerStat {
  name: string;
  tagline: string;
  avatarSeed: string;
  groupRecord: string;
  quarterFinals: string;
  totalGoals: number;
  playStyle: string;
  winProbability: number;
  recentForm: ('W' | 'D' | 'L')[];
}

export interface EFootballFinalScore {
  homeScore: number;
  awayScore: number;
  display: string;
  statusText: string;
  winningPicks: string[];
  losingPicks: string[];
}

export interface EFootballMatch {
  id: string;
  stageName: string;
  scheduledTime: string;
  status: 'UPCOMING' | 'LIVE' | 'FT';
  finalScore?: EFootballFinalScore;
  player1: EFootballPlayerStat;
  player2: EFootballPlayerStat;
  traderAnalysis: string;
  keyStats: string[];
  odds: {
    homeWin: number;     // 1
    draw: number;        // X
    awayWin: number;     // 2
    overUnderLabel?: string;
    overUnderThreshold?: number; // 2.5, 5.5, etc.
    overOdds?: number;   // Over
    underOdds?: number;  // Under
    bttsLabel?: string;
    ggOdds?: number;     // Both Teams to Score (GG)
    ngOdds?: number;     // No Goal (NG)
    doubleChance1X?: number; // 1X (Home or Draw)
    doubleChanceX2?: number; // X2 (Away or Draw)
    doubleChance12?: number; // 12 (Either Team Wins)
    homeTrophyOdds?: number; // To Lift The Trophy: Home
    awayTrophyOdds?: number; // To Lift The Trophy: Away
    homeQualifyOdds?: number; // To Qualify: Home Team
    awayQualifyOdds?: number; // To Qualify: Away Team
  };
  bookmakerMargin: string;
}

export const EFOOTBALL_GRAND_FINAL_2026: EFootballMatch = {
  id: 'efb-final-2026',
  stageName: '🏆 SEIJO58 eFOOTBALL CAMP ™ — GRAND FINAL (FAINALI KUU)',
  scheduledTime: 'FT / TOURNAMENT FINISHED',
  status: 'FT',
  finalScore: {
    homeScore: 4,
    awayScore: 6,
    display: '4 – 6',
    statusText: 'FT / TOURNAMENT FINISHED: ISAAC 4 🆚 6 MAN U',
    winningPicks: [
      '2 (MAN U Win)',
      'X2 (MAN U or Draw)',
      '12 (Either Team Wins)',
      'Over 2.5 Goals (Total goals = 10)',
      'GG (Both Teams Scored - 4:6)',
      'MAN U To Lift The Trophy (Mabingwa)'
    ],
    losingPicks: [
      '1 (ISAAC Win)',
      '1X (ISAAC or Draw)',
      'Under 2.5 Goals',
      'NG (No Goal)',
      'ISAAC To Lift Trophy'
    ]
  },
  player1: {
    name: 'ISAAC',
    tagline: 'Mshindi wa Pili (Runner Up) • Scored 4 in Final',
    avatarSeed: 'isaac_final',
    groupRecord: 'Mtoano: Mabao 17 jumla • QF Winner (Agg 7-6) • SF Winner (6-1 vs Suranono) • Final: 4-6',
    quarterFinals: 'Finalist: Alipambana kwa ushujaa mkubwa na kufunga mabao 4 kwenye Fainali Kuu!',
    totalGoals: 17,
    playStyle: 'High-Intensity Attack, Direct Pressing & Clinical Finishing',
    winProbability: 51,
    recentForm: ['W', 'W', 'W', 'D', 'L']
  },
  player2: {
    name: 'MAN U',
    tagline: '👑 BINGWA RASMI WA MASHINDANO 2026 (CHAMPION)',
    avatarSeed: 'manu_final',
    groupRecord: '👑 BINGWA WA MASHINDANO! Ushindi wa 6–4 Fainali Kuu dhidi ya ISAAC!',
    quarterFinals: 'Champion: Ushindi wa kishindo 6-4 kwenye Fainali Kuu na kutwaa Taji la Ubingwa!',
    totalGoals: 43,
    playStyle: 'Ruthless High-Pressing, Physical Dominance & Dangerous Long Range Strikes',
    winProbability: 49,
    recentForm: ['W', 'W', 'W', 'W', 'W']
  },
  traderAnalysis: 'MATOKEO RASMI YA FAINALI KUU: ISAAC 4 🆚 6 MAN U (FT)! Mechi ya kihistoria na mabao 10 uwanjani! MAN U ametwaa Ubingwa Rasmi wa SEIJO58 eFOOTBALL CAMP ™ 2026. Masoko yaliyoshinda: 2 (MAN U Win @ 2.75), X2 (MAN U or Draw @ 1.51), 12 (Either Team Wins @ 1.28), Over 2.5 Goals (Mabao 10 @ 1.85), GG (Both Teams Scored @ 1.70), na MAN U To Lift The Trophy (@ 1.98)! Malipo yote yameshasuluhishwa kikamilifu.',
  keyStats: [
    'Matokeo Rasmi: ISAAC 4 – 6 MAN U (FT)',
    '👑 BINGWA RASMI: MAN U 🏆',
    '🥈 MSHINDI WA PILI: ISAAC17 🥈',
    'Winning Markets: 2 (MAN U) 🟢, X2 🟢, 12 🟢, Over 2.5 (10 Mabao) 🟢, GG 🟢, MAN U Trophy 🟢',
    'Losing Markets: 1 (ISAAC) 🔴, 1X 🔴, Under 2.5 🔴, NG 🔴, ISAAC Trophy 🔴',
    'Mikeka yote imesuluhishwa na malipo kuingizwa kwenye Wallet Balance!'
  ],
  odds: {
    homeWin: 2.45, // 1 (ISAAC Win)
    draw: 3.30,    // X (Draw)
    awayWin: 2.75, // 2 (MAN U Win)
    doubleChance1X: 1.42, // 1X (ISAAC or Draw)
    doubleChanceX2: 1.51, // X2 (MAN U or Draw)
    doubleChance12: 1.28, // 12 (Either Team Wins)
    overUnderLabel: 'Total Goals Over / Under 2.5',
    overUnderThreshold: 2.5,
    overOdds: 1.85, // Over 2.5 Goals
    underOdds: 1.95, // Under 2.5 Goals
    bttsLabel: 'Both Teams To Score (GG / NG)',
    ggOdds: 1.70,  // GG (Yes)
    ngOdds: 2.05,  // NG (No)
    homeTrophyOdds: 1.78, // ISAAC To Lift Trophy
    awayTrophyOdds: 1.98, // MAN U To Lift Trophy
    homeQualifyOdds: 1.78, // To Lift Trophy alias
    awayQualifyOdds: 1.98  // To Lift Trophy alias
  },
  bookmakerMargin: '9.8% Professional Bookmaker Margin'
};

export const EFOOTBALL_GRAND_FINAL: EFootballMatch = EFOOTBALL_GRAND_FINAL_2026;

export const EFOOTBALL_SEMI_FINALS_DATA: EFootballMatch[] = [
  {
    id: 'efb-semi-1',
    stageName: 'NUSU FAINALI (SF1) • LEG 1',
    scheduledTime: 'FT / MATCH FINISHED',
    status: 'FT',
    player1: {
      name: 'MAN U',
      tagline: 'Tournament Top Scorers • Lethal Offensive Firepower',
      avatarSeed: 'manu',
      groupRecord: 'Group Stage: 5 Wins, 1 Loss (20+ Goals) • QF Winner (Agg 6-6, Playoff 5-4)',
      quarterFinals: 'Robo Fainali: Alifuzu Nusu Fainali baada ya kuiondoa GWACKY55',
      totalGoals: 34,
      playStyle: 'High-Pressing Offensive Avalanche & Direct Attack',
      winProbability: 46,
      recentForm: ['W', 'W', 'W', 'W', 'W']
    },
    player2: {
      name: 'MASTER PLAN',
      tagline: 'Rock-Solid Wall • Conceded Only 1 Goal in QF',
      avatarSeed: 'masterplan',
      groupRecord: 'Group C: 3 Wins, 1 Draw, 2 Losses • QF Winner (Agg 2-1 vs VAMOS)',
      quarterFinals: 'Robo Fainali: Ushindi wa kishindo 2-0 ugenini Leg 1 na kufuzu Nusu Fainali',
      totalGoals: 17,
      playStyle: 'Tight Tactical Defense, Positional Control & Deadly Counters',
      winProbability: 38,
      recentForm: ['L', 'W', 'W', 'D', 'W']
    },
    finalScore: {
      homeScore: 3,
      awayScore: 1,
      display: '3 – 1',
      statusText: 'FT: MAN U 3 – 1 MASTER PLAN (MR JOKER)',
      winningPicks: [
        '1 (MAN U Win)',
        'Over 2.5 Goals',
        'GG (Both Teams Scored - 3:1)'
      ],
      losingPicks: [
        '2 (MASTER PLAN Win)',
        'X (Draw)',
        'Under 2.5 Goals',
        'NG'
      ]
    },
    traderAnalysis: 'UCHAMBUZI WA KITAALAMU: MAN U ndiye kinara wa mabao katika mashindano yote lakini anaruhusu mabao mepesi. Kwa upande mwingine, MASTER PLAN anacheza ulinzi mkali sana wa mbinu (alifungwa goli 1 pekee katika mechi za Robo Fainali). Mechi hii ya Leg 1 imemalizika kwa MAN U kushinda 3-1!',
    keyStats: [
      'MAN U 3 – 1 MASTER PLAN (MR JOKER) FT',
      'Winning Markets: 1 (MAN U Win) 🟢, Over 2.5 Goals 🟢, GG 🟢',
      'Losing Markets: 2 (MASTER PLAN Win) 🔴, X (Draw) 🔴, Under 2.5 🔴, NG 🔴',
      'Mabao ya Mechi: Jumla ya mabao 4 (> 2.5)',
      'Wote Wamefunga: GG (3:1)',
      'To Qualify: Kuingia Grand Final inasubiri mchezo wa marudiano (Leg 2)'
    ],
    odds: {
      homeWin: 2.05, // 1 (MAN U Win)
      draw: 3.30,    // X (Draw)
      awayWin: 3.10, // 2 (MASTER PLAN Win)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.60, // Over 2.5 Goals
      underOdds: 2.20, // Under 2.5 Goals
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.52,  // GG (Both Teams to Score)
      ngOdds: 2.35,  // NG (No Goal)
      homeQualifyOdds: 1.65, // Fuzu: MAN U
      awayQualifyOdds: 2.10  // Fuzu: MASTER PLAN
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  },
  {
    id: 'efb-semi-2',
    stageName: 'NUSU FAINALI (SF2) • LEG 1',
    scheduledTime: 'FT / MATCH FINISHED',
    status: 'FT',
    player1: {
      name: 'SURANONO',
      tagline: 'High-Scoring Juggernaut • Scored 7 Goals in QF',
      avatarSeed: 'suranono',
      groupRecord: 'Group Stage Surge • Mshindi wa Mtoano & QF (Agg 7-4 vs Gibwa)',
      quarterFinals: 'Robo Fainali: Ushindi wa kishindo 3-1 ugenini Leg 1 na kufuzu Nusu Fainali',
      totalGoals: 21,
      playStyle: 'Fearless Direct Attack, Long Range Precision & High Press',
      winProbability: 40,
      recentForm: ['L', 'W', 'W', 'W', 'W']
    },
    player2: {
      name: 'ISAAC17',
      tagline: 'Tactical Dynamo • Scored 7 Goals in QF Thriller',
      avatarSeed: 'isaac17',
      groupRecord: 'Best Loser Qualifier • Ushindi wa Kihistoria QF (Agg 7-6 vs Benfica)',
      quarterFinals: 'Robo Fainali: Ushindi wa kishindo 5-4 Leg 2 na kufuzu Nusu Fainali',
      totalGoals: 30,
      playStyle: 'Possession Tiki-Taka, Midfield Control & Set-Piece Precision',
      winProbability: 42,
      recentForm: ['W', 'W', 'W', 'D', 'W']
    },
    finalScore: {
      homeScore: 1,
      awayScore: 6,
      display: '1 – 6',
      statusText: 'FT: SURANONO 1 – 6 ISAAC17 (Leg 1)',
      winningPicks: [
        '2 (ISAAC17 Win)',
        'Over 2.5 Goals',
        'GG (Both Teams Scored - 1:6)'
      ],
      losingPicks: [
        '1 (SURANONO Win)',
        'X (Draw)',
        'Under 2.5 Goals',
        'NG'
      ]
    },
    traderAnalysis: 'UCHAMBUZI WA KITAALAMU: Timu zote mbili zilifunga jumla ya mabao 7 katika mechi zao za Robo Fainali. Mechi hii ya Leg 1 imeshuhudia ISAAC17 akipata ushindi mnono wa mabao 6-1 ugenini dhidi ya SURANONO!',
    keyStats: [
      'SURANONO 1 – 6 ISAAC17 FT',
      'Winning Markets: 2 (ISAAC17 Win) 🟢, Over 2.5 Goals 🟢, GG 🟢',
      'Losing Markets: 1 (SURANONO Win) 🔴, X (Draw) 🔴, Under 2.5 🔴, NG 🔴',
      'Mabao ya Mechi: Jumla ya mabao 7 (> 2.5)',
      'Wote Wamefunga: GG (1:6)',
      'To Qualify: Kuingia Grand Final inasubiri mchezo wa marudiano (Leg 2)'
    ],
    odds: {
      homeWin: 2.65, // 1 (SURANONO Win)
      draw: 3.25,    // X (Draw)
      awayWin: 2.45, // 2 (ISAAC17 Win)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.55, // Over 2.5 Goals
      underOdds: 2.30, // Under 2.5 Goals
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.48,  // GG (Both Teams to Score)
      ngOdds: 2.45,  // NG (No Goal)
      homeQualifyOdds: 1.85, // Fuzu: SURANONO
      awayQualifyOdds: 1.85  // Fuzu: ISAAC17
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  }
];

export const EFOOTBALL_QUARTER_FINALS_DATA: EFootballMatch[] = [
  {
    id: 'efb-qf-1',
    stageName: 'ROBO FAINALI (QF1) • LEG 1',
    scheduledTime: 'FT / FINISHED (Mikondo Miwili)',
    status: 'FT',
    finalScore: {
      homeScore: 1,
      awayScore: 3,
      display: '1 – 3',
      statusText: 'FT: GWACKY55 alishinda Leg 1 (1–3) • MAN U amefuzu (Agg: 6–6, Playoff 5–4)',
      winningPicks: [
        '2 (GWACKY55)',
        'Over 2.5 Goals',
        'GG (Both Teams Score)',
        'MAN U (To Qualify)'
      ],
      losingPicks: [
        '1 (MAN U)',
        'X (Sare / Draw)',
        'Under 2.5 Goals',
        'NG (No Goal / Asifunge)',
        'GWACKY55 (To Qualify)'
      ]
    },
    player1: {
      name: 'MAN U',
      tagline: 'Historic Giant • 20+ Goals in Groups',
      avatarSeed: 'manu',
      groupRecord: 'Group Stage: 5 Wins, 1 Loss (20+ Goals Scored - Kinara wa Mabao)',
      quarterFinals: 'Robo Fainali: Amefuzu Nusu Fainali (Agg 6-6, 3rd match 5-4 dhidi ya GWACKY55) 🟢',
      totalGoals: 22,
      playStyle: 'Offensive Overload, High-Intensity Attack & Sharp Long-Range Precision',
      winProbability: 51,
      recentForm: ['W', 'W', 'W', 'W', 'L']
    },
    player2: {
      name: 'GWACKY55',
      tagline: 'Aggressive Enforcer • UNBEATEN (Zero Losses)',
      avatarSeed: 'gwacky55',
      groupRecord: 'Group Stage: 3 Wins, 3 Draws, 0 Losses (UNBEATEN • Rekodi Safi)',
      quarterFinals: 'Robo Fainali: Ushindi wa Leg 1 (3-1), alitolewa kwenye mchezo wa 3 (4-5)',
      totalGoals: 12,
      playStyle: 'Unbeaten Low-Block Defense, Aggressive Physicality & Rapid Counters',
      winProbability: 26,
      recentForm: ['W', 'D', 'W', 'D', 'W']
    },
    traderAnalysis: 'MATOKEO RASMI YA FT: GWACKY55 alipata ushindi wa ugenini wa 3-1 katika Leg 1. Hata hivyo, katika matokeo ya jumla (Aggregate 6-6), MAN U alishinda mechi ya 3 ya maamuzi (Playoff 5-4) na kufuzu rasmi Nusu Fainali!',
    keyStats: [
      'Matokeo ya Leg 1: MAN U 1 – 3 GWACKY55 (Mshindi: GWACKY55 @ 3.60)',
      'Over/Under 2.5: Over 2.5 Goals Ilishinda (Mabao 4 > 2.5 @ 1.65)',
      'Both Teams To Score: GG Ilishinda (Wote walifunga 1-3 @ 1.55)',
      'Fuzu Nusu Fainali: MAN U Amefuzu (Agg: 6-6, 3rd match: 5-4 @ 1.50)'
    ],
    odds: {
      homeWin: 1.85, // 1 (MAN U Win)
      draw: 3.40,    // X (Draw)
      awayWin: 3.60, // 2 (GWACKY55 Win - WON)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.65, // Over 2.5 Goals (WON)
      underOdds: 2.10, // Under 2.5 Goals
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.55,  // GG (WON)
      ngOdds: 2.30,  // NG (No Goal)
      homeQualifyOdds: 1.50, // Fuzu: MAN U (QUALIFIED)
      awayQualifyOdds: 2.40  // Fuzu: GWACKY55
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  },
  {
    id: 'efb-qf-2',
    stageName: 'ROBO FAINALI (QF2) • LEG 1',
    scheduledTime: 'FT / FINISHED (Mikondo Miwili)',
    status: 'FT',
    finalScore: {
      homeScore: 0,
      awayScore: 2,
      display: '0 – 2',
      statusText: 'FT: MASTER PLAN alishinda Leg 1 (0–2) na kufuzu Nusu Fainali (Agg: 2–1)',
      winningPicks: [
        '2 (MASTER PLAN)',
        'Under 2.5 Goals',
        'NG (No Goal / Asifunge)',
        'MASTER PLAN (To Qualify)'
      ],
      losingPicks: [
        '1 (VAMOS)',
        'X (Sare / Draw)',
        'Over 2.5 Goals',
        'GG (Both Teams Score)',
        'VAMOS (To Qualify)'
      ]
    },
    player1: {
      name: 'VAMOS',
      tagline: 'High Pressing & Rapid Wing Counters',
      avatarSeed: 'vamos',
      groupRecord: 'Group Stage: 3 Wins, 2 Draws, 1 Loss',
      quarterFinals: 'Robo Fainali: Alifungwa Leg 1 (0-2) nyumbani, alitolewa (Agg: 1-2)',
      totalGoals: 15,
      playStyle: 'High Pressing, Quick Flank Acceleration & Counter-Pressing',
      winProbability: 39,
      recentForm: ['W', 'D', 'W', 'L', 'W']
    },
    player2: {
      name: 'MASTER PLAN',
      tagline: 'Strategic Powerhouse • Semi-Finalist Qualifier',
      avatarSeed: 'masterplan',
      groupRecord: 'Group C: 3 Wins, 1 Draw, 2 Losses (Dynamic Attack Form)',
      quarterFinals: 'Robo Fainali: Ushindi wa ugenini 0-2 Leg 1 na kufuzu rasmi Nusu Fainali 🟢',
      totalGoals: 14,
      playStyle: 'Dynamic Positional Play, Midfield Control & Clinical Scoring',
      winProbability: 34,
      recentForm: ['W', 'W', 'D', 'L', 'W']
    },
    traderAnalysis: 'MATOKEO RASMI YA FT: MASTER PLAN walifanya kazi kubwa ugenini na kushinda 0-2 bila kuruhusu goli. Kwa matokeo ya jumla (Agg 2-1), MASTER PLAN anafuzu rasmi Nusu Fainali!',
    keyStats: [
      'Matokeo ya Leg 1: VAMOS 0 – 2 MASTER PLAN (Mshindi: MASTER PLAN @ 2.75)',
      'Over/Under 2.5: Under 2.5 Goals Ilishinda (Mabao 2 < 2.5 @ 1.80)',
      'Both Teams To Score: NG Ilishinda (Clean Sheet 0-2 @ 1.95)',
      'Fuzu Nusu Fainali: MASTER PLAN Amefuzu (Agg: 2-1 @ 1.85)'
    ],
    odds: {
      homeWin: 2.40, // 1 (VAMOS Win)
      draw: 3.10,    // X (Draw)
      awayWin: 2.75, // 2 (MASTER PLAN Win - WON)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.95, // Over 2.5 Goals
      underOdds: 1.80, // Under 2.5 Goals (WON)
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.75,  // GG
      ngOdds: 1.95,  // NG (No Goal - WON)
      homeQualifyOdds: 1.85, // Fuzu: VAMOS
      awayQualifyOdds: 1.85  // Fuzu: MASTER PLAN (QUALIFIED)
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  },
  {
    id: 'efb-qf-4',
    stageName: 'ROBO FAINALI (QF3) • LEG 1',
    scheduledTime: 'FT / FINISHED (Mikondo Miwili)',
    status: 'FT',
    finalScore: {
      homeScore: 1,
      awayScore: 3,
      display: '1 – 3',
      statusText: 'FT: SURANONO alishinda Leg 1 (1–3) na kufuzu Nusu Fainali (Agg: 7–4)',
      winningPicks: [
        '2 (SURANONO)',
        'Over 2.5 Goals',
        'GG (Both Teams Score)',
        'SURANONO (To Qualify)'
      ],
      losingPicks: [
        '1 (GIBWA)',
        'X (Sare / Draw)',
        'Under 2.5 Goals',
        'NG (No Goal / Asifunge)',
        'GIBWA (To Qualify)'
      ]
    },
    player1: {
      name: 'GIBWA',
      tagline: 'Group B Power • Disciplined Defense',
      avatarSeed: 'gibwa',
      groupRecord: 'Group B: 2 Wins, 1 Draw (Ulinzi Imara na Pasi za Uhakika)',
      quarterFinals: 'Robo Fainali: Alifungwa Leg 1 (1-3) nyumbani, alitolewa kwa jumla ya mabao 4-7',
      totalGoals: 11,
      playStyle: 'Disciplined Low Block, Midfield Density & Clinical Counter Strikes',
      winProbability: 42,
      recentForm: ['W', 'D', 'W', 'L', 'D']
    },
    player2: {
      name: 'SURANONO',
      tagline: 'Unstoppable Strike Force • Semi-Finalist Qualifier',
      avatarSeed: 'suranono',
      groupRecord: 'Alipanda kwa kasi mwisho wa makundi na kushinda mtoano wa Mchujo (Playoff)',
      quarterFinals: 'Robo Fainali: Ushindi wa ugenini 1-3 Leg 1 na kufuzu Nusu Fainali (Agg: 7-4) 🟢',
      totalGoals: 13,
      playStyle: 'Fearless Direct Runs, Long-Distance Shots & Resilient Fighting Spirit',
      winProbability: 31,
      recentForm: ['L', 'W', 'W', 'W', 'D']
    },
    traderAnalysis: 'MATOKEO RASMI YA FT: SURANONO aliendelea na moto wake wa ushindi akifunga mabao 3 ugenini (1-3). Kwa matokeo ya jumla (Agg 7-4), SURANONO amefuzu rasmi Nusu Fainali!',
    keyStats: [
      'Matokeo ya Leg 1: GIBWA 1 – 3 SURANONO (Mshindi: SURANONO @ 3.00)',
      'Over/Under 2.5: Over 2.5 Goals Ilishinda (Mabao 4 > 2.5 @ 1.85)',
      'Both Teams To Score: GG Ilishinda (Wote walifunga 1-3 @ 1.70)',
      'Fuzu Nusu Fainali: SURANONO Amefuzu (Agg: 7-4 @ 2.05)'
    ],
    odds: {
      homeWin: 2.20, // 1 (GIBWA Win)
      draw: 3.20,    // X (Draw)
      awayWin: 3.00, // 2 (SURANONO Win - WON)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.85, // Over 2.5 Goals (WON)
      underOdds: 1.85, // Under 2.5 Goals
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.70,  // GG (Both Teams to Score - WON)
      ngOdds: 2.05,  // NG (No Goal)
      homeQualifyOdds: 1.70, // Fuzu: GIBWA
      awayQualifyOdds: 2.05  // Fuzu: SURANONO (QUALIFIED)
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  },
  {
    id: 'efb-qf-3',
    stageName: 'ROBO FAINALI (QF4) • LEG 1 & 2',
    scheduledTime: 'FT / FINISHED (Mikondo Miwili)',
    status: 'FT',
    finalScore: {
      homeScore: 2,
      awayScore: 2,
      display: '2 – 2 (Leg 1) | 5 – 4 (Leg 2)',
      statusText: 'FT: Leg 1 (2–2), Leg 2 (5–4). Jumla (Agg: 7–6). ISAAC17 amefuzu Nusu Fainali! 🟢',
      winningPicks: [
        'X (Sare / Draw)',
        'Over 2.5 Goals',
        'GG (Both Teams Score)',
        'ISAAC17 (To Qualify)'
      ],
      losingPicks: [
        '1 (ISAAC17)',
        '2 (BENFICA)',
        'Under 2.5 Goals',
        'NG (No Goal / Asifunge)',
        'BENFICA (To Qualify)'
      ]
    },
    player1: {
      name: 'ISAAC17',
      tagline: 'Master Tactician • Semi-Finalist Qualifier',
      avatarSeed: 'isaac17',
      groupRecord: 'Best Loser Qualifier • Ushindi wa Kihistoria Robo Fainali',
      quarterFinals: 'Robo Fainali: Sare 2-2 Leg 1, Ushindi 5-4 Leg 2. Amefuzu Nusu Fainali (Agg: 7-6) 🟢',
      totalGoals: 24,
      playStyle: 'Possession Control, Tiki-Taka Combinations & Set-Piece Precision',
      winProbability: 50,
      recentForm: ['W', 'W', 'D', 'W', 'W']
    },
    player2: {
      name: 'BENFICA',
      tagline: 'Top of Group B • Flying Wings',
      avatarSeed: 'benfica',
      groupRecord: 'Kinara wa Kundi B: 4 Wins, 1 Draw, 1 Loss',
      quarterFinals: 'Robo Fainali: Sare 2-2 Leg 1, Alifungwa 4-5 Leg 2. Alitolewa (Agg: 6-7) 🔴',
      totalGoals: 24,
      playStyle: 'Flying Wings, Rapid Transitions & High-Line Finishing',
      winProbability: 50,
      recentForm: ['W', 'W', 'W', 'D', 'L']
    },
    traderAnalysis: 'MATOKEO RASMI YA FT: Mechi kali ya kusisimua! Leg 1 iliisha 2-2 (Sare, Over 2.5, GG). Leg 2 ISAAC17 alishinda 5-4, na kwa matokeo ya jumla ya mabao 7-6 (Agg 7-6), ISAAC17 amefuzu rasmi Nusu Fainali!',
    keyStats: [
      'Matokeo ya Leg 1: ISAAC17 2 – 2 BENFICA (Mshindi: X Sare @ 3.30)',
      'Matokeo ya Leg 2: ISAAC17 5 – 4 BENFICA (Agg: 7–6)',
      'Over/Under 2.5: Over 2.5 Goals Ilishinda (Mabao 4 > 2.5 @ 1.70)',
      'Both Teams To Score: GG Ilishinda (Timu zote zilifunga 2-2 @ 1.60)',
      'Fuzu Nusu Fainali: ISAAC17 Amefuzu (Agg: 7-6 @ 2.50)'
    ],
    odds: {
      homeWin: 2.90, // 1 (ISAAC17 Win)
      draw: 3.30,    // X (Draw - WON)
      awayWin: 2.15, // 2 (BENFICA Win)
      overUnderLabel: 'Total Goals Over / Under 2.5 (Mabao ya Mechi)',
      overUnderThreshold: 2.5,
      overOdds: 1.70, // Over 2.5 Goals (WON)
      underOdds: 2.00, // Under 2.5 Goals
      bttsLabel: 'Both Teams To Score (GG / NG)',
      ggOdds: 1.60,  // GG (Both Teams to Score - WON)
      ngOdds: 2.20,  // NG (No Goal)
      homeQualifyOdds: 2.50, // Fuzu: ISAAC17 (QUALIFIED - WON)
      awayQualifyOdds: 1.45  // Fuzu: BENFICA
    },
    bookmakerMargin: '12% Bookmaker Margin Included'
  }
];

export const EFOOTBALL_COMPLETED_MATCHES: EFootballMatch[] = [
  ...EFOOTBALL_SEMI_FINALS_DATA,
  ...EFOOTBALL_QUARTER_FINALS_DATA
];

export const EFOOTBALL_ACTIVE_MATCHES: EFootballMatch[] = [
  EFOOTBALL_GRAND_FINAL_2026
];

export const EFOOTBALL_MATCHES: EFootballMatch[] = [
  EFOOTBALL_GRAND_FINAL_2026,
  ...EFOOTBALL_COMPLETED_MATCHES
];

// Backwards compatibility export
export const EFOOTBALL_SEMI_FINALS: EFootballMatch[] = EFOOTBALL_MATCHES;

// Helper to evaluate any selection against official results
export function checkSelectionResult(matchId: string, marketType: string, selection: string): {
  isWin: boolean;
  scoreDisplay: string;
  reason: string;
  isPending?: boolean;
} {
  // 0. GRAND FINAL: ISAAC 4 🆚 6 MAN U (FT - TOURNAMENT FINISHED)
  const isGrandFinal = matchId === 'efb-final-2026' || matchId === 'efb-final-1' || 
    (selection.includes('ISAAC') && selection.includes('MAN U')) ||
    (selection.includes('Trophy') && (selection.includes('ISAAC') || selection.includes('MAN U'))) ||
    ((matchId === 'efb-final-2026' || matchId === 'grand-final') && !selection.includes('BENFICA') && !selection.includes('SURANONO') && !selection.includes('MASTER PLAN'));

  if (isGrandFinal) {
    // 1X2 Full Time Result: Winner is 2 (MAN U Win)
    if (marketType === '1X2') {
      const isWin = selection.startsWith('2') || (selection.includes('MAN U') && !selection.includes('Draw') && !selection.includes('Sare'));
      return {
        isWin,
        scoreDisplay: 'FT: 4 – 6',
        reason: isWin ? '2 (MAN U Win - FT 4:6) 🟢' : 'Losing: FT 4-6 (MAN U Alishinda Fainali) 🔴',
        isPending: false
      };
    }
    // Double Chance: 1X (Loss), X2 (Win), 12 (Win)
    if (marketType === 'DC' || marketType.includes('Double')) {
      const isWin = selection.includes('X2') || selection.includes('12');
      return {
        isWin,
        scoreDisplay: 'FT: 4 – 6',
        reason: isWin ? (selection.includes('X2') ? 'X2 (MAN U or Draw) 🟢' : '12 (Either Team Wins) 🟢') : '1X ilikosa (MAN U Alishinda 4-6) 🔴',
        isPending: false
      };
    }
    // Over / Under 2.5 Goals: Total goals = 10 -> Over 2.5 Won
    if (marketType === 'OU25' || marketType.startsWith('OU') || marketType.includes('Over')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 10 (4-6)',
        reason: isWin ? 'Over 2.5 Goals (Jumla mabao 10 > 2.5) 🟢' : 'Under 2.5 ilikosa (Mabao 10 yamefungwa) 🔴',
        isPending: false
      };
    }
    // Both Teams To Score (GG / NG): 4-6 -> GG Won
    if (marketType === 'BTTS' || marketType.includes('Both')) {
      const isWin = selection.includes('GG') || selection.includes('Yes');
      return {
        isWin,
        scoreDisplay: 'FT: GG (4-6)',
        reason: isWin ? 'GG (Both Teams Scored - 4:6) 🟢' : 'NG ilikosa (Timu zote zilifunga 4-6) 🔴',
        isPending: false
      };
    }
    // To Lift The Trophy: MAN U Won
    if (marketType === 'TROPHY' || marketType === 'QUALIFY' || selection.includes('Trophy') || selection.includes('Ubingwa')) {
      const isWin = selection.includes('MAN U');
      return {
        isWin,
        scoreDisplay: 'FT: 4 – 6 (MAN U Bingwa)',
        reason: isWin ? '👑 MAN U To Lift The Trophy (Mabingwa) 🟢' : 'ISAAC Alishindwa Fainali (Runner Up) 🔴',
        isPending: false
      };
    }
  }

  // 1. QF1: MAN U vs GWACKY55
  // Leg 1 Result: MAN U 1 – 3 GWACKY55
  // Leg 1 Winners: 2 (GWACKY55 Win), Over 2.5 Goals, GG 🟢
  // Overall Qualified Team (Fuzu Nusu Fainali): MAN U (Agg: 6–6, 3rd match: 5–4) 🟢
  const isQF1 = matchId === 'efb-qf-1' || ((selection.includes('MAN U') || selection.includes('GWACKY55')) && !selection.includes('BENFICA') && !selection.includes('SURANONO') && !selection.includes('MASTER PLAN'));
  if (isQF1) {
    if (marketType === '1X2') {
      const isWin = selection.startsWith('2') || selection.includes('GWACKY55');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 3',
        reason: isWin ? '2 (GWACKY55 Win - Leg 1) 🟢' : 'Losing: FT 1-3 (GWACKY55 Won Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 4 (1-3)',
        reason: isWin ? 'Over 2.5 Goals (Mabao 4 > 2.5) 🟢' : 'Under 2.5 Goals ilikosa (Mabao 4) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('GG');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 3 GG',
        reason: isWin ? 'GG (Both Teams Scored - 1:3) 🟢' : 'NG ilikosa (Timu zote zilifunga 1-3) 🔴',
        isPending: false
      };
    }
    if (marketType === 'QUALIFY') {
      const isWin = selection.includes('MAN U');
      return {
        isWin,
        scoreDisplay: 'Fuzu: MAN U (Agg: 6-6, 3rd: 5-4)',
        reason: isWin ? 'MAN U Amefuzu Nusu Fainali (Agg 6-6, Playoff 5-4) 🟢' : 'GWACKY55 Alitolewa Playoff (4-5) 🔴',
        isPending: false
      };
    }
  }

  // 2. QF2: VAMOS vs MASTER PLAN
  // Leg 1 Result: VAMOS 0 – 2 MASTER PLAN
  // Leg 1 Winners: 2 (MASTER PLAN Win), Under 2.5 Goals, NG 🟢
  // Overall Qualified Team (Fuzu Nusu Fainali): MASTER PLAN (Agg: 2–1) 🟢
  const isQF2 = matchId === 'efb-qf-2' || ((selection.includes('VAMOS') || selection.includes('MASTER PLAN')) && !selection.includes('GWACKY55') && !selection.includes('SURANONO') && !selection.includes('BENFICA'));
  if (isQF2) {
    if (marketType === '1X2') {
      const isWin = selection.startsWith('2') || selection.includes('MASTER PLAN');
      return {
        isWin,
        scoreDisplay: 'FT: 0 – 2',
        reason: isWin ? '2 (MASTER PLAN Win - Leg 1) 🟢' : 'Losing: FT 0-2 (MASTER PLAN Won Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Under');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 2 (0-2)',
        reason: isWin ? 'Under 2.5 Goals (Mabao 2 < 2.5) 🟢' : 'Over 2.5 Goals ilikosa (Mabao 2) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('NG') || selection.includes('Asifunge');
      return {
        isWin,
        scoreDisplay: 'FT: 0 – 2 NG',
        reason: isWin ? 'NG (Clean Sheet 0-2 / Asifunge) 🟢' : 'GG ilikosa (VAMOS hakufunga goli) 🔴',
        isPending: false
      };
    }
    if (marketType === 'QUALIFY') {
      const isWin = selection.includes('MASTER PLAN');
      return {
        isWin,
        scoreDisplay: 'Fuzu: MASTER PLAN (Agg: 2-1)',
        reason: isWin ? 'MASTER PLAN Amefuzu Nusu Fainali (Agg 2-1) 🟢' : 'VAMOS Alitolewa (Agg 1-2) 🔴',
        isPending: false
      };
    }
  }

  // 3. QF3: GIBWA vs SURANONO
  // Leg 1 Result: GIBWA 1 – 3 SURANONO
  // Leg 1 Winners: 2 (SURANONO Win), Over 2.5 Goals, GG 🟢
  // Overall Qualified Team (Fuzu Nusu Fainali): SURANONO (Agg: 7–4) 🟢
  const isQF3 = matchId === 'efb-qf-4' || (matchId === 'efb-qf-3' && (selection.includes('GIBWA') || selection.includes('SURANONO'))) || ((selection.includes('GIBWA') || selection.includes('SURANONO')) && !selection.includes('BENFICA') && !selection.includes('ISAAC17') && !selection.includes('MAN U'));
  if (isQF3) {
    if (marketType === '1X2') {
      const isWin = selection.startsWith('2') || selection.includes('SURANONO');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 3',
        reason: isWin ? '2 (SURANONO Win - Leg 1) 🟢' : 'Losing: FT 1-3 (SURANONO Won Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 4 (1-3)',
        reason: isWin ? 'Over 2.5 Goals (Mabao 4 > 2.5) 🟢' : 'Under 2.5 Goals ilikosa (Mabao 4) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('GG');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 3 GG',
        reason: isWin ? 'GG (Both Teams Scored - 1:3) 🟢' : 'NG ilikosa (Timu zote zilifunga 1-3) 🔴',
        isPending: false
      };
    }
    if (marketType === 'QUALIFY') {
      const isWin = selection.includes('SURANONO');
      return {
        isWin,
        scoreDisplay: 'Fuzu: SURANONO (Agg: 7-4)',
        reason: isWin ? 'SURANONO Amefuzu Nusu Fainali (Agg 7-4) 🟢' : 'GIBWA Alitolewa (Agg 4-7) 🔴',
        isPending: false
      };
    }
  }

  // 4. QF4: ISAAC17 vs BENFICA (Archived / Settled)
  // Leg 1 Result: ISAAC17 2 – 2 BENFICA
  // Leg 1 Winning Markets: X (Draw) 🟢, Over 2.5 Goals 🟢, GG 🟢
  // Leg 2 Result: ISAAC17 5 – 4 BENFICA
  // Aggregate Score: ISAAC17 7 – 6 BENFICA
  // Overall Qualified Team (Fuzu Nusu Fainali): ISAAC17 🟢
  const isQF4 = (matchId === 'efb-qf-3' || matchId === 'efb-qf-4' || selection.includes('BENFICA'));
  if (isQF4) {
    if (marketType === '1X2') {
      const isWin = selection.startsWith('X') || selection.toLowerCase().includes('sare') || selection.toLowerCase().includes('draw');
      return {
        isWin,
        scoreDisplay: 'FT: 2 – 2 (Leg 1)',
        reason: isWin ? 'X (Sare / Draw Leg 1 - 2:2) 🟢' : 'Losing: FT 2-2 (Sare Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 4 (2-2)',
        reason: isWin ? 'Over 2.5 Goals (Mabao 4 > 2.5) 🟢' : 'Under 2.5 Goals ilikosa (Mabao 4) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('GG');
      return {
        isWin,
        scoreDisplay: 'FT: 2 – 2 GG',
        reason: isWin ? 'GG (Both Teams Scored - 2:2) 🟢' : 'NG ilikosa (Timu zote zilifunga 2-2) 🔴',
        isPending: false
      };
    }
    if (marketType === 'QUALIFY') {
      const isWin = selection.includes('ISAAC17');
      return {
        isWin,
        scoreDisplay: 'Fuzu: ISAAC17 (Agg: 7-6)',
        reason: isWin ? 'ISAAC17 Amefuzu Nusu Fainali (Agg 7-6) 🟢' : 'BENFICA Alitolewa (Agg 6-7) 🔴',
        isPending: false
      };
    }
  }

  // 5. OFFICIAL SEMI-FINALS (NUSU FAINALI):
  // SF1: MAN U 3 – 1 MASTER PLAN (MR JOKER)
  // SF2: SURANONO 1 – 6 ISAAC17
  // Official Scores & Settlement:
  // - SF1 Winning: 1 (MAN U Win) 🟢, Over 2.5 (Total 4) 🟢, GG (3:1) 🟢 | Losing: 2, X, Under 2.5, NG 🔴
  // - SF2 Winning: 2 (ISAAC17 Win) 🟢, Over 2.5 (Total 7) 🟢, GG (1:6) 🟢 | Losing: 1, X, Under 2.5, NG 🔴
  // - "To Qualify" (Kuingia Fainali) outright bets MUST remain PENDING until Leg 2 aggregate scores!
  const isSF1 = matchId === 'efb-semi-1' || 
    (selection.includes('MASTER PLAN') && !selection.includes('VAMOS')) || 
    (selection.includes('MAN U') && !selection.includes('GWACKY55') && matchId !== 'efb-qf-1');

  const isSF2 = matchId === 'efb-semi-2' || 
    (selection.includes('ISAAC17') && selection.includes('SURANONO')) || 
    (selection.includes('SURANONO') && !selection.includes('GIBWA') && matchId !== 'efb-qf-4') || 
    (selection.includes('ISAAC17') && !selection.includes('BENFICA') && matchId !== 'efb-qf-3');

  if (isSF1) {
    if (marketType === 'QUALIFY' || selection.includes('To Qualify') || selection.includes('Kuingia Fainali') || selection.includes('Fuzu')) {
      return {
        isWin: false,
        scoreDisplay: 'Pending Leg 2',
        reason: 'SF1 To Qualify inasubiri matokeo ya Leg 2 (Aggregate) ⏳',
        isPending: true
      };
    }
    if (marketType === '1X2') {
      const isWin = (selection.startsWith('1') || selection.includes('MAN U')) && !selection.includes('MASTER PLAN') && !selection.toLowerCase().includes('draw') && !selection.toLowerCase().includes('sare');
      return {
        isWin,
        scoreDisplay: 'FT: 3 – 1',
        reason: isWin ? '1 (MAN U Win - 3:1) 🟢' : 'Losing: FT 3-1 (MAN U alishinda Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 4 (3-1)',
        reason: isWin ? 'Over 2.5 Goals (Mabao 4 > 2.5) 🟢' : 'Under 2.5 Goals ilikosa (Mabao 4) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('GG');
      return {
        isWin,
        scoreDisplay: 'FT: 3 – 1 GG',
        reason: isWin ? 'GG (Both Teams Scored - 3:1) 🟢' : 'NG ilikosa (Timu zote zilifunga 3-1) 🔴',
        isPending: false
      };
    }
  }

  if (isSF2) {
    if (marketType === 'QUALIFY' || selection.includes('To Qualify') || selection.includes('Kuingia Fainali') || selection.includes('Fuzu')) {
      return {
        isWin: false,
        scoreDisplay: 'Pending Leg 2',
        reason: 'SF2 To Qualify inasubiri matokeo ya Leg 2 (Aggregate) ⏳',
        isPending: true
      };
    }
    if (marketType === '1X2') {
      const isWin = selection.includes('ISAAC17') && !selection.toLowerCase().includes('draw') && !selection.toLowerCase().includes('sare');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 6',
        reason: isWin ? '2 (ISAAC17 Win - 1:6) 🟢' : 'Losing: FT 1-6 (ISAAC17 alishinda Leg 1) 🔴',
        isPending: false
      };
    }
    if (marketType === 'OU25' || marketType.startsWith('OU')) {
      const isWin = selection.includes('Over');
      return {
        isWin,
        scoreDisplay: 'FT: Mabao 7 (1-6)',
        reason: isWin ? 'Over 2.5 Goals (Mabao 7 > 2.5) 🟢' : 'Under 2.5 Goals ilikosa (Mabao 7) 🔴',
        isPending: false
      };
    }
    if (marketType === 'BTTS') {
      const isWin = selection.includes('GG');
      return {
        isWin,
        scoreDisplay: 'FT: 1 – 6 GG',
        reason: isWin ? 'GG (Both Teams Scored - 1:6) 🟢' : 'NG ilikosa (Timu zote zilifunga 1-6) 🔴',
        isPending: false
      };
    }
  }

  // 3. SPECIAL TOURNAMENT OUTRIGHT MARKETS (SIKU 3 FLAGGED MARKET)
  if (matchId.startsWith('tournament-outright') || marketType.startsWith('OUTRIGHT')) {
    try {
      const settlementStr = typeof window !== 'undefined' ? localStorage.getItem('seijo58_tournament_settlement') : null;
      if (settlementStr) {
        const settlement = JSON.parse(settlementStr);
        if (settlement && settlement.isSettled) {
          if (marketType === 'OUTRIGHT_CHAMPION') {
            const champ = (settlement.champion || '').trim().toUpperCase();
            const pick = selection.trim().toUpperCase();
            const isWin = Boolean(champ && (pick === champ || pick.includes(champ)));
            return {
              isWin,
              scoreDisplay: `👑 Bingwa: ${champ}`,
              reason: isWin 
                ? `👑 Bingwa Rasmi wa Mashindano (${champ}) 🟢` 
                : `Losing: Bingwa rasmi ni ${champ} 🔴`,
              isPending: false
            };
          }
          if (marketType === 'OUTRIGHT_FINALISTS') {
            const f1 = (settlement.finalist1 || '').trim().toUpperCase();
            const f2 = (settlement.finalist2 || '').trim().toUpperCase();
            const pick = selection.trim().toUpperCase();
            const isWin = Boolean(f1 && f2 && pick.includes(f1) && pick.includes(f2));
            return {
              isWin,
              scoreDisplay: `🏁 Wafainali: ${f1} & ${f2}`,
              reason: isWin 
                ? `🏁 Wafainali Sahihi wa Grand Final (${f1} & ${f2}) 🟢` 
                : `Losing: Timu za Fainali ni ${f1} & ${f2} 🔴`,
              isPending: false
            };
          }
        }
      }
    } catch (e) {}

    return {
      isWin: false,
      scoreDisplay: 'Siku 3 Soko ⏳',
      reason: 'Soko la Mashindano • Inasubiri Robo Fainali & Uamuzi Rasmi ⏳',
      isPending: true
    };
  }

  return {
    isWin: false,
    scoreDisplay: 'Inasubiri',
    reason: 'Inasubiri kuanza ⏳',
    isPending: true
  };
}

// Universal dynamic evaluator for any match (preset or created by Admin)
export function evaluateMatchSelection(match: EFootballMatch, marketType: string, selection: string): {
  isWin: boolean;
  scoreDisplay: string;
  reason: string;
  isPending?: boolean;
} {
  if (match.status !== 'FT' || !match.finalScore) {
    return {
      isWin: false,
      scoreDisplay: 'Inasubiri',
      reason: 'Mechi Bado Haijamalizika (Pending) ⏳',
      isPending: true
    };
  }

  const homeScore = match.finalScore.homeScore;
  const awayScore = match.finalScore.awayScore;
  const totalGoals = homeScore + awayScore;
  const bothScored = homeScore > 0 && awayScore > 0;
  const p1Name = match.player1?.name || 'Home';
  const p2Name = match.player2?.name || 'Away';

  if (marketType === '1X2') {
    if (selection.startsWith('1') || selection.includes(p1Name)) {
      const isWin = homeScore > awayScore;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `1 (${p1Name} Win) 🟢` : `Losing: FT ${homeScore}-${awayScore} (${p2Name} Win / Sare) 🔴`
      };
    }
    if (selection.startsWith('X') || selection.includes('Draw') || selection.includes('Sare')) {
      const isWin = homeScore === awayScore;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `X (Draw / Sare) 🟢` : `Losing: FT ${homeScore}-${awayScore} (Hakukuwa na sare) 🔴`
      };
    }
    if (selection.startsWith('2') || selection.includes(p2Name)) {
      const isWin = awayScore > homeScore;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `2 (${p2Name} Win) 🟢` : `Losing: FT ${homeScore}-${awayScore} (${p1Name} Win / Sare) 🔴`
      };
    }
  }

  if (marketType.startsWith('OU')) {
    const threshold = match.odds.overUnderThreshold || 2.5;
    if (selection.includes('Over')) {
      const isWin = totalGoals > threshold;
      return {
        isWin,
        scoreDisplay: `FT: Mabao ${totalGoals}`,
        reason: isWin ? `Over ${threshold} (Mabao ${totalGoals} > ${threshold}) 🟢` : `Under ilishinda (Mabao ${totalGoals} < ${threshold}) 🔴`
      };
    }
    if (selection.includes('Under')) {
      const isWin = totalGoals < threshold;
      return {
        isWin,
        scoreDisplay: `FT: Mabao ${totalGoals}`,
        reason: isWin ? `Under ${threshold} (Mabao ${totalGoals} < ${threshold}) 🟢` : `Over ilishinda (Mabao ${totalGoals} > ${threshold}) 🔴`
      };
    }
  }

  if (marketType === 'BTTS') {
    if (selection.includes('GG')) {
      const isWin = bothScored;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? 'GG (Both Teams Scored) 🟢' : 'NG ilitokea (Timu moja au zote hazikufunga) 🔴'
      };
    }
    if (selection.includes('NG')) {
      const isWin = !bothScored;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? 'NG (Clean Sheet / Hakuna goli pande zote) 🟢' : 'GG ilitokea (Wote walifunga) 🔴'
      };
    }
  }

  if (marketType === 'QUALIFY') {
    if (match.id.includes('semi') || match.stageName.includes('NUSU FAINALI')) {
      return {
        isWin: false,
        scoreDisplay: 'Pending Leg 2',
        reason: 'To Qualify inasubiri matokeo ya Leg 2 (Aggregate) ⏳',
        isPending: true
      };
    }

    if (match.finalScore && match.finalScore.winningPicks) {
      const isWin = match.finalScore.winningPicks.some(p => 
        p.includes(selection) || 
        selection.includes(p) || 
        (selection.includes('MAN U') && p.includes('MAN U')) || 
        (selection.includes('MASTER PLAN') && p.includes('MASTER PLAN')) || 
        (selection.includes('SURANONO') && p.includes('SURANONO'))
      );
      return {
        isWin,
        scoreDisplay: match.finalScore.display || `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `${selection} Amefuzu Nusu Fainali 🟢` : `${selection} Alitolewa Robo Fainali 🔴`,
        isPending: false
      };
    }

    if (selection.includes(p1Name)) {
      const isWin = homeScore > awayScore;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `${p1Name} Amefuzu Nusu Fainali 🟢` : `${p2Name} Amefuzu Nusu Fainali 🔴`,
        isPending: false
      };
    }
    if (selection.includes(p2Name)) {
      const isWin = awayScore > homeScore;
      return {
        isWin,
        scoreDisplay: `FT: ${homeScore} – ${awayScore}`,
        reason: isWin ? `${p2Name} Amefuzu Nusu Fainali 🟢` : `${p1Name} Amefuzu Nusu Fainali 🔴`,
        isPending: false
      };
    }
  }

  // Fallback to static checkSelectionResult
  return checkSelectionResult(match.id, marketType, selection);
}


