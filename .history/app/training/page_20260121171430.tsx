'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import Script from 'next/script';
import { useRef, useEffect } from 'react';
import SystemFlow from '../components/SystemFlow';
import SectionConnector from '../components/SectionConnector';

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-white">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-400"
        >
          ▾
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  )
}

function PayoutRow({
  direction = 'left',
}: {
  direction?: 'left' | 'right'
}) {
  const payouts = [
    '/payouts/1.jpeg',
    '/payouts/2.jpeg',
    '/payouts/3.jpeg',
    '/payouts/4.jpeg',
    '/payouts/5.jpeg',
    '/payouts/6.jpeg',
    '/payouts/7.jpeg',
    '/payouts/8.jpeg',
    '/payouts/9.jpeg',
    '/payouts/10.jpeg',
  ]

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex gap-6 w-max"
        animate={{
          x: direction === 'left'
            ? ['0%', '-50%']
            : ['-50%', '0%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 40,
          ease: 'linear',
        }}
      >
        {[...payouts, ...payouts].map((src, i) => (
<div
  key={i}
  className="w-[500px] aspect-[6] shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
>
  <img
    src={src}
    alt="Payout proof"
    className="w-full h-full object-cover"
    draggable={false}
  />
</div>

        ))}
      </motion.div>

      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-black to-transparent" />
    </div>
  )
}


export default function TrainingLandingPage() {
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ctaRef.current) return;
      const rect = ctaRef.current.getBoundingClientRect();
      setIsFloating(rect.bottom < 0);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [open, setOpen] = useState(false);

    const [activeVideo, setActiveVideo] = useState<null | { id: string; thumb: string }>(null);


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

    const VIDEOS = [
    {
      thumb: '/yt/vid1.jpg',
      id: 'EYaJ4kPYDGk',
    },
    {
      thumb: '/yt/vid2.jpg',
      id: 'MK5j4u_nvIA',
    },
    {
      thumb: '/yt/vid3.jpg',
      id: 'CJNxKptyBmw',
    },
    {
      thumb: '/yt/vid4.jpg',
      id: 'CAaFeRiw5dQ',
    },
    {
      thumb: '/yt/vid5.jpg',
      id: '5X_HBYAvTwQ?si=gwaRiBhgv3TBM3co',
    },
  ];







  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4" onContextMenu={(e) => e.preventDefault()}>
        <Script
          src="https://fast.wistia.com/assets/external/E-v1.js"
          strategy="afterInteractive"
        />

        {/* TOP BRAND MARK */}
        <div className="mt-6 mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Prop Accelerator"
              className="w-10 h-10"
            />
            <span className="text-xs tracking-[0.3em] text-zinc-500">
              PROP ACCELERATOR
            </span>
          </div>
        </div>

        {/* HERO */}
        <section className="w-full max-w-4xl text-center">
          <motion.h1
            className="text-[2.2rem] sm:text-[1.85rem] leading-[1.1] font-semibold"
          >
            EXPLOIT A STRUCTURAL MISMATCH IN PROP FIRMS
          </motion.h1>

          <div className="mt-6 flex items-center gap-4 justify-center">
            <div className="h-px w-16 bg-red-400/40" />
            <span className="font-serif italic text-red-400/80 text-lg">
              TWO-ACCOUNT HEDGE SYSTEM EXPLOIT
            </span>
            <div className="h-px w-16 bg-red-400/40" />
          </div>

            <p
              className="mt-8 text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              I built a prop-broker hedging framework that generated over
              <span className="text-white font-medium"> $750,000</span> using prop firms.
              <br />
              This free training breaks down the exact system.
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
      <section className="mt-1 text-center">
      {/* INLINE / FLOATING CTA BAR */}
      <div ref={ctaRef} className="w-full max-w-5xl mt-15">


        <div
          className={`
            transition-all duration-300
            ${isFloating
              ? 'fixed bottom-0 left-0 right-0 z-40'
              : 'relative'}
          `}
        >
          <div
            className={`
              mx-auto max-w-5xl
              px-6 py-4
              flex items-center justify-between gap-4
              bg-black/70 backdrop-blur-xl
              border border-zinc-800
              ${isFloating ? 'rounded-t-2xl' : 'rounded-2xl'}
            `}
          >
            <div>
              <p className="font-semibold text-white">
                Ready to see the full framework?
              </p>
              <p className="text-sm text-zinc-400">
                Learn Hedging Brokers - Prop Firms
              </p>
            </div>

            <Button
              onClick={() => setOpen(true)}
              className="px-6 py-3 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl"
            >
              Unlock Free Training
            </Button>
          </div>
        </div>
      </div>


        <p className="text-sm text-zinc-400 mt-3">
            Free training • No indicators • No signals
        </p>
        <SectionConnector height={70}/>
        </section>
<div className="my-6 sm:my-10 overflow-visible px-3 sm:px-0">
  <SystemFlow />
