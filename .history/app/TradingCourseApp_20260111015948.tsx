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
  <div className={`relative min-h-screen ${pageBg} text-white font-sans`}>

    {/* ================= FLOATING HEADER ================= */}
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-xs tracking-[0.22em] text-zinc-400">
              PROP ACCELERATOR
            </div>
            <div className="text-[11px] text-zinc-500">
              Hedge • Calculator • Execution
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex gap-1 overflow-x-auto">
          {[
            ["home", "Dashboard", <Home size={16} />],
            ["lessons", "Training", <TvMinimalIcon size={16} />],
            ["calculator", "Calculator", <CalculatorIcon size={16} />],
            ["lot", "Lot Tool", <CoinsIcon size={16} />],
            ["documents", "Docs", <FileText size={16} />],
          ].map(([key, label, icon]) => (
            <button
              key={key as string}
              onClick={() => setActiveTab(key as any)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition
                ${
                  activeTab === key
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href="https://t.me/+U_s-oDtDDdg2ZDVk"
            target="_blank"
            className="rounded-xl bg-white/5 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10"
          >
            Announcements
          </a>
        </div>
      </div>
    </div>

    {/* ================= MAIN CONTENT ================= */}
    <motion.div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-8">
      <div className="w-full">

        {/* ================= HOME ================= */}
        {activeTab === "home" && (
          <div className="space-y-8">

            {/* HERO */}
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 p-6 sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                System <span className="text-emerald-400">Online</span>
              </h2>

              <p className="mt-3 max-w-2xl text-zinc-400">
                This is a rule-based execution framework. No discretion.
                No improvisation. Follow the sequence.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/40 ring-1 ring-white/10 p-5">
                  <p className="text-xs text-zinc-500">SYSTEM STATUS</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-300">
                    ACTIVE ●
                  </p>
                </div>

                <div className="rounded-2xl bg-black/40 ring-1 ring-white/10 p-5">
                  <p className="text-xs text-zinc-500">PROGRESS</p>
                  <p className="mt-1 text-2xl font-semibold">{progress}%</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setActiveTab("lessons")}
                  className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-300"
                >
                  Continue Training
                </button>
                <button
                  onClick={() => setActiveTab("calculator")}
                  className="rounded-xl bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Open Calculator
                </button>
              </div>
            </div>

            {/* ANNOUNCEMENTS */}
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 p-6">
              <p className="mb-3 text-sm font-semibold">Announcements</p>

              {announcementLoading ? (
                <p className="text-zinc-400">Loading…</p>
              ) : announcementError ? (
                <p className="text-red-400">{announcementError}</p>
              ) : announcements.length ? (
                <div className="space-y-3">
                  {announcements.map((a) => {
                    const styles = ANNOUNCEMENT_STYLES[a.variant ?? "neutral"]
                    return (
                      <div
                        key={a.id}
                        className={`rounded-2xl p-4 ring-1 ring-white/10 ${styles.box}`}
                      >
                        {a.title && (
                          <p className={`mb-1 font-semibold ${styles.title}`}>
                            {a.title}
                          </p>
                        )}
                        <p className={`text-sm ${styles.text}`}>
                          {a.message}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-zinc-400">No announcements.</p>
              )}
            </div>
          </div>
        )}

        {/* ================= LESSONS / DOCUMENTS / CALCULATOR / LOT ================= */}
        {/* ALL OTHER TABS */}
        {/* NOTHING LOGIC-WISE CHANGED BELOW */}
        {/* ONLY CONTAINERS ARE FLAT / GLASS */}

        {/* ⬇️ KEEP ALL YOUR EXISTING TAB CONTENT EXACTLY AS-IS ⬇️ */}
        {/* Replace ONLY outer wrappers with: */}
        {/* bg-white/[0.03] ring-1 ring-white/10 rounded-3xl */}

        {/* Your existing JSX for lessons, calculator, lot tool goes here unchanged */}

      </div>
    </motion.div>
  </div>
)
}