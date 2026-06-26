// PART 1 / 3 — FOUNDATION, THEME, LAYOUT, MOTION SYSTEM
'use client'

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants, Transition } from 'framer-motion'
import {
  Home,
  TvMinimal,
  FileText,
  Calculator,
  Coins,
  Menu,
  X,
  ChevronRight,
  Play,
  Download,
} from 'lucide-react'

/* =====================================================================================
   DESIGN GOALS
   - Dashboard-style layout inspired by modern SaaS (sample UI provided)
   - Left rail navigation + top context bar
   - Heavy but tasteful Framer Motion usage
   - Glass / soft light theme, premium spacing, clear hierarchy
   - This file is intentionally LARGE and split into PARTS
===================================================================================== */

/* =====================================================================================
   THEME TOKENS
===================================================================================== */

const theme = {
  bg: 'bg-zinc-950',
  panel: 'bg-white/60 backdrop-blur-xl',
  panelDark: 'bg-zinc-900/70 backdrop-blur-xl',
  border: 'border border-black/10',
  softBorder: 'border border-white/40',
  text: {
    primary: 'text-zinc-900',
    secondary: 'text-zinc-600',
    muted: 'text-zinc-400',
  },
}

/* =====================================================================================
   MOTION PRESETS
===================================================================================== */

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
  show: {
    opacity: 1,
    y: 0,
    transition: springSnappy,
  },
}

const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSoft,
  },
}

/* =====================================================================================
   APP NAVIGATION MODEL
===================================================================================== */

type TabKey = 'home' | 'lessons' | 'documents' | 'calculator' | 'lot'

const NAV_ITEMS: {
  key: TabKey
  label: string
  icon: React.ReactNode
}[] = [
  { key: 'home', label: 'Dashboard', icon: <Home size={18} /> },
  { key: 'lessons', label: 'Lessons', icon: <TvMinimal size={18} /> },
  { key: 'documents', label: 'Documents', icon: <FileText size={18} /> },
  { key: 'calculator', label: 'Calculator', icon: <Calculator size={18} /> },
  { key: 'lot', label: 'Lot Tool', icon: <Coins size={18} /> },
]

/* =====================================================================================
   ROOT APP
===================================================================================== */

export default function TradingAppRedesign() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className={`min-h-screen w-full ${theme.bg} text-black`}>
      <style jsx global>{`
        .pa-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.85);
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          outline: none;
        }
        .pa-input:focus {
          border-color: rgba(0,0,0,0.35);
          box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
        }
      `}</style>
      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          onChange={setActiveTab}
          mobileOpen={mobileNav}
          onClose={() => setMobileNav(false)}
        />

        {/* MAIN CONTENT */}
        <div className="flex flex-1 flex-col">
          <TopBar
            activeTab={activeTab}
            onMenu={() => setMobileNav(true)}
          />

          <main className="flex-1 px-6 py-6">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <Dashboard key="home" />}
              {activeTab === 'lessons' && <Lessons key="lessons" />}
              {activeTab === 'documents' && <Documents key="documents" />}
              {activeTab === 'calculator' && <CalculatorPage key="calculator" />}
              {activeTab === 'lot' && <LotTool key="lot" />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================================
   SIDEBAR
===================================================================================== */

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
      {/* Mobile overlay */}
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
          fixed z-50 h-full w-[260px] bg-white/80 backdrop-blur-xl
          md:static md:z-auto
          ${mobileOpen ? 'left-0' : '-left-[260px]'} md:left-0
          transition-all
        `}
        initial={false}
      >
        <div className="flex h-full flex-col p-5">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              F
            </div>
            <div>
              <div className="text-sm font-semibold">Prop Accelerator</div>
              <div className="text-xs text-zinc-500">Private Workspace</div>
            </div>
          </div>

          {/* Nav */}
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
                    ${
                      active
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:bg-black/5'
                    }
                  `}
                >
                  <span
                    className={
                      active
                        ? 'text-white'
                        : 'text-zinc-400 group-hover:text-zinc-600'
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto text-xs text-zinc-400">v1.0</div>
        </div>
      </motion.aside>
    </>
  )
}

