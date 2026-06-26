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
} from "lucide-react"
import { ShieldAlertIcon, SendIcon, TvMinimalIcon } from "lucide-react"
import { Button } from "./components/ui/Button"
import { Card, CardContent } from "./components/ui/Card"
import { Progress } from "./components/ui/Progress"
import { supabase } from "@/supabaseClient"

/* -------------------------------- Drag scroll -------------------------------- */

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return
    isDown = true
    ref.current.classList.add("cursor-grabbing")
    startX = e.pageX - ref.current.offsetLeft
    scrollLeft = ref.current.scrollLeft
  }

  const onMouseLeave = () => {
    if (!ref.current) return
    isDown = false
    ref.current.classList.remove("cursor-grabbing")
  }

  const onMouseUp = () => {
    if (!ref.current) return
    isDown = false
    ref.current.classList.remove("cursor-grabbing")
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX) * 1.5
    ref.current.scrollLeft = scrollLeft - walk
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
  NAS100: {
    display: "NAS100 (US Tech 100)",
    type: "index" as const,
    pipValuePerLot: 0.1,
  },
  US30: {
    display: "US30 (Dow Jones)",
    type: "index" as const,
    pipValuePerLot: 0.1,
  },
  SPX500: {
    display: "SPX500 (S&P 500)",
    type: "index" as const,
    pipValuePerLot: 0.1,
  },
  XAUUSD: {
    display: "XAUUSD (Gold)",
    type: "gold" as const,
    pipValuePerLot: 100,
  },
  EURUSD: {
    display: "EURUSD",
    type: "forex" as const,
    pipValuePerLot: 10,
  },
  GBPUSD: {
    display: "GBPUSD",
    type: "forex" as const,
    pipValuePerLot: 10,
  },
} as const

type SymbolKey = keyof typeof SYMBOL_CONFIG

