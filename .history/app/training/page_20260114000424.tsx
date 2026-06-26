'use client'

import { motion } from 'framer-motion'
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

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isInvalid = (field: 'name' | 'email' | 'phone') =>
    touched[field] && form[field].trim() === ''

  const isPhoneLengthValid = () => {
    const valid = PHONE_LENGTHS[form.countryCode]
    return valid ? valid.includes(form.phone.length) : false
  }

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col items-center px-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Script
        src="https://fast.wistia.com/assets/external/E-v1.js"
        strategy="afterInteractive"
      />

      {/* LOGO */}
      <div className="mt-10 mb-8">
        <img src="/favicon.ico" className="w-12 h-12 mx-auto" />
      </div>

      {/* HERO */}
      <section className="max-w-4xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-semibold leading-tight"
        >
          A Structural Exploit Inside
          <br />
          <span className="text-red-400">Prop Firm Risk Models</span>
        </motion.h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
          I built a two-account hedge framework that monetises prop firm
          evaluation rules instead of fighting price.
          <br />
          <span className="text-white font-semibold">
            $750,000+ generated using this exact structure.
          </span>
        </p>
      </section>

      {/* VSL */}
      <section className="w-full max-w-5xl mt-10">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/vsl-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" />
        </div>
      </section>

      {/* PRIMARY CTA */}
      <section className="mt-10 text-center">
        <motion.div
          animate={{
            scale: [1, 1.04, 1],
            boxShadow: [
              '0 0 0 rgba(34,197,94,0)',
              '0 0 32px rgba(34,197,94,.6)',
              '0 0 0 rgba(34,197,94,0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="inline-block rounded-2xl"
        >
          <Button
            onClick={() => setOpen(true)}
            className="px-14 py-6 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-2xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-xl">Unlock Free Training</span>
              <span className="text-xs opacity-70 mt-1">
                Limited access window
              </span>
            </div>
          </Button>
        </motion.div>

        <p className="text-xs text-zinc-400 mt-4">
          No indicators • No signals • No predictions
        </p>
      </section>

      {/* RESULTS WALL */}
      <section className="w-full max-w-6xl mt-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold">
            Real Results From Real Operators
          </h2>
          <p className="text-zinc-400 mt-4 text-lg">
            Same framework. Same rules. Different execution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            ['Brandon', '$234K in 12 months'],
            ['Jeff', '$188K under 12 months'],
            ['Winston', '$54K month'],
            ['Diaz', '$52K in 8 days'],
            ['Nico', '$50K month'],
            ['Isaac', '$44K day'],
            ['Xavier', '$11K first week'],
            ['Tiny', 'From broke → 5 figures'],
          ].map(([name, result], i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{name}</span>
                <span className="text-green-400 text-sm">{result}</span>
              </div>
              <div className="h-40 bg-black border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-sm">
                Screenshot proof
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-500 text-center mt-8">
          Results vary by execution, risk tolerance and capital. Proof shown
          from real users.
        </p>
      </section>

      {/* STRUCTURE */}
      <section className="w-full max-w-5xl mt-24 space-y-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">
            What’s Actually Happening Behind The Scenes
          </h2>
          <p className="text-zinc-400 mt-4 text-lg">
            This is not trading edge.
            <br />
            It’s structural asymmetry.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['Prop Account', 'Strict % drawdown rules on virtual balances'],
            ['Broker Hedge', 'Real cash settlement with flexible sizing'],
            ['Asymmetric Net', 'Losses engineered to pay over cycles'],
          ].map(([t, d], i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center"
            >
              <h3 className="font-semibold mb-2">{t}</h3>
              <p className="text-zinc-400 text-sm">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-24 max-w-4xl w-full">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-semibold mb-4">
            Watch The Free Training
          </h3>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            This framework shows how prop firm failure scenarios can be
            monetised instead of avoided.
          </p>

          <Button
            onClick={() => setOpen(true)}
            className="px-14 py-6 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-2xl"
          >
            Unlock Free Training
          </Button>
        </div>
      </section>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold text-center mb-2">
              Unlock Free Training
            </h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              Enter your details to continue
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
                )
                  return

                const res = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: `${form.countryCode}${form.phone}`,
                  }),
                })

                if (res.ok) window.location.href = '/training/watch'
              }}
              className="space-y-4"
            >
              <input
                placeholder="First name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg"
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) =>
                    handleChange('countryCode', e.target.value)
                  }
                  className="px-3 py-3 bg-black border border-zinc-800 rounded-lg"
                >
                  {Object.keys(PHONE_LENGTHS).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    handleChange(
                      'phone',
                      e.target.value.replace(/[^0-9]/g, '')
                    )
                  }
                  onBlur={() => handleBlur('phone')}
                  className="flex-1 px-4 py-3 bg-black border border-zinc-800 rounded-lg"
                />
              </div>

              <Button className="w-full py-3 bg-green-400 text-black font-semibold rounded-xl">
                Watch Training Now
              </Button>
            </form>
          </div>
        </div>
      )}

      <footer className="text-xs text-zinc-600 my-10 text-center">
        Educational content only. Trading involves risk.
        <br />© Prop Accelerators
      </footer>
    </div>
  )
}
