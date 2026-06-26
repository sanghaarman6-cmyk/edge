'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants, Transition } from 'framer-motion'
import {
  Home,
  TvMinimal,
  FileText,
  Calculator as CalculatorIcon,
  Coins,
  Menu,
  X,
  Play,
  Download,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '@/supabaseClient'

/* =====================================================================================
   THEME TOKENS — matches the provided dashboard UI style
===================================================================================== */

const theme = {
  appBg: 'bg-zinc-950',
  topbar: 'bg-transparent',

  sidebar: 'bg-white/80 backdrop-blur-xl',
  panel: 'bg-white/75 backdrop-blur-xl border border-black/10 shadow-[0_18px_60px_rgba(0,0,0,0.14)]',
  panelSoft: 'bg-white/65 backdrop-blur-xl border border-black/10',
  darkPanel: 'bg-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
  text: {
    primary: 'text-zinc-900',
    secondary: 'text-zinc-600',
    muted: 'text-zinc-500',
  },
}

const springSnappy = {
  type: 'spring',
  stiffness: 220,
  damping: 24,
} as const satisfies Transition

const springSoft = {
  type: 'spring',
  stiffness: 260,
  damping: 22,
} as const satisfies Transition

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: springSnappy },
}

const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springSoft },
}

/* =====================================================================================
   TYPES (unchanged from your logic)
===================================================================================== */

interface Lesson {
  title: string
  duration: string
  video: string | null
  thumbnail: string
}

interface DocumentItem {
  name: string
  file: string
}

interface Category {
  title: string
  lessons: Lesson[]
}

interface PayoutScenario {
  index: number
  totalCost: number
  netAfterPayout: number
  netIfFailAfter: number
}

interface CalcResult {
  evalType: 'one-step' | 'two-step'
  accountSize: number
  evalCost: number
  phase1Target: number
  phase2Target?: number
  dailyDD: number
  maxDD: number

  riskPerDayEval: number
  tradesPerDayEval: number
  riskPerTradeEval: number
  maxEvalSLTrades: number
  perSLProfitEval: number
  evalFailGrossPersonal: number
  evalFailNet: number

  phase1RR: number
  phase1CostPersonal: number
  phase2RR?: number
  phase2CostPersonal?: number
  costEvalPersonal: number
  costToFunded: number

  fundedRiskPerDay: number
  fundedTradesPerDay: number
  riskPerTradeFunded: number
  maxFundedSLTrades: number
  perSLProfitFunded: number
  fundedFailGrossPersonal: number
  fundedFailNet: number
  failFundedProfit: number

  payoutTarget: number
  fundedSplit: number
  payoutAmount: number
  payoutRRFunded: number
  hedgeLossPerPayout: number
  payoutScenarios: PayoutScenario[]

  hedgePerPercentEval: number
  hedgePerPercentFunded: number
}

interface LotResult {
  symbol: string
  symbolDisplay: string
  accountSizeProp: number
  riskPerTradeProp: number
  slPips: number
  pipValuePerLot: number
  riskDollarProp: number
  lotSizeProp: number
  hedgePerPercent: number
  personalGainPerTrade: number
  lotSizePersonal: number
  approxMarginUsedPercent?: number
  personalBalance: number
  marginProp: number
  marginPropPercent: number
  marginPersonalPercent: number
  marginPersonal: number
}

const SYMBOL_CONFIG = {
  NAS100: { display: 'NAS100 (US Tech 100)', type: 'index' as const, pipValuePerLot: 0.1 },
  US30: { display: 'US30 (Dow Jones)', type: 'index' as const, pipValuePerLot: 0.1 },
  SPX500: { display: 'SPX500 (S&P 500)', type: 'index' as const, pipValuePerLot: 0.1 },
  XAUUSD: { display: 'XAUUSD (Gold)', type: 'gold' as const, pipValuePerLot: 100 },
  EURUSD: { display: 'EURUSD', type: 'forex' as const, pipValuePerLot: 10 },
  GBPUSD: { display: 'GBPUSD', type: 'forex' as const, pipValuePerLot: 10 },
} as const
type SymbolKey = keyof typeof SYMBOL_CONFIG

type TabKey = 'home' | 'lessons' | 'documents' | 'calculator' | 'lot'

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'Dashboard', icon: <Home size={18} /> },
  { key: 'lessons', label: 'Lessons', icon: <TvMinimal size={18} /> },
  { key: 'documents', label: 'Documents', icon: <FileText size={18} /> },
  { key: 'calculator', label: 'Calculator', icon: <CalculatorIcon size={18} /> },
  { key: 'lot', label: 'Lot Tool', icon: <Coins size={18} /> },
]

/* =====================================================================================
   ROOT APP — Same features, new UI shell
===================================================================================== */