const ANNOUNCEMENT_STYLES = {
  neutral: {
    box: "border-zinc-700/60 bg-zinc-900/60",
    title: "text-zinc-100",
    text: "text-zinc-200",
  },
  green: {
    box: "border-emerald-400/30 bg-emerald-400/10",
    title: "text-emerald-300",
    text: "text-emerald-100",
  },
  yellow: {
    box: "border-yellow-400/30 bg-yellow-400/10",
    title: "text-yellow-300",
    text: "text-yellow-100",
  },
  red: {
    box: "border-red-400/30 bg-red-400/10",
    title: "text-red-300",
    text: "text-red-100",
  },
}

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_announcements",
        },
        (payload) => {
          // INSERT
          if (payload.eventType === "INSERT") {
            const newAnnouncement = payload.new as Announcement
            setAnnouncements((prev) => [newAnnouncement, ...prev])
          }

          // DELETE
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id
            setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId))
          }

          // UPDATE
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Announcement
            setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
          }
        }
      )
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
          {
            title: "The Prop Firm Game — How the System Really Works",
            duration: "8:16",
            video: "h2ldqp9al5",
            thumbnail: "/thumbnails/t1.webp",
          },
          {
            title: "The One-Trade Evaluation Pass Method",
            duration: "7:48",
            video: "tw5e0nld6b",
            thumbnail: "/thumbnails/t2.webp",
          },
          {
            title: "The Funded Account Hedge System (Payout Engine)",
            duration: "24:07",
            video: "h5alyreoz8",
            thumbnail: "/thumbnails/t3.webp",
          },
          {
            title: "The Hedge Engine — Lot Sizes, Copier Setup & Margin Control",
            duration: "19:50",
            video: "8ti20kgpr9",
            thumbnail: "/thumbnails/t4.webp",
          },
          {
            title: "The Ghost Protocol Playbook — Scaling, Ban Avoidance & Mastery",
            duration: "9:00",
            video: "gozr3rjynf",
            thumbnail: "/thumbnails/t5.webp",
          },
          { title: "Coming Soon...", duration: "00:00", video: "gozr3rjynf", thumbnail: "/thumbnails/t6.webp" },
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

  const [activeTab, setActiveTab] = useState<"home" | "lessons" | "documents" | "calculator" | "lot">("home")
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [])

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

      payoutScenarios.push({
        index: i,
        totalCost: totalCostThis,
        netAfterPayout,
        netIfFailAfter,
      })

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
    const maxMarginPercent = parseFloat(lotMaxMarginPercentInput) || 0
    const maxDD = parseFloat(maxDDInput) || 0

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

    if (cfg.type === "forex") {
      contractValuePerLot = 135000
    }

    if (cfg.type === "gold") {
      contractValuePerLot = price * 100
    }

    if (cfg.type === "index") {
      contractValuePerLot = price * 1
    }

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

  /* --------------------------- Premium-ish layout constants --------------------------- */

  const pageBg =
    "min-h-screen w-full bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(34,197,94,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_10%,rgba(59,130,246,0.10),transparent_55%),radial-gradient(1000px_700px_at_40%_100%,rgba(244,63,94,0.10),transparent_55%)]"

  const panel =
    "bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/70 shadow-[0_20px_70px_rgba(0,0,0,0.65)]"

  /* --------------------------- Render --------------------------- */

  return (
    <div className={`relative ${pageBg} text-white font-sans`}>
      {/* Global CSS helpers */}
      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Floating brand mark */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <div className="relative">
          <img src="/favicon.ico" alt="Logo" className="w-10 h-10 object-contain" />
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-200">PROP ACCELERATOR</div>
          <div className="text-[11px] text-zinc-500">Training • Hedge Engine • Lot Tool</div>
        </div>
      </div>

      {/* Mobile hamburger */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 right-4 z-40 rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-2 hover:bg-white/10"
        >
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -260, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col justify-between ${panel}`}
          >
            <div className="p-4">
              <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-4">
                <img src="/favicon.ico" alt="Prop Accelerator Logo" className="mb-2 h-14 w-14 object-contain" />
                <div className="text-center">
                  <div className="text-sm font-semibold tracking-wide">PROP ACCELERATOR</div>
                  <div className="mt-1 text-[11px] text-zinc-500">Execute the sequence. Don’t improvise.</div>
                </div>
              </div>

              <div className="space-y-1">
                <SidebarItem
                  icon={<Home size={18} />}
                  label="Home"
                  active={activeTab === "home"}
                  onClick={() => {
                    setActiveTab("home")
                    setSidebarOpen(false)
                  }}
                />
                <SidebarItem
                  icon={<TvMinimalIcon size={18} />}
                  label="Lessons"
                  active={activeTab === "lessons"}
                  onClick={() => {
                    setActiveTab("lessons")
                    setSidebarOpen(false)
                  }}
                />
                <SidebarItem
                  icon={<FileText size={18} />}
                  label="Documents"
                  active={activeTab === "documents"}
                  onClick={() => {
                    setActiveTab("documents")
                    setSidebarOpen(false)
                  }}
                />
                <SidebarItem
                  icon={<CalculatorIcon size={18} />}
                  label="Calculator"
                  active={activeTab === "calculator"}
                  onClick={() => {
                    setActiveTab("calculator")
                    setSidebarOpen(false)
                  }}
                />
                <SidebarItem
                  icon={<CoinsIcon size={18} />}
                  label="Lot Size"
                  active={activeTab === "lot"}
                  onClick={() => {
                    setActiveTab("lot")
                    setSidebarOpen(false)
                  }}
                />
                <div className="my-3 border-t border-zinc-800/70" />
                <SidebarItem
                  icon={<ShieldAlertIcon size={18} />}
                  label="Announcements"
                  href="https://t.me/+U_s-oDtDDdg2ZDVk"
                />
                <SidebarItem icon={<SendIcon size={18} />} label="Private Community" href="https://t.me/+bpRxV73NpixlYjRk" />
              </div>
            </div>

            <div className="p-4">
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-3 text-center text-xs text-zinc-500">
                *Information for educational purposes only
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <motion.div className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-10 pt-24 sm:px-8">
        <div className="w-full">
          {/* HOME */}
          {activeTab === "home" &&
            (() => {
              const nextCTA = progress >= 100 ? "Optimize Lot Sizes" : progress > 0 ? "Resume Training" : "Start Training"

              return (
                <div className="space-y-8">
                  <div className={`rounded-3xl p-6 sm:p-8 ${panel}`}>
                    <div className="max-w-3xl">
                      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        You Are Now Inside The <span className="text-red-400">System…</span>
                      </h2>
                      <p className="mt-3 text-base leading-relaxed text-zinc-300 sm:text-lg">
                        This method is engineered for <span className="font-semibold text-red-300">mathematical certainty</span>,
                        not luck. You are now inside <span className="font-semibold text-red-300">Prop Accelerator</span> — follow
                        the sequence precisely.
                      </p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-5">
                          <div className="text-xs text-zinc-500">SYSTEM STATUS</div>
                          <div className="mt-1 text-xl font-semibold">
                            ACTIVE <span className="text-emerald-400">●</span>
                          </div>
                          <div className="mt-3 text-sm text-zinc-400">
                            Mode: <span className="font-semibold text-white">Prop Accelerator (Hedged)</span>
                            <br />
                            Objective: <span className="font-semibold text-white">Funded → Payout Cycles</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-5">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-xs text-zinc-500">PROGRESS</div>
                              <div className="mt-1 text-3xl font-semibold">{progress}%</div>
                              <div className="text-xs text-zinc-500">completed</div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full bg-emerald-400"
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => {
                            const nextLessonId = getNextIncompleteLessonId()
                            if (nextLessonId !== null) {
                              setActiveTab("lessons")
                              setTimeout(() => setActiveVideo(nextLessonId), 200)
                            } else {
                              setActiveTab("calculator")
                            }
                          }}
                          className="rounded-2xl bg-emerald-400 px-7 py-4 text-lg font-bold text-black shadow-[0_0_60px_rgba(74,222,128,0.22)] hover:bg-emerald-300"
                        >
                          {nextCTA}
                        </button>

                        <button
                          onClick={() => setActiveTab("calculator")}
                          className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-7 py-4 text-lg font-semibold text-white hover:bg-white/10"
                        >
                          Open Calculator
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Announcements */}
                  <div className={`rounded-3xl p-6 ${panel}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Announcements</p>
                      <span className="text-xs text-zinc-500">Live updates</span>
                    </div>

                    {announcementLoading ? (
                      <p className="text-sm text-zinc-400">Loading…</p>
                    ) : announcementError ? (
                      <p className="text-sm text-red-400">Failed to load announcements: {announcementError}</p>
                    ) : announcements.length > 0 ? (
                      <div className="space-y-3">
                        {announcements.map((a) => {
                          const styles = ANNOUNCEMENT_STYLES[a.variant ?? "neutral"]
                          return (
                            <div key={a.id} className={`rounded-2xl border p-4 ${styles.box}`}>
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

                  {/* Steps */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className={`rounded-3xl p-5 ${panel}`}>
                      <p className="text-xs text-zinc-500">STEP 1</p>
                      <h4 className="mt-1 text-base font-semibold">Watch Module 1</h4>
                      <p className="mt-2 text-sm text-zinc-400">Start with foundations. No skipping.</p>
                      <button
                        onClick={() => setActiveTab("lessons")}
                        className="mt-4 w-full rounded-2xl border border-zinc-800/70 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                      >
                        Go to Lessons
                      </button>
                    </div>

                    <div className={`rounded-3xl p-5 ${panel}`}>
                      <p className="text-xs text-zinc-500">STEP 2</p>
                      <h4 className="mt-1 text-base font-semibold">Run Hedge Calculator</h4>
                      <p className="mt-2 text-sm text-zinc-400">Generate your baseline hedge numbers.</p>
                      <button
                        onClick={() => setActiveTab("calculator")}
                        className="mt-4 w-full rounded-2xl border border-zinc-800/70 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                      >
                        Open Calculator
                      </button>
                    </div>

                    <div className={`rounded-3xl p-5 ${panel}`}>
                      <p className="text-xs text-zinc-500">STEP 3</p>
                      <h4 className="mt-1 text-base font-semibold">Size Your Lots</h4>
                      <p className="mt-2 text-sm text-zinc-400">Convert theory → execution sizing.</p>
                      <button
                        onClick={() => setActiveTab("lot")}
                        className="mt-4 w-full rounded-2xl border border-zinc-800/70 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                      >
                        Open Lot Tool
                      </button>
                    </div>
                  </div>

                  {/* Non-negotiables */}
                  <div className={`rounded-3xl p-6 ${panel}`}>
                    <p className="text-xs text-zinc-500">NON-NEGOTIABLES</p>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li>• Never trade without the hedge logic.</li>
                      <li>• Never exceed daily DD — the system breaks.</li>
                      <li>• No improvising. Execute the sequence.</li>
                    </ul>
                  </div>
                </div>
              )
            })()}

          {/* LESSONS */}
          {activeTab === "lessons" && (
            <div className="w-full space-y-6">
              <div className={`rounded-3xl p-6 ${panel}`}>
                <h2 className="text-center text-2xl font-semibold">Prop Accelerator — Training Modules</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-400">
                  Swipe horizontally through the modules. Click any card to open the video.
                </p>

                <div className="mx-auto mt-6 max-w-xl">
                  <Progress value={progress} />
                  <p className="mt-2 text-center text-sm text-zinc-500">{progress}% completed</p>
                </div>
              </div>

              <div
                ref={drag.ref}
                onMouseDown={drag.onMouseDown}
                onMouseLeave={drag.onMouseLeave}
                onMouseUp={drag.onMouseUp}
                onMouseMove={drag.onMouseMove}
                className="hide-scroll w-full cursor-grab select-none overflow-x-auto overflow-y-visible px-2 pb-4 pt-2 active:cursor-grabbing"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex snap-x snap-mandatory gap-6 px-2">
                  {categories.flatMap((cat, catIndex) =>
                    cat.lessons.map((lesson, lessonIndex) => {
                      const id = lessonIds[catIndex][lessonIndex]
                      const completed = completedLessons.includes(id)

                      return (
                        <div
                          key={id}
                          className="group relative h-[500px] max-w-[280px] min-w-[280px] cursor-pointer overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/50 shadow-[0_20px_70px_rgba(0,0,0,0.55)] transition-transform hover:z-10 hover:scale-[1.03] active:scale-[0.98] sm:h-[580px] sm:max-w-[320px] sm:min-w-[320px]"
                          onClick={() => {
                            if (lesson.video) setActiveVideo(id)
                          }}
                        >
                          <div className="relative h-[68%] w-full overflow-hidden">
                            <img
                              src={lesson.thumbnail}
                              className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105"
                              alt={lesson.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition group-hover:bg-white/20">
                                <PlayCircle size={46} className="text-white/90" />
                              </div>
                            </div>
                          </div>

                          <div className="flex h-[32%] flex-col justify-between p-5">
                            <div>
                              <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{lesson.title}</h3>
                              <p className="mt-1 text-sm text-zinc-500">Duration: {lesson.duration}</p>
                            </div>

                            {completed && <p className="text-sm font-semibold text-emerald-300">✓ Completed</p>}
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
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.92, opacity: 0 }}
                      className={`w-full max-w-4xl overflow-hidden rounded-3xl ${panel}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative w-full">
                        {(() => {
                          const lesson = categories.flatMap((c) => c.lessons)[activeVideo]
                          const videoId = lesson.video

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
              <div className={`rounded-3xl p-6 ${panel}`}>
                <h2 className="text-2xl font-semibold">Documents</h2>
                <p className="mt-2 text-sm text-zinc-400">Preview or download your resources.</p>
              </div>

              <div className="space-y-3">
                {documents.map((doc, index) => {
                  const active = activeDocIndex === index
                  const isImage = doc.file.toLowerCase().endsWith(".png")

                  return (
                    <Card key={index} className={`${panel}`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium">{doc.name}</span>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => setActiveDocIndex(active ? null : index)}>
                              {active ? "Close" : "Preview"}
                            </Button>
                            <a href={doc.file} download>
                              <Button variant="secondary" className="flex items-center gap-1">
                                <Download size={14} /> Download
                              </Button>
                            </a>
                          </div>
                        </div>

                        {active && (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800/70 bg-black">
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
              <div className={`rounded-3xl p-6 ${panel}`}>
                <h2 className="text-2xl font-semibold">Hedged Prop Calculator</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Rough baseline numbers for hedging a prop evaluation with a personal account.{" "}
                  <span className="font-semibold text-red-300">Educational use only – not financial advice.</span>
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className={`${panel} md:col-span-2`}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-zinc-400">Evaluation type</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEvalType("one-step")}
                          className={`rounded-xl border px-3 py-1 text-sm ${
                            evalType === "one-step"
                              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                              : "border-zinc-800/70 bg-zinc-950/40 text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          1-step
                        </button>
                        <button
                          onClick={() => setEvalType("two-step")}
                          className={`rounded-xl border px-3 py-1 text-sm ${
                            evalType === "two-step"
                              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                              : "border-zinc-800/70 bg-zinc-950/40 text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          2-step
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Account size (prop)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={accountSizeInput}
                          onChange={(e) => setAccountSizeInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Eval cost ($)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={evalCostInput}
                          onChange={(e) => setEvalCostInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Phase 1 target (%)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={profitTargetInput}
                          onChange={(e) => setProfitTargetInput(e.target.value)}
                        />
                      </Field>

                      {evalType === "two-step" && (
                        <Field label="Phase 2 target (%)">
                          <input
                            type="number"
                            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                            value={phase2TargetInput}
                            onChange={(e) => setPhase2TargetInput(e.target.value)}
                          />
                        </Field>
                      )}

                      <Field label="Daily DD (%)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={dailyDDInput}
                          onChange={(e) => setDailyDDInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Max DD (%)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={maxDDInput}
                          onChange={(e) => setMaxDDInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Risk per day on prop (evaluation) %" hint="Must be ≤ Daily DD. Total risk per day during evaluation.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={riskPerDayEvalInput}
                          onChange={(e) => setRiskPerDayEvalInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Trades per day (evaluation)">
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={tradesPerDayEvalInput}
                          onChange={(e) => setTradesPerDayEvalInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Profit on fail (eval) – personal ($)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={failEvalProfitInput}
                          onChange={(e) => setFailEvalProfitInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Profit split on funded (%)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={fundedProfitSplitInput}
                          onChange={(e) => setFundedProfitSplitInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Profit on fail (funded) – personal ($)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={failFundedProfitInput}
                          onChange={(e) => setFailFundedProfitInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Payout target on funded (%)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={payoutTargetInput}
                          onChange={(e) => setPayoutTargetInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Risk per day on prop (funded) %">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={fundedRiskPerDayInput}
                          onChange={(e) => setFundedRiskPerDayInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Trades per day (funded)">
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={fundedTradesPerDayInput}
                          onChange={(e) => setFundedTradesPerDayInput(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Button variant="secondary" className="mt-2" onClick={handleCalculate}>
                      Calculate
                    </Button>
                  </CardContent>
                </Card>

                {calcResult && (
                  <Card className={`${panel} md:col-span-2`}>
                    <CardContent className="space-y-4 p-5 text-sm leading-relaxed">
                      <h3 className="text-lg font-semibold">Full Breakdown</h3>

                      {/* EVAL FAIL */}
                      <section className="space-y-2">
                        <p className="font-semibold text-yellow-300">IF EVALUATION FAILS:</p>

                        <p className="text-zinc-300">
                          You risk approximately{" "}
                          <span className="font-bold text-blue-300">{calcResult.riskPerTradeEval.toFixed(2)}% per trade</span>{" "}
                          on the prop side, with up to{" "}
                          <span className="font-bold text-blue-300">{calcResult.tradesPerDayEval}</span> trade(s) per day.
                        </p>

                        <p className="text-zinc-300">
                          You can roughly take{" "}
                          <span className="font-bold text-blue-300">{calcResult.maxEvalSLTrades}</span> full SL trade(s) before hitting
                          the <span className="font-bold text-red-300">{calcResult.maxDD.toFixed(2)}% max DD</span>.
                        </p>

                        <div className="mt-2 space-y-1">
                          {renderDayByDay(
                            calcResult.maxEvalSLTrades,
                            calcResult.tradesPerDayEval,
                            calcResult.perSLProfitEval,
                            "evaluation hedge"
                          )}
                        </div>

                        <p className="mt-2 text-zinc-300">
                          ------------------------------
                          <br />
                          Personal net profit ≈{" "}
                          <span className="font-bold text-emerald-300">
                            ${Math.round(calcResult.evalFailGrossPersonal).toLocaleString()}
                          </span>{" "}
                          −{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.evalCost).toLocaleString()}</span> (challenge
                          cost)
                          <br />
                          ≈{" "}
                          <span className="font-bold text-emerald-300">${Math.round(calcResult.evalFailNet).toLocaleString()}</span>{" "}
                          overall after a failed evaluation.
                        </p>
                      </section>

                      {/* EVAL PASS → FUNDED */}
                      <section className="mt-4 space-y-2">
                        <p className="font-semibold text-yellow-300">IF EVALUATION PASSES → FUNDED STAGE:</p>

                        <p className="text-zinc-300">
                          Phase 1 target:{" "}
                          <span className="font-bold text-blue-300">{calcResult.phase1Target.toFixed(2)}%</span> in one trade →{" "}
                          <span className="font-bold text-blue-300">~{calcResult.phase1RR.toFixed(2)}R</span> (with{" "}
                          {calcResult.riskPerTradeEval.toFixed(2)}% risk).
                        </p>

                        {calcResult.evalType === "two-step" && calcResult.phase2RR !== undefined && (
                          <p className="text-zinc-300">
                            Phase 2 target:{" "}
                            <span className="font-bold text-blue-300">{calcResult.phase2Target?.toFixed(2)}%</span> in one trade →{" "}
                            <span className="font-bold text-blue-300">~{calcResult.phase2RR.toFixed(2)}R</span>.
                          </p>
                        )}

                        <p className="text-zinc-300">
                          Personal cost if the evaluation is passed in one trade per phase:
                          <br />
                          Phase 1 ≈{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.phase1CostPersonal).toLocaleString()}</span>
                          {calcResult.evalType === "two-step" && calcResult.phase2CostPersonal !== undefined && (
                            <>
                              <br />
                              Phase 2 ≈{" "}
                              <span className="font-bold text-red-300">
                                ${Math.round(calcResult.phase2CostPersonal).toLocaleString()}
                              </span>
                            </>
                          )}
                          <br />
                          Total personal cost to pass the evaluation ≈{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.costEvalPersonal).toLocaleString()}</span>.
                        </p>

                        <p className="text-zinc-300">
                          Including the evaluation fee{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.evalCost).toLocaleString()}</span>, the{" "}
                          <span className="font-bold text-blue-300">cost to get funded</span> is roughly{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.costToFunded).toLocaleString()}</span>.
                        </p>
                      </section>

                      {/* FUNDED FAIL BEFORE PAYOUTS */}
                      <section className="mt-4 space-y-2">
                        <p className="font-semibold text-yellow-300">
                          IF FUNDED ACCOUNT FAILS <span className="text-xs">(before any payouts)</span>:
                        </p>

                        <p className="text-zinc-300">
                          On the funded stage, the hedge is sized so that if the funded account hits the{" "}
                          <span className="font-bold text-red-300">{calcResult.maxDD.toFixed(2)}% max drawdown</span>, your personal
                          account is targeting to recover:
                        </p>

                        <ul className="list-inside list-disc text-zinc-300">
                          <li>
                            The full <span className="font-bold text-blue-300">cost to get funded</span> (~
                            <span className="font-bold text-red-300">${Math.round(calcResult.costToFunded).toLocaleString()}</span>)
                          </li>
                          <li>
                            Plus{" "}
                            <span className="font-bold text-emerald-300">
                              ${Math.round(calcResult.failFundedProfit).toLocaleString()}
                            </span>{" "}
                            extra profit on a funded fail.
                          </li>
                        </ul>

                        <p className="text-zinc-300">
                          Each full SL on the funded prop (
                          <span className="font-bold text-blue-300">{calcResult.riskPerTradeFunded.toFixed(2)}% risk</span>) gives you
                          about{" "}
                          <span className="font-bold text-emerald-300">${Math.round(calcResult.perSLProfitFunded).toLocaleString()}</span>{" "}
                          on the personal account.
                        </p>

                        <p className="text-zinc-300">
                          You can roughly take{" "}
                          <span className="font-bold text-blue-300">{calcResult.maxFundedSLTrades}</span> SL trade(s) before hitting the
                          funded max DD.
                        </p>

                        <div className="mt-2 space-y-1">
                          {renderDayByDay(
                            calcResult.maxFundedSLTrades,
                            calcResult.fundedTradesPerDay,
                            calcResult.perSLProfitFunded,
                            "funded hedge"
                          )}
                        </div>

                        <p className="mt-2 text-zinc-300">
                          ------------------------------
                          <br />
                          Personal hedge profit on a funded-fail cycle ≈{" "}
                          <span className="font-bold text-emerald-300">
                            ${Math.round(calcResult.fundedFailGrossPersonal).toLocaleString()}
                          </span>{" "}
                          total on personal −{" "}
                          <span className="font-bold text-red-300">${Math.round(calcResult.costToFunded).toLocaleString()}</span> cost to
                          get funded
                          <br />
                          ≈{" "}
                          <span className="font-bold text-emerald-300">${Math.round(calcResult.fundedFailNet).toLocaleString()}</span>{" "}
                          overall after a funded fail <strong>before any payouts</strong>.
                        </p>
                      </section>

                      {/* FUNDED PAYOUTS */}
                      <section className="mt-4 space-y-2">
                        <p className="font-semibold text-yellow-300">IF FUNDED PAYOUTS HIT:</p>

                        <p className="text-zinc-300">
                          Funded payout target:{" "}
                          <span className="font-bold text-blue-300">
                            {calcResult.payoutTarget.toFixed(2)}% of ${calcResult.accountSize.toLocaleString()}
                          </span>{" "}
                          with a <span className="font-bold text-blue-300">{calcResult.fundedSplit.toFixed(2)}%</span> profit split.
                        </p>

                        <p className="text-zinc-300">
                          Each payout ≈{" "}
                          <span className="font-bold text-emerald-300">${Math.round(calcResult.payoutAmount).toLocaleString()}</span>{" "}
                          from the prop.
                        </p>

                        <p className="text-zinc-300">
                          The payout trade on the personal account is sized at roughly{" "}
                          <span className="font-bold text-blue-300">{calcResult.payoutRRFunded.toFixed(2)}R</span> (funded stage), so if
                          TP hits on prop, you lose about{" "}
                          <span className="font-bold text-red-300">
                            ${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}
                          </span>{" "}
                          on the personal side.
                        </p>

                        {calcResult.payoutScenarios.map((scenario, idx) => (
                          <div key={scenario.index} className="mt-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-4">
                            <p className="font-semibold text-yellow-300">IF FUNDED PAYOUT {scenario.index} HITS:</p>

                            <p className="mt-2 text-zinc-300">
                              Previous accumulated "cost" carried into this cycle ≈{" "}
                              <span className="font-bold text-red-300">
                                ${Math.round(scenario.totalCost - calcResult.hedgeLossPerPayout).toLocaleString()}
                              </span>
                              .
                            </p>

                            <p className="text-zinc-300">
                              Personal hedge loss on the payout trade ≈{" "}
                              <span className="font-bold text-red-300">
                                ${Math.round(calcResult.hedgeLossPerPayout).toLocaleString()}
                              </span>
                              .
                            </p>

                            <p className="text-zinc-300">
                              Total cost considered for payout {scenario.index} ≈{" "}
                              <span className="font-bold text-red-300">${Math.round(scenario.totalCost).toLocaleString()}</span> (previous
                              cost + current hedge loss).
                            </p>

                            <p className="text-zinc-300">
                              Payout {scenario.index} from prop ≈{" "}
                              <span className="font-bold text-emerald-300">${Math.round(calcResult.payoutAmount).toLocaleString()}</span>
                              .
                            </p>

                            <p className="text-zinc-300">
                              Net result after payout {scenario.index} ≈{" "}
                              <span className={`font-bold ${scenario.netAfterPayout >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                ${Math.round(scenario.netAfterPayout).toLocaleString()}
                              </span>{" "}
                              overall.
                            </p>

                            <p className="text-zinc-300">
                              Remaining "cost" going into the next cycle ≈{" "}
                              <span className="font-bold text-blue-300">
                                ${Math.max(0, Math.round(-scenario.netAfterPayout)).toLocaleString()}
                              </span>
                              .
                            </p>

                            <p className="text-zinc-300">
                              If the funded account <span className="font-bold text-red-300">fails</span> after payout {scenario.index}:
                              your hedge on the personal account would make about{" "}
                              <span className="font-bold text-emerald-300">
                                ${Math.round(scenario.netIfFailAfter).toLocaleString()}
                              </span>{" "}
                              on that funded-fail cycle.
                            </p>

                            <p className="text-zinc-300">
                              Net result for <span className="font-semibold">"funded fail after payout {scenario.index}"</span> ≈{" "}
                              <span className={`font-bold ${scenario.netIfFailAfter >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                                ${Math.round(scenario.netIfFailAfter).toLocaleString()}
                              </span>
                              .
                            </p>

                            {idx === calcResult.payoutScenarios.length - 1 && (
                              <p className="mt-2 text-xs text-zinc-500">
                                After enough payouts, both the payout results and funded-fail results stabilise – additional payouts or
                                fails tend to repeat with roughly the same net outcome.
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

          {/* LOT TOOL */}
          {activeTab === "lot" && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className={`rounded-3xl p-6 ${panel}`}>
                <h2 className="text-2xl font-semibold">Lot Size Calculator</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Get approximate lot sizes for your prop account and mirrored hedge on your personal account, based on pips/points.{" "}
                  <span className="font-semibold text-red-300">Educational use only – not financial advice.</span>
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className={`${panel} md:col-span-2`}>
                  <CardContent className="space-y-4 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Symbol" hint="Pips = FX pips / index points / $ move for gold & crypto.">
                        <select
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotSymbol}
                          onChange={(e) => setLotSymbol(e.target.value as SymbolKey)}
                        >
                          {Object.entries(SYMBOL_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>
                              {cfg.display}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Prop account size ($)">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotAccountSizeProp}
                          onChange={(e) => setLotAccountSizeProp(e.target.value)}
                        />
                      </Field>

                      <Field label="Risk per trade on prop (%)" hint="Same % you use for funded/eval (e.g., 1–2% per trade).">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotRiskPerTradePropInput}
                          onChange={(e) => setLotRiskPerTradePropInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Stop loss distance (pips / points)" hint="Indices = points · FX = pips · Gold/BTC = $ move.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotSLPipsInput}
                          onChange={(e) => setLotSLPipsInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Current Price" hint="Needed for correct margin calculations (gold, indices, BTC).">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotPriceInput}
                          onChange={(e) => setLotPriceInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Max margin % (approx)" hint="Rough check — real broker margin will differ.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotMaxMarginPercentInput}
                          onChange={(e) => setLotMaxMarginPercentInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Prop firm leverage (e.g. 100 = 1:100)" hint="Used to estimate margin needed on your prop account.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotPropLeverageInput}
                          onChange={(e) => setLotPropLeverageInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Personal broker leverage (e.g. 500 = 1:500)" hint="Used to estimate hedge margin on personal account.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotPersonalLeverageInput}
                          onChange={(e) => setLotPersonalLeverageInput(e.target.value)}
                        />
                      </Field>

                      <Field label="Personal account balance ($)" hint="Used only for context; lot size uses $ hedge below.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotPersonalBalanceInput}
                          onChange={(e) => setLotPersonalBalanceInput(e.target.value)}
                        />
                      </Field>

                      <Field label="$ target per 1% prop loss" hint="Copy from the hedge calculator's “hedge per 1%”.">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                          value={lotHedgePerPercentInput}
                          onChange={(e) => setLotHedgePerPercentInput(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Button variant="secondary" className="mt-2" onClick={handleLotCalculate}>
                      Calculate lot sizes
                    </Button>
                  </CardContent>
                </Card>

                {lotResult && (
                  <Card className={`${panel} md:col-span-2`}>
                    <CardContent className="space-y-3 p-5 text-sm leading-relaxed">
                      <h3 className="text-lg font-semibold">Lot Size Summary — {lotResult.symbolDisplay}</h3>

                      <section className="space-y-1">
                        <p className="font-semibold text-yellow-300">PROP ACCOUNT:</p>

                        <p className="text-zinc-300">
                          Account size: <span className="font-bold text-blue-300">${lotResult.accountSizeProp.toLocaleString()}</span>, risk:{" "}
                          <span className="font-bold text-blue-300">{lotResult.riskPerTradeProp.toFixed(2)}%</span> →{" "}
                          <span className="font-bold text-red-300">${Math.round(lotResult.riskDollarProp).toLocaleString()}</span> at risk.
                        </p>

                        <p className="text-zinc-300">
                          SL distance: <span className="font-bold text-blue-300">{lotResult.slPips.toFixed(1)} pips/points</span>, pip value per lot:{" "}
                          <span className="font-bold text-blue-300">${lotResult.pipValuePerLot.toFixed(2)}</span>.
                        </p>

                        <p className="text-zinc-300">
                          Recommended prop lot size: <span className="font-bold text-emerald-300">{lotResult.lotSizeProp.toFixed(3)} lots</span>.
                        </p>

                        {typeof lotResult.approxMarginUsedPercent === "number" && (
                          <p className="text-xs text-zinc-500">
                            Approx margin usage:{" "}
                            <span className={`font-semibold ${lotResult.approxMarginUsedPercent > 80 ? "text-red-300" : "text-yellow-300"}`}>
                              {lotResult.approxMarginUsedPercent.toFixed(1)}%
                            </span>
                            .
                          </p>
                        )}
                      </section>

                      <section className="mt-3 space-y-1">
                        <p className="font-semibold text-yellow-300">PERSONAL HEDGE:</p>

                        <p className="text-zinc-300">
                          Target hedge: make{" "}
                          <span className="font-bold text-emerald-300">${lotResult.hedgePerPercent.toFixed(2)}</span> for each{" "}
                          <span className="font-bold text-red-300">1% loss</span> on prop.
                        </p>

                        <p className="text-zinc-300">
                          Gain needed per opposite trade ≈{" "}
                          <span className="font-bold text-emerald-300">${Math.round(lotResult.personalGainPerTrade).toLocaleString()}</span>.
                        </p>

                        <p className="text-zinc-300">
                          Recommended personal hedge lot:{" "}
                          <span className="font-bold text-emerald-300">{lotResult.lotSizePersonal.toFixed(3)} lots</span>.
                        </p>
                      </section>

                      <p className="mt-3 text-xs text-zinc-500">
                        Always verify pip values & margin with your actual broker before placing trades.
                      </p>
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
      <label className="text-sm text-zinc-400">{label}</label>
      {children}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
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
        <div key={day}>
          <p className="font-semibold text-zinc-200">Day {day}:</p>
          {trades.map((t) => (
            <p key={t.trade} className="ml-4 text-zinc-300">
              Trade {t.trade} SL = <span className="font-bold text-emerald-300">${Math.round(t.profit).toLocaleString()}</span> on
              personal ({label})
            </p>
          ))}
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
  }, [hashedId, onComplete])

  return (
    <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
      <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
        <div className={`wistia_embed wistia_async_${hashedId} videoFoam=true`} />
      </div>
    </div>
  )
}

/* -------------------------------- Sidebar item (same behavior) -------------------------------- */

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  href,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  href?: string
}) {
  const base =
    "flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-medium transition " +
    (active
      ? "border-zinc-700/70 bg-white/10 text-white"
      : "border-zinc-800/60 bg-zinc-950/40 text-zinc-300 hover:bg-white/10 hover:text-white")

  if (href) {
    return (
      <a href={href} className={base} target="_blank" rel="noopener noreferrer">
        {icon}
        {label}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={base}>
      {icon}
      {label}
    </button>
  )
}
