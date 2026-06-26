'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  FileText,
  Lock,
  Download,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Calculator as CalculatorIcon,
  Target,
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card, CardContent } from './components/ui/Card';
import { Progress } from './components/ui/Progress';

// Horizontal drag-scroll helper
import { useRef } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    isDown = true;
    ref.current.classList.add("cursor-grabbing");
    startX = e.pageX - ref.current.offsetLeft;
    scrollLeft = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    isDown = false;
    ref.current.classList.remove("cursor-grabbing");
  };

  const onMouseUp = () => {
    if (!ref.current) return;
    isDown = false;
    ref.current.classList.remove("cursor-grabbing");
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // drag speed multiplier
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
}


interface Lesson {
  title: string;
  duration: string;
  video: string | null; // YouTube IDvideo: 
  thumbnail: string;
  
}

interface DocumentItem {
  name: string;
  file: string;
}

interface Category {
  title: string;
  lessons: Lesson[];
}

interface PayoutScenario {
  index: number;
  totalCost: number;
  netAfterPayout: number;
  netIfFailAfter: number;
}

interface CalcResult {
  evalType: 'one-step' | 'two-step';
  accountSize: number;
  evalCost: number;
  phase1Target: number;
  phase2Target?: number;
  dailyDD: number;
  maxDD: number;

  // Eval settings
  riskPerDayEval: number;
  tradesPerDayEval: number;
  riskPerTradeEval: number;
  maxEvalSLTrades: number;
  perSLProfitEval: number;
  evalFailGrossPersonal: number;
  evalFailNet: number;

  phase1RR: number;
  phase1CostPersonal: number;
  phase2RR?: number;
  phase2CostPersonal?: number;
  costEvalPersonal: number;
  costToFunded: number;

  // Funded settings
  fundedRiskPerDay: number;
  fundedTradesPerDay: number;
  riskPerTradeFunded: number;
  maxFundedSLTrades: number;
  perSLProfitFunded: number;
  fundedFailGrossPersonal: number;
  fundedFailNet: number;
  failFundedProfit: number;

  // Payout / hedge
  payoutTarget: number;
  fundedSplit: number;
  payoutAmount: number;
  payoutRRFunded: number;
  hedgeLossPerPayout: number;
  payoutScenarios: PayoutScenario[];

  // Helper
  hedgePerPercentEval: number;
  hedgePerPercentFunded: number;
}

interface LotResult {
  symbol: string;
  symbolDisplay: string;
  accountSizeProp: number;
  riskPerTradeProp: number;
  slPips: number;
  pipValuePerLot: number;
  riskDollarProp: number;
  lotSizeProp: number;
  hedgePerPercent: number;
  personalGainPerTrade: number;
  lotSizePersonal: number;
  approxMarginUsedPercent?: number;
  personalBalance: number;
  marginProp: number;
  marginPropPercent: number;
  marginPersonalPercent: number;
  marginPersonal: number;
}

const SYMBOL_CONFIG = {
  NAS100: {
    display: 'NAS100 (US Tech 100)',
    type: 'index' as const,
    pipValuePerLot: 0.1, // $1 per point per lot
  },
  US30: {
    display: 'US30 (Dow Jones)',
    type: 'index' as const,
    pipValuePerLot: 0.1,
  },
  SPX500: {
    display: 'SPX500 (S&P 500)',
    type: 'index' as const,
    pipValuePerLot: 0.1,
  },
  XAUUSD: {
    display: 'XAUUSD (Gold)',
    type: 'gold' as const,
    pipValuePerLot: 100, // $1 move = $100 per lot
  },
  EURUSD: {
    display: 'EURUSD',
    type: 'forex' as const,
    pipValuePerLot: 10, // $10 per pip per lot
  },
  GBPUSD: {
    display: 'GBPUSD',
    type: 'forex' as const,
    pipValuePerLot: 10,
  },
} as const;

type SymbolKey = keyof typeof SYMBOL_CONFIG;