/* =====================================================================================
   TOP BAR
===================================================================================== */

function TopBar({
  activeTab,
  onMenu,
}: {
  activeTab: TabKey
  onMenu: () => void
}) {
  const title = NAV_ITEMS.find((n) => n.key === activeTab)?.label ?? ''

  return (
    <motion.header
      variants={fade}
      initial="hidden"
      animate="show"
      className="flex items-center justify-between border-b border-black/10 bg-white/60 px-6 py-4 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <button
          className="md:hidden"
          onClick={onMenu}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-zinc-500">Status: Active</div>
        <div className="h-9 w-9 rounded-full bg-zinc-200" />
      </div>
    </motion.header>
  )
}

/* =====================================================================================
   DASHBOARD
===================================================================================== */

function Dashboard() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <motion.div
        variants={scaleIn}
        className="rounded-2xl bg-white/80 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hello Josh 👋</h2>
            <p className="mt-1 text-sm text-zinc-500">It’s good to see you again.</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-zinc-200" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Courses completed" value="11" />
        <StatCard title="In progress" value="4" />
        <StatCard title="Learning hours" value="42h" />
      </div>
    </motion.section>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <motion.div
      variants={scaleIn}
      className="rounded-2xl bg-white/80 p-5 backdrop-blur-xl"
    >
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </motion.div>
  )
}

/* =====================================================================================
   /* =====================================================================================
   PART 2 — LESSONS + DOCUMENTS (FULLY BUILT)
===================================================================================== */

/* -------------------------------- MOCK DATA -------------------------------- */

const LESSONS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  title: `Module ${i + 1}: Core Trading Concept`,
  duration: `${8 + i}:0${i}`,
  completed: i < 3,
}))

const DOCUMENTS = [
  { name: 'Hedge Engine Blueprint', type: 'PDF', size: '2.4mb' },
  { name: 'Risk Framework', type: 'PDF', size: '1.1mb' },
  { name: 'Execution Checklist', type: 'PNG', size: '900kb' },
]

/* -------------------------------- LESSONS PAGE -------------------------------- */