export default function TradingCourseDashboardUI() {
  type Announcement = {
    id: string
    title: string | null
    message: string
    created_at: string
    variant: 'neutral' | 'green' | 'yellow' | 'red'
    is_active?: boolean
  }

  /* -------------------- App nav -------------------- */

  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [mobileNav, setMobileNav] = useState(false)

  /* -------------------- Announcements (unchanged logic) -------------------- */

  const [announcementLoading, setAnnouncementLoading] = useState(true)
  const [announcementError, setAnnouncementError] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    let mounted = true
    async function loadAnnouncements() {
      setAnnouncementLoading(true)
      setAnnouncementError(null)

      const { data, error } = await supabase
        .from('admin_announcements')
        .select('id, title, message, variant, created_at, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!mounted) return

      if (error) {
        setAnnouncementError(error.message)
        setAnnouncements([])
      } else {
        setAnnouncements((data ?? []) as Announcement[])
      }

      setAnnouncementLoading(false)
    }

    loadAnnouncements()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('admin-announcements-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_announcements' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newAnnouncement = payload.new as Announcement
          if (newAnnouncement?.is_active === false) return
          setAnnouncements((prev) => [newAnnouncement, ...prev])
        }
        if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId))
        }
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Announcement
          // Keep only active announcements (same behavior as your initial fetch)
          setAnnouncements((prev) => {
            const next = prev.map((a) => (a.id === updated.id ? updated : a))
            return next.filter((a) => a.is_active !== false)
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* -------------------- Course data (unchanged) -------------------- */

  const categories: Category[] = useMemo(
    () => [
      {
        title: 'Category 1: Foundations of Prop Trading',
        lessons: [
          { title: 'The Prop Firm Game — How the System Really Works', duration: '8:16', video: 'h2ldqp9al5', thumbnail: '/thumbnails/t1.webp' },
          { title: 'The One-Trade Evaluation Pass Method', duration: '7:48', video: 'tw5e0nld6b', thumbnail: '/thumbnails/t2.webp' },
          { title: 'The Funded Account Hedge System (Payout Engine)', duration: '24:07', video: 'h5alyreoz8', thumbnail: '/thumbnails/t3.webp' },
          { title: 'The Hedge Engine — Lot Sizes, Copier Setup & Margin Control', duration: '19:50', video: '8ti20kgpr9', thumbnail: '/thumbnails/t4.webp' },
          { title: 'The Ghost Protocol Playbook — Scaling, Ban Avoidance & Mastery', duration: '9:00', video: 'gozr3rjynf', thumbnail: '/thumbnails/t5.webp' },
          { title: 'Coming Soon...', duration: '00:00', video: null, thumbnail: '/thumbnails/t6.webp' },
        ],
      },
    ],
    []
  )

  const documents: DocumentItem[] = useMemo(
    () => [
      { name: 'Hedge Engine Blueprint', file: '/docs/Hedge Engine Blueprint.pdf' },
      { name: 'Prop Ban-Avoidance Playbook (Optional)', file: '/docs/Prop Ban-Avoidance Playbook.pdf' },
      { name: 'Prop Tier-List', file: '/docs/PropTierList.png' },
    ],
    []
  )

  /* -------------------- Progress persistence (unchanged) -------------------- */

  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('courseProgress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompletedLessons(parsed.completedLessons || [])
        setProgress(parsed.progress || 0)
      } catch {
        localStorage.removeItem('courseProgress')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('courseProgress', JSON.stringify({ completedLessons, progress }))
  }, [completedLessons, progress])

  const lessonIds: number[][] = useMemo(() => {
    return categories.map((cat, catIdx) => {
      const start = categories.slice(0, catIdx).reduce((acc, c) => acc + c.lessons.length, 0)
      return cat.lessons.map((_, i) => start + i)
    })
  }, [categories])

  const totalLessons = useMemo(() => lessonIds.flat().length, [lessonIds])

  const flatLessons = useMemo(() => {
    const out: Array<{
      id: number
      lesson: Lesson
      categoryTitle: string
      categoryIndex: number
      lessonIndex: number
    }> = []
    categories.forEach((cat, ci) => {
      cat.lessons.forEach((lesson, li) => {
        out.push({
          id: lessonIds[ci]?.[li] ?? 0,
          lesson,
          categoryTitle: cat.title,
          categoryIndex: ci,
          lessonIndex: li,
        })
      })
    })
    return out
  }, [categories, lessonIds])

  const getLessonById = useCallback(
    (id: number | null) => {
      if (id === null) return null
      return flatLessons.find((x) => x.id === id) ?? null
    },
    [flatLessons]
  )

  const getNextIncompleteLessonId = useCallback(() => {
    const flatIds = lessonIds.flat()
    return flatIds.find((id) => !completedLessons.includes(id)) ?? null
  }, [lessonIds, completedLessons])

  const markComplete = useCallback(
    (id: number) => {
      setCompletedLessons((prev) => {
        if (prev.includes(id)) return prev
        const updated = [...prev, id].sort((a, b) => a - b)
        const percent = Math.round((updated.length / totalLessons) * 100)
        setProgress(percent)
        return updated
      })
    },
    [totalLessons]
  )

  /* -------------------- Disable context menu (unchanged) -------------------- */

  useEffect(() => {
    const disableContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', disableContext)
    return () => document.removeEventListener('contextmenu', disableContext)
  }, [])

  /* -------------------- Calculator state (unchanged) -------------------- */

  const [evalType, setEvalType] = useState<'one-step' | 'two-step'>('one-step')
  const [accountSizeInput, setAccountSizeInput] = useState<string>('200000')
  const [profitTargetInput, setProfitTargetInput] = useState<string>('10')
  const [phase2TargetInput, setPhase2TargetInput] = useState<string>('5')
  const [dailyDDInput, setDailyDDInput] = useState<string>('5')
  const [maxDDInput, setMaxDDInput] = useState<string>('10')
  const [evalCostInput, setEvalCostInput] = useState<string>('1000')
  const [riskPerDayEvalInput, setRiskPerDayEvalInput] = useState<string>('2')
  const [tradesPerDayEvalInput, setTradesPerDayEvalInput] = useState<string>('2')
  const [failEvalProfitInput, setFailEvalProfitInput] = useState<string>('1000')
  const [fundedProfitSplitInput, setFundedProfitSplitInput] = useState<string>('90')
  const [failFundedProfitInput, setFailFundedProfitInput] = useState<string>('1000')
  const [payoutTargetInput, setPayoutTargetInput] = useState<string>('5')
  const [fundedRiskPerDayInput, setFundedRiskPerDayInput] = useState<string>('2')
  const [fundedTradesPerDayInput, setFundedTradesPerDayInput] = useState<string>('2')
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)

  /* -------------------- Lot tool state (unchanged) -------------------- */

  const [lotSymbol, setLotSymbol] = useState<SymbolKey>('NAS100')
  const [lotAccountSizeProp, setLotAccountSizeProp] = useState<string>('200000')
  const [lotRiskPerTradePropInput, setLotRiskPerTradePropInput] = useState<string>('2')
  const [lotSLPipsInput, setLotSLPipsInput] = useState<string>('50')
  const [lotMaxMarginPercentInput, setLotMaxMarginPercentInput] = useState<string>('30')
  const [lotPersonalBalanceInput, setLotPersonalBalanceInput] = useState<string>('10000')
  const [lotHedgePerPercentInput, setLotHedgePerPercentInput] = useState<string>('100')
  const [lotResult, setLotResult] = useState<LotResult | null>(null)
  const [lotPropLeverageInput, setLotPropLeverageInput] = useState<string>('100')
  const [lotPersonalLeverageInput, setLotPersonalLeverageInput] = useState<string>('500')
  const [lotPriceInput, setLotPriceInput] = useState<string>('2400')

  /* -------------------- Documents UI state -------------------- */

  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(null)

  /* =====================================================================================
     CALCULATOR LOGIC (UNCHANGED)
===================================================================================== */

  const handleCalculate = () => {
    const accountSize = parseFloat(accountSizeInput) || 0
    const phase1Target = parseFloat(profitTargetInput) || 0
    const phase2Target = parseFloat(phase2TargetInput) || 0
    const dailyDD = parseFloat(dailyDDInput) || 0
    const maxDD = parseFloat(maxDDInput) || 0
    const evalCost = parseFloat(evalCostInput) || 0
    const riskPerDayEvalRaw = parseFloat(riskPerDayEvalInput) || 0
    const tradesPerDayEval = Math.max(parseFloat(tradesPerDayEvalInput) || 1, 1)
    const failEvalProfit = parseFloat(failEvalProfitInput) || 0
    const fundedSplit = parseFloat(fundedProfitSplitInput) || 0
    const failFundedProfit = parseFloat(failFundedProfitInput) || 0
    const payoutTarget = parseFloat(payoutTargetInput) || 0
    const fundedRiskPerDay = parseFloat(fundedRiskPerDayInput) || 0
    const fundedTradesPerDay = Math.max(parseFloat(fundedTradesPerDayInput) || 1, 1)

    if (!accountSize || !dailyDD || !maxDD) {
      setCalcResult(null)
      return
    }

    const riskPerDayEval = Math.min(riskPerDayEvalRaw, dailyDD)
    const riskPerTradeEval = riskPerDayEval / tradesPerDayEval
    const maxEvalSLTrades = riskPerTradeEval > 0 ? Math.floor(maxDD / riskPerTradeEval) : 0

    const hedgePerPercentEval = maxDD > 0 ? (evalCost + failEvalProfit) / maxDD : 0
    const perSLProfitEval = hedgePerPercentEval * riskPerTradeEval
    const evalFailGrossPersonal = perSLProfitEval * maxEvalSLTrades
    const evalFailNet = evalFailGrossPersonal - evalCost

    const phase1RR = riskPerTradeEval > 0 ? phase1Target / riskPerTradeEval : 0
    const phase1CostPersonal = perSLProfitEval * phase1RR

    let phase2RR: number | undefined
    let phase2CostPersonal: number | undefined
    if (evalType === 'two-step') {
      phase2RR = riskPerTradeEval > 0 ? phase2Target / riskPerTradeEval : 0
      phase2CostPersonal = perSLProfitEval * phase2RR
    }

    const costEvalPersonal = phase1CostPersonal + (phase2CostPersonal ?? 0)
    const costToFunded = costEvalPersonal + evalCost

    const riskPerTradeFunded = fundedRiskPerDay / fundedTradesPerDay
    const maxFundedSLTrades = riskPerTradeFunded > 0 ? Math.floor(maxDD / riskPerTradeFunded) : 0

    const hedgePerPercentFunded = maxDD > 0 ? (costToFunded + failFundedProfit) / maxDD : 0
    const perSLProfitFunded = hedgePerPercentFunded * riskPerTradeFunded
    const fundedFailGrossPersonal = perSLProfitFunded * maxFundedSLTrades
    const fundedFailNet = fundedFailGrossPersonal - costToFunded

    const payoutAmount = accountSize * (payoutTarget / 100) * (fundedSplit / 100)
    const payoutRRFunded = riskPerTradeFunded > 0 ? payoutTarget / riskPerTradeFunded : 0
    const hedgeLossPerPayout = perSLProfitFunded * payoutRRFunded

    const payoutScenarios: PayoutScenario[] = []
    let carryCost = costToFunded
    let prevNetAfter: number | null = null
    let prevNetFailAfter: number | null = null
    const MAX_PAYOUT_ITERS = 10

    for (let i = 1; i <= MAX_PAYOUT_ITERS; i++) {
      const totalCostThis = carryCost + hedgeLossPerPayout
      const netAfterPayout = payoutAmount - totalCostThis
      const netIfFailAfter = fundedFailGrossPersonal - carryCost

      payoutScenarios.push({ index: i, totalCost: totalCostThis, netAfterPayout, netIfFailAfter })
      carryCost = netAfterPayout < 0 ? -netAfterPayout : 0

      if (prevNetAfter !== null && prevNetFailAfter !== null) {
        const stable =
          Math.abs(netAfterPayout - prevNetAfter) < 1 &&
          Math.abs(netIfFailAfter - prevNetFailAfter) < 1 &&
          carryCost < 1
        if (stable) break
      }

      prevNetAfter = netAfterPayout
      prevNetFailAfter = netIfFailAfter
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
      failFundedProfit,
      fundedFailNet,

      payoutTarget,
      fundedSplit,
      payoutAmount,
      payoutRRFunded,
      hedgeLossPerPayout,
      payoutScenarios,

      hedgePerPercentEval,
      hedgePerPercentFunded,
    })
  }

  /* =====================================================================================
     LOT TOOL LOGIC (UNCHANGED)
===================================================================================== */

  const handleLotCalculate = () => {
    const cfg = SYMBOL_CONFIG[lotSymbol]

    const accountSizeProp = parseFloat(lotAccountSizeProp) || 0
    const riskPerTradeProp = parseFloat(lotRiskPerTradePropInput) || 0
    const slPips = parseFloat(lotSLPipsInput) || 0
    const hedgePerPercent = parseFloat(lotHedgePerPercentInput) || 0

    if (!accountSizeProp || !riskPerTradeProp || !slPips || !cfg) {
      setLotResult(null)
      return
    }

    const pipValuePerLot = cfg.pipValuePerLot
    const riskDollarProp = (riskPerTradeProp / 100) * accountSizeProp
    const lotSizeProp = pipValuePerLot > 0 && slPips > 0 ? riskDollarProp / (pipValuePerLot * slPips) : 0

    const personalGainPerTrade = hedgePerPercent * riskPerTradeProp
    const lotSizePersonal = pipValuePerLot > 0 && slPips > 0 ? personalGainPerTrade / (pipValuePerLot * slPips) : 0

    const propLev = parseFloat(lotPropLeverageInput) || 100
    const personalLev = parseFloat(lotPersonalLeverageInput) || 500

    const price = parseFloat(lotPriceInput) || 0
    let contractValuePerLot = 100000
    if (cfg.type === 'forex') contractValuePerLot = 135000
    if (cfg.type === 'gold') contractValuePerLot = price * 100
    if (cfg.type === 'index') contractValuePerLot = price * 1

    const marginProp = (contractValuePerLot * lotSizeProp) / propLev
    const approxMarginUsedPercent = (marginProp / accountSizeProp) * 100

    const marginPersonal = (contractValuePerLot * lotSizePersonal) / personalLev
    const marginPropPercent = (marginProp / accountSizeProp) * 100
    const marginPersonalPercent = (marginPersonal / (parseFloat(lotPersonalBalanceInput) || 1)) * 100

    setLotResult({
      symbol: lotSymbol,
      symbolDisplay: cfg.display,
      accountSizeProp,
      personalBalance: parseFloat(lotPersonalBalanceInput) || 0,
      riskPerTradeProp,
      riskDollarProp,
      slPips,
      pipValuePerLot,
      lotSizeProp,
      marginProp,
      marginPropPercent,
      hedgePerPercent,
      personalGainPerTrade,
      lotSizePersonal,
      marginPersonal,
      marginPersonalPercent,
      approxMarginUsedPercent,
    })
  }

  /* =====================================================================================
     KEYBOARD ESC (unchanged behavior)
===================================================================================== */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNav(false)
        setActiveVideo(null)
        setActiveDocIndex(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* =====================================================================================
     RENDER
===================================================================================== */

  const title = NAV_ITEMS.find((n) => n.key === activeTab)?.label ?? ''
  const nextLessonId = getNextIncompleteLessonId()
  const nextCTA =
    progress >= 100 ? 'Open Lot Tool' : progress > 0 ? 'Resume Lessons' : 'Start Lessons'

  return (
    <div className={`min-h-screen w-full ${theme.appBg}`}>
      <style jsx global>{`
        .pa-input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(0,0,0,0.14);
          background: rgba(255,255,255,0.88);
          padding: 0.75rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          color: rgb(24 24 27);
        }
        .pa-input:focus {
          border-color: rgba(0,0,0,0.35);
          box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
        }
      `}</style>

      <div className="flex min-h-screen">
        <FloatingSidebar
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex flex-1 flex-col">
          <TopBar
            title={title}
            onMenu={() => setMobileNav(true)}
            progress={progress}
          />

          <main className="flex-1 px-6 py-6 pl-[120px]">

            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <Dashboard
                  key="home"
                  progress={progress}
                  nextCTA={nextCTA}
                  onNext={() => {
                    if (nextLessonId !== null) {
                      setActiveTab('lessons')
                      setTimeout(() => setActiveVideo(nextLessonId), 120)
                    } else {
                      setActiveTab('calculator')
                    }
                  }}
                  onOpenCalc={() => setActiveTab('calculator')}
                  onOpenLessons={() => setActiveTab('lessons')}
                  onOpenDocs={() => setActiveTab('documents')}
                  onOpenLot={() => setActiveTab('lot')}
                  announcements={announcements}
                  announcementLoading={announcementLoading}
                  announcementError={announcementError}
                />
              )}

              {activeTab === 'lessons' && (
                <LessonsPage
                  key="lessons"
                  flatLessons={flatLessons}
                  completedLessons={completedLessons}
                  progress={progress}
                  onOpenLesson={(id) => setActiveVideo(id)}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsPage
                  key="documents"
                  documents={documents}
                  activeDocIndex={activeDocIndex}
                  onToggleDoc={(i) => setActiveDocIndex((prev) => (prev === i ? null : i))}
                />
              )}

              {activeTab === 'calculator' && (
                <CalculatorPage
                  key="calculator"
                  evalType={evalType}
                  setEvalType={setEvalType}
                  accountSizeInput={accountSizeInput}
                  setAccountSizeInput={setAccountSizeInput}
                  profitTargetInput={profitTargetInput}
                  setProfitTargetInput={setProfitTargetInput}
                  phase2TargetInput={phase2TargetInput}
                  setPhase2TargetInput={setPhase2TargetInput}
                  dailyDDInput={dailyDDInput}
                  setDailyDDInput={setDailyDDInput}
                  maxDDInput={maxDDInput}
                  setMaxDDInput={setMaxDDInput}
                  evalCostInput={evalCostInput}
                  setEvalCostInput={setEvalCostInput}
                  riskPerDayEvalInput={riskPerDayEvalInput}
                  setRiskPerDayEvalInput={setRiskPerDayEvalInput}
                  tradesPerDayEvalInput={tradesPerDayEvalInput}
                  setTradesPerDayEvalInput={setTradesPerDayEvalInput}
                  failEvalProfitInput={failEvalProfitInput}
                  setFailEvalProfitInput={setFailEvalProfitInput}
                  fundedProfitSplitInput={fundedProfitSplitInput}
                  setFundedProfitSplitInput={setFundedProfitSplitInput}
                  failFundedProfitInput={failFundedProfitInput}
                  setFailFundedProfitInput={setFailFundedProfitInput}
                  payoutTargetInput={payoutTargetInput}
                  setPayoutTargetInput={setPayoutTargetInput}
                  fundedRiskPerDayInput={fundedRiskPerDayInput}
                  setFundedRiskPerDayInput={setFundedRiskPerDayInput}
                  fundedTradesPerDayInput={fundedTradesPerDayInput}
                  setFundedTradesPerDayInput={setFundedTradesPerDayInput}
                  calcResult={calcResult}
                  onCalculate={handleCalculate}
                />
              )}

              {activeTab === 'lot' && (
                <LotToolPage
                  key="lot"
                  lotSymbol={lotSymbol}
                  setLotSymbol={setLotSymbol}
                  lotAccountSizeProp={lotAccountSizeProp}
                  setLotAccountSizeProp={setLotAccountSizeProp}
                  lotRiskPerTradePropInput={lotRiskPerTradePropInput}
                  setLotRiskPerTradePropInput={setLotRiskPerTradePropInput}
                  lotSLPipsInput={lotSLPipsInput}
                  setLotSLPipsInput={setLotSLPipsInput}
                  lotPriceInput={lotPriceInput}
                  setLotPriceInput={setLotPriceInput}
                  lotMaxMarginPercentInput={lotMaxMarginPercentInput}
                  setLotMaxMarginPercentInput={setLotMaxMarginPercentInput}
                  lotPropLeverageInput={lotPropLeverageInput}
                  setLotPropLeverageInput={setLotPropLeverageInput}
                  lotPersonalLeverageInput={lotPersonalLeverageInput}
                  setLotPersonalLeverageInput={setLotPersonalLeverageInput}
                  lotPersonalBalanceInput={lotPersonalBalanceInput}
                  setLotPersonalBalanceInput={setLotPersonalBalanceInput}
                  lotHedgePerPercentInput={lotHedgePerPercentInput}
                  setLotHedgePerPercentInput={setLotHedgePerPercentInput}
                  lotResult={lotResult}
                  onCalculate={handleLotCalculate}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Video modal (same behavior, new UI) */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={springSoft}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_28px_90px_rgba(0,0,0,0.35)]"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute right-4 top-4 z-10 rounded-xl border border-black/10 bg-white/80 p-2 text-zinc-700 hover:bg-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {(() => {
                const item = getLessonById(activeVideo)
                const vid = item?.lesson?.video ?? null
                if (!vid) {
                  return (
                    <div className="p-10">
                      <div className="text-lg font-semibold text-zinc-900">No video available</div>
                      <div className="mt-2 text-sm text-zinc-600">This module is marked as coming soon.</div>
                    </div>
                  )
                }
                return (
                  <div className="bg-black">
                    <WistiaPlayer hashedId={vid} onComplete={() => markComplete(activeVideo)} />
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =====================================================================================
   SIDEBAR
===================================================================================== */
function FloatingSidebar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <aside className="fixed left-4 top-1/2 z-50 -translate-y-1/2">
      <div
        className="
          flex h-[520px] w-[72px] flex-col items-center
          justify-between
          rounded-3xl
          bg-white/80
          py-5
          shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        "
      >
        {/* Top logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
          <img
            src="/favicon.ico"
            alt="Prop Accelerator"
            className="h-5 w-5"
          />
        </div>


        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-5">
          {NAV_ITEMS.map((item) => {
            const active = item.key === activeTab
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`
                  group relative flex h-10 w-10 items-center justify-center
                  rounded-xl transition
                  ${active ? 'bg-black text-white' : 'text-black/70 hover:text-black'}
                `}
              >
                {item.icon}

                {/* Active indicator dot */}
                {active && (
                  <span className="absolute -right-2 h-2 w-2 rounded-full bg-black" />
                )}

                {/* Tooltip */}
                <span
                  className="
                    pointer-events-none absolute left-14
                    whitespace-nowrap rounded-md
                    bg-white px-2 py-1 text-xs text-black
                    opacity-0 transition
                    group-hover:opacity-100
                  "
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom action */}
        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-black/60 hover:text-black">
          ⎋
        </button>
      </div>
    </aside>
  )
}

