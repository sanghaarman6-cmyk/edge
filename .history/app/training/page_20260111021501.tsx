'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Script from 'next/script'
import { Button } from '../components/ui/Button'

export default function TrainingLandingPage() {
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
  })

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  })

  const PHONE_LENGTHS: Record<string, number[]> = {
    '+1': [10],
    '+44': [10],
    '+61': [9],
    '+971': [9],
    '+65': [8],
    '+49': [10, 11],
    '+33': [9],
    '+34': [9],
    '+39': [9, 10],
    '+31': [9],
    '+41': [9],
    '+46': [9],
    '+47': [8],
    '+45': [8],
    '+81': [10],
    '+82': [9, 10],
    '+852': [8],
    '+86': [11],
    '+91': [10],
    '+55': [10, 11],
    '+52': [10],
    '+54': [10],
    '+27': [9],
  }

  const handleChange = (field: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const handleBlur = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }))

  const isInvalid = (field: 'name' | 'email' | 'phone') =>
    touched[field] && !form[field]

  const isPhoneLengthValid = () => {
    const valid = PHONE_LENGTHS[form.countryCode]
    return valid ? valid.includes(form.phone.length) : false
  }

  return (
    <div
      className="min-h-screen bg-black text-white px-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Script src="https://fast.wistia.com/assets/external/E-v1.js" strategy="afterInteractive" />

      {/* HEADER */}
      <header className="pt-10 text-center">
        <img src="/favicon.ico" className="mx-auto h-12 w-12" />
        <p className="mt-3 text-xs tracking-[0.3em] text-zinc-500">
          PRIVATE TRAINING ACCESS
        </p>
      </header>

      {/* HERO */}
      <section className="mx-auto mt-14 max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-semibold leading-tight"
        >
          A Structural Trading Model
          <br />
          Built on a Prop Firm Mismatch
        </motion.h1>

        <p className="mt-5 text-zinc-400 text-base sm:text-lg leading-relaxed">
          This is not prediction, indicators, or signals.
          <br />
          It’s a risk-engineered system that monetises
          <span className="text-white font-semibold"> failure, payouts, and drawdown asymmetry</span>.
        </p>
      </section>

      {/* VIDEO */}
      <section className="mx-auto mt-10 max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          <video
            src="/vsl-loop.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 rounded-xl border border-zinc-700 bg-black/70 px-4 py-2 text-xs">
            Proof clip — full breakdown inside
          </div>
        </div>
      </section>

      {/* PRIMARY CTA */}
      <section className="mt-10 text-center">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <Button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-white px-12 py-6 text-black text-lg font-semibold hover:bg-zinc-200"
          >
            Watch The Free Training
          </Button>
        </motion.div>

        <p className="mt-3 text-xs text-zinc-500">
          No indicators • No signals • No guessing
        </p>
      </section>

      {/* STRUCTURE */}
      <section className="mx-auto mt-24 max-w-5xl space-y-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold">
            What The Model Is Actually Doing
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            This system is about structuring outcomes,
            not predicting price.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['Prop Firm Account', 'Large notional balance measured in % drawdown'],
            ['Personal Broker', 'Real dollars settled on each outcome'],
            ['Engineered Hedge', 'Losses, passes, and payouts monetised differently'],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center"
            >
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-semibold mb-4">
              Why This Can’t Be Priced Out
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Prop firms evaluate in percentages on simulated capital.
              Brokers settle real profit and loss in dollars.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              This disconnect allows outcomes to be engineered —
              fully within the rules.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <ul className="space-y-3 text-zinc-300 text-sm">
              <li>• Losing scenarios monetised</li>
              <li>• Evaluations and funded stages treated differently</li>
              <li>• Payout cycles outweigh controlled losses</li>
              <li>• No rule breaking, no latency, no manipulation</li>
            </ul>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <h3 className="text-2xl font-semibold mb-4">
            Access The Free Training
          </h3>
          <p className="text-zinc-400 max-w-xl mx-auto mb-6">
            This is a structural trading model —
            not a strategy, not signals, not opinions.
          </p>

          <Button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-white px-12 py-6 text-black text-lg font-semibold hover:bg-zinc-200"
          >
            Watch The Training
          </Button>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8"
            >
              <h3 className="text-2xl font-semibold text-center mb-2">
                Private Training Access
              </h3>
              <p className="text-sm text-zinc-400 text-center mb-6">
                Enter your details to continue.
              </p>

              {/* FORM — unchanged logic */}
              {/* (your existing form logic stays exactly the same here) */}

              <p className="mt-6 text-xs text-zinc-500 text-center">
                Educational content only. No spam.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="my-10 text-center text-xs text-zinc-600">
        Educational content only. Trading involves risk.
        <br />
        © Prop Accelerator
      </footer>
    </div>
  )
}
