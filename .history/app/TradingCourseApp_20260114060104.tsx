"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Home,
  FileText,
  Download,
  PlayCircle,
  Calculator as CalculatorIcon,
  CoinsIcon,
  ChevronDown,
  X,
  ShieldAlertIcon,
  SendIcon,
  TvMinimalIcon,
} from "lucide-react"
import { Button } from "./components/ui/Button"
import { Card, CardContent } from "./components/ui/Card"
import { Progress } from "./components/ui/Progress"
import { supabase } from "@/supabaseClient"

/* -------------------------------- Drag scroll -------------------------------- */

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return
    isDownRef.current = true
    ref.current.classList.add("cursor-grabbing")
    startXRef.current = e.pageX - ref.current.offsetLeft
    scrollLeftRef.current = ref.current.scrollLeft
  }

  const onMouseLeave = () => {
    if (!ref.current) return
    isDownRef.current = false
    ref.current.classList.remove("cursor-grabbing")
  }

  const onMouseUp = () => {
    if (!ref.current) return
    isDownRef.current = false
    ref.current.classList.remove("cursor-grabbing")
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    ref.current.scrollLeft = scrollLeftRef.current - walk
  }

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove }
}

/* -------------------------------- Types -------------------------------- */

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
  evalType: "one-step" | "two-step"
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
  NAS100: { display: "NAS100 (US Tech 100)", type: "index" as const, pipValuePerLot: 0.1 },
  US30: { display: "US30 (Dow Jones)", type: "index" as const, pipValuePerLot: 0.1 },
  SPX500: { display: "SPX500 (S&P 500)", type: "index" as const, pipValuePerLot: 0.1 },
  XAUUSD: { display: "XAUUSD (Gold)", type: "gold" as const, pipValuePerLot: 100 },
  EURUSD: { display: "EURUSD", type: "forex" as const, pipValuePerLot: 10 },
  GBPUSD: { display: "GBPUSD", type: "forex" as const, pipValuePerLot: 10 },
} as const
type SymbolKey = keyof typeof SYMBOL_CONFIG

const ANNOUNCEMENT_STYLES = {
  neutral: { box: "border-zinc-800/70 bg-zinc-950/60", title: "text-zinc-100", text: "text-zinc-300" },
  green: { box: "border-zinc-700/70 bg-zinc-950/60", title: "text-zinc-100", text: "text-zinc-300" },
  yellow: { box: "border-zinc-700/70 bg-zinc-950/60", title: "text-zinc-100", text: "text-zinc-300" },
  red: { box: "border-zinc-700/70 bg-zinc-950/60", title: "text-zinc-100", text: "text-zinc-300" },
} as const

type TabKey = "home" | "lessons" | "documents" | "calculator" | "lot"

const TABS: Array<{
  key: TabKey
  label: string
  icon: React.ReactNode
  short?: string
}> = [
  { key: "home", label: "Home", icon: <Home size={16} />, short: "Home" },
  { key: "lessons", label: "Lessons", icon: <TvMinimalIcon size={16} />, short: "Lessons" },
  { key: "documents", label: "Documents", icon: <FileText size={16} />, short: "Docs" },
  { key: "calculator", label: "Calculator", icon: <CalculatorIcon size={16} />, short: "Calc" },
  { key: "lot", label: "Lot Size", icon: <CoinsIcon size={16} />, short: "Lot" },
]

/* -------------------------------- Page -------------------------------- */