</div>


        <SectionConnector height={70}/>

         {/* AS SEEN ON */}
        <section className="w-full max-w-6xl mt-12">
          <p className="text-xs tracking-[0.35em] text-zinc-500 text-center mb-6">
            AS SEEN ON
          </p>

          {/* Logos */}
          <div className="flex justify-center flex-wrap gap-8 mb-6 opacity-80">
            <img src="/logos/fundednext.png" className="h-5" />
            <img src="/logos/thefundedtrader.png" className="h-5" />
            <img src="/logos/alphacapital.png" className="h-5" />
            <img src="/logos/fundingpips.png" className="h-5" />
          </div>

          {/* Video carousel */}
          <div className="relative">
            {/* manual scroll layer */}
            <div
              className="
                overflow-x-auto
                scrollbar-hide
                snap-x snap-mandatory
                touch-pan-x
              "
            >
              {/* auto-scroll track */}
              <motion.div
                className="flex gap-6 w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 40,
                  ease: 'linear',
                }}
              >
                {[...VIDEOS, ...VIDEOS].map((v, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-[260px] cursor-pointer"
                    onClick={() => setActiveVideo(v)}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800">
                      <img
                        src={v.thumb}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />

                      {/* cinematic gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                      {/* play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-white translate-x-px"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      <SectionConnector height={70}/>
      {/* TESTIMONIALS IMAGtE */}
      <section className="w-full max-w-5xl mt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">
            Real Results From Real Members
          </h2>
          <p className="text-zinc-400 mt-3 text-lg">
            Unedited screenshots. Real payouts. Real conversations.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <img
            src="/Testimonials.png"
            alt="Member testimonials and payout proofs"
            className="w-full h-auto"
            draggable={false}
          />
        </div>

        <p className="text-xs text-zinc-500 text-center mt-6 max-w-2xl mx-auto">
          Results vary by execution, capital, and risk management.  
          Screenshots shown are from real users.
        </p>
      <SectionConnector height={130}/>
      </section>

      {/* STRUCTURE SECTION */}
      <section className="w-full max-w-6xl space-y-10">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-semibold mb-6">
            What’s Actually Happening Behind the Scenes
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            This isn’t about predicting price.
            <br />
            <span className="text-white">
              It’s about structuring risk across two different systems.
            </span>
          </p>
        </div>

        {/* FLOW DIAGRAM */}
        <div className="grid md:grid-cols-3 gap-8 relative">

          {[
            {
              step: '01',
              title: 'Prop Firm Position',
              text: 'A position is opened on a prop firm account under strict percentage-based risk rules.',
            },
            {
              step: '02',
              title: 'Broker Offset',
              text: 'At the same time, the opposite position is opened on a personal broker with real dollar settlement.',
            },
            {
              step: '03',
              title: 'Asymmetric Outcome',
              text: 'The system is sized so one side always benefits over the full cycle.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8"
            >
              {/* STEP NUMBER */}
              <div className="absolute -top-4 left-6 bg-black px-3 py-1 rounded-full border border-zinc-800 text-xs text-zinc-400">
                {item.step}
              </div>

              <h3 className="text-xl font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {item.text}
              </p>
              
            </div>        
            
          ))}
          
            </div>
          <div className="w-full max-w-5xl mx-auto my-20">
            
        </div>


          {/* FAQ SECTION */}
          <section className="w-full max-w-3xl mx-auto mt-10 mb-20 px-2">
            <SectionConnector height={70}/>
            <h2 className="text-3xl font-semibold text-center mb-10">
              Common Questions
            </h2>

            {(() => {
              const [openIndex, setOpenIndex] = useState<number | null>(null)

              const faqs = [
                {
                  q: 'What happens after I join Prop-Accelerator?',
                  a: 'You get immediate access to the full framework, system breakdowns, and the private community. Everything is structured step by step with custom login to our in-house webapp with all the tools.',
                },
                {
                  q: 'Is this for beginners or experienced traders?',
                  a: 'This is best suited for traders who understand basic execution and want to exploit the mathematical edge without any real monetary risk.',
                },
                {
                  q: 'Do I need a large personal account to hedge?',
                  a: 'No. The system is designed to scale. Hedge sizing is relative and adjusted based on your capital.',
                },
                {
                  q: 'Can I really profit even if a prop evaluation fails?',
                  a: 'Yes. The system is built so losing scenarios are planned and fully monetised, essentialy allowing you to take evaluations for FREE..',
                },
                {
                  q: 'Is there guidance or support inside?',
                  a: 'Yes. You’re not left alone. The community and guidance are built around correct execution and discipline.',
                },
              ]

              return (
                <div className="space-y-4">
                  {faqs.map((item, i) => (
                    <FAQItem
                      key={i}
                      question={item.q}
                      answer={item.a}
                      isOpen={openIndex === i}
                      onToggle={() =>
                        setOpenIndex(openIndex === i ? null : i)
                      }
                    />
                  ))}
                </div>
              )
            })()}

          </section>

          {/* DOCUMENTED OUTCOMES */}
          <section className="w-full max-w-7xl mx-auto mt-24 mb-32 px-4">
            <p className="text-xs tracking-[0.35em] text-zinc-500 text-center mb-6">
              DOCUMENTED OUTCOMES
            </p>

            <h2 className="text-3xl font-semibold text-center mb-12">
              This Isn’t Theory. It’s Execution.
            </h2>

            <div className="space-y-6 overflow-hidden">
              <PayoutRow direction="left" />
              <PayoutRow direction="right" />
              <PayoutRow direction="left" />
            </div>

            <p className="text-xs text-zinc-500 text-center mt-10 max-w-2xl mx-auto">
              Screens shown are real account results across multiple firms and cycles.
              Individual results vary by execution and risk.
            </p>
          </section>




       
       <div className="h-px bg-black" />
      </section>

      {/* VIDEO MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setActiveVideo(null)} // 👈 tap outside closes
        >
          <div
            className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800"
            onClick={(e) => e.stopPropagation()} // 👈 prevent close when tapping video
          >
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}


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
