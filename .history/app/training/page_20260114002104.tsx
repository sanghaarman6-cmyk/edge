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

    const isPhoneLengthValid = () => {
    const validLengths = PHONE_LENGTHS[form.countryCode];
    if (!validLengths) return false;

    return validLengths.includes(form.phone.length);
    };


    const PHONE_LENGTHS: Record<string, number[]> = {
    '+1': [10],        // USA, Canada
    '+44': [10],       // UK
    '+61': [9],        // Australia
    '+971': [9],       // UAE
    '+65': [8],        // Singapore

    '+49': [10, 11],   // Germany
    '+33': [9],        // France
    '+34': [9],        // Spain
    '+39': [9, 10],    // Italy
    '+31': [9],        // Netherlands
    '+41': [9],        // Switzerland
    '+46': [9],        // Sweden
    '+47': [8],        // Norway
    '+45': [8],        // Denmark

    '+81': [10],       // Japan
    '+82': [9, 10],    // South Korea
    '+852': [8],       // Hong Kong
    '+86': [11],       // China
    '+91': [10],       // India

    '+55': [10, 11],   // Brazil
    '+52': [10],       // Mexico
    '+54': [10],       // Argentina

    '+27': [9],        // South Africa
    };








  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4" onContextMenu={(e) => e.preventDefault()}>
        <Script
          src="https://fast.wistia.com/assets/external/E-v1.js"
          strategy="afterInteractive"
        />

      {/* LOGO */}
      <div className="mt-8 mb-6">
        <img
          src="/favicon.ico"
          alt="Prop Accelerator"
          className="w-12 h-12 mx-auto"
        />
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


        {/* SILENT LOOP VSL (GIF-LIKE MP4) */}
        <section className="w-full max-w-4xl mt-8">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
            <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            onContextMenu={(e) => e.preventDefault()}
            >
            <source src="/vsl-loop.mp4" type="video/mp4" />
            </video>

            {/* Interaction shield */}
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
            transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            }}
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
      

      {/* PROOF WALL */}

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

        {/* HEADER */}
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

        {/* 3 STEP CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Prop Firm Position',
              text: 'A position is opened on a prop firm account under strict risk rules.',
            },
            {
              title: 'Broker Offset',
              text: 'At the same time, the opposite position is opened on a personal broker.',
            },
            {
              title: 'Asymmetric Outcome',
              text: 'The system is sized so one side always benefits over the full cycle.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center"
            >
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* WHY IT WORKS */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h3 className="text-2xl font-semibold mb-4">
              Why Prop Firms Can’t Price This In
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Prop firms measure drawdown and performance in percentages
              on large virtual balances.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Brokers settle profit and loss in real dollars.
              <br />
              Combining both creates a structural mismatch —
              not speed, not latency, not manipulation.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <h4 className="font-semibold mb-4 text-white">
              This model focuses on:
            </h4>
            <ul className="space-y-3 text-zinc-300 text-sm">
              <li>• Monetising losing scenarios</li>
              <li>• Engineering evaluation vs funded phases differently</li>
              <li>• Letting payouts outweigh controlled losses</li>
              <li>• Operating fully within prop firm rules</li>
            </ul>
          </div>
        </div>

        {/* FINAL CTA PANEL */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-semibold mb-4">
            Watch The Free Training
          </h3>
          <p className="text-zinc-400 max-w-xl mx-auto mb-6">
            This is a structural trading model —
            not indicators, not signals, not trade calls.
          </p>

          <Button
            onClick={() => setOpen(true)}
            className="px-12 py-6 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-2xl"
          >
            <div className="flex flex-col items-center leading-tight">
              <span className="text-xl">Unlock Free Training</span>
              <span className="text-xs opacity-80 mt-1">(limited spots)</span>
            </div>
          </Button>
        </div>
      </section>

      {/* MODAL */}
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

                // 🔥 SAVE LEAD
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

                // ✅ REDIRECT AFTER SAVE
                window.location.href = '/training/watch';
              }}


                className="space-y-6"
                >
                {/* INPUTS */}
                <div className="space-y-4">
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

                    {/* PHONE WITH COUNTRY CODE */}
                    <div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={form.countryCode}
                            onChange={(e) => handleChange('countryCode', e.target.value)}
                            className="w-full sm:w-32 px-3 py-3 bg-black border border-zinc-800 rounded-lg text-white"
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
                                handleChange('phone', e.target.value.replace(/[^0-9]/g, ''))
                            }
                            onBlur={() => handleBlur('phone')}
                            className={`w-full sm:flex-1 min-w-0 px-4 py-3 bg-black border rounded-lg text-white placeholder-zinc-500 ${
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
                </div>

                {/* CTA */}
                <div className="pt-2">
                    <Button
                    type="submit"
                    className="w-full py-3 text-lg bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl"
                    >
                    Watch Free Training Now
                    </Button>
                </div>
                </form>


            <p className="text-xs text-zinc-500 mt-4 text-center">
              Educational content only. No spam.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-xs text-zinc-600 my-8 text-center max-w-xl">
        Educational content only. Trading involves risk. Results are not guaranteed.
        <br />
        © Prop Accelerators
      </footer>
    </div>
  );
}
