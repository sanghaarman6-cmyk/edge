'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import Script from 'next/script'

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

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  type ValidField = 'name' | 'email' | 'phone'

  const isInvalid = (field: ValidField) => {
    return touched[field] && form[field].trim() === ''
  }

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

  const isPhoneLengthValid = () => {
    const validLengths = PHONE_LENGTHS[form.countryCode]
    if (!validLengths) return false
    return validLengths.includes(form.phone.length)
  }

  return (
    <div
      className="min-h-screen bg-black text-white px-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Script
        src="https://fast.wistia.com/assets/external/E-v1.js"
        strategy="afterInteractive"
      />

      {/* HEADER */}
      <header className="pt-10 text-center">
        <img src="/favicon.ico" className="mx-auto h-12 w-12" />
        <p className="mt-3 text-[11px] tracking-[0.32em] text-zinc-500">
          PRIVATE TRAINING ACCESS
        </p>
      </header>

      {/* HERO */}
      <section className="mx-auto mt-14 max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl sm:text-4xl font-semibold leading-tight"
        >
          A Structural Mismatch
          <br />
          Inside Prop Firm Risk Models
        </motion.h1>

        <p className="mt-6 text-zinc-400 text-base sm:text-lg leading-relaxed">
          This is not indicators. Not signals. Not prediction.
          <br />
          It’s a two-account hedge model designed to monetise
          <span className="text-white font-semibold">
            {' '}losses, passes, and payout cycles
          </span>.
        </p>
      </section>

      {/* VIDEO */}
      <section className="mx-auto mt-10 max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-black">
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

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute bottom-4 left-4 rounded-xl border border-zinc-700 bg-black/70 px-4 py-2 text-xs">
            Silent proof clip — full explanation inside
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
            What’s Actually Happening
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            This model engineers outcomes —
            it does not predict price.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['Prop Firm Account', 'Large simulated balance measured in % drawdown'],
            ['Personal Broker', 'Real capital settled in absolute dollars'],
            ['Hedge Engine', 'Opposing exposure sized asymmetrically'],
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

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h3 className="text-2xl font-semibold mb-4">
              Why Prop Firms Can’t Price This In
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Prop firms enforce risk in percentages on large virtual balances.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Brokers settle profit and loss in real dollars.
              <br />
              Combining both creates a structural mismatch —
              without breaking rules.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <ul className="space-y-3 text-zinc-300 text-sm">
              <li>• Losing scenarios monetised</li>
              <li>• Evaluation and funded stages engineered differently</li>
              <li>• Payouts outweigh controlled hedge losses</li>
              <li>• Fully compliant execution</li>
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
            not indicators, not signals, not opinions.
          </p>

          <Button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-white px-12 py-6 text-black text-lg font-semibold hover:bg-zinc-200"
          >
            Watch The Training
          </Button>
        </div>
      </section>

      {/* MODAL — LOGIC UNCHANGED */}
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
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-2xl font-semibold mb-2 text-center">
                Unlock The Free Training
              </h3>
              <p className="text-zinc-400 text-sm text-center mb-6">
                Enter your details to access the full breakdown.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()

                  setTouched({ name: true, email: true, phone: true })

                  if (
                    !form.name ||
                    !form.email ||
                    !form.phone ||
                    !isPhoneLengthValid()
                  ) {
                    return
                  }

                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: form.name,
                      email: form.email,
                      phone: `${form.countryCode}${form.phone}`,
                    }),
                  })

                  if (!res.ok) {
                    alert('Something went wrong. Please try again.')
                    return
                  }

                  window.location.href = '/training/watch'
                }}
                className="space-y-6"
              >
                {/* NAME */}
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-zinc-500 ${
                      isInvalid('name') ? 'border-red-500' : 'border-zinc-800'
                    }`}
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-zinc-500 ${
                      isInvalid('email') ? 'border-red-500' : 'border-zinc-800'
                    }`}
                  />
                </div>

                {/* PHONE */}
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => handleChange('countryCode', e.target.value)}
                    className="w-32 px-3 py-3 bg-black border border-zinc-800 rounded-lg text-white"
                  >
                    {Object.keys(PHONE_LENGTHS).map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) =>
                      handleChange('phone', e.target.value.replace(/[^0-9]/g, ''))
                    }
                    onBlur={() => handleBlur('phone')}
                    className={`flex-1 px-4 py-3 bg-black border rounded-lg text-white placeholder-zinc-500 ${
                      isInvalid('phone') ? 'border-red-500' : 'border-zinc-800'
                    }`}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 text-lg bg-white text-black font-semibold rounded-xl hover:bg-zinc-200"
                >
                  Watch Free Training Now
                </Button>
              </form>

              <p className="text-xs text-zinc-500 mt-4 text-center">
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
        © Prop Accelerators
      </footer>
    </div>
  )
}