function Lessons() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null)

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your lessons</h2>
          <p className="mt-1 text-sm text-zinc-500">Continue where you left off</p>
        </div>
        <div className="text-sm text-zinc-500">3 / {LESSONS.length} completed</div>
      </div>

      {/* Lesson grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lesson) => (
          <motion.button
            key={lesson.id}
            layout
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveLesson(lesson.id)}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-5 text-left backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold leading-snug">
                  {lesson.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">{lesson.duration}</p>
              </div>
              {lesson.completed && (
                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
                  Done
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-zinc-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: lesson.completed ? '100%' : '30%' }}
                  className="h-full rounded-full bg-black"
                />
              </div>
              <Play size={14} className="text-zinc-400 group-hover:text-black" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {activeLesson !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={springSoft}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-2xl bg-white p-6"
            >
              <button
                onClick={() => setActiveLesson(null)}
                className="absolute right-4 top-4"
              >
                <X size={18} />
              </button>
              <div className="flex h-[320px] items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                Video Player Placeholder
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/* -------------------------------- DOCUMENTS PAGE -------------------------------- */

function Documents() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="mt-1 text-sm text-zinc-500">Reference material & blueprints</p>
      </div>

      <div className="space-y-3">
        {DOCUMENTS.map((doc) => (
          <motion.div
            key={doc.name}
            whileHover={{ y: -2 }}
            className="flex items-center justify-between rounded-xl bg-white/80 p-4 backdrop-blur-xl"
          >
            <div>
              <div className="text-sm font-medium">{doc.name}</div>
              <div className="text-xs text-zinc-500">
                {doc.type} • {doc.size}
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs text-white">
              <Download size={14} />
              Download
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

/* =====================================================================================
   PART 3 — CALCULATOR + LOT TOOL (FULL INTERACTIVE, PREMIUM)
===================================================================================== */

/* -------------------------------- CALCULATOR -------------------------------- */

function CalculatorPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [accountSize, setAccountSize] = useState('200000')
  const [dailyRisk, setDailyRisk] = useState('2')
  const [maxDD, setMaxDD] = useState('10')
  const [result, setResult] = useState<number | null>(null)

  const calculate = () => {
    const size = parseFloat(accountSize)
    const risk = parseFloat(dailyRisk)
    const dd = parseFloat(maxDD)
    if (!size || !risk || !dd) return
    setResult(((size * risk) / 100) * (dd / 10))
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="grid gap-6 lg:grid-cols-[1fr_420px]"
    >
      {/* LEFT — INPUT FLOW */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Hedged Prop Calculator</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Guided inputs. Clean outputs. No noise.
          </p>
        </div>

        <motion.div layout className="rounded-2xl bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Step {step} of 3</div>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full ${s <= step ? 'bg-black' : 'bg-zinc-200'}`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 space-y-4"
              >
                <Field label="Prop account size ($)">
                  <input
                    className="pa-input"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                  />
                </Field>
                <button
                  onClick={() => setStep(2)}
                  className="w-full rounded-xl bg-black py-3 text-sm text-white"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 space-y-4"
              >
                <Field label="Daily risk (%)">
                  <input
                    className="pa-input"
                    value={dailyRisk}
                    onChange={(e) => setDailyRisk(e.target.value)}
                  />
                </Field>
                <Field label="Max drawdown (%)">
                  <input
                    className="pa-input"
                    value={maxDD}
                    onChange={(e) => setMaxDD(e.target.value)}
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border py-3 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      calculate()
                      setStep(3)
                    }}
                    className="flex-1 rounded-xl bg-black py-3 text-sm text-white"
                  >
                    Calculate
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="rounded-xl bg-zinc-100 p-4">
                  <div className="text-xs text-zinc-500">Estimated hedge per day</div>
                  <div className="mt-1 text-2xl font-semibold">
                    ${result?.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl border py-3 text-sm"
                >
                  Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* RIGHT — STICKY SUMMARY */}
      <motion.aside
        variants={scaleIn}
        className="sticky top-6 h-fit rounded-2xl bg-white/80 p-5 backdrop-blur-xl"
      >
        <div className="text-xs text-zinc-500">Live summary</div>
        <div className="mt-3 space-y-2 text-sm">
          <div>Account: ${accountSize || '—'}</div>
          <div>Daily risk: {dailyRisk || '—'}%</div>
          <div>Max DD: {maxDD || '—'}%</div>
        </div>
        <div className="mt-4 rounded-xl bg-black p-3 text-sm text-white">
          Hedge ≈ ${result?.toLocaleString() ?? '—'}
        </div>
      </motion.aside>
    </motion.section>
  )
}

/* -------------------------------- LOT TOOL -------------------------------- */

function LotTool() {
  const [risk, setRisk] = useState('2')
  const [sl, setSl] = useState('50')

  const lot = useMemo(() => {
    const r = parseFloat(risk)
    const s = parseFloat(sl)
    if (!r || !s) return null
    return (r * 10) / s
  }, [risk, sl])

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold">Lot sizing</h2>
        <p className="mt-1 text-sm text-zinc-500">Fast sanity check before execution</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-white/80 p-6 backdrop-blur-xl"
        >
          <Field label="Risk per trade (%)">
            <input
              className="pa-input"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            />
          </Field>
          <div className="h-3" />
          <Field label="Stop loss (pips / points)">
            <input
              className="pa-input"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
            />
          </Field>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-black p-6 text-white"
        >
          <div className="text-xs text-white/60">Suggested lot size</div>
          <div className="mt-2 text-3xl font-semibold">
            {lot ? lot.toFixed(2) : '—'} lots
          </div>
          <p className="mt-3 text-xs text-white/60">
            Always confirm margin & pip values with broker.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}

/* -------------------------------- FIELD HELPER -------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-zinc-800">{label}</div>
      {children}
      {hint ? <div className="text-xs text-zinc-500">{hint}</div> : null}
    </div>
  )
}
  )
}
