'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import Script from 'next/script';

export default function TrainingLandingPage() {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  type ValidField = 'name' | 'email' | 'phone';

  const isInvalid = (field: ValidField) => {
    return touched[field] && form[field].trim() === '';
  };

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
  };

  const isPhoneLengthValid = () => {
    const validLengths = PHONE_LENGTHS[form.countryCode];
    if (!validLengths) return false;
    return validLengths.includes(form.phone.length);
  };

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
      <div className="mt-8 mb-6">
        <img src="/favicon.ico" className="w-12 h-12 mx-auto" />
      </div>

      {/* HERO */}
      <section className="max-w-3xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl font-semibold leading-tight"
        >
          Exploit a Structural Mismatch in Prop Firms
          <span className="text-red-400"> Using a Two-Account Hedge System</span>
        </motion.h1>

        <p className="mt-4 text-zinc-400 text-base sm:text-lg">
          I built a prop-broker hedging system that generated over
          <span className="text-white font-semibold"> $750,000</span> using prop firms.
          <br />
          This free training breaks down the exact framework.
        </p>
      </section>

      {/* VSL */}
      <section className="w-full max-w-4xl mt-8">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          >
            <source src="/vsl-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-10" />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 text-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0px rgba(74, 222, 128, 0.0)',
              '0 0 30px rgba(74, 222, 128, 0.6)',
              '0 0 0px rgba(74, 222, 128, 0.0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block rounded-2xl"
        >
          <Button
            onClick={() => setOpen(true)}
            className="px-12 py-6 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-2xl"
          >
            <div className="flex flex-col items-center leading-tight">
              <span className="text-xl">Unlock Free Training</span>
              <span className="text-xs opacity-80 mt-1">(limited spots)</span>
            </div>
          </Button>
        </motion.div>

        <p className="text-sm text-zinc-400 mt-3">
          Free training • No indicators • No signals
        </p>
      </section>

      {/* PROOF WALL */}
      <section className="w-full max-w-6xl mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">
            Real Results From Real Members
          </h2>
          <p className="text-zinc-400 mt-3 text-lg">
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
            ['Tiny', 'Broke → 5 figures'],
          ].map(([name, result], i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{name}</span>
                <span className="text-green-400 text-sm">{result}</span>
              </div>

              <div className="h-40 rounded-lg border border-zinc-800 bg-black flex items-center justify-center text-zinc-600 text-sm">
                Screenshot proof
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-500 text-center mt-8">
          Results vary by execution and risk. Proof shown from real users.
        </p>
      </section>

      {/* STRUCTURE SECTION */}
      <section className="w-full max-w-5xl mt-20 space-y-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4">
            What’s Actually Happening Behind The Scenes
          </h2>
          <p className="text-zinc-400 text-lg">
            This isn’t about predicting price.
            <br />
            It’s about structuring risk across two different systems.
          </p>
        </div>
      </section>

      {/* MODAL — FULLY RESTORED */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-md relative">
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
                e.preventDefault();

                setTouched({
                  name: true,
                  email: true,
                  phone: true,
                });

                if (
                  !form.name ||
                  !form.email ||
                  !form.phone ||
                  !isPhoneLengthValid()
                ) {
                  return;
                }

                const res = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: `${form.countryCode}${form.phone}`,
                  }),
                });

                if (!res.ok) {
                  alert('Something went wrong. Please try again.');
                  return;
                }

                window.location.href = '/training/watch';
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
                {isInvalid('name') && (
                  <p className="mt-1 text-xs text-red-500">This field is required</p>
                )}
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
                {isInvalid('email') && (
                  <p className="mt-1 text-xs text-red-500">This field is required</p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => handleChange('countryCode', e.target.value)}
                    className="w-full sm:w-32 px-3 py-3 bg-black border border-zinc-800 rounded-lg text-white"
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
                    className={`w-full sm:flex-1 px-4 py-3 bg-black border rounded-lg text-white placeholder-zinc-500 ${
                      isInvalid('phone') ? 'border-red-500' : 'border-zinc-800'
                    }`}
                  />
                </div>

                {touched.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {!form.phone
                      ? 'Phone number is required'
                      : !isPhoneLengthValid()
                      ? 'Invalid phone number for selected country'
                      : ''}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-lg bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl"
              >
                Watch Free Training Now
              </Button>
            </form>

            <p className="text-xs text-zinc-500 mt-4 text-center">
              Educational content only. No spam.
            </p>
          </div>
        </div>
      )}

      <footer className="text-xs text-zinc-600 my-8 text-center max-w-xl">
        Educational content only. Trading involves risk. Results are not guaranteed.
        <br />
        © Prop Accelerators
      </footer>
    </div>
  );
}
