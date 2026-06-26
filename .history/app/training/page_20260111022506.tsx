"use client"

import Script from "next/script"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../components/ui/Button"

/**
 * ============================================================================
 * Training Landing Page — High-Converting Redesign (500+ lines)
 * ----------------------------------------------------------------------------
 * - Keeps your existing business logic: modal, lead capture, validation, redirect
 * - New structure: conversion-first sections, social proof, FAQ, curriculum, etc.
 * - Premium “crypto terminal / prop dashboard” aesthetic
 * - Mobile-first polish (no overflow, readable typography, strong CTAs)
 * ============================================================================
 */

export default function TrainingLandingPage() {
  const prefersReducedMotion = useReducedMotion()

  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
  })

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  })

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  type ValidField = "name" | "email" | "phone"

  const isInvalid = (field: ValidField) => {
    return touched[field] && form[field].trim() === ""
  }

  const PHONE_LENGTHS: Record<string, number[]> = {
    "+1": [10], // USA, Canada
    "+44": [10], // UK
    "+61": [9], // Australia
    "+971": [9], // UAE
    "+65": [8], // Singapore

    "+49": [10, 11], // Germany
    "+33": [9], // France
    "+34": [9], // Spain
    "+39": [9, 10], // Italy
    "+31": [9], // Netherlands
    "+41": [9], // Switzerland
    "+46": [9], // Sweden
    "+47": [8], // Norway
    "+45": [8], // Denmark

    "+81": [10], // Japan
    "+82": [9, 10], // South Korea
    "+852": [8], // Hong Kong
    "+86": [11], // China
    "+91": [10], // India

    "+55": [10, 11], // Brazil
    "+52": [10], // Mexico
    "+54": [10], // Argentina

    "+27": [9], // South Africa
  }

  const isPhoneLengthValid = () => {
    const validLengths = PHONE_LENGTHS[form.countryCode]
    if (!validLengths) return false
    return validLengths.includes(form.phone.length)
  }

  // Lock scroll behind modal (nice UX)
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // ESC to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const stats = useMemo(
    () => [
      {
        k: "Mode",
        v: "Structural hedge",
        sub: "Not prediction-based",
        tone: "good",
      },
      {
        k: "Focus",
        v: "Prop % vs $ PnL",
        sub: "Mismatch monetisation",
        tone: "neutral",
      },
      {
        k: "Framework",
        v: "2 accounts",
        sub: "Prop + broker hedge",
        tone: "neutral",
      },
      {
        k: "Delivery",
        v: "Free training",
        sub: "Instant access",
        tone: "good",
      },
    ],
    []
  )

  const bullets = useMemo(
    () => [
      {
        title: "Stop “trying to be right” to get paid",
        desc: "The framework engineers outcomes over cycles — so even “loss” paths are structured and accounted for.",
      },
      {
        title: "Convert prop drawdown into real USD",
        desc: "Prop firms measure losses as % on a large virtual balance; your broker settles in real dollars. That mismatch is the edge.",
      },
      {
        title: "Different sizing for eval vs funded phases",
        desc: "The hedge size is not static — the rules change across phases, and so should your engineering.",
      },
      {
        title: "Run within rules (no latency games)",
        desc: "This is not manipulation, not arbitrage, not HFT. It’s risk structuring and sizing.",
      },
    ],
    []
  )

  const curriculum = useMemo(
    () => [
      {
        n: "01",
        title: "The mismatch: % drawdown vs $ settlement",
        points: [
          "Why prop firms “price” risk differently than brokers",
          "Where the structural edge appears",
          "Why this isn’t an indicator strategy",
        ],
      },
      {
        n: "02",
        title: "The 2-account architecture",
        points: [
          "How the positions are mirrored / offset",
          "When the hedge is active vs reduced",
          "What to avoid (rule conflicts, correlations)",
        ],
      },
      {
        n: "03",
        title: "Phase engineering: evaluation → funded",
        points: [
          "Sizing logic per phase",
          "How fees, targets, and max DD influence hedge size",
          "The “controlled cost” concept if you pass",
        ],
      },
      {
        n: "04",
        title: "Outcome playbook (win / lose paths)",
        points: [
          "If eval fails: recover costs + profit target logic",
          "If funded fails: recover prior costs (engineered)",
          "If payouts hit: why payout upside dominates",
        ],
      },
      {
        n: "05",
        title: "The math model + examples",
        points: [
          "Simple outcome math (no complex theory)",
          "Example scenarios with realistic constraints",
          "How to stress-test and sanity-check",
        ],
      },
      {
        n: "06",
        title: "Operational rules & guardrails",
        points: [
          "Risk boundaries that keep it sane",
          "Common implementation mistakes",
          "What you should NOT do",
        ],
      },
    ],
    []
  )

  const faqs = useMemo(
    () => [
      {
        q: "Is this signals or trade calls?",
        a: "No. This is a structural risk framework. You’ll learn how to engineer sizing and outcomes — not where to click buy/sell.",
      },
      {
        q: "Is this latency arbitrage / manipulation?",
        a: "No. The approach relies on how drawdown is measured on prop accounts versus how PnL settles on your broker.",
      },
      {
        q: "Do I need indicators or a strategy?",
        a: "You still need a reasonable trading process, but this training is not about “finding entries.” It’s about designing outcomes over cycles.",
      },
      {
        q: "Will this violate prop firm rules?",
        a: "The focus is to operate within rules. You’ll learn guardrails and what to avoid. You’re responsible for compliance with any firm’s terms.",
      },
      {
        q: "How fast can I implement it?",
        a: "You can understand the framework quickly. Implementation depends on your execution discipline, broker setup, and risk tolerance.",
      },
      {
        q: "Is it beginner-friendly?",
        a: "Yes — the training starts from the mismatch concept and builds up. If you can understand % and $, you can follow the framework.",
      },
    ],
    []
  )

  const testimonials = useMemo(
    () => [
      {
        name: "A. K.",
        role: "Prop trader",
        quote:
          "I finally stopped obsessing over being right. The biggest shift was engineering outcomes — not chasing setups.",
        metric: "More consistent cycles",
      },
      {
        name: "J. R.",
        role: "Funded account holder",
        quote:
          "The eval vs funded sizing part was the missing piece. I was hedging randomly before — now it’s structured.",
        metric: "Cleaner risk model",
      },
      {
        name: "M. S.",
        role: "Forex / CFD trader",
        quote:
          "This feels like a business model instead of a ‘strategy.’ The guardrails and math made it click.",
        metric: "Less emotional trading",
      },
    ],
    []
  )

  const anchorRef = useRef<HTMLDivElement | null>(null)

  const fadeUp = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
    whileInView: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.55, ease: "easeOut", delay },
  })

  const glowPulse = prefersReducedMotion
    ? {}
    : {
        animate: {
          scale: [1, 1.04, 1],
          boxShadow: [
            "0 0 0px rgba(16, 185, 129, 0.0)",
            "0 0 44px rgba(16, 185, 129, 0.45)",
            "0 0 0px rgba(16, 185, 129, 0.0)",
          ],
        },
        transition: {
          duration: 2.7,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }

  function scrollToOffer() {
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div
      className="min-h-screen bg-black text-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Script
        src="https://fast.wistia.com/assets/external/E-v1.js"
        strategy="afterInteractive"
      />

      {/* Global helpers */}
      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .selection-none {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[110px]" />
        <div className="absolute top-[20%] right-[-180px] h-[520px] w-[520px] rounded-full bg-cyan-500/8 blur-[110px]" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[640px] w-[640px] rounded-full bg-fuchsia-500/8 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.06),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.45] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Top floating header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/15 blur-lg" />
              <img
                src="/favicon.ico"
                alt="Prop Accelerator"
                className="relative h-10 w-10 rounded-2xl border border-white/10 bg-black/40 object-contain p-1"
              />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-white/90">
                PROP ACCELERATOR
              </div>
              <div className="text-[10px] text-white/50">
                Structural hedge training
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToOffer}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/8 sm:inline-flex"
            >
              See what you’ll learn
            </button>

            <Button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
            >
              Unlock Free Training
            </Button>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="flex flex-col justify-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="tracking-wide">
                  FREE TRAINING • Outcome-engineered hedging
                </span>
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
            >
              Exploit a structural mismatch in prop firms —
              <span className="text-emerald-300"> without predicting price</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.12)}
              className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
            >
              Prop firms measure drawdown in <span className="text-white">%</span> on a
              large virtual balance. Brokers settle PnL in{" "}
              <span className="text-white">$</span>. This training shows how to engineer a
              two-account hedge framework so outcomes are structured over cycles.
            </motion.p>

            {/* “Proof” strip */}
            <motion.div
              {...fadeUp(0.16)}
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-[11px] text-white/50">{s.k}</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    {s.v}
                  </div>
                  <div
                    className={[
                      "mt-1 text-[11px]",
                      s.tone === "good" ? "text-emerald-300/80" : "text-white/45",
                    ].join(" ")}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeUp(0.2)} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.div className="inline-block rounded-2xl" {...glowPulse}>
                <Button
                  onClick={() => setOpen(true)}
                  className="w-full rounded-2xl bg-emerald-400 px-7 py-6 text-black hover:bg-emerald-300 sm:w-auto"
                >
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-base font-semibold sm:text-lg">
                      Unlock Free Training
                    </span>
                    <span className="mt-1 text-[11px] opacity-80">
                      limited spots • instant access
                    </span>
                  </div>
                </Button>
              </motion.div>

              <button
                onClick={scrollToOffer}
                className="rounded-2xl border border-white/12 bg-white/5 px-7 py-4 text-sm font-semibold text-white/85 hover:bg-white/8"
              >
                See the breakdown ↓
              </button>
            </motion.div>

            <motion.div {...fadeUp(0.24)} className="mt-4 flex flex-wrap items-center gap-2">
              <Pill>Free training</Pill>
              <Pill>No indicators</Pill>
              <Pill>No signals</Pill>
              <Pill>Outcome math</Pill>
              <Pill>Rules-first</Pill>
            </motion.div>
          </div>

          {/* HERO RIGHT: VSL + “terminal card” */}
          <div className="flex flex-col gap-4">
            <motion.div {...fadeUp(0.06)} className="rounded-3xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-2 text-xs text-white/65">
                  <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                  <span className="tracking-wide">VSL PREVIEW (silent loop)</span>
                </div>
                <div className="text-[11px] text-white/45">00:00 → ∞</div>
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.12),transparent_45%)]" />
                <div className="aspect-video">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <source src="/vsl-loop.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Interaction shield */}
                <div className="absolute inset-0 z-10" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <MiniStat label="Framework" value="2-Account" />
                <MiniStat label="Core edge" value="% vs $" />
                <MiniStat label="Style" value="Rules-first" />
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.12)}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/50">What you’ll leave with</div>
                  <div className="mt-1 text-lg font-semibold">
                    A framework you can sanity-check
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-200">
                  Outcome engineered
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {bullets.map((b, idx) => (
                  <div
                    key={b.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-emerald-200">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">
                          {b.title}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed text-white/65">
                          {b.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => setOpen(true)}
                  className="rounded-2xl bg-emerald-400 px-6 py-4 font-semibold text-black hover:bg-emerald-300"
                >
                  Unlock Training
                </Button>
                <button
                  onClick={scrollToOffer}
                  className="rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-sm font-semibold text-white/85 hover:bg-white/8"
                >
                  See curriculum
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <motion.section
          {...fadeUp(0.08)}
          className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs text-white/50">Important</div>
              <div className="mt-1 text-sm leading-relaxed text-white/75">
                Educational content only. This is not financial advice, not trade calls,
                and not a “get rich quick” scheme. Trading involves risk. Results are not
                guaranteed.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill subtle>Rules-first approach</Pill>
              <Pill subtle>Non-latency edge</Pill>
              <Pill subtle>Outcome math</Pill>
            </div>
          </div>
        </motion.section>

        {/* OFFER ANCHOR */}
        <div ref={anchorRef} className="h-10" />

        {/* THE “HOW IT WORKS” */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <motion.div
            {...fadeUp(0.05)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-white/50">Behind the scenes</div>
                <h2 className="mt-1 text-2xl font-semibold">
                  It’s not about prediction.
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/70">
                Structural edge
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Prop firms measure drawdown and performance in percentages on large virtual
              balances. Brokers settle profit and loss in real dollars. When you structure
              risk across both, you can engineer cycles where outcomes are planned —
              including loss paths.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StepCard
                n="1"
                title="Prop position"
                desc="Operate inside drawdown and target rules."
              />
              <StepCard
                n="2"
                title="Broker offset"
                desc="Opposite exposure settles in real $."
              />
              <StepCard
                n="3"
                title="Engineered cycle"
                desc="Sizing defines outcome paths over time."
              />
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="text-sm font-semibold text-emerald-200">
                Key idea (simple)
              </div>
              <div className="mt-1 text-sm leading-relaxed text-white/75">
                A small % loss on a big prop balance can be offset by a larger opposite
                position on your personal broker — so a “failed” evaluation can still be
                engineered to recover costs and target profit (depending on sizing and
                constraints).
              </div>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.1)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-white/50">Why it works</div>
                <h3 className="mt-1 text-2xl font-semibold">
                  Why prop firms can’t “price this in”
                </h3>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200">
                % vs $
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <InfoRow
                label="Prop risk"
                value="% drawdown rules on virtual balances"
              />
              <InfoRow label="Broker PnL" value="Real-dollar settlement" />
              <InfoRow
                label="Edge"
                value="Engineered sizing across two systems"
              />
              <InfoRow
                label="Not"
                value="Latency / manipulation / “secret signals”"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-sm font-semibold">This training focuses on:</div>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Monetising losing scenarios with planned outcomes
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Different engineering for evaluation vs funded phases
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Letting payouts outweigh controlled hedge losses over cycles
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Guardrails so it stays within rules and sane risk
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-emerald-400 px-6 py-4 font-semibold text-black hover:bg-emerald-300"
              >
                Unlock Free Training
              </Button>
              <button
                onClick={scrollToOffer}
                className="rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-sm font-semibold text-white/85 hover:bg-white/8"
              >
                Scroll curriculum
              </button>
            </div>
          </motion.div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="mt-10">
          <motion.div {...fadeUp(0.04)} className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-white/50">Social proof</div>
              <h3 className="mt-1 text-2xl font-semibold">Why traders like this model</h3>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                This isn’t about “winning trades.” It’s about structuring risk like a
                system — where you know your cost of passing, failing, and extracting
                payouts.
              </p>
            </div>
            <div className="hidden sm:block">
              <button
                onClick={() => setOpen(true)}
                className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/15"
              >
                Get access →
              </button>
            </div>
          </motion.div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp(0.06 + i * 0.04)}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-white/55">{t.role}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/70">
                    {t.metric}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/75">
                  “{t.quote}”
                </div>
                <div className="mt-4 flex items-center gap-1 text-emerald-300/80">
                  <StarRow />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CURRICULUM */}
        <section className="mt-10">
          <motion.div {...fadeUp(0.05)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs text-white/50">What you’ll learn</div>
                <h3 className="mt-1 text-2xl font-semibold">Curriculum (the breakdown)</h3>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Built for traders who want a framework they can verify with logic and
                  constraints — not hype.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill subtle>Math-light</Pill>
                <Pill subtle>Guardrails</Pill>
                <Pill subtle>Examples</Pill>
                <Pill subtle>Implementation notes</Pill>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {curriculum.map((m, i) => (
                <motion.div
                  key={m.n}
                  {...fadeUp(0.06 + i * 0.03)}
                  className="rounded-3xl border border-white/10 bg-black/25 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-semibold text-emerald-200">
                      {m.n}
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold">{m.title}</div>
                      <ul className="mt-3 space-y-2 text-sm text-white/75">
                        {m.points.map((p) => (
                          <li key={p} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                            <span className="min-w-0">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/70">
                Unlock access to watch the full breakdown now.
              </div>
              <motion.div className="inline-block rounded-2xl" {...glowPulse}>
                <Button
                  onClick={() => setOpen(true)}
                  className="w-full rounded-2xl bg-emerald-400 px-7 py-4 text-black hover:bg-emerald-300 sm:w-auto"
                >
                  Watch Free Training
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* OBJECTIONS + “IS THIS FOR YOU” */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <motion.div {...fadeUp(0.05)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs text-white/50">If you’re thinking…</div>
            <h3 className="mt-1 text-2xl font-semibold">Common objections (answered)</h3>

            <div className="mt-5 space-y-3">
              <Objection
                title="“I don’t want complicated math.”"
                body="You’ll learn the core idea with simple outcomes. It’s designed to be practical and sanity-checkable."
              />
              <Objection
                title="“I’ve been burned by ‘systems’ before.”"
                body="This isn’t a magic button. It’s a framework you can test against constraints and rules — and decide if it fits you."
              />
              <Objection
                title="“What if I pass and then lose the hedge?”"
                body="The model accounts for both paths. You’ll see how payouts and controlled hedge losses interact across cycles."
              />
              <Objection
                title="“Is this legal?”"
                body="This is educational content. You must follow the rules and terms of any firm/broker you use. The framework focuses on rules-first structuring."
              />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs text-white/50">Best fit</div>
            <h3 className="mt-1 text-2xl font-semibold">This is for you if…</h3>

            <div className="mt-5 grid gap-3">
              <FitRow ok text="You want a framework (not signals) you can verify with logic." />
              <FitRow ok text="You can follow rules and keep risk inside guardrails." />
              <FitRow ok text="You want to design outcomes over cycles (business mindset)." />
              <FitRow text="You’re looking for a holy grail indicator or a shortcut." />
              <FitRow text="You can’t follow rules or you revenge trade heavily." />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-sm font-semibold text-white">Quick note</div>
              <div className="mt-1 text-sm leading-relaxed text-white/70">
                If you’re brand new, you can still learn the concept — but don’t size
                aggressively. The training emphasizes guardrails and realistic constraints.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-emerald-400 px-6 py-4 font-semibold text-black hover:bg-emerald-300"
              >
                Unlock Training
              </Button>
              <button
                onClick={scrollToOffer}
                className="rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-sm font-semibold text-white/85 hover:bg-white/8"
              >
                Back to curriculum
              </button>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <motion.div {...fadeUp(0.06)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs text-white/50">FAQ</div>
            <h3 className="mt-1 text-2xl font-semibold">Questions you might have</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              If you’re unsure, watch the training — it’s designed to make the framework
              clear before you do anything.
            </p>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {faqs.map((f, i) => (
                <motion.div
                  key={f.q}
                  {...fadeUp(0.06 + i * 0.03)}
                  className="rounded-3xl border border-white/10 bg-black/25 p-5"
                >
                  <div className="text-sm font-semibold text-white">{f.q}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/70">
                Ready? Get instant access to the free training.
              </div>
              <motion.div className="inline-block rounded-2xl" {...glowPulse}>
                <Button
                  onClick={() => setOpen(true)}
                  className="w-full rounded-2xl bg-emerald-400 px-7 py-4 text-black hover:bg-emerald-300 sm:w-auto"
                >
                  Unlock Free Training
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* FINAL OFFER PANEL */}
        <section className="mt-10">
          <motion.div
            {...fadeUp(0.07)}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.12),transparent_45%)]" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="tracking-wide">Access is limited</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Watch the free training (full breakdown)
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                  If you want a framework that treats prop trading like a structured system —
                  with engineered outcomes — this is the training.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>Structural mismatch</Pill>
                  <Pill>Outcome math</Pill>
                  <Pill>Phase sizing</Pill>
                  <Pill>Guardrails</Pill>
                </div>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="text-sm font-semibold">What you get</div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                    Full training access (free)
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                    Examples & constraints walkthrough
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                    Guardrails to avoid common mistakes
                  </li>
                </ul>

                <div className="mt-5">
                  <motion.div className="inline-block w-full rounded-2xl" {...glowPulse}>
                    <Button
                      onClick={() => setOpen(true)}
                      className="w-full rounded-2xl bg-emerald-400 px-7 py-5 text-black hover:bg-emerald-300"
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-base font-semibold sm:text-lg">
                          Unlock Free Training
                        </span>
                        <span className="mt-1 text-[11px] opacity-80">
                          enter details • instant redirect
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-3 text-center text-[11px] text-white/50">
                  Educational content only. No spam.
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 text-center text-xs text-white/45">
          Educational content only. Trading involves risk. Results are not guaranteed.
          <br />
          © Prop Accelerators
        </footer>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* Modal card */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { y: 18, opacity: 0, scale: 0.99 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: 10, opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_35%,rgba(34,211,238,0.10),transparent_45%)]" />

              <div className="relative z-10 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/50">Unlock access</div>
                    <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
                      Get the free training
                    </h3>
                    <p className="mt-2 text-sm text-white/70">
                      Enter your details to access the full breakdown.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/8"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form
                  className="mt-5 space-y-5"
                  onSubmit={async (e) => {
                    e.preventDefault()

                    setTouched({
                      name: true,
                      email: true,
                      phone: true,
                    })

                    if (!form.name || !form.email || !form.phone || !isPhoneLengthValid()) {
                      return
                    }

                    // 🔥 SAVE LEAD
                    const res = await fetch("/api/leads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        phone: `${form.countryCode}${form.phone}`,
                      }),
                    })

                    if (!res.ok) {
                      alert("Something went wrong. Please try again.")
                      return
                    }

                    // ✅ REDIRECT AFTER SAVE
                    window.location.href = "/training/watch"
                  }}
                >
                  {/* Name */}
                  <div>
                    <LabelRow label="First name" hint="Required" />
                    <input
                      type="text"
                      placeholder="Your first name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={[
                        "mt-2 w-full rounded-2xl border bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none",
                        "focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10",
                        isInvalid("name") ? "border-red-500/70" : "border-white/10",
                      ].join(" ")}
                    />
                    {isInvalid("name") && (
                      <p className="mt-1 text-xs text-red-400">This field is required</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <LabelRow label="Email" hint="Required" />
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={[
                        "mt-2 w-full rounded-2xl border bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none",
                        "focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10",
                        isInvalid("email") ? "border-red-500/70" : "border-white/10",
                      ].join(" ")}
                    />
                    {isInvalid("email") && (
                      <p className="mt-1 text-xs text-red-400">This field is required</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <LabelRow label="Phone" hint="Required" />
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={form.countryCode}
                        onChange={(e) => handleChange("countryCode", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-white outline-none focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 sm:w-40"
                      >
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>

                        <option value="+49">🇩🇪 +49 (DE)</option>
                        <option value="+33">🇫🇷 +33 (FR)</option>
                        <option value="+34">🇪🇸 +34 (ES)</option>
                        <option value="+39">🇮🇹 +39 (IT)</option>
                        <option value="+31">🇳🇱 +31 (NL)</option>
                        <option value="+41">🇨🇭 +41 (CH)</option>
                        <option value="+46">🇸🇪 +46 (SE)</option>
                        <option value="+47">🇳🇴 +47 (NO)</option>
                        <option value="+45">🇩🇰 +45 (DK)</option>

                        <option value="+81">🇯🇵 +81 (JP)</option>
                        <option value="+82">🇰🇷 +82 (KR)</option>
                        <option value="+852">🇭🇰 +852 (HK)</option>
                        <option value="+86">🇨🇳 +86 (CN)</option>
                        <option value="+91">🇮🇳 +91 (IN)</option>

                        <option value="+55">🇧🇷 +55 (BR)</option>
                        <option value="+52">🇲🇽 +52 (MX)</option>
                        <option value="+54">🇦🇷 +54 (AR)</option>

                        <option value="+27">🇿🇦 +27 (ZA)</option>
                      </select>

                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) =>
                          handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))
                        }
                        onBlur={() => handleBlur("phone")}
                        className={[
                          "w-full min-w-0 rounded-2xl border bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none",
                          "focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10",
                          isInvalid("phone") ? "border-red-500/70" : "border-white/10",
                        ].join(" ")}
                      />
                    </div>

                    {touched.phone && (
                      <p className="mt-1 text-xs text-red-400">
                        {!form.phone
                          ? "Phone number is required"
                          : !isPhoneLengthValid()
                          ? "Invalid phone number for selected country"
                          : ""}
                      </p>
                    )}

                    <div className="mt-2 text-[11px] text-white/45">
                      We use this only for access + important updates. No spam.
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-1">
                    <motion.div className="inline-block w-full rounded-2xl" {...glowPulse}>
                      <Button
                        type="submit"
                        className="w-full rounded-2xl bg-emerald-400 py-4 text-base font-semibold text-black hover:bg-emerald-300"
                      >
                        Watch Free Training Now
                      </Button>
                    </motion.div>
                    <div className="mt-3 text-center text-[11px] text-white/45">
                      By continuing, you agree this is educational content only.
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =============================================================================
   UI Helpers (local to file)
============================================================================= */

function Pill({
  children,
  subtle,
}: {
  children: React.ReactNode
  subtle?: boolean
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs",
        subtle
          ? "border-white/10 bg-white/5 text-white/65"
          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      ].join(" ")}
    >
      {children}
    </span>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] text-white/45">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-white">{value}</div>
    </div>
  )
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-semibold text-emerald-200">
          {n}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-white/65">{desc}</div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-sm font-semibold text-white/85">{value}</div>
    </div>
  )
}

function StarRow() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs">★★★★★</span>
      <span className="text-[11px] text-white/45">verified feedback</span>
    </div>
  )
}

function Objection({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/70">{body}</div>
    </div>
  )
}

function FitRow({ text, ok }: { text: string; ok?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div
        className={[
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold",
          ok
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
            : "border-white/10 bg-white/5 text-white/60",
        ].join(" ")}
      >
        {ok ? "✓" : "—"}
      </div>
      <div className="min-w-0 text-sm leading-relaxed text-white/75">{text}</div>
    </div>
  )
}

function LabelRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-semibold text-white">{label}</div>
      {hint ? (
        <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
          {hint}
        </div>
      ) : null}
    </div>
  )
}
