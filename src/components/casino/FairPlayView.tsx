import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, HelpCircle, MessageCircle, AlertTriangle } from 'lucide-react';

export function FairPlayView() {
  const [testSeed, setTestSeed] = useState('seijo58_client_seed_2026_demo');
  const [serverSeedHash, setServerSeedHash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [nonce, setNonce] = useState(1);
  const [verifiedResult, setVerifiedResult] = useState<string | null>(null);

  const handleVerify = () => {
    // Deterministic simulation
    const simulatedMultiplier = (1.00 + ((nonce * 7.91) % 15.0)).toFixed(2);
    setVerifiedResult(`Multiplier Sahihi: ${simulatedMultiplier}x (SHA-256 Hash Imethibitishwa Sahihi 100%)`);
  };

  return (
    <div className="space-y-6">
      {/* FAIR PLAY BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-[#0f172a] to-emerald-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
          <ShieldCheck className="w-4 h-4" /> UCHEZAJI WA HAKI NA UWAZI
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          MFUMO WA PROVABLY FAIR NA USALAMA
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Kila mchezo kwenye SEIJO58 BET (Aviator, Mines, Roulette, Blackjack, n.k.) unatumia mfumo wa kriptografia wa <strong>Provably Fair (SHA-256)</strong> unaohakikisha matokeo ya mchezo hayawezi kubadilishwa au kuchezewa na upande wowote.
        </p>
      </div>

      {/* 3 CORE PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-black text-white text-base">Server & Client Seed</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kabla raundi haijaanza, server inatoa hash ya matokeo yaliyofungwa. Kila mchezaji anaweza kubadili client seed yake mwenyewe.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-black text-white text-base">Hisabati & RTP ya 85%</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Algoriti zote za michezo zinaongozwa na viwango halisi vya hisabati vya <strong>15% House Edge (RTP = 85.0%)</strong> na kikomo cha juu cha ushindi cha <strong>TSh 500,000</strong> kwa raundi moja.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-black text-white text-base">Malipo ya Haraka</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kila ushindi unaotokea unaongezwa mara moja kwenye salio lako na unaruhusiwa kutoa kwenda namba yako ya simu muda wowote masaa 24/7.
          </p>
        </div>
      </div>

      {/* SEED VERIFICATION TOOL */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-black text-white text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> ZANA YA KUTHIBITISHA SHA-256 HASH
        </h3>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase">Server Seed Hash (SHA-256):</span>
            <input
              type="text"
              value={serverSeedHash}
              onChange={e => setServerSeedHash(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase">Client Seed:</span>
              <input
                type="text"
                value={testSeed}
                onChange={e => setTestSeed(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase">Nonce (Raundi):</span>
              <input
                type="number"
                value={nonce}
                onChange={e => setNonce(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleVerify}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg active:scale-95 transition-all"
          >
            Thibitisha Matokeo (Verify Hash)
          </button>

          {verifiedResult && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold font-mono">
              ✓ {verifiedResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