function Sidebar({
  activeTab,
  onChange,
  mobileOpen,
  onClose,
}: {
  activeTab: TabKey
  onChange: (t: TabKey) => void
  mobileOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`
          fixed z-50 h-screen w-[240px]
          bg-white/80 backdrop-blur-xl
          md:static md:z-auto
          ${mobileOpen ? 'left-0' : '-left-[240px]'} md:left-0
          transition-all
        `}
      >

        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
            <img
              src="/favicon.ico"
              alt="Prop Accelerator"
              className="h-5 w-5"
            />
          </div>


            <div>
              <div className="text-sm font-semibold text-zinc-900">Prop Accelerator</div>
              <div className="text-xs text-zinc-500">Private Workspace</div>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.key === activeTab
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onChange(item.key)
                    onClose()
                  }}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                    transition
                    ${active ? 'bg-black text-white' : 'text-zinc-600 hover:bg-black/5'}
                  `}
                >
                  <span className={active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <a
              href="https://t.me/+U_s-oDtDDdg2ZDVk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs text-zinc-700 hover:bg-white"
            >
              Announcements <ChevronRight size={14} />
            </a>
            <a
              href="https://t.me/+bpRxV73NpixlYjRk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs text-zinc-700 hover:bg-white"
            >
              Community <ChevronRight size={14} />
            </a>
            <div className="text-[11px] text-zinc-400">v1.0</div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* =====================================================================================
   TOP BAR
===================================================================================== */

function TopBar({
  title,
  onMenu,
  progress,
}: {
  title: string
  onMenu: () => void
  progress: number
}) {
  return (
    <motion.header
      variants={fade}
      initial="hidden"
      animate="show"
      className="sticky top-0 z-30"
    >
      {/* Outer shell – only spacing */}
      <div className="px-5 pt-4 pl-[120px] md:px-7 md:pl-[120px]">
        {/* Inner floating bar */}
        <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-xl px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={onMenu} aria-label="Open menu">
              <Menu size={20} className="text-zinc-800" />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Status */}
            <div className="hidden text-sm text-zinc-500 sm:block">
              Status: Active
            </div>

            {/* Progress bar + % inline */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-[120px] rounded-full bg-black/10">
                <div
                  className="h-2 rounded-full bg-black"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <div className="text-xs text-zinc-500 tabular-nums">
                {progress}%
              </div>
            </div>

            {/* Avatar / logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <img
                src="/favicon.ico"
                alt="Prop Accelerator"
                className="h-5 w-5"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

/* =====================================================================================
   DASHBOARD
===================================================================================== */

function Dashboard({
  progress,
  nextCTA,
  onNext,
  onOpenCalc,
  onOpenLessons,
  onOpenDocs,
  onOpenLot,
  announcements,
  announcementLoading,
  announcementError,
}: {
  progress: number
  nextCTA: string
  onNext: () => void
  onOpenCalc: () => void
  onOpenLessons: () => void
  onOpenDocs: () => void
  onOpenLot: () => void
  announcements: Array<{ id: string; title: string | null; message: string; variant: string; created_at: string }>
  announcementLoading: boolean
  announcementError: string | null
}) {
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
      <motion.div variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Workspace</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Clean cockpit. Same logic. Repeatable execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onNext} className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white">
              {nextCTA}
            </button>
            <button onClick={onOpenCalc} className="rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-white">
              Open Calculator
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <DashTile title="Progress" value={`${progress}%`} icon={<ChevronRight size={18} />} onClick={onOpenLessons} />
        <DashTile title="Lessons" value="Open modules" icon={<ChevronRight size={18} />} onClick={onOpenLessons} />
        <DashTile title="Documents" value="Blueprints" icon={<ChevronRight size={18} />} onClick={onOpenDocs} />
        <DashTile title="Lot Tool" value="Sizing & margin" icon={<ChevronRight size={18} />} onClick={onOpenLot} />
      </div>

      <motion.div variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-zinc-500">ANNOUNCEMENTS</div>
            <div className="mt-1 text-sm text-zinc-600">Live updates from admin</div>
          </div>
          <a
            href="https://t.me/+U_s-oDtDDdg2ZDVk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-black px-3 py-2 text-xs font-medium text-white"
          >
            Open channel
          </a>
        </div>

        <div className="mt-4">
          {announcementLoading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : announcementError ? (
            <div className="text-sm text-zinc-600">Failed to load announcements: {announcementError}</div>
          ) : announcements.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-xl bg-white/70 p-4 border border-black/10">
                  {a.title ? <div className="text-sm font-semibold text-zinc-900">{a.title}</div> : null}
                  <div className="mt-1 whitespace-pre-line text-sm text-zinc-600">{a.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No active announcements.</div>
          )}
        </div>
      </motion.div>
    </motion.section>
  )
}

function DashTile({
  title,
  value,
  icon,
  onClick,
}: {
  title: string
  value: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <motion.button
      variants={scaleIn}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl p-5 text-left ${theme.panelSoft}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-zinc-500">{title}</div>
          <div className="mt-2 text-lg font-semibold text-zinc-900">{value}</div>
        </div>
        <div className="rounded-xl bg-black/5 p-2 text-zinc-700">{icon}</div>
      </div>
    </motion.button>
  )
}

/* =====================================================================================
   LESSONS PAGE — same completion + wistia logic
===================================================================================== */

function LessonsPage({
  flatLessons,
  completedLessons,
  progress,
  onOpenLesson,
}: {
  flatLessons: Array<{ id: number; lesson: Lesson; categoryTitle: string }>
  completedLessons: number[]
  progress: number
  onOpenLesson: (id: number) => void
}) {
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Lessons</h2>
          <p className="mt-1 text-sm text-white/60">Click a module to open the video. Completion is saved.</p>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
          Progress: <span className="font-semibold text-white">{progress}%</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flatLessons.map((item) => {
          const done = completedLessons.includes(item.id)
          const clickable = !!item.lesson.video
          return (
            <motion.button
              key={item.id}
              variants={scaleIn}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => clickable && onOpenLesson(item.id)}
              className={`group overflow-hidden rounded-2xl text-left ${
                clickable ? theme.panel : 'bg-white/50 backdrop-blur-xl border border-black/10 opacity-80'
              }`}
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={item.lesson.thumbnail}
                  alt={item.lesson.title}
                  className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/45" />
                <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-zinc-900">
                  {item.lesson.duration}
                </div>
                {done && (
                  <div className="absolute right-3 top-3 rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">
                    Done
                  </div>
                )}
                {clickable && (
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                    <Play size={14} /> Play
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="text-xs text-zinc-500">{item.categoryTitle}</div>
                <div className="mt-2 text-sm font-semibold text-zinc-900 line-clamp-2">{item.lesson.title}</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-black/10">
                    <div className="h-2 rounded-full bg-black" style={{ width: done ? '100%' : '25%' }} />
                  </div>
                  <ChevronRight size={16} className="text-zinc-400" />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}

/* =====================================================================================
   DOCUMENTS PAGE — same preview/download functionality
===================================================================================== */

function DocumentsPage({
  documents,
  activeDocIndex,
  onToggleDoc,
}: {
  documents: DocumentItem[]
  activeDocIndex: number | null
  onToggleDoc: (i: number) => void
}) {
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Documents</h2>
        <p className="mt-1 text-sm text-white/60">Preview or download your resources.</p>
      </div>

      <div className="space-y-3">
        {documents.map((doc, i) => {
          const active = activeDocIndex === i
          const isImage = doc.file.toLowerCase().endsWith('.png') || doc.file.toLowerCase().endsWith('.webp') || doc.file.toLowerCase().endsWith('.jpg') || doc.file.toLowerCase().endsWith('.jpeg')

          return (
            <motion.div key={doc.name} variants={scaleIn} className={`rounded-2xl p-4 ${theme.panel}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{doc.name}</div>
                  <div className="text-xs text-zinc-500">{doc.file.split('/').pop()}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onToggleDoc(i)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium ${
                      active ? 'bg-black text-white' : 'border border-black/10 bg-white/70 text-zinc-800 hover:bg-white'
                    }`}
                  >
                    {active ? 'Close preview' : 'Preview'}
                  </button>

                  <a href={doc.file} download className="inline-flex">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-xs font-medium text-white">
                      <Download size={14} /> Download
                    </span>
                  </a>
                </div>
              </div>

              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-zinc-100"
                  >
                    {isImage ? (
                      <img src={doc.file} alt={doc.name} className="h-[520px] w-full object-contain" />
                    ) : (
                      <iframe src={doc.file} title={doc.name} className="h-[520px] w-full" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

/* =====================================================================================
   CALCULATOR PAGE — same inputs + same output breakdown
===================================================================================== */

function CalculatorPage(props: {
  evalType: 'one-step' | 'two-step'
  setEvalType: (v: 'one-step' | 'two-step') => void
  accountSizeInput: string
  setAccountSizeInput: (v: string) => void
  profitTargetInput: string
  setProfitTargetInput: (v: string) => void
  phase2TargetInput: string
  setPhase2TargetInput: (v: string) => void
  dailyDDInput: string
  setDailyDDInput: (v: string) => void
  maxDDInput: string
  setMaxDDInput: (v: string) => void
  evalCostInput: string
  setEvalCostInput: (v: string) => void
  riskPerDayEvalInput: string
  setRiskPerDayEvalInput: (v: string) => void
  tradesPerDayEvalInput: string
  setTradesPerDayEvalInput: (v: string) => void
  failEvalProfitInput: string
  setFailEvalProfitInput: (v: string) => void
  fundedProfitSplitInput: string
  setFundedProfitSplitInput: (v: string) => void
  failFundedProfitInput: string
  setFailFundedProfitInput: (v: string) => void
  payoutTargetInput: string
  setPayoutTargetInput: (v: string) => void
  fundedRiskPerDayInput: string
  setFundedRiskPerDayInput: (v: string) => void
  fundedTradesPerDayInput: string
  setFundedTradesPerDayInput: (v: string) => void
  calcResult: CalcResult | null
  onCalculate: () => void
}) {
  const {
    evalType,
    setEvalType,
    accountSizeInput,
    setAccountSizeInput,
    profitTargetInput,
    setProfitTargetInput,
    phase2TargetInput,
    setPhase2TargetInput,
    dailyDDInput,
    setDailyDDInput,
    maxDDInput,
    setMaxDDInput,
    evalCostInput,
    setEvalCostInput,
    riskPerDayEvalInput,
    setRiskPerDayEvalInput,
    tradesPerDayEvalInput,
    setTradesPerDayEvalInput,
    failEvalProfitInput,
    setFailEvalProfitInput,
    fundedProfitSplitInput,
    setFundedProfitSplitInput,
    failFundedProfitInput,
    setFailFundedProfitInput,
    payoutTargetInput,
    setPayoutTargetInput,
    fundedRiskPerDayInput,
    setFundedRiskPerDayInput,
    fundedTradesPerDayInput,
    setFundedTradesPerDayInput,
    calcResult,
    onCalculate,
  } = props

  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-[1fr_420px]">
      {/* LEFT */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Hedged Prop Calculator</h2>
          <p className="mt-1 text-sm text-white/60">Same math. Cleaner dashboard flow.</p>
        </div>

        <motion.div variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-900">Evaluation Type</div>
            <div className="flex gap-2">
              <button
                onClick={() => setEvalType('one-step')}
                className={`rounded-xl px-3 py-2 text-xs font-medium ${
                  evalType === 'one-step' ? 'bg-black text-white' : 'border border-black/10 bg-white/70 text-zinc-800'
                }`}
              >
                1-step
              </button>
              <button
                onClick={() => setEvalType('two-step')}
                className={`rounded-xl px-3 py-2 text-xs font-medium ${
                  evalType === 'two-step' ? 'bg-black text-white' : 'border border-black/10 bg-white/70 text-zinc-800'
                }`}
              >
                2-step
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FieldLight label="Account size (prop)">
              <input className="pa-input" type="number" value={accountSizeInput} onChange={(e) => setAccountSizeInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Eval cost ($)">
              <input className="pa-input" type="number" value={evalCostInput} onChange={(e) => setEvalCostInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Phase 1 target (%)">
              <input className="pa-input" type="number" value={profitTargetInput} onChange={(e) => setProfitTargetInput(e.target.value)} />
            </FieldLight>

            {evalType === 'two-step' && (
              <FieldLight label="Phase 2 target (%)">
                <input className="pa-input" type="number" value={phase2TargetInput} onChange={(e) => setPhase2TargetInput(e.target.value)} />
              </FieldLight>
            )}

            <FieldLight label="Daily DD (%)">
              <input className="pa-input" type="number" value={dailyDDInput} onChange={(e) => setDailyDDInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Max DD (%)">
              <input className="pa-input" type="number" value={maxDDInput} onChange={(e) => setMaxDDInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Risk per day (evaluation) %" hint="Must be ≤ Daily DD.">
              <input className="pa-input" type="number" value={riskPerDayEvalInput} onChange={(e) => setRiskPerDayEvalInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Trades per day (evaluation)">
              <input className="pa-input" type="number" min={1} value={tradesPerDayEvalInput} onChange={(e) => setTradesPerDayEvalInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Profit on fail (eval) — personal ($)">
              <input className="pa-input" type="number" value={failEvalProfitInput} onChange={(e) => setFailEvalProfitInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Profit split on funded (%)">
              <input className="pa-input" type="number" value={fundedProfitSplitInput} onChange={(e) => setFundedProfitSplitInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Profit on fail (funded) — personal ($)">
              <input className="pa-input" type="number" value={failFundedProfitInput} onChange={(e) => setFailFundedProfitInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Payout target on funded (%)">
              <input className="pa-input" type="number" value={payoutTargetInput} onChange={(e) => setPayoutTargetInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Risk per day (funded) %">
              <input className="pa-input" type="number" value={fundedRiskPerDayInput} onChange={(e) => setFundedRiskPerDayInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Trades per day (funded)">
              <input className="pa-input" type="number" min={1} value={fundedTradesPerDayInput} onChange={(e) => setFundedTradesPerDayInput(e.target.value)} />
            </FieldLight>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button onClick={onCalculate} className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">
              Calculate
            </button>
            <div className="text-xs text-zinc-500">Keep calculator + lot tool inputs aligned.</div>
          </div>
        </motion.div>

        {calcResult && (
          <motion.div variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
            <div className="flex items-end justify-between gap-3">
              <div className="text-lg font-semibold text-zinc-900">Full Breakdown</div>
              <div className="text-xs text-zinc-500">
                Max DD <span className="font-semibold text-zinc-800">{calcResult.maxDD.toFixed(2)}%</span> • Daily DD{' '}
                <span className="font-semibold text-zinc-800">{calcResult.dailyDD.toFixed(2)}%</span>
              </div>
            </div>

            {/* IF EVAL FAILS */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold tracking-[0.16em] text-zinc-500">IF EVALUATION FAILS</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <p>
                  Risk per trade (eval): <span className="font-semibold text-zinc-900">{calcResult.riskPerTradeEval.toFixed(2)}%</span> with{' '}
                  <span className="font-semibold text-zinc-900">{calcResult.tradesPerDayEval}</span> trade(s)/day.
                </p>
                <p>
                  Max SL trades before max DD: <span className="font-semibold text-zinc-900">{calcResult.maxEvalSLTrades}</span>
                </p>

                <div className="mt-2 space-y-2">
                  {renderDayByDayLight(calcResult.maxEvalSLTrades, calcResult.tradesPerDayEval, calcResult.perSLProfitEval, 'evaluation hedge')}
                </div>

                <div className="mt-3 border-t border-black/10 pt-3">
                  <p>
                    Personal net ≈ <span className="font-semibold text-zinc-900">${Math.round(calcResult.evalFailGrossPersonal).toLocaleString()}</span> −{' '}
                    <span className="font-semibold text-zinc-900">${Math.round(calcResult.evalCost).toLocaleString()}</span> ≈{' '}
                    <span className="font-semibold text-zinc-900">${Math.round(calcResult.evalFailNet).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* IF EVAL PASSES */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold tracking-[0.16em] text-zinc-500">IF EVALUATION PASSES → FUNDED</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <p>
                  Phase 1 target: <span className="font-semibold text-zinc-900">{calcResult.phase1Target.toFixed(2)}%</span> → ~
                  <span className="font-semibold text-zinc-900">{calcResult.phase1RR.toFixed(2)}R</span>
                </p>

                {calcResult.evalType === 'two-step' && calcResult.phase2RR !== undefined && (
                  <p>
                    Phase 2 target: <span className="font-semibold text-zinc-900">{calcResult.phase2Target?.toFixed(2)}%</span> → ~
                    <span className="font-semibold text-zinc-900">{calcResult.phase2RR.toFixed(2)}R</span>
                  </p>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <MiniStatLight label="Phase 1 cost (personal)" value={`$${Math.round(calcResult.phase1CostPersonal).toLocaleString()}`} />
                  {calcResult.evalType === 'two-step' ? (
                    <MiniStatLight label="Phase 2 cost (personal)" value={`$${Math.round(calcResult.phase2CostPersonal ?? 0).toLocaleString()}`} />
                  ) : (
                    <MiniStatLight label="Phase 2 cost" value="—" />
                  )}
                  <MiniStatLight label="Cost to funded" value={`$${Math.round(calcResult.costToFunded).toLocaleString()}`} emphasize />
                </div>
              </div>
            </div>

            {/* IF FUNDED FAILS */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold tracking-[0.16em] text-zinc-500">IF FUNDED FAILS (BEFORE PAYOUTS)</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <p>
                  Risk per trade (funded): <span className="font-semibold text-zinc-900">{calcResult.riskPerTradeFunded.toFixed(2)}%</span> with{' '}
                  <span className="font-semibold text-zinc-900">{calcResult.fundedTradesPerDay}</span> trade(s)/day.
                </p>
                <p>
                  Personal per SL profit (funded hedge):{' '}
                  <span className="font-semibold text-zinc-900">${Math.round(calcResult.perSLProfitFunded).toLocaleString()}</span>
                </p>
                <p>
                  Max SL trades before max DD: <span className="font-semibold text-zinc-900">{calcResult.maxFundedSLTrades}</span>
                </p>

                <div className="mt-2 space-y-2">
                  {renderDayByDayLight(calcResult.maxFundedSLTrades, calcResult.fundedTradesPerDay, calcResult.perSLProfitFunded, 'funded hedge')}
                </div>

                <div className="mt-3 border-t border-black/10 pt-3">
                  <p>
                    Net after funded fail ≈{' '}
                    <span className="font-semibold text-zinc-900">${Math.round(calcResult.fundedFailNet).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* PAYOUTS */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold tracking-[0.16em] text-zinc-500">IF FUNDED PAYOUTS HIT</div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MiniStatLight label="Payout amount" value={`$${Math.round(calcResult.payoutAmount).toLocaleString()}`} emphasize />
                <MiniStatLight label="Hedge loss per payout" value={`$${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}`} />
                <MiniStatLight label="Payout RR (funded)" value={`${calcResult.payoutRRFunded.toFixed(2)}R`} />
              </div>

              <div className="mt-4 grid gap-3">
                {calcResult.payoutScenarios.map((scenario, idx) => (
                  <div key={scenario.index} className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">Payout {scenario.index}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Total cost carried + hedge loss: ${Math.round(scenario.totalCost).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Net after payout</div>
                        <div className="text-sm font-semibold text-zinc-900">${Math.round(scenario.netAfterPayout).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <MiniStatLight label="Remaining carry cost" value={`$${Math.max(0, Math.round(-scenario.netAfterPayout)).toLocaleString()}`} />
                      <MiniStatLight label="Net if fail after payout" value={`$${Math.round(scenario.netIfFailAfter).toLocaleString()}`} />
                    </div>

                    {idx === calcResult.payoutScenarios.length - 1 && (
                      <div className="mt-3 text-xs text-zinc-500">
                        After enough payouts, results stabilise. Additional payouts/fails tend to repeat similar outcomes.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* RIGHT sticky summary */}
      <motion.aside variants={scaleIn} className={`sticky top-[92px] h-fit rounded-2xl p-5 ${theme.panel}`}>
        <div className="text-xs text-zinc-500">Live summary</div>
        <div className="mt-3 space-y-2 text-sm text-zinc-700">
          <div>Account: ${accountSizeInput || '—'}</div>
          <div>Daily DD: {dailyDDInput || '—'}%</div>
          <div>Max DD: {maxDDInput || '—'}%</div>
        </div>
        <div className="mt-4 rounded-xl bg-black p-3 text-sm font-semibold text-white">
          Hedge (eval) per 1% ≈ ${calcResult ? Math.round(calcResult.hedgePerPercentEval).toLocaleString() : '—'}
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Copy “hedge per 1%” into Lot Tool for consistent sizing.
        </div>
      </motion.aside>
    </motion.section>
  )
}

/* =====================================================================================
   LOT TOOL PAGE — same logic, dashboard UI
===================================================================================== */

function LotToolPage(props: {
  lotSymbol: SymbolKey
  setLotSymbol: (v: SymbolKey) => void
  lotAccountSizeProp: string
  setLotAccountSizeProp: (v: string) => void
  lotRiskPerTradePropInput: string
  setLotRiskPerTradePropInput: (v: string) => void
  lotSLPipsInput: string
  setLotSLPipsInput: (v: string) => void
  lotPriceInput: string
  setLotPriceInput: (v: string) => void
  lotMaxMarginPercentInput: string
  setLotMaxMarginPercentInput: (v: string) => void
  lotPropLeverageInput: string
  setLotPropLeverageInput: (v: string) => void
  lotPersonalLeverageInput: string
  setLotPersonalLeverageInput: (v: string) => void
  lotPersonalBalanceInput: string
  setLotPersonalBalanceInput: (v: string) => void
  lotHedgePerPercentInput: string
  setLotHedgePerPercentInput: (v: string) => void
  lotResult: LotResult | null
  onCalculate: () => void
}) {
  const {
    lotSymbol,
    setLotSymbol,
    lotAccountSizeProp,
    setLotAccountSizeProp,
    lotRiskPerTradePropInput,
    setLotRiskPerTradePropInput,
    lotSLPipsInput,
    setLotSLPipsInput,
    lotPriceInput,
    setLotPriceInput,
    lotMaxMarginPercentInput,
    setLotMaxMarginPercentInput,
    lotPropLeverageInput,
    setLotPropLeverageInput,
    lotPersonalLeverageInput,
    setLotPersonalLeverageInput,
    lotPersonalBalanceInput,
    setLotPersonalBalanceInput,
    lotHedgePerPercentInput,
    setLotHedgePerPercentInput,
    lotResult,
    onCalculate,
  } = props

  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Lot Tool</h2>
        <p className="mt-1 text-sm text-white/60">Same sizing + margin estimate. Verify with broker.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <motion.div variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldLight label="Symbol" hint="Pips = FX pips / index points / $ move for gold.">
              <select className="pa-input" value={lotSymbol} onChange={(e) => setLotSymbol(e.target.value as SymbolKey)}>
                {Object.entries(SYMBOL_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.display}
                  </option>
                ))}
              </select>
            </FieldLight>

            <FieldLight label="Prop account size ($)">
              <input className="pa-input" type="number" value={lotAccountSizeProp} onChange={(e) => setLotAccountSizeProp(e.target.value)} />
            </FieldLight>

            <FieldLight label="Risk per trade on prop (%)">
              <input className="pa-input" type="number" value={lotRiskPerTradePropInput} onChange={(e) => setLotRiskPerTradePropInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Stop loss distance (pips / points)">
              <input className="pa-input" type="number" value={lotSLPipsInput} onChange={(e) => setLotSLPipsInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Current Price" hint="Needed for margin estimates (indices/gold).">
              <input className="pa-input" type="number" value={lotPriceInput} onChange={(e) => setLotPriceInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Max margin % (approx)">
              <input className="pa-input" type="number" value={lotMaxMarginPercentInput} onChange={(e) => setLotMaxMarginPercentInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Prop firm leverage">
              <input className="pa-input" type="number" value={lotPropLeverageInput} onChange={(e) => setLotPropLeverageInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Personal broker leverage">
              <input className="pa-input" type="number" value={lotPersonalLeverageInput} onChange={(e) => setLotPersonalLeverageInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="Personal account balance ($)">
              <input className="pa-input" type="number" value={lotPersonalBalanceInput} onChange={(e) => setLotPersonalBalanceInput(e.target.value)} />
            </FieldLight>

            <FieldLight label="$ target per 1% prop loss" hint="Copy from Calculator: hedge per 1% (eval or funded).">
              <input className="pa-input" type="number" value={lotHedgePerPercentInput} onChange={(e) => setLotHedgePerPercentInput(e.target.value)} />
            </FieldLight>
          </div>

          <button onClick={onCalculate} className="mt-5 w-full rounded-xl bg-black py-3 text-sm font-medium text-white">
            Calculate lot sizes
          </button>
        </motion.div>

        <motion.aside variants={scaleIn} className={`rounded-2xl p-6 ${theme.panel}`}>
          <div className="text-xs text-zinc-500">Output</div>

          {!lotResult ? (
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-zinc-600">
              Enter inputs, then press <span className="font-semibold text-zinc-900">Calculate</span>.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className={`rounded-2xl p-4 ${theme.darkPanel}`}>
                <div className="text-xs text-white/60">Suggested prop lot</div>
                <div className="mt-1 text-3xl font-semibold">{lotResult.lotSizeProp.toFixed(3)} lots</div>
                <div className="mt-2 text-xs text-white/60">
                  Margin approx: {lotResult.marginPropPercent.toFixed(2)}% • Risk ${Math.round(lotResult.riskDollarProp).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                <div className="text-xs text-zinc-500">Suggested personal hedge lot</div>
                <div className="mt-1 text-2xl font-semibold text-zinc-900">{lotResult.lotSizePersonal.toFixed(3)} lots</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Personal margin approx: {lotResult.marginPersonalPercent.toFixed(2)}%
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4 text-xs text-zinc-500">
                Always verify pip values and margin with your actual broker before placing trades.
              </div>
            </div>
          )}
        </motion.aside>
      </div>
    </motion.section>
  )
}

/* =====================================================================================
   SMALL HELPERS (light theme versions)
===================================================================================== */

function FieldLight({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-zinc-800">{label}</div>
      {children}
      {hint ? <div className="text-xs text-zinc-500">{hint}</div> : null}
    </div>
  )
}

function MiniStatLight({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white/70 p-3 ${emphasize ? 'ring-1 ring-black/10' : ''}`}>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${emphasize ? 'text-zinc-900' : 'text-zinc-800'}`}>{value}</div>
    </div>
  )
}

/* =====================================================================================
   Breakdown helper (same logic, light UI)
===================================================================================== */

function renderDayByDayLight(totalTrades: number, tradesPerDay: number, perSLProfit: number, label: string) {
  if (totalTrades <= 0 || tradesPerDay <= 0) return null

  const rows: { day: number; trade: number; profit: number }[] = []
  for (let i = 0; i < totalTrades; i++) {
    const day = Math.floor(i / tradesPerDay) + 1
    const trade = (i % tradesPerDay) + 1
    rows.push({ day, trade, profit: perSLProfit })
  }

  const grouped: Record<number, { trade: number; profit: number }[]> = {}
  rows.forEach((r) => {
    if (!grouped[r.day]) grouped[r.day] = []
    grouped[r.day].push({ trade: r.trade, profit: r.profit })
  })

  return (
    <>
      {Object.entries(grouped).map(([day, trades]) => (
        <div key={day} className="rounded-2xl border border-black/10 bg-white/70 p-3">
          <div className="text-sm font-semibold text-zinc-900">Day {day}</div>
          <div className="mt-2 space-y-1">
            {trades.map((t) => (
              <div key={t.trade} className="text-sm text-zinc-700">
                Trade {t.trade} SL = <span className="font-semibold text-zinc-900">${Math.round(t.profit).toLocaleString()}</span> on personal ({label})
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/* =====================================================================================
   Wistia player (same behavior as your original)
===================================================================================== */

function WistiaPlayer({ hashedId, onComplete }: { hashedId: string; onComplete?: () => void }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://fast.wistia.com/assets/external/E-v1.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      window._wq = window._wq || []
      // @ts-ignore
      window._wq.push({
        id: hashedId,
        onReady: function (video: any) {
          video.bind('end', function () {
            if (onComplete) onComplete()
          })
        },
      })
    }

    return () => {
      // keep script; wistia can be reused across videos
    }
  }, [hashedId, onComplete])

  return (
    <div className="wistia_responsive_padding" style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
      <div className="wistia_responsive_wrapper" style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }}>
        <div className={`wistia_embed wistia_async_${hashedId} videoFoam=true`} />
      </div>
    </div>
  )
}