export default function TradingCourseApp() {
  type Announcement = {
    id: string
    title: string | null
    message: string
    created_at: string
    variant: "neutral" | "green" | "yellow" | "red"
  }

  /* --------------------------- Announcements state --------------------------- */

  const [announcementLoading, setAnnouncementLoading] = useState(true)
  const [announcementError, setAnnouncementError] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    let mounted = true
    async function loadAnnouncements() {
      setAnnouncementLoading(true)
      setAnnouncementError(null)

      const { data, error } = await supabase
        .from("admin_announcements")
        .select("id, title, message, variant, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

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
      .channel("admin-announcements-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_announcements" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newAnnouncement = payload.new as Announcement
          setAnnouncements((prev) => [newAnnouncement, ...prev])
        }
        if (payload.eventType === "DELETE") {
          const deletedId = (payload.old as { id: string }).id
          setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId))
        }
        if (payload.eventType === "UPDATE") {
          const updated = payload.new as Announcement
          setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* --------------------------- Course data --------------------------- */

  const categories: Category[] = useMemo(
    () => [
      {
        title: "Category 1: Foundations of Prop Trading",
        lessons: [
          { title: "The Prop Firm Game — How the System Really Works", duration: "8:16", video: "h2ldqp9al5", thumbnail: "/thumbnails/t1.webp" },
          { title: "The One-Trade Evaluation Pass Method", duration: "7:48", video: "tw5e0nld6b", thumbnail: "/thumbnails/t2.webp" },
          { title: "The Funded Account Hedge System (Payout Engine)", duration: "24:07", video: "h5alyreoz8", thumbnail: "/thumbnails/t3.webp" },
          { title: "The Hedge Engine — Lot Sizes, Copier Setup & Margin Control", duration: "19:50", video: "8ti20kgpr9", thumbnail: "/thumbnails/t4.webp" },
          { title: "The Ghost Protocol Playbook — Scaling, Ban Avoidance & Mastery", duration: "9:00", video: "gozr3rjynf", thumbnail: "/thumbnails/t5.webp" },
          { title: "Coming Soon...", duration: "00:00", video: null, thumbnail: "/thumbnails/t6.webp" },
        ],
      },
    ],
    []
  )

  const documents: DocumentItem[] = useMemo(
    () => [
      { name: "Hedge Engine Blueprint", file: "/docs/Hedge Engine Blueprint.pdf" },
      { name: "Prop Ban-Avoidance Playbook (Optional)", file: "/docs/Prop Ban-Avoidance Playbook.pdf" },
      { name: "Prop Tier-List", file: "/docs/PropTierList.png" },
    ],
    []
  )

  /* --------------------------- UI / app state --------------------------- */

  const [activeTab, setActiveTab] = useState<TabKey>("home")
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [progress, setProgress] = useState<number>(0)

  // IMPORTANT: treat this as a LESSON ID, not a flat index
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(null)
  const [navMenuOpen, setNavMenuOpen] = useState(false)

  useEffect(() => {
    const disableContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener("contextmenu", disableContext)
    return () => document.removeEventListener("contextmenu", disableContext)
  }, [])

  const drag = useDragScroll()

  const lessonIds: number[][] = useMemo(() => {
    return categories.map((cat, catIdx) => {
      const start = categories.slice(0, catIdx).reduce((acc, c) => acc + c.lessons.length, 0)
      return cat.lessons.map((_, i) => start + i)
    })
  }, [categories])

  const totalLessons = useMemo(() => lessonIds.flat().length, [lessonIds])

  // Build a fast lookup: lessonId -> lesson
  const lessonById = useMemo(() => {
    const map = new Map<number, Lesson>()
    const flatLessons = categories.flatMap((c) => c.lessons)
    const flatIds = lessonIds.flat()
    for (let i = 0; i < flatIds.length; i++) {
      map.set(flatIds[i], flatLessons[i])
    }
    return map
  }, [categories, lessonIds])

  const getNextIncompleteLessonId = useCallback(() => {
    const flatIds = lessonIds.flat()
    return flatIds.find((id) => !completedLessons.includes(id)) ?? null
  }, [lessonIds, completedLessons])

  /* --------------------------- Calculator state --------------------------- */

  const [evalType, setEvalType] = useState<"one-step" | "two-step">("one-step")
  const [accountSizeInput, setAccountSizeInput] = useState<string>("200000")
  const [profitTargetInput, setProfitTargetInput] = useState<string>("10")
  const [phase2TargetInput, setPhase2TargetInput] = useState<string>("5")
  const [dailyDDInput, setDailyDDInput] = useState<string>("5")
  const [maxDDInput, setMaxDDInput] = useState<string>("10")
  const [evalCostInput, setEvalCostInput] = useState<string>("1000")
  const [riskPerDayEvalInput, setRiskPerDayEvalInput] = useState<string>("2")
  const [tradesPerDayEvalInput, setTradesPerDayEvalInput] = useState<string>("2")
  const [failEvalProfitInput, setFailEvalProfitInput] = useState<string>("1000")
  const [fundedProfitSplitInput, setFundedProfitSplitInput] = useState<string>("90")
  const [failFundedProfitInput, setFailFundedProfitInput] = useState<string>("1000")
  const [payoutTargetInput, setPayoutTargetInput] = useState<string>("5")
  const [fundedRiskPerDayInput, setFundedRiskPerDayInput] = useState<string>("2")
  const [fundedTradesPerDayInput, setFundedTradesPerDayInput] = useState<string>("2")
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)

  /* --------------------------- Lot calc state --------------------------- */

  const [lotSymbol, setLotSymbol] = useState<SymbolKey>("NAS100")
  const [lotAccountSizeProp, setLotAccountSizeProp] = useState<string>("200000")
  const [lotRiskPerTradePropInput, setLotRiskPerTradePropInput] = useState<string>("2")
  const [lotSLPipsInput, setLotSLPipsInput] = useState<string>("50")
  const [lotMaxMarginPercentInput, setLotMaxMarginPercentInput] = useState<string>("30")
  const [lotPersonalBalanceInput, setLotPersonalBalanceInput] = useState<string>("10000")
  const [lotHedgePerPercentInput, setLotHedgePerPercentInput] = useState<string>("100")
  const [lotResult, setLotResult] = useState<LotResult | null>(null)
  const [lotPropLeverageInput, setLotPropLeverageInput] = useState<string>("100")
  const [lotPersonalLeverageInput, setLotPersonalLeverageInput] = useState<string>("500")
  const [lotPriceInput, setLotPriceInput] = useState<string>("2400")

  /* --------------------------- Calculator logic (unchanged) --------------------------- */

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
    if (evalType === "two-step") {
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
          Math.abs(netAfterPayout - prevNetAfter) < 1 && Math.abs(netIfFailAfter - prevNetFailAfter) < 1 && carryCost < 1
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
      phase2Target: evalType === "two-step" ? phase2Target : undefined,
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
    if (cfg.type === "forex") contractValuePerLot = 135000
    if (cfg.type === "gold") contractValuePerLot = price * 100
    if (cfg.type === "index") contractValuePerLot = price * 1

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

  /* --------------------------- Progress persistence (unchanged) --------------------------- */

  useEffect(() => {
    const saved = localStorage.getItem("courseProgress")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompletedLessons(parsed.completedLessons || [])
        setProgress(parsed.progress || 0)
      } catch {
        localStorage.removeItem("courseProgress")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("courseProgress", JSON.stringify({ completedLessons, progress }))
  }, [completedLessons, progress])

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

  /* --------------------------- Premium monochrome layout constants --------------------------- */

  const pageBg =
    "min-h-screen w-full bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(900px_500px_at_80%_10%,rgba(255,255,255,0.04),transparent_55%),radial-gradient(1000px_700px_at_40%_100%,rgba(255,255,255,0.03),transparent_55%)] bg-black"

  const glass =
    "bg-zinc-950/55 backdrop-blur-xl border border-zinc-800/70 shadow-[0_22px_80px_rgba(0,0,0,0.75)]"

  const hairline = "border border-zinc-800/70"
  const soft = "bg-zinc-950/45"
  const input =
    "w-full rounded-2xl border border-zinc-800/70 bg-zinc-950/55 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/30 focus:ring-0"

  /* --------------------------- Convenience --------------------------- */

  const activeTabMeta = useMemo(() => TABS.find((t) => t.key === activeTab) ?? TABS[0], [activeTab])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavMenuOpen(false)
        setActiveVideo(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /* --------------------------- Render --------------------------- */

  return (
    <div className={`relative ${pageBg} text-white font-sans`}>
      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Top floating nav */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        <div className={`pointer-events-auto mx-auto max-w-6xl rounded-3xl ${glass}`}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/favicon.ico" alt="Logo" className="h-9 w-9 object-contain" />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10 blur-xl" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-100">PROP ACCELERATOR</div>
                <div className="text-[11px] text-zinc-500">Training • Hedge Engine • Lot Tool</div>
              </div>
            </div>

            {/* Desktop tabs */}
            <div className="hidden items-center gap-2 md:flex">
              <div className={`flex items-center gap-1 rounded-2xl ${hairline} ${soft} p-1`}>
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={[
                      "group flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition",
                      activeTab === t.key
                        ? "bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                    title={t.label}
                  >
                    <span className={activeTab === t.key ? "text-black" : "text-zinc-300 group-hover:text-white"}>
                      {t.icon}
                    </span>
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile dropdown */}
            <div className="relative md:hidden">
              <button
                onClick={() => setNavMenuOpen((s) => !s)}
                className={`flex items-center gap-2 rounded-2xl ${hairline} ${soft} px-3 py-2 text-sm text-zinc-100 hover:bg-white/10`}
              >
                <span className="text-zinc-200">{activeTabMeta.icon}</span>
                <span className="font-medium">{activeTabMeta.label}</span>
                <ChevronDown size={16} className={`text-zinc-400 transition ${navMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {navMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNavMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ type: "spring" as const, stiffness: 300, damping: 28 }}
                      className={`absolute right-0 top-[46px] z-50 w-[230px] overflow-hidden rounded-3xl ${glass}`}
                    >
                      <div className="p-2">
                        {TABS.map((t) => (
                          <button
                            key={t.key}
                            onClick={() => {
                              setActiveTab(t.key)
                              setNavMenuOpen(false)
                            }}
                            className={[
                              "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm transition",
                              activeTab === t.key ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10",
                            ].join(" ")}
                          >
                            <span className={activeTab === t.key ? "text-black" : "text-zinc-300"}>{t.icon}</span>
                            <span className="font-medium">{t.label}</span>
                          </button>
                        ))}

                        <div className="my-2 border-t border-zinc-800/70" />

                        <a
                          href="https://t.me/+U_s-oDtDDdg2ZDVk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
                        >
                          <ShieldAlertIcon size={16} className="text-zinc-300" />
                          Announcements
                        </a>
                        <a
                          href="https://t.me/+bpRxV73NpixlYjRk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
                        >
                          <SendIcon size={16} className="text-zinc-300" />
                          Private Community
                        </a>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Subbar */}
          <div className="flex items-center justify-between gap-3 border-t border-zinc-800/70 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="hidden h-2 w-2 rounded-full bg-white md:block" />
              <div className="text-xs text-zinc-400">
                Status: <span className="font-semibold text-zinc-100">Active</span>
                <span className="mx-2 text-zinc-700">•</span>
                Mode: <span className="font-semibold text-zinc-100">Hedged Sequence</span>
              </div>
            </div>

            <div className="flex min-w-[140px] items-center gap-3">
              <div className="w-full">
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full bg-white" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                </div>
              </div>
              <div className="w-[48px] text-right text-xs font-semibold text-zinc-200">{progress}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <motion.div className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-12 pt-[132px] sm:px-8 sm:pt-[156px]">
        <div className="w-full">
          {/* HOME */}
          {activeTab === "home" &&
            (() => {
              const nextCTA = progress >= 100 ? "Open Lot Tool" : progress > 0 ? "Resume Lessons" : "Start Lessons"

              return (
                <div className="space-y-6">
                  {/* Hero */}
                  <div className={`rounded-[28px] ${glass} p-6 sm:p-8`}>
                    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/70 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          Private training environment
                        </div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                          Execute the sequence.
                          <span className="block text-zinc-300">No improvisation.</span>
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                          This app is built to be used like a cockpit: clear steps, consistent inputs, and repeatable outputs.
                          Keep everything tight, controlled, and measurable.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() => {
                              const nextLessonId = getNextIncompleteLessonId()
                              if (nextLessonId !== null) {
                                setActiveTab("lessons")
                                setTimeout(() => setActiveVideo(nextLessonId), 160)
                              } else {
                                setActiveTab("calculator")
                              }
                            }}
                            className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_14px_50px_rgba(0,0,0,0.55)] hover:bg-zinc-100"
                          >
                            {nextCTA}
                          </button>

                          <button
                            onClick={() => setActiveTab("calculator")}
                            className="rounded-2xl border border-zinc-800/70 bg-zinc-950/50 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
                          >
                            Open Calculator
                          </button>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid gap-3">
                        <QuickTile
                          title="Lessons"
                          subtitle="Modules & completion"
                          onClick={() => setActiveTab("lessons")}
                          icon={<TvMinimalIcon size={18} />}
                        />
                        <QuickTile
                          title="Documents"
                          subtitle="Blueprints & resources"
                          onClick={() => setActiveTab("documents")}
                          icon={<FileText size={18} />}
                        />
                        <QuickTile
                          title="Lot Tool"
                          subtitle="Sizing & margin check"
                          onClick={() => setActiveTab("lot")}
                          icon={<CoinsIcon size={18} />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Announcements */}
                  <div className={`rounded-[28px] ${glass} p-6`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">Announcements</p>
                        <p className="mt-0.5 text-xs text-zinc-500">Live updates from admin</p>
                      </div>
                      <a
                        href="https://t.me/+U_s-oDtDDdg2ZDVk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                      >
                        Open channel
                      </a>
                    </div>

                    {announcementLoading ? (
                      <p className="text-sm text-zinc-400">Loading…</p>
                    ) : announcementError ? (
                      <p className="text-sm text-zinc-300">Failed to load announcements: {announcementError}</p>
                    ) : announcements.length > 0 ? (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {announcements.map((a) => {
                          const styles = ANNOUNCEMENT_STYLES[a.variant ?? "neutral"]
                          return (
                            <div key={a.id} className={`rounded-3xl border p-4 ${styles.box}`}>
                              {a.title && <p className={`mb-1 text-sm font-semibold ${styles.title}`}>{a.title}</p>}
                              <p className={`whitespace-pre-line text-sm ${styles.text}`}>{a.message}</p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">No active announcements.</p>
                    )}
                  </div>

                  {/* Principles */}
                  <div className={`rounded-[28px] ${glass} p-6`}>
                    <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">NON-NEGOTIABLES</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Principle title="Protect drawdown" text="Stay within daily and max DD. The entire edge depends on consistency." />
                      <Principle title="Match inputs" text="Keep risk, trades/day, and lot sizing aligned across tools. No mismatches." />
                      <Principle title="Repeat the cycle" text="Treat this like a process, not a trade. Outcomes compound over cycles." />
                    </div>

                    <div className="mt-5 rounded-3xl border border-zinc-800/70 bg-zinc-950/40 p-4">
                      <p className="text-xs text-zinc-500">Disclaimer</p>
                      <p className="mt-1 text-sm text-zinc-400">Information for educational purposes only. Not financial advice.</p>
                    </div>
                  </div>
                </div>
              )
            })()}

          {/* LESSONS */}
          {activeTab === "lessons" && (
            <div className="w-full space-y-6">
              <div className={`rounded-[28px] ${glass} p-6`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Training Modules</h2>
                    <p className="mt-1 text-sm text-zinc-400">Swipe horizontally. Click a module to open the video.</p>
                  </div>
                  <div className="w-full max-w-sm">
                    <Progress value={progress} />
                    <p className="mt-2 text-xs text-zinc-500">{progress}% completed</p>
                  </div>
                </div>
              </div>

              <div
                ref={drag.ref}
                onMouseDown={drag.onMouseDown}
                onMouseLeave={drag.onMouseLeave}
                onMouseUp={drag.onMouseUp}
                onMouseMove={drag.onMouseMove}
                className="hide-scroll w-full cursor-grab select-none overflow-x-auto overflow-y-visible px-1 pb-4 pt-1 active:cursor-grabbing"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex snap-x snap-mandatory gap-4 px-1 sm:gap-6">
                  {categories.flatMap((cat, catIndex) =>
                    cat.lessons.map((lesson, lessonIndex) => {
                      const id = lessonIds[catIndex][lessonIndex]
                      const completed = completedLessons.includes(id)

                      return (
                        <div
                          key={id}
                          className="group relative h-[480px] max-w-[280px] min-w-[280px] cursor-pointer overflow-hidden rounded-[28px] border border-zinc-800/70 bg-zinc-950/45 shadow-[0_24px_80px_rgba(0,0,0,0.65)] transition-transform hover:z-10 hover:scale-[1.02] active:scale-[0.99] sm:h-[560px] sm:max-w-[320px] sm:min-w-[320px]"
                          onClick={() => {
                            if (lesson.video) setActiveVideo(id)
                          }}
                        >
                          <div className="relative h-[70%] w-full overflow-hidden">
                            <img
                              src={lesson.thumbnail}
                              className="h-full w-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-95"
                              alt={lesson.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/85" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition group-hover:bg-white/15">
                                <PlayCircle size={46} className="text-white/90" />
                              </div>
                            </div>

                            <div className="absolute left-4 top-4 rounded-full border border-zinc-800/70 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                              {lesson.duration}
                            </div>

                            {completed && (
                              <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-100 backdrop-blur">
                                Completed
                              </div>
                            )}
                          </div>

                          <div className="flex h-[30%] flex-col justify-between p-5">
                            <div>
                              <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-zinc-100">{lesson.title}</h3>
                              <p className="mt-2 text-sm text-zinc-500">Tap to open</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-zinc-600">{cat.title}</div>
                              <div className="h-8 w-8 rounded-2xl border border-zinc-800/70 bg-zinc-950/50" />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Video modal */}
              <AnimatePresence>
                {activeVideo !== null && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveVideo(null)}
                  >
                    <motion.div
                      initial={{ y: 10, scale: 0.98, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{ y: 10, scale: 0.98, opacity: 0 }}
                      transition={{ type: "spring" as const, stiffness: 280, damping: 26 }}
                      className={`relative w-full max-w-4xl overflow-hidden rounded-[28px] ${glass}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveVideo(null)}
                        className="absolute right-3 top-3 z-10 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-2 text-zinc-200 hover:bg-white/10"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>

                      <div className="relative w-full">
                        {(() => {
                          const lesson = lessonById.get(activeVideo)
                          const videoId = lesson?.video
                          if (!videoId) {
                            return (
                              <div className="p-12 text-center text-zinc-300">
                                <p>No video available for this module yet.</p>
                              </div>
                            )
                          }
                          return <WistiaPlayer hashedId={videoId} onComplete={() => markComplete(activeVideo)} />
                        })()}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className={`rounded-[28px] ${glass} p-6`}>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Documents</h2>
                <p className="mt-1 text-sm text-zinc-400">Preview or download your resources.</p>
              </div>

              <div className="grid gap-3">
                {documents.map((doc, index) => {
                  const active = activeDocIndex === index
                  const isImage = doc.file.toLowerCase().endsWith(".png")

                  return (
                    <Card key={index} className={`${glass}`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-zinc-100">{doc.name}</div>
                            <div className="text-xs text-zinc-500">{doc.file.split("/").pop()}</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setActiveDocIndex(active ? null : index)}
                              className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                                active
                                  ? "border-white/20 bg-white text-black"
                                  : "border-zinc-800/70 bg-zinc-950/40 text-zinc-200 hover:bg-white/10"
                              }`}
                            >
                              {active ? "Close preview" : "Preview"}
                            </button>

                            <a href={doc.file} download>
                              <button className="flex items-center gap-1 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10">
                                <Download size={14} /> Download
                              </button>
                            </a>
                          </div>
                        </div>

                        {active && (
                          <div className="mt-4 overflow-hidden rounded-[22px] border border-zinc-800/70 bg-black">
                            {isImage ? (
                              <img src={doc.file} alt={doc.name} className="h-[520px] w-full object-contain" />
                            ) : (
                              <iframe src={doc.file} className="h-[520px] w-full" title={doc.name} />
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className={`rounded-[28px] ${glass} p-6`}>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Hedged Prop Calculator</h2>
                <p className="mt-2 text-sm text-zinc-400">Same logic, cleaner cockpit. Educational use only — not financial advice.</p>
              </div>

              <div className="grid gap-4">
                <Card className={`${glass}`}>
                  <CardContent className="space-y-5 p-5">
                    {/* Eval type */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold tracking-[0.18em] text-zinc-400">EVALUATION TYPE</div>
                        <div className="mt-1 text-sm text-zinc-300">Choose the evaluation structure.</div>
                      </div>

                      <div className={`flex items-center gap-1 rounded-2xl ${hairline} ${soft} p-1`}>
                        <button
                          onClick={() => setEvalType("one-step")}
                          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            evalType === "one-step" ? "border-white/20 bg-white text-black" : "border-transparent text-zinc-200 hover:bg-white/10"
                          }`}
                        >
                          1-step
                        </button>
                        <button
                          onClick={() => setEvalType("two-step")}
                          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            evalType === "two-step" ? "border-white/20 bg-white text-black" : "border-transparent text-zinc-200 hover:bg-white/10"
                          }`}
                        >
                          2-step
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Account size (prop)">
                        <input type="number" className={input} value={accountSizeInput} onChange={(e) => setAccountSizeInput(e.target.value)} />
                      </Field>

                      <Field label="Eval cost ($)">
                        <input type="number" className={input} value={evalCostInput} onChange={(e) => setEvalCostInput(e.target.value)} />
                      </Field>

                      <Field label="Phase 1 target (%)">
                        <input type="number" className={input} value={profitTargetInput} onChange={(e) => setProfitTargetInput(e.target.value)} />
                      </Field>

                      {evalType === "two-step" && (
                        <Field label="Phase 2 target (%)">
                          <input type="number" className={input} value={phase2TargetInput} onChange={(e) => setPhase2TargetInput(e.target.value)} />
                        </Field>
                      )}

                      <Field label="Daily DD (%)">
                        <input type="number" className={input} value={dailyDDInput} onChange={(e) => setDailyDDInput(e.target.value)} />
                      </Field>

                      <Field label="Max DD (%)">
                        <input type="number" className={input} value={maxDDInput} onChange={(e) => setMaxDDInput(e.target.value)} />
                      </Field>

                      <Field label="Risk per day on prop (evaluation) %" hint="Must be ≤ Daily DD. Total risk per day during evaluation.">
                        <input type="number" className={input} value={riskPerDayEvalInput} onChange={(e) => setRiskPerDayEvalInput(e.target.value)} />
                      </Field>

                      <Field label="Trades per day (evaluation)">
                        <input type="number" min={1} className={input} value={tradesPerDayEvalInput} onChange={(e) => setTradesPerDayEvalInput(e.target.value)} />
                      </Field>

                      <Field label="Profit on fail (eval) – personal ($)">
                        <input type="number" className={input} value={failEvalProfitInput} onChange={(e) => setFailEvalProfitInput(e.target.value)} />
                      </Field>

                      <Field label="Profit split on funded (%)">
                        <input type="number" className={input} value={fundedProfitSplitInput} onChange={(e) => setFundedProfitSplitInput(e.target.value)} />
                      </Field>

                      <Field label="Profit on fail (funded) – personal ($)">
                        <input type="number" className={input} value={failFundedProfitInput} onChange={(e) => setFailFundedProfitInput(e.target.value)} />
                      </Field>

                      <Field label="Payout target on funded (%)">
                        <input type="number" className={input} value={payoutTargetInput} onChange={(e) => setPayoutTargetInput(e.target.value)} />
                      </Field>

                      <Field label="Risk per day on prop (funded) %">
                        <input type="number" className={input} value={fundedRiskPerDayInput} onChange={(e) => setFundedRiskPerDayInput(e.target.value)} />
                      </Field>

                      <Field label="Trades per day (funded)">
                        <input type="number" min={1} className={input} value={fundedTradesPerDayInput} onChange={(e) => setFundedTradesPerDayInput(e.target.value)} />
                      </Field>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <button onClick={handleCalculate} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-100">
                        Calculate
                      </button>

                      <div className="text-xs text-zinc-500">Tip: keep inputs identical across calculator + lot tool for consistent sizing.</div>
                    </div>
                  </CardContent>
                </Card>

                {calcResult && (
                  <Card className={`${glass}`}>
                    <CardContent className="space-y-4 p-5 text-sm leading-relaxed">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <h3 className="text-lg font-semibold text-zinc-100">Full Breakdown</h3>
                        <div className="text-xs text-zinc-500">
                          Max DD: <span className="font-semibold text-zinc-200">{calcResult.maxDD.toFixed(2)}%</span>
                          <span className="mx-2 text-zinc-700">•</span>
                          Daily DD: <span className="font-semibold text-zinc-200">{calcResult.dailyDD.toFixed(2)}%</span>
                        </div>
                      </div>

                      <div className={`rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4`}>
                        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">IF EVALUATION FAILS</p>
                        <div className="mt-3 space-y-2 text-zinc-300">
                          <p>
                            Risk per trade (eval):{" "}
                            <span className="font-semibold text-zinc-100">{calcResult.riskPerTradeEval.toFixed(2)}%</span> with{" "}
                            <span className="font-semibold text-zinc-100">{calcResult.tradesPerDayEval}</span> trade(s)/day.
                          </p>
                          <p>
                            Max SL trades before max DD: <span className="font-semibold text-zinc-100">{calcResult.maxEvalSLTrades}</span>
                          </p>
                          <div className="mt-2 space-y-1">
                            {renderDayByDay(calcResult.maxEvalSLTrades, calcResult.tradesPerDayEval, calcResult.perSLProfitEval, "evaluation hedge")}
                          </div>
                          <div className="mt-3 border-t border-zinc-800/70 pt-3">
                            <p>
                              Personal net ≈{" "}
                              <span className="font-semibold text-zinc-100">${Math.round(calcResult.evalFailGrossPersonal).toLocaleString()}</span> −{" "}
                              <span className="font-semibold text-zinc-100">${Math.round(calcResult.evalCost).toLocaleString()}</span> ≈{" "}
                              <span className="font-semibold text-white">${Math.round(calcResult.evalFailNet).toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4`}>
                        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">IF EVALUATION PASSES → FUNDED</p>
                        <div className="mt-3 space-y-2 text-zinc-300">
                          <p>
                            Phase 1 target: <span className="font-semibold text-zinc-100">{calcResult.phase1Target.toFixed(2)}%</span> → ~
                            <span className="font-semibold text-zinc-100">{calcResult.phase1RR.toFixed(2)}R</span>
                          </p>
                          {calcResult.evalType === "two-step" && calcResult.phase2RR !== undefined && (
                            <p>
                              Phase 2 target: <span className="font-semibold text-zinc-100">{calcResult.phase2Target?.toFixed(2)}%</span> → ~
                              <span className="font-semibold text-zinc-100">{calcResult.phase2RR.toFixed(2)}R</span>
                            </p>
                          )}

                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <MiniStat label="Phase 1 cost (personal)" value={`$${Math.round(calcResult.phase1CostPersonal).toLocaleString()}`} />
                            {calcResult.evalType === "two-step" ? (
                              <MiniStat label="Phase 2 cost (personal)" value={`$${Math.round(calcResult.phase2CostPersonal ?? 0).toLocaleString()}`} />
                            ) : (
                              <MiniStat label="Phase 2 cost" value="—" />
                            )}
                            <MiniStat label="Cost to funded" value={`$${Math.round(calcResult.costToFunded).toLocaleString()}`} emphasize />
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4`}>
                        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">IF FUNDED FAILS (BEFORE PAYOUTS)</p>
                        <div className="mt-3 space-y-2 text-zinc-300">
                          <p>
                            Risk per trade (funded):{" "}
                            <span className="font-semibold text-zinc-100">{calcResult.riskPerTradeFunded.toFixed(2)}%</span> with{" "}
                            <span className="font-semibold text-zinc-100">{calcResult.fundedTradesPerDay}</span> trade(s)/day.
                          </p>
                          <p>
                            Personal per SL profit (funded hedge):{" "}
                            <span className="font-semibold text-zinc-100">${Math.round(calcResult.perSLProfitFunded).toLocaleString()}</span>
                          </p>
                          <p>
                            Max SL trades before max DD: <span className="font-semibold text-zinc-100">{calcResult.maxFundedSLTrades}</span>
                          </p>
                          <div className="mt-2 space-y-1">
                            {renderDayByDay(calcResult.maxFundedSLTrades, calcResult.fundedTradesPerDay, calcResult.perSLProfitFunded, "funded hedge")}
                          </div>
                          <div className="mt-3 border-t border-zinc-800/70 pt-3">
                            <p>
                              Net after funded fail ≈ <span className="font-semibold text-white">${Math.round(calcResult.fundedFailNet).toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4`}>
                        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">IF FUNDED PAYOUTS HIT</p>
                        <div className="mt-3 space-y-2 text-zinc-300">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <MiniStat label="Payout amount" value={`$${Math.round(calcResult.payoutAmount).toLocaleString()}`} emphasize />
                            <MiniStat label="Hedge loss per payout" value={`$${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}`} />
                            <MiniStat label="Payout RR (funded)" value={`${calcResult.payoutRRFunded.toFixed(2)}R`} />
                          </div>

                          <div className="mt-2 grid gap-3">
                            {calcResult.payoutScenarios.map((scenario, idx) => (
                              <div key={scenario.index} className="rounded-3xl border border-zinc-800/70 bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-100">Payout {scenario.index}</p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                      Total cost carried + hedge loss: ${Math.round(scenario.totalCost).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-zinc-500">Net after payout</p>
                                    <p className={`text-sm font-semibold ${scenario.netAfterPayout >= 0 ? "text-white" : "text-zinc-300"}`}>
                                      ${Math.round(scenario.netAfterPayout).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-3">
                                    <p className="text-xs text-zinc-500">Remaining carry cost</p>
                                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                                      ${Math.max(0, Math.round(-scenario.netAfterPayout)).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-3">
                                    <p className="text-xs text-zinc-500">Net if fail after payout</p>
                                    <p className={`mt-1 text-sm font-semibold ${scenario.netIfFailAfter >= 0 ? "text-white" : "text-zinc-300"}`}>
                                      ${Math.round(scenario.netIfFailAfter).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {idx === calcResult.payoutScenarios.length - 1 && (
                                  <p className="mt-3 text-xs text-zinc-600">
                                    After enough payouts, results stabilise. Additional payouts/fails tend to repeat similar outcomes.
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* LOT TOOL */}
          {activeTab === "lot" && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className={`rounded-[28px] ${glass} p-6`}>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Lot Size Calculator</h2>
                <p className="mt-2 text-sm text-zinc-400">Approx lot sizing + margin estimate. Educational use only — verify with your broker.</p>
              </div>

              <div className="grid gap-4">
                <Card className={`${glass}`}>
                  <CardContent className="space-y-4 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Symbol" hint="Pips = FX pips / index points / $ move for gold.">
                        <select className={input} value={lotSymbol} onChange={(e) => setLotSymbol(e.target.value as SymbolKey)}>
                          {Object.entries(SYMBOL_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>
                              {cfg.display}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Prop account size ($)">
                        <input type="number" className={input} value={lotAccountSizeProp} onChange={(e) => setLotAccountSizeProp(e.target.value)} />
                      </Field>

                      <Field label="Risk per trade on prop (%)" hint="Same % used in the calculator outputs.">
                        <input type="number" className={input} value={lotRiskPerTradePropInput} onChange={(e) => setLotRiskPerTradePropInput(e.target.value)} />
                      </Field>

                      <Field label="Stop loss distance (pips / points)" hint="Indices = points · FX = pips · Gold = $ move.">
                        <input type="number" className={input} value={lotSLPipsInput} onChange={(e) => setLotSLPipsInput(e.target.value)} />
                      </Field>

                      <Field label="Current Price" hint="Needed for margin estimates (indices/gold).">
                        <input type="number" className={input} value={lotPriceInput} onChange={(e) => setLotPriceInput(e.target.value)} />
                      </Field>

                      <Field label="Max margin % (approx)" hint="For your own sanity check (not enforced).">
                        <input type="number" className={input} value={lotMaxMarginPercentInput} onChange={(e) => setLotMaxMarginPercentInput(e.target.value)} />
                      </Field>

                      <Field label="Prop firm leverage (e.g. 100 = 1:100)">
                        <input type="number" className={input} value={lotPropLeverageInput} onChange={(e) => setLotPropLeverageInput(e.target.value)} />
                      </Field>

                      <Field label="Personal broker leverage (e.g. 500 = 1:500)">
                        <input type="number" className={input} value={lotPersonalLeverageInput} onChange={(e) => setLotPersonalLeverageInput(e.target.value)} />
                      </Field>

                      <Field label="Personal account balance ($)">
                        <input type="number" className={input} value={lotPersonalBalanceInput} onChange={(e) => setLotPersonalBalanceInput(e.target.value)} />
                      </Field>

                      <Field label="$ target per 1% prop loss" hint="Copy from the hedge calculator’s “hedge per 1%”.">
                        <input type="number" className={input} value={lotHedgePerPercentInput} onChange={(e) => setLotHedgePerPercentInput(e.target.value)} />
                      </Field>
                    </div>

                    <button onClick={handleLotCalculate} className="mt-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-100">
                      Calculate lot sizes
                    </button>
                  </CardContent>
                </Card>

                {lotResult && (
                  <Card className={`${glass}`}>
                    <CardContent className="space-y-4 p-5 text-sm leading-relaxed">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <h3 className="text-lg font-semibold text-zinc-100">Lot Size Summary</h3>
                        <div className="text-xs text-zinc-500">{lotResult.symbolDisplay}</div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4">
                          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">PROP ACCOUNT</p>
                          <div className="mt-3 space-y-2 text-zinc-300">
                            <p>
                              Account: <span className="font-semibold text-zinc-100">${lotResult.accountSizeProp.toLocaleString()}</span>
                              <span className="mx-2 text-zinc-700">•</span>
                              Risk: <span className="font-semibold text-zinc-100">{lotResult.riskPerTradeProp.toFixed(2)}%</span>
                              <span className="mx-2 text-zinc-700">•</span>
                              $ Risk: <span className="font-semibold text-zinc-100">${Math.round(lotResult.riskDollarProp).toLocaleString()}</span>
                            </p>
                            <p>
                              SL: <span className="font-semibold text-zinc-100">{lotResult.slPips.toFixed(1)}</span>
                              <span className="mx-2 text-zinc-700">•</span>
                              Pip/lot: <span className="font-semibold text-zinc-100">${lotResult.pipValuePerLot.toFixed(2)}</span>
                            </p>

                            <div className="mt-2 rounded-2xl border border-zinc-800/70 bg-black/20 p-3">
                              <p className="text-xs text-zinc-500">Recommended prop lot</p>
                              <p className="mt-1 text-base font-semibold text-white">{lotResult.lotSizeProp.toFixed(3)} lots</p>
                            </div>

                            {typeof lotResult.approxMarginUsedPercent === "number" && (
                              <p className="text-xs text-zinc-500">
                                Approx margin usage: <span className="font-semibold text-zinc-200">{lotResult.approxMarginUsedPercent.toFixed(1)}%</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4">
                          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-400">PERSONAL HEDGE</p>
                          <div className="mt-3 space-y-2 text-zinc-300">
                            <p>
                              Target per 1% prop loss: <span className="font-semibold text-zinc-100">${lotResult.hedgePerPercent.toFixed(2)}</span>
                            </p>
                            <p>
                              Gain needed per opposite trade:{" "}
                              <span className="font-semibold text-zinc-100">${Math.round(lotResult.personalGainPerTrade).toLocaleString()}</span>
                            </p>

                            <div className="mt-2 rounded-2xl border border-zinc-800/70 bg-black/20 p-3">
                              <p className="text-xs text-zinc-500">Recommended personal hedge lot</p>
                              <p className="mt-1 text-base font-semibold text-white">{lotResult.lotSizePersonal.toFixed(3)} lots</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <MiniStat label="Prop margin %" value={`${lotResult.marginPropPercent.toFixed(2)}%`} />
                              <MiniStat label="Personal margin %" value={`${lotResult.marginPersonalPercent.toFixed(2)}%`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/35 p-4 text-xs text-zinc-500">
                        Always verify pip values and margin with your actual broker before placing trades.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* -------------------------------- Small UI helpers -------------------------------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300">{label}</label>
      {children}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  )
}

function MiniStat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-3 ${
        emphasize ? "shadow-[0_18px_60px_rgba(0,0,0,0.55)]" : ""
      }`}
    >
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${emphasize ? "text-white" : "text-zinc-200"}`}>{value}</div>
    </div>
  )
}

function QuickTile({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-[24px] border border-zinc-800/70 bg-zinc-950/45 p-4 text-left shadow-[0_18px_70px_rgba(0,0,0,0.55)] transition hover:bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-100">{title}</div>
          <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-2 text-zinc-200 group-hover:bg-white/10">
          {icon}
        </div>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-900">
        <div className="h-full w-1/3 bg-white/20" />
      </div>
    </button>
  )
}

function Principle({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-zinc-800/70 bg-zinc-950/40 p-4">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-2 text-sm text-zinc-400">{text}</div>
    </div>
  )
}

/* -------------------------------- Breakdown helper (unchanged) -------------------------------- */

function renderDayByDay(totalTrades: number, tradesPerDay: number, perSLProfit: number, label: string) {
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
        <div key={day} className="rounded-2xl border border-zinc-800/70 bg-black/20 p-3">
          <p className="text-sm font-semibold text-zinc-100">Day {day}</p>
          <div className="mt-2 space-y-1">
            {trades.map((t) => (
              <p key={t.trade} className="text-sm text-zinc-300">
                Trade {t.trade} SL = <span className="font-semibold text-zinc-100">${Math.round(t.profit).toLocaleString()}</span>{" "}
                on personal ({label})
              </p>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/* -------------------------------- Wistia player (same behavior) -------------------------------- */

function WistiaPlayer({ hashedId, onComplete }: { hashedId: string; onComplete?: () => void }) {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://fast.wistia.com/assets/external/E-v1.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      window._wq = window._wq || []
      // @ts-ignore
      window._wq.push({
        id: hashedId,
        onReady: function (video: any) {
          video.bind("end", function () {
            if (onComplete) onComplete()
          })
        },
      })
    }

    return () => {
      // keep behaviour identical; no teardown required for this embed pattern
    }
  }, [hashedId, onComplete])

  return (
    <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
      <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
        <div className={`wistia_embed wistia_async_${hashedId} videoFoam=true`} />
      </div>
    </div>
  )
}