export default function TradingCourseApp() {

  // 🎬 Course Categories
  const categories: Category[] = [
  {
    title: 'Category 1: Foundations of Prop Trading',
    lessons: [
      { title: 'The Prop Firm Game — How the System Really Works', duration: '5:00', video: 'pqpsbw2gh3', thumbnail: "/thumbnails/t1.webp" },
      { title: 'The One-Trade Evaluation Pass Method', duration: '5:00', video: 'pqpsbw2gh3', thumbnail: "/thumbnails/t2.webp" },
      { title: 'The Funded Account Hedge System (Payout Engine)', duration: '5:00', video: 'pqpsbw2gh3', thumbnail: "/thumbnails/t3.webp" },
      { title: 'The Hedge Engine — Lot Sizes, Copier Setup & Margin Control', duration: '5:30', video: 'pqpsbw2gh3', thumbnail: "/thumbnails/t4.webp" },
      { title: 'The Ghost Protocol Playbook — Scaling, Ban Avoidance & Mastery', duration: '5:30', video: 'pqpsbw2gh3', thumbnail: "/thumbnails/t5.webp" },
      { title: 'Coming Soon...', duration: '00:00', video: null, thumbnail: "/thumbnails/t6.webp" },
    ],
  },
];


  const documents: DocumentItem[] = [
    { name: 'Hedge Engine Blueprint', file: '/docs/Hedge Engine Blueprint.pdf' },
    { name: 'Prop Ban-Avoidance Playbook (Optional)', file: '/docs/Prop Ban-Avoidance Playbook.pdf' },
    { name: 'Prop Tier-List', file: '/docs/PropTierList.png' },
  ];

  // 🧠 Base App State
  const [activeTab, setActiveTab] = useState<
    'home' | 'lessons' | 'documents' | 'calculator' | 'lot'
  >('home');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, []);
  // Disable right-click globally
  useEffect(() => {
    const disableContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

  const drag = useDragScroll();


  // 🧮 Stable lesson IDs across categories
  const lessonIds: number[][] = categories.map((cat, catIdx) => {
    const start = categories.slice(0, catIdx).reduce((acc, c) => acc + c.lessons.length, 0);
    return cat.lessons.map((_, i) => start + i);
  });
  const totalLessons = lessonIds.flat().length;

  // 🧮 ==== CALCULATOR STATE & LOGIC (hedged prop) ====
  const [evalType, setEvalType] = useState<'one-step' | 'two-step'>('one-step');
  const [accountSizeInput, setAccountSizeInput] = useState<string>('200000');
  const [profitTargetInput, setProfitTargetInput] = useState<string>('10'); // phase 1 %
  const [phase2TargetInput, setPhase2TargetInput] = useState<string>('5'); // phase 2 %
  const [dailyDDInput, setDailyDDInput] = useState<string>('5'); // %
  const [maxDDInput, setMaxDDInput] = useState<string>('10'); // %
  const [evalCostInput, setEvalCostInput] = useState<string>('1000'); // $
  const [riskPerDayEvalInput, setRiskPerDayEvalInput] = useState<string>('2'); // %
  const [tradesPerDayEvalInput, setTradesPerDayEvalInput] = useState<string>('2'); // #
  const [failEvalProfitInput, setFailEvalProfitInput] = useState<string>('1000'); // $
  const [fundedProfitSplitInput, setFundedProfitSplitInput] = useState<string>('90'); // %
  const [failFundedProfitInput, setFailFundedProfitInput] = useState<string>('1000'); // $
  const [payoutTargetInput, setPayoutTargetInput] = useState<string>('5'); // %
  const [fundedRiskPerDayInput, setFundedRiskPerDayInput] = useState<string>('2'); // %
  const [fundedTradesPerDayInput, setFundedTradesPerDayInput] = useState<string>('2'); // #
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

// 🧮 ==== LOT SIZE CALCULATOR STATE ====
const [lotSymbol, setLotSymbol] = useState<SymbolKey>('NAS100');
const [lotAccountSizeProp, setLotAccountSizeProp] = useState<string>('200000');
const [lotRiskPerTradePropInput, setLotRiskPerTradePropInput] = useState<string>('2');
const [lotSLPipsInput, setLotSLPipsInput] = useState<string>('50');
const [lotMaxMarginPercentInput, setLotMaxMarginPercentInput] = useState<string>('30');
const [lotPersonalBalanceInput, setLotPersonalBalanceInput] = useState<string>('10000');
const [lotHedgePerPercentInput, setLotHedgePerPercentInput] = useState<string>('100');
const [lotResult, setLotResult] = useState<LotResult | null>(null);
const [lotPropLeverageInput, setLotPropLeverageInput] = useState<string>('100');
const [lotPersonalLeverageInput, setLotPersonalLeverageInput] = useState<string>('500');
const [lotPriceInput, setLotPriceInput] = useState<string>('2400'); 

  const handleCalculate = () => {
    const accountSize = parseFloat(accountSizeInput) || 0;
    const phase1Target = parseFloat(profitTargetInput) || 0;
    const phase2Target = parseFloat(phase2TargetInput) || 0;
    const dailyDD = parseFloat(dailyDDInput) || 0;
    const maxDD = parseFloat(maxDDInput) || 0;
    const evalCost = parseFloat(evalCostInput) || 0;
    const riskPerDayEvalRaw = parseFloat(riskPerDayEvalInput) || 0;
    const tradesPerDayEval = Math.max(parseFloat(tradesPerDayEvalInput) || 1, 1);
    const failEvalProfit = parseFloat(failEvalProfitInput) || 0;
    const fundedSplit = parseFloat(fundedProfitSplitInput) || 0;
    const failFundedProfit = parseFloat(failFundedProfitInput) || 0;
    const payoutTarget = parseFloat(payoutTargetInput) || 0;
    const fundedRiskPerDay = parseFloat(fundedRiskPerDayInput) || 0;
    const fundedTradesPerDay = Math.max(parseFloat(fundedTradesPerDayInput) || 1, 1);

    if (!accountSize || !dailyDD || !maxDD) {
      setCalcResult(null);
      return;
    }

    // Clamp eval risk per day to daily DD (safety)
    const riskPerDayEval = Math.min(riskPerDayEvalRaw, dailyDD);
    const riskPerTradeEval = riskPerDayEval / tradesPerDayEval;

    const maxEvalSLTrades =
      riskPerTradeEval > 0 ? Math.floor(maxDD / riskPerTradeEval) : 0;

    // Hedge per 1% loss on eval: aims to cover evalCost + failEvalProfit over full maxDD
    const hedgePerPercentEval =
      maxDD > 0 ? (evalCost + failEvalProfit) / maxDD : 0;

    const perSLProfitEval = hedgePerPercentEval * riskPerTradeEval;
    const evalFailGrossPersonal = perSLProfitEval * maxEvalSLTrades;
    const evalFailNet = evalFailGrossPersonal - evalCost;

    const phase1RR = riskPerTradeEval > 0 ? phase1Target / riskPerTradeEval : 0;
    const phase1CostPersonal = perSLProfitEval * phase1RR;

    let phase2RR: number | undefined;
    let phase2CostPersonal: number | undefined;

    if (evalType === 'two-step') {
      phase2RR = riskPerTradeEval > 0 ? phase2Target / riskPerTradeEval : 0;
      phase2CostPersonal = perSLProfitEval * phase2RR;
    }

    const costEvalPersonal =
      phase1CostPersonal + (phase2CostPersonal ?? 0);

    const costToFunded = costEvalPersonal + evalCost;

    // ==== Funded stage ====
    const riskPerTradeFunded = fundedRiskPerDay / fundedTradesPerDay;
    const maxFundedSLTrades =
      riskPerTradeFunded > 0 ? Math.floor(maxDD / riskPerTradeFunded) : 0;

    // Hedge per 1% on funded: aim to recover costToFunded + failFundedProfit if maxDD hit
    const hedgePerPercentFunded =
      maxDD > 0 ? (costToFunded + failFundedProfit) / maxDD : 0;

    const perSLProfitFunded = hedgePerPercentFunded * riskPerTradeFunded;
    const fundedFailGrossPersonal = perSLProfitFunded * maxFundedSLTrades;
    const fundedFailNet = fundedFailGrossPersonal - costToFunded;

    // Payout characteristics
    const payoutAmount =
      accountSize * (payoutTarget / 100) * (fundedSplit / 100);
    const payoutRRFunded =
      riskPerTradeFunded > 0 ? payoutTarget / riskPerTradeFunded : 0;
    const hedgeLossPerPayout = perSLProfitFunded * payoutRRFunded;

    // Payout loop until things stabilise
    const payoutScenarios: PayoutScenario[] = [];
    let carryCost = costToFunded; // "debt" from evaluation & getting funded
    let prevNetAfter: number | null = null;
    let prevNetFailAfter: number | null = null;

    const MAX_PAYOUT_ITERS = 10;

    for (let i = 1; i <= MAX_PAYOUT_ITERS; i++) {
      const totalCostThis = carryCost + hedgeLossPerPayout;
      const netAfterPayout = payoutAmount - totalCostThis;
      const netIfFailAfter = netAfterPayout + fundedFailNet;

      payoutScenarios.push({
        index: i,
        totalCost: totalCostThis,
        netAfterPayout,
        netIfFailAfter,
      });

      // Update carry cost: if still negative, carry forward; if positive, reset to 0
      carryCost = netAfterPayout < 0 ? -netAfterPayout : 0;

      if (prevNetAfter !== null && prevNetFailAfter !== null) {
        const stableAfter =
          Math.abs(netAfterPayout - prevNetAfter) < 1 &&
          Math.abs(netIfFailAfter - prevNetFailAfter) < 1 &&
          carryCost < 1;
        if (stableAfter) break;
      }

      prevNetAfter = netAfterPayout;
      prevNetFailAfter = netIfFailAfter;
    }

    setCalcResult({
      evalType,
      accountSize,
      evalCost,
      phase1Target,
      phase2Target: evalType === 'two-step' ? phase2Target : undefined,
      dailyDD,
      maxDD,

      riskPerDayEval,
      tradesPerDayEval,
      riskPerTradeEval,
      maxEvalSLTrades,
      perSLProfitEval,
      evalFailGrossPersonal,
      evalFailNet,

      phase1RR,
      phase1CostPersonal,
      phase2RR,
      phase2CostPersonal,
      costEvalPersonal,
      costToFunded,

      fundedRiskPerDay,
      fundedTradesPerDay,
      riskPerTradeFunded,
      maxFundedSLTrades,
      perSLProfitFunded,
      fundedFailGrossPersonal,
      fundedFailNet,
      failFundedProfit,

      payoutTarget,
      fundedSplit,
      payoutAmount,
      payoutRRFunded,
      hedgeLossPerPayout,
      payoutScenarios,

      hedgePerPercentEval,
      hedgePerPercentFunded,
    });
  };

  const handleLotCalculate = () => {
    const cfg = SYMBOL_CONFIG[lotSymbol];

    const accountSizeProp = parseFloat(lotAccountSizeProp) || 0;
    const riskPerTradeProp = parseFloat(lotRiskPerTradePropInput) || 0;
    const slPips = parseFloat(lotSLPipsInput) || 0;
    const hedgePerPercent = parseFloat(lotHedgePerPercentInput) || 0;
    const maxMarginPercent = parseFloat(lotMaxMarginPercentInput) || 0;
    const maxDD = parseFloat(maxDDInput) || 0; // reuse from main calc for approx margin

    if (!accountSizeProp || !riskPerTradeProp || !slPips || !cfg) {
      setLotResult(null);
      return;
    }

    const pipValuePerLot = cfg.pipValuePerLot;
    const riskDollarProp = (riskPerTradeProp / 100) * accountSizeProp;
    const lotSizeProp =
      pipValuePerLot > 0 && slPips > 0
        ? riskDollarProp / (pipValuePerLot * slPips)
        : 0;

    // personal target per trade based on "dollars per 1% prop loss"
    const personalGainPerTrade = hedgePerPercent * riskPerTradeProp;
    const lotSizePersonal =
      pipValuePerLot > 0 && slPips > 0
        ? personalGainPerTrade / (pipValuePerLot * slPips)
        : 0;



    const propLev = parseFloat(lotPropLeverageInput) || 100;
    const personalLev = parseFloat(lotPersonalLeverageInput) || 500;

    // notional value of 1 lot (approx)
    // indices/crypto/gold -> $1 per point × contract size defined above
    // FX -> assume pipValuePerLot * 10000 gives contract size
    // ✔ FIXED — Contract value per lot
    // ✔ FIXED — Contract value per 1 lot
    const price = parseFloat(lotPriceInput) || 0;
    let contractValuePerLot = 100000; // fallback

    if (cfg.type === 'forex') {
      contractValuePerLot = 135000; // standard FX lot
    }

    if (cfg.type === 'gold') {
      // 1 lot = 100 oz
      contractValuePerLot = price * 100;
    }

    if (cfg.type === 'index') {
      // 1 lot = $1 per point × index price
      contractValuePerLot = price * 1;
    }


    // compute margin
    const marginProp =
      (contractValuePerLot * lotSizeProp) / propLev;

    const approxMarginUsedPercent = (marginProp / accountSizeProp) * 100;

    const marginPersonal =
      (contractValuePerLot * lotSizePersonal) / personalLev;

    const marginPropPercent = (marginProp / accountSizeProp) * 100;
    const marginPersonalPercent =
      (marginPersonal / (parseFloat(lotPersonalBalanceInput) || 1)) * 100;

    setLotResult({
      symbol: lotSymbol,
      symbolDisplay: cfg.display,
      accountSizeProp,
      personalBalance: parseFloat(lotPersonalBalanceInput) || 0,   // <-- REQUIRED
      riskPerTradeProp,
      riskDollarProp,
      slPips,
      pipValuePerLot,
      lotSizeProp,
      marginProp,
      marginPropPercent,
      hedgePerPercent: hedgePerPercent,
      personalGainPerTrade,
      lotSizePersonal,
      marginPersonal,
      marginPersonalPercent,
      approxMarginUsedPercent,
    });

  };

  // 📈 Load/save progress
  useEffect(() => {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedLessons(parsed.completedLessons || []);
        setProgress(parsed.progress || 0);
      } catch {
        localStorage.removeItem('courseProgress');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('courseProgress', JSON.stringify({ completedLessons, progress }));
  }, [completedLessons, progress]);

  const markComplete = useCallback(
    (id: number) => {
      setCompletedLessons((prev) => {
        if (prev.includes(id)) return prev;
        const updated = [...prev, id].sort((a, b) => a - b);
        const percent = Math.round((updated.length / totalLessons) * 100);
        setProgress(percent);
        return updated;
      });
    },
    [totalLessons]
  );

  // 🔒 Category locking (only categories are locked, not individual lessons)
  const isCategoryLocked = (catIndex: number): boolean => {
    if (catIndex === 0) return false;
    const prevIds = lessonIds[catIndex - 1];
    return !prevIds.every((id) => completedLessons.includes(id));
  };

  // ✅ Main Course App
  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {/* DARK OVERLAY (click outside closes sidebar) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}

        {sidebarOpen && (
          <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            className="
              fixed top-0 left-0 
              h-full w-64 
              bg-black border-r border-zinc-800 
              z-50 shadow-xl
              flex flex-col justify-between
            "

          >
            <div>
              <div className="w-full flex flex-col items-center justify-center px-6 mb-6">
                <img
                  src="/favicon.ico"   // <-- Replace with your logo file
                  alt="Prop Accelerator Logo"
                  className="w-16 h-16 object-contain mb-2"
                />

                <span className="text-lg font-semibold tracking-tight text-center">
                  PROP ACCELERATOR
                </span>
              </div>

              {/* Nav */}
              <div className="flex flex-col space-y-1 mt-2 px-2">
                <SidebarItem
                  icon={<Home size={20} />}
                  label="Home"
                  active={activeTab === 'home'}
                  onClick={() => setActiveTab('home')}
                />
                <SidebarItem
                  icon={<BookOpen size={20} />}
                  label="Lessons"
                  active={activeTab === 'lessons'}
                  onClick={() => setActiveTab('lessons')}
                />
                <SidebarItem
                  icon={<FileText size={20} />}
                  label="Documents"
                  active={activeTab === 'documents'}
                  onClick={() => setActiveTab('documents')}
                />
                <SidebarItem
                  icon={<CalculatorIcon size={20} />}
                  label="Calculator"
                  active={activeTab === 'calculator'}
                  onClick={() => setActiveTab('calculator')}
                />
                <SidebarItem
                  icon={<Target size={20} />}
                  label="Lot Size"
                  active={activeTab === 'lot'}
                  onClick={() => setActiveTab('lot')}
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-zinc-500 text-xs px-2">
              <p className="text-center text-zinc-600 mt-2">*Information For <br />Educational Purposes Only</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HAMBURGER BUTTON (opens sidebar) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 right-4 z-40 p-2 bg-zinc-900/80 rounded-lg border border-zinc-700"
        >
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      )}



      {/* Main Content */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="flex-1 px-4 py-6 sm:p-8 overflow-y-auto h-full mt-2 sm:mt-6"
      >
        {/* 🏠 HOME */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-start w-full space-y-8 px-2 sm:px-0">
            <div className="text-center max-w-3xl">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-3">
                You Are Now Inside The <span className="text-red-400">System…</span>
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                This method is engineered for <span className="text-red-400 font-semibold">mathematical certainty</span>, 
                not luck. You are now inside <span className="text-red-400 font-semibold">Prop Accelerator</span> — follow the 
                sequence precisely.
              </p>
            </div>

            {/* 🎬 Sleek Intro Video */}
            <div className="relative w-full max-w-4xl px-2">

              {/* BIG RED GLOW BEHIND (no negative z-index) */}
              <div
                className="
                  pointer-events-none
                  absolute inset-0
                  scale-100
                  
                  opacity-50
                  rounded-3xl
                  z-0
                "
              />

              {/* Video Wrapper is above the glow */}
              <div className="relative z-10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <WistiaPlayer hashedId="pqpsbw2gh3" />
              </div>
            </div>
          </div>
        )}

        {/* 📱 Telegram Join Buttons */}
        {activeTab === 'home' && (
        <div className="flex flex-col items-center justify-start w-full space-y-8">

          {/* ⭐⭐⭐ PUT TELEGRAM BUTTONS HERE ⭐⭐⭐ */}
          <div className="mt-10 flex flex-col items-center justify-center w-full">
            <p className="text-zinc-400 text-sm mb-4 text-center">
              Community is part of the edge — get inside.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-4">


              <a
                href="https://t.me/YOUR_TESTIMONIAL_CHANNEL"
                className="px-6 py-3 rounded-xl bg-zinc-600/90 hover:bg-zinc-500 
                transition-all text-white text-sm font-semibold shadow-md 
                hover:shadow-zinc-600/30 border border-zinc-400/30 
                w-full sm:w-auto text-center"
              >
                ⭐ Testimonials Channel
              </a>

              <a
                href="https://t.me/YOUR_FREE_GROUP_CHAT"
                className="px-6 py-3 rounded-xl bg-zinc-600/90 hover:bg-zinc-500 
                transition-all text-white text-sm font-semibold shadow-md 
                hover:shadow-zinc-600/30 border border-zinc-400/30 
                w-full sm:w-auto text-center"
              >
                💬 Student Group Chat
              </a>

            </div>
          </div>
          {/* ⭐⭐⭐ END TELEGRAM SECTION ⭐⭐⭐ */}

        </div>
      )}



        {/* 📚 LESSONS */}
        {activeTab === 'lessons' && (
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Prop Accelerator — Training Modules
            </h2>
            <p className="text-zinc-400 mb-6 text-center max-w-xl mx-auto">
              Swipe horizontally through the modules. Click any card to open the video.
            </p>

            {/* Progress */}
            <div className="max-w-xl mx-auto mb-8">
              <Progress value={progress} />
              <p className="text-sm text-zinc-500 mt-1 text-center">
                {progress}% completed
              </p>
            </div>

            {/* Horizontal Scroll */}
            <div
              ref={drag.ref}
              onMouseDown={drag.onMouseDown}
              onMouseLeave={drag.onMouseLeave}
              onMouseUp={drag.onMouseUp}
              onMouseMove={drag.onMouseMove}
              className="w-full overflow-x-auto overflow-y-visible pb-4 px-4 pt-2 hide-scroll cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`
                .hide-scroll::-webkit-scrollbar { display: none; }
              `}</style>

              <div className="flex gap-6 px-2 overflow-visible snap-x snap-mandatory">
                {categories.flatMap((cat, catIndex) =>
                  cat.lessons.map((lesson, lessonIndex) => {
                    const id = lessonIds[catIndex][lessonIndex];
                    const completed = completedLessons.includes(id);

                    return (
                      <div
                        key={id}
                        className="
                          relative
                          min-w-[260px] sm:min-w-[300px]
                          max-w-[260px] sm:max-w-[300px]
                          h-[480px] sm:h-[560px]
                          bg-zinc-900 
                          border border-zinc-800 
                          rounded-2xl 
                          shadow-xl 
                          cursor-pointer 
                          group
                          hover:scale-[1.03] 
                          active:scale-[0.97] 
                          transition-transform
                          flex flex-col
                          overflow-visible
                          hover:z-10
                        "
                        onClick={() => {
                          if (lesson.video) setActiveVideo(id);
                        }}
                      >
                        {/* 📸 Cinematic Thumbnail */}
                        <div className="relative h-[68%] w-full overflow-hidden rounded-t-2xl">
                          <img
                            src={lesson.thumbnail}
                            className="h-full w-full object-cover transform group-hover:scale-105 transition-all duration-500 opacity-90"
                            alt={lesson.title}
                          />

                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

                          {/* Centered play button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="
                                snap-start
                                bg-white/10 
                                backdrop-blur-sm 
                                rounded-full 
                                p-4 
                                border border-white/20 
                                group-hover:bg-white/20 
                                transition
                              "
                            >
                              <PlayCircle size={42} className="text-white opacity-90" />
                            </div>
                          </div>
                        </div>

                        {/* 📄 Text Section */}
                        <div className="h-[32%] flex flex-col justify-between p-4">
                          <div>
                            <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                              {lesson.title}
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1">
                              Duration: {lesson.duration}
                            </p>
                          </div>

                          {completed && (
                            <p className="text-green-400 text-sm font-semibold mt-2">
                              ✓ Completed
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
              {activeVideo !== null && (
                <motion.div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="w-full max-w-4xl bg-zinc-950 rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="flex justify-end p-3 border-b border-zinc-800">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveVideo(null)}
                        className="text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        ✖
                      </motion.button>
                    </div>

                    <div className="relative w-full">
                      {(() => {
                        const lesson = categories.flatMap(c => c.lessons)[activeVideo];
                        const videoId = lesson.video;

                        if (!videoId) {
                          return (
                            <div className="p-12 text-center text-zinc-300">
                              <p>No video available for this module yet.</p>
                            </div>
                          );
                        }

                        return (
                          <WistiaPlayer hashedId={videoId} onComplete={() => markComplete(activeVideo)} />
                        );
                      })()}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}


        {/* 📄 DOCUMENTS */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Documents</h2>
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const active = activeDocIndex === index;
                const isImage = doc.file.toLowerCase().endsWith('.png');
                return (
                  <Card key={index} className="bg-zinc-900 border border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{doc.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => setActiveDocIndex(active ? null : index)}
                          >
                            {active ? 'Close' : 'Preview'}
                          </Button>
                          <a href={doc.file} download>
                            <Button
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Download size={14} /> Download
                            </Button>
                          </a>
                        </div>
                      </div>
                      {active && (
                        <div className="mt-4 rounded-lg overflow-hidden">
                          {isImage ? (
                            <img
                              src={doc.file}
                              alt={doc.name}
                              className="w-full h-[500px] object-contain bg-black"
                            />
                          ) : (
                            <iframe
                              src={doc.file}
                              className="w-full h-[500px]"
                              title={doc.name}
                            ></iframe>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 🧮 HEDGED PROP CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Hedged Prop Calculator</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Rough baseline numbers for hedging a prop evaluation with a personal account.{' '}
              <span className="text-red-400 font-semibold">
                Educational use only – not financial advice.
              </span>
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border border-zinc-800 md:col-span-2">
                <CardContent className="p-4 space-y-4">
                  {/* Eval type */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm text-zinc-400">Evaluation type</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEvalType('one-step')}
                        className={`px-3 py-1 text-sm rounded border ${
                          evalType === 'one-step'
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        1-step
                      </button>
                      <button
                        onClick={() => setEvalType('two-step')}
                        className={`px-3 py-1 text-sm rounded border ${
                          evalType === 'two-step'
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-zinc-900 border-zinc-700'
                        }`}
                      >
                        2-step
                      </button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Account size (prop)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={accountSizeInput}
                        onChange={(e) => setAccountSizeInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Eval cost ($)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={evalCostInput}
                        onChange={(e) => setEvalCostInput(e.target.value)}
                      />
                    </div>

                    {/* Phase targets */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Phase 1 target (%)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={profitTargetInput}
                        onChange={(e) => setProfitTargetInput(e.target.value)}
                      />
                    </div>

                    {evalType === 'two-step' && (
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">
                          Phase 2 target (%)
                        </label>
                        <input
                          type="number"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                          value={phase2TargetInput}
                          onChange={(e) => setPhase2TargetInput(e.target.value)}
                        />
                      </div>
                    )}

                    {/* DDs */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Daily DD (%)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={dailyDDInput}
                        onChange={(e) => setDailyDDInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Max DD (%)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={maxDDInput}
                        onChange={(e) => setMaxDDInput(e.target.value)}
                      />
                    </div>

                    {/* Eval risk profile */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Risk per day on prop (evaluation) %
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={riskPerDayEvalInput}
                        onChange={(e) => setRiskPerDayEvalInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Must be ≤ Daily DD. This is the total risk per day during the evaluation
                        (before splitting into trades).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Trades per day (evaluation)
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={tradesPerDayEvalInput}
                        onChange={(e) => setTradesPerDayEvalInput(e.target.value)}
                      />
                    </div>

                    {/* Profit on fails */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Profit on fail (eval) – personal ($)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={failEvalProfitInput}
                        onChange={(e) => setFailEvalProfitInput(e.target.value)}
                      />
                    </div>

                    {/* Funded settings */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Profit split on funded (%)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={fundedProfitSplitInput}
                        onChange={(e) => setFundedProfitSplitInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Profit on fail (funded) – personal ($)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={failFundedProfitInput}
                        onChange={(e) => setFailFundedProfitInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Payout target on funded (%)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={payoutTargetInput}
                        onChange={(e) => setPayoutTargetInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Risk per day on prop (funded) %
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={fundedRiskPerDayInput}
                        onChange={(e) => setFundedRiskPerDayInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Trades per day (funded)
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={fundedTradesPerDayInput}
                        onChange={(e) => setFundedTradesPerDayInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="mt-2"
                    onClick={handleCalculate}
                  >
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {calcResult && (
                <Card className="bg-zinc-900 border border-zinc-800 md:col-span-2">
                  <CardContent className="p-4 space-y-4 text-sm leading-relaxed">
                    <h3 className="font-semibold text-lg mb-1">Full Breakdown</h3>

                    {/* ==== EVAL FAIL ==== */}
                    <section className="space-y-2">
                      <p className="font-semibold text-yellow-300">
                        IF EVALUATION FAILS:
                      </p>
                      <p className="text-zinc-300">
                        You risk approximately{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.riskPerTradeEval.toFixed(2)}% per trade
                        </span>{' '}
                        on the prop side, with up to{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.tradesPerDayEval}
                        </span>{' '}
                        trade(s) per day.
                      </p>
                      <p className="text-zinc-300">
                        You can roughly take{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.maxEvalSLTrades}
                        </span>{' '}
                        full SL trade(s) before hitting the{' '}
                        <span className="font-bold text-red-400">
                          {calcResult.maxDD.toFixed(2)}% max DD
                        </span>
                        .
                      </p>

                      {/* Day-by-day eval fail */}
                      <div className="mt-2 space-y-1">
                        {renderDayByDay(
                          calcResult.maxEvalSLTrades,
                          calcResult.tradesPerDayEval,
                          calcResult.perSLProfitEval,
                          'evaluation hedge'
                        )}
                      </div>

                      <p className="mt-2 text-zinc-300">
                        ------------------------------
                        <br />
                        Personal net profit ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.evalFailGrossPersonal).toLocaleString()}
                        </span>{' '}
                        −{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.evalCost).toLocaleString()}
                        </span>{' '}
                        (challenge cost)
                        <br />
                        ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.evalFailNet).toLocaleString()}
                        </span>{' '}
                        overall after a failed evaluation.
                      </p>
                    </section>

                    {/* ==== EVAL PASS → FUNDED ==== */}
                    <section className="space-y-2 mt-4">
                      <p className="font-semibold text-yellow-300">
                        IF EVALUATION PASSES → FUNDED STAGE:
                      </p>
                      <p className="text-zinc-300">
                        Phase 1 target:{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.phase1Target.toFixed(2)}%
                        </span>{' '}
                        in one trade →{' '}
                        <span className="font-bold text-blue-400">
                          ~{calcResult.phase1RR.toFixed(2)}R
                        </span>{' '}
                        (with {calcResult.riskPerTradeEval.toFixed(2)}% risk).
                      </p>

                      {calcResult.evalType === 'two-step' && calcResult.phase2RR !== undefined && (
                        <p className="text-zinc-300">
                          Phase 2 target:{' '}
                          <span className="font-bold text-blue-400">
                            {calcResult.phase2Target?.toFixed(2)}%
                          </span>{' '}
                          in one trade →{' '}
                          <span className="font-bold text-blue-400">
                            ~{calcResult.phase2RR.toFixed(2)}R
                          </span>
                          .
                        </p>
                      )}

                      <p className="text-zinc-300">
                        Personal cost if the evaluation is passed in one trade per phase:
                        <br />
                        Phase 1 ≈{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.phase1CostPersonal).toLocaleString()}
                        </span>
                        {calcResult.evalType === 'two-step' &&
                          calcResult.phase2CostPersonal !== undefined && (
                            <>
                              <br />
                              Phase 2 ≈{' '}
                              <span className="font-bold text-red-400">
                                ${Math.round(calcResult.phase2CostPersonal).toLocaleString()}
                              </span>
                            </>
                          )}
                        <br />
                        Total personal cost to pass the evaluation ≈{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.costEvalPersonal).toLocaleString()}
                        </span>
                        .
                      </p>

                      <p className="text-zinc-300">
                        Including the evaluation fee{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.evalCost).toLocaleString()}
                        </span>
                        , the{' '}
                        <span className="font-bold text-blue-400">cost to get funded</span>{' '}
                        is roughly{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.costToFunded).toLocaleString()}
                        </span>
                        .
                      </p>
                    </section>

                    {/* ==== FUNDED FAIL BEFORE ANY PAYOUTS ==== */}
                    <section className="space-y-2 mt-4">
                      <p className="font-semibold text-yellow-300">
                        IF FUNDED ACCOUNT FAILS{' '}
                        <span className="text-xs">(before any payouts)</span>:
                      </p>
                      <p className="text-zinc-300">
                        On the funded stage, the hedge is sized so that if the funded account
                        hits the{' '}
                        <span className="font-bold text-red-400">
                          {calcResult.maxDD.toFixed(2)}% max drawdown
                        </span>
                        , your personal account is targeting to recover:
                      </p>
                      <ul className="list-disc list-inside text-zinc-300">
                        <li>
                          The full{' '}
                          <span className="font-bold text-blue-400">cost to get funded</span>{' '}
                          (~
                          <span className="font-bold text-red-400">
                            ${Math.round(calcResult.costToFunded).toLocaleString()}
                          </span>
                          )
                        </li>
                        <li>
                          Plus{' '}
                          <span className="font-bold text-green-400">
                            ${Math.round(calcResult.failFundedProfit).toLocaleString()}
                          </span>{' '}
                          extra profit on a funded fail.
                        </li>
                      </ul>

                      <p className="text-zinc-300">
                        Each full SL on the funded prop (
                        <span className="font-bold text-blue-400">
                          {calcResult.riskPerTradeFunded.toFixed(2)}% risk
                        </span>
                        ) gives you about{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.perSLProfitFunded).toLocaleString()}
                        </span>{' '}
                        on the personal account.
                      </p>

                      <p className="text-zinc-300">
                        You can roughly take{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.maxFundedSLTrades}
                        </span>{' '}
                        SL trade(s) before hitting the funded max DD.
                      </p>

                      <div className="mt-2 space-y-1">
                        {renderDayByDay(
                          calcResult.maxFundedSLTrades,
                          calcResult.fundedTradesPerDay,
                          calcResult.perSLProfitFunded,
                          'funded hedge'
                        )}
                      </div>

                      <p className="mt-2 text-zinc-300">
                        ------------------------------
                        <br />
                        Personal net profit on this funded-fail cycle ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.fundedFailGrossPersonal).toLocaleString()}
                        </span>{' '}
                        total on personal −{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.costToFunded).toLocaleString()}
                        </span>{' '}
                        cost to get funded
                        <br />
                        ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.fundedFailNet).toLocaleString()}
                        </span>{' '}
                        overall after a funded fail (before any payouts).
                      </p>
                    </section>

                    {/* ==== FUNDED PAYOUTS & FAIL AFTER PAYOUT ==== */}
                    <section className="space-y-2 mt-4">
                      <p className="font-semibold text-yellow-300">
                        IF FUNDED PAYOUTS HIT:
                      </p>
                      <p className="text-zinc-300">
                        Funded payout target:{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.payoutTarget.toFixed(2)}% of $
                          {calcResult.accountSize.toLocaleString()}
                        </span>{' '}
                        with a{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.fundedSplit.toFixed(2)}%
                        </span>{' '}
                        profit split.
                      </p>
                      <p className="text-zinc-300">
                        Each payout ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(calcResult.payoutAmount).toLocaleString()}
                        </span>{' '}
                        from the prop.
                      </p>
                      <p className="text-zinc-300">
                        The payout trade on the personal account is sized at roughly{' '}
                        <span className="font-bold text-blue-400">
                          {calcResult.payoutRRFunded.toFixed(2)}R
                        </span>{' '}
                        (funded stage), so if TP hits on prop, you lose about{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}
                        </span>{' '}
                        on the personal side.
                      </p>

                      {calcResult.payoutScenarios.map((scenario, idx) => (
                        <div key={scenario.index} className="mt-3 space-y-1">
                          <p className="font-semibold text-zinc-200">
                            IF FUNDED PAYOUT {scenario.index} HITS:
                          </p>
                          <p className="text-zinc-300">
                            Previous accumulated "cost" carried into this cycle ≈{' '}
                            <span className="font-bold text-red-400">
                              $
                              {Math.round(
                                scenario.totalCost - calcResult.hedgeLossPerPayout
                              ).toLocaleString()}
                            </span>
                            .
                          </p>
                          <p className="text-zinc-300">
                            Personal hedge loss on the payout trade ≈{' '}
                            <span className="font-bold text-red-400">
                              ${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}
                            </span>
                            .
                          </p>
                          <p className="text-zinc-300">
                            Total cost considered for payout {scenario.index} ≈{' '}
                            <span className="font-bold text-red-400">
                              ${Math.round(scenario.totalCost).toLocaleString()}
                            </span>{' '}
                            (previous cost + current hedge loss).
                          </p>
                          <p className="text-zinc-300">
                            Payout {scenario.index} from prop ≈{' '}
                            <span className="font-bold text-green-400">
                              ${Math.round(calcResult.payoutAmount).toLocaleString()}
                            </span>
                            .
                          </p>
                          <p className="text-zinc-300">
                            Net result after payout {scenario.index} ≈{' '}
                            <span
                              className={`font-bold ${
                                scenario.netAfterPayout >= 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              ${Math.round(scenario.netAfterPayout).toLocaleString()}
                            </span>{' '}
                            overall.
                          </p>

                          <p className="text-zinc-300">
                            Remaining "cost" going into the next cycle ≈{' '}
                            <span className="font-bold text-blue-400">
                              $
                              {Math.max(
                                0,
                                Math.round(-scenario.netAfterPayout)
                              ).toLocaleString()}
                            </span>
                            .
                          </p>

                          <p className="text-zinc-300">
                            If the funded account{' '}
                            <span className="font-bold text-red-400">fails</span> after payout{' '}
                            {scenario.index}
                            : your hedge on the personal account would make about{' '}
                            <span className="font-bold text-green-400">
                              ${Math.round(calcResult.fundedFailNet).toLocaleString()}
                            </span>{' '}
                            on that funded-fail cycle.
                          </p>
                          <p className="text-zinc-300">
                            Net result for{' '}
                            <span className="font-semibold">
                              "funded fail after payout {scenario.index}"
                            </span>{' '}
                            ≈{' '}
                            <span
                              className={`font-bold ${
                                scenario.netIfFailAfter >= 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              ${Math.round(scenario.netIfFailAfter).toLocaleString()}
                            </span>
                            .
                          </p>

                          {idx === calcResult.payoutScenarios.length - 1 && (
                            <p className="text-xs text-zinc-500 mt-1">
                              After enough payouts, both the payout results and funded-fail
                              results stabilise – additional payouts or fails tend to repeat with
                              roughly the same net outcome.
                            </p>
                          )}
                        </div>
                      ))}
                    </section>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* 🎯 LOT SIZE CALCULATOR */}
        {activeTab === 'lot' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-semibold mb-2">Lot Size Calculator</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Get approximate lot sizes for your prop account and mirrored hedge on your personal
              account, based on pips/points.{' '}
              <span className="text-red-400 font-semibold">
                Educational use only – not financial advice.
              </span>
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900 border border-zinc-800 md:col-span-2">
                <CardContent className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">

                    {/* Symbol */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Symbol</label>
                      <select
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotSymbol}
                        onChange={(e) => setLotSymbol(e.target.value as SymbolKey)}
                      >
                        {Object.entries(SYMBOL_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.display}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-zinc-500">
                        Pips = FX pips / index points / $ move for gold & crypto.
                      </p>
                    </div>

                    {/* Prop account size */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Prop account size ($)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotAccountSizeProp}
                        onChange={(e) => setLotAccountSizeProp(e.target.value)}
                      />
                    </div>

                    {/* Risk per trade */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Risk per trade on prop (%)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotRiskPerTradePropInput}
                        onChange={(e) => setLotRiskPerTradePropInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Same % you use for funded/eval (e.g., 1–2% per trade).
                      </p>
                    </div>

                    {/* SL pips */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Stop loss distance (pips / points)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotSLPipsInput}
                        onChange={(e) => setLotSLPipsInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Indices = points · FX = pips · Gold/BTC = $ move.
                      </p>
                    </div>

                    {/* Live Price Input */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Current Price</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotPriceInput}
                        onChange={(e) => setLotPriceInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Needed for correct margin calculations (gold, indices, BTC).
                      </p>
                    </div>

                    {/* Max margin use */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Max margin % (approx)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotMaxMarginPercentInput}
                        onChange={(e) => setLotMaxMarginPercentInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Rough check — real broker margin will differ.
                      </p>
                    </div>

                    {/* Personal balance */}
                    {/* Prop leverage */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Prop firm leverage (e.g. 100 = 1:100)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotPropLeverageInput}
                        onChange={(e) => setLotPropLeverageInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">Used to estimate margin needed on your prop account.</p>
                    </div>

                    {/* Personal broker leverage */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Personal broker leverage (e.g. 500 = 1:500)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotPersonalLeverageInput}
                        onChange={(e) => setLotPersonalLeverageInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">Used to estimate hedge margin on personal account.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Personal account balance ($)</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotPersonalBalanceInput}
                        onChange={(e) => setLotPersonalBalanceInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Used only for context; lot size uses $ hedge below.
                      </p>
                    </div>

                    {/* Hedge per 1% */}
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">$ target per 1% prop loss</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                        value={lotHedgePerPercentInput}
                        onChange={(e) => setLotHedgePerPercentInput(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">
                        Copy from the hedge calculator's “hedge per 1%”.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="mt-2"
                    onClick={handleLotCalculate}
                  >
                    Calculate lot sizes
                  </Button>
                </CardContent>
              </Card>

              {lotResult && (
                <Card className="bg-zinc-900 border border-zinc-800 md:col-span-2">
                  <CardContent className="p-4 space-y-3 text-sm leading-relaxed">

                    <h3 className="font-semibold text-lg mb-1">
                      Lot Size Summary — {lotResult.symbolDisplay}
                    </h3>

                    {/* PROP SIDE */}
                    <section className="space-y-1">
                      <p className="font-semibold text-yellow-300">PROP ACCOUNT:</p>

                      <p className="text-zinc-300">
                        Account size:{' '}
                        <span className="font-bold text-blue-400">
                          ${lotResult.accountSizeProp.toLocaleString()}
                        </span>
                        , risk:{' '}
                        <span className="font-bold text-blue-400">
                          {lotResult.riskPerTradeProp.toFixed(2)}%
                        </span>{' '}
                        →{' '}
                        <span className="font-bold text-red-400">
                          ${Math.round(lotResult.riskDollarProp).toLocaleString()}
                        </span>{' '}
                        at risk.
                      </p>

                      <p className="text-zinc-300">
                        SL distance:{' '}
                        <span className="font-bold text-blue-400">
                          {lotResult.slPips.toFixed(1)} pips/points
                        </span>
                        , pip value per lot:{' '}
                        <span className="font-bold text-blue-400">
                          ${lotResult.pipValuePerLot.toFixed(2)}
                        </span>
                        .
                      </p>

                      <p className="text-zinc-300">
                        Recommended prop lot size:{' '}
                        <span className="font-bold text-green-400">
                          {lotResult.lotSizeProp.toFixed(3)} lots
                        </span>
                        .
                      </p>

                      {typeof lotResult.approxMarginUsedPercent === 'number' && (
                        <p className="text-xs text-zinc-500">
                          Approx margin usage:{' '}
                          <span
                            className={`font-semibold ${
                              lotResult.approxMarginUsedPercent > 80
                                ? 'text-red-400'
                                : 'text-yellow-300'
                            }`}
                          >
                            {lotResult.approxMarginUsedPercent.toFixed(1)}%
                          </span>
                          .
                        </p>
                      )}
                    </section>

                    {/* PERSONAL SIDE */}
                    <section className="space-y-1 mt-3">
                      <p className="font-semibold text-yellow-300">PERSONAL HEDGE:</p>

                      <p className="text-zinc-300">
                        Target hedge: make{' '}
                        <span className="font-bold text-green-400">
                          ${lotResult.hedgePerPercent.toFixed(2)}
                        </span>{' '}
                        for each{' '}
                        <span className="font-bold text-red-400">1% loss</span> on prop.
                      </p>

                      <p className="text-zinc-300">
                        Gain needed per opposite trade ≈{' '}
                        <span className="font-bold text-green-400">
                          ${Math.round(lotResult.personalGainPerTrade).toLocaleString()}
                        </span>
                        .
                      </p>

                      <p className="text-zinc-300">
                        Recommended personal hedge lot:{' '}
                        <span className="font-bold text-green-400">
                          {lotResult.lotSizePersonal.toFixed(3)} lots
                        </span>
                        .
                      </p>
                    </section>

                    <p className="text-xs text-zinc-500 mt-3">
                      Always verify pip values & margin with your actual broker before placing
                      trades.
                    </p>

                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/** Helper: render Day 1/2 + Trade 1/2 style breakdown */
<style jsx global>{`
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`}</style>

function renderDayByDay(
  totalTrades: number,
  tradesPerDay: number,
  perSLProfit: number,
  label: string
) {
  if (totalTrades <= 0 || tradesPerDay <= 0) return null;

  const rows: { day: number; trade: number; profit: number }[] = [];
  for (let i = 0; i < totalTrades; i++) {
    const day = Math.floor(i / tradesPerDay) + 1;
    const trade = (i % tradesPerDay) + 1;
    rows.push({ day, trade, profit: perSLProfit });
  }

  const grouped: Record<number, { trade: number; profit: number }[]> = {};
  rows.forEach((r) => {
    if (!grouped[r.day]) grouped[r.day] = [];
    grouped[r.day].push({ trade: r.trade, profit: r.profit });
  });

  return (
    <>
      {Object.entries(grouped).map(([day, trades]) => (
        <div key={day}>
          <p className="font-semibold text-zinc-200">Day {day}:</p>
          {trades.map((t) => (
            <p key={t.trade} className="text-zinc-300 ml-4">
              Trade {t.trade} SL ={' '}
              <span className="font-bold text-green-400">
                ${Math.round(t.profit).toLocaleString()}
              </span>{' '}
              on personal ({label})
            </p>
          ))}
        </div>
      ))}
    </>
  );
}


/** Wistia Player Component */
function WistiaPlayer({
  hashedId,
  onComplete,
}: {
  hashedId: string;
  onComplete?: () => void;
}) {

  // Trigger completion when video ends
  useEffect(() => {
    // Load Wistia script once
    const script = document.createElement("script");
    script.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Wistia event binding
      // @ts-ignore
      window._wq = window._wq || [];
      // @ts-ignore
      window._wq.push({
        id: hashedId,
        onReady: function(video: any) {
          video.bind("end", function () {
            if (onComplete) onComplete();
          });
        },
      });
    };
  }, [hashedId, onComplete]);

  return (
    <div className="wistia_responsive_padding" style={{padding:"56.25% 0 0 0", position:"relative"}}>
      <div className="wistia_responsive_wrapper" style={{height:"100%", left:0, position:"absolute", top:0, width:"100%"}}>
        <div className={`wistia_embed wistia_async_${hashedId} videoFoam=true`}></div>
      </div>
    </div>
  );
}


function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-sm transition-all duration-200 w-full ${
        active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
}

// temp fix for commit email
