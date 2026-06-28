"use client";

import Image from "next/image";
import { useState } from "react";

const telegramUrl = "hhttps://t.me/+KZQzlBDgHIY1N2Vk";

const stats = [
  { label: "2026 YTD", value: "+23.91%", note: "Current year performance" },
  { label: "Best Month", value: "+8.43%", note: "May 2026" },
  { label: "Worst Month", value: "-4.66%", note: "January 2026" },
  { label: "Tracked Data", value: "2014–2026", note: "Historical period" },
];

const monthlyReturns = [
  { month: "Jan", value: -4.66 },
  { month: "Feb", value: 1.89 },
  { month: "Mar", value: 4.51 },
  { month: "Apr", value: 6.81 },
  { month: "May", value: 8.43 },
  { month: "Jun", value: 4.93 },
];

const yearlyReturns = [
  { year: "2014", returnValue: "16.30%", drawdown: "-6.58%" },
  { year: "2015", returnValue: "31.21%", drawdown: "-12.54%" },
  { year: "2016", returnValue: "4.15%", drawdown: "-10.87%" },
  { year: "2017", returnValue: "24.96%", drawdown: "-7.44%" },
  { year: "2018", returnValue: "46.88%", drawdown: "-5.28%" },
  { year: "2019", returnValue: "31.13%", drawdown: "-9.60%" },
  { year: "2020", returnValue: "39.17%", drawdown: "-6.40%" },
  { year: "2021", returnValue: "38.25%", drawdown: "-8.48%" },
  { year: "2022", returnValue: "24.81%", drawdown: "-9.58%" },
  { year: "2023", returnValue: "16.31%", drawdown: "-9.40%" },
  { year: "2024", returnValue: "11.79%", drawdown: "-10.04%" },
  { year: "2025", returnValue: "21.53%", drawdown: "-10.53%" },
];

const modelDetails = [
  {
    title: "2 NAS100 model outputs per day",
    body: "Members receive up to two daily NAS100 trade opportunities generated from the mechanical system.",
  },
  {
    title: "Entry, SL and TP included",
    body: "Every output is delivered with exact entry, stop-loss and take-profit levels so execution is clear.",
  },
  {
    title: "Fully rule-based logic",
    body: "The system follows predefined conditions. It is not built around emotional bias, guesswork or random trade calls.",
  },
  {
    title: "Free Telegram access",
    body: "The free Telegram gives users updates, performance context, education around the model and next steps.",
  },
];

const validationPoints = [
  "Developed from multi-year NAS100 research",
  "Tested across 2014–2026 market conditions",
  "Reviewed through return, drawdown, Calmar, Ulcer, MAR and SQN-style robustness checks",
  "Validated across different regimes rather than only one profitable period",
  "Live-tested before being offered publicly",
  "Built to avoid overfitting and short-term curve-fit results",
];

const principles = [
  {
    title: "Mechanical Execution",
    body: "The model is rule-based. It does not rely on mood, bias, news chasing or random discretion.",
  },
  {
    title: "Risk-Defined Ideas",
    body: "Every trade idea includes a predefined invalidation point before upside is considered.",
  },
  {
    title: "Transparent Reporting",
    body: "Losses, drawdowns, losing months and historical data are displayed because clean reporting builds trust.",
  },
];

const faq = [
  {
    question: "What do members receive?",
    answer:
      "Members receive up to two NAS100 trade opportunities per trading day from a fully mechanical system, including entry, stop-loss and take-profit levels.",
  },
  {
    question: "How do I join?",
    answer:
      "Click Join Free Telegram to enter the free group. Inside, you can learn more about the model, performance and next steps.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Edge Private Fund provides market research and trade ideas only. You are responsible for your own trading decisions and risk.",
  },
  {
    question: "Are losses shown?",
    answer:
      "Yes. Losing months and drawdowns are shown clearly because performance without risk context is misleading.",
  },
  {
    question: "Is performance guaranteed?",
    answer:
      "No. Past performance does not guarantee future results. Trading involves risk and losses are possible.",
  },
];

function AccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-label="Close access popup"
      />

      <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#090909] p-8 shadow-2xl shadow-black">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-white/10 px-3 py-1 text-sm text-white/50 transition hover:text-white"
        >
          Close
        </button>

        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#C6A86A]">
          Free Telegram Access
        </p>

        <h3 className="text-3xl font-light tracking-tight text-white">
          Join the free Edge Telegram.
        </h3>

        <p className="mt-5 text-sm leading-7 text-white/55">
          Get access to NAS100 model updates, performance insights, trading
          education and further instructions inside the free Telegram group.
        </p>

        <div className="mt-8">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black transition hover:bg-[#C6A86A]"
          >
            Join Free Telegram
          </a>
        </div>

        <p className="mt-6 text-xs leading-6 text-white/30">
          Trading involves risk. Past performance does not guarantee future
          results.
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-12">
      <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#C6A86A]">
        {eyebrow}
      </p>

      <h2 className="max-w-4xl text-4xl font-light tracking-tight text-white md:text-5xl">
        {title}
      </h2>

      {text && (
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/50">
          {text}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AccessModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="group">
            <div>
              <p className="text-lg font-light tracking-[0.35em] transition group-hover:text-[#C6A86A]">
                EDGE
              </p>
              <div className="mt-1 h-px w-full bg-[#C6A86A]" />
              <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#C6A86A]">
                Private Fund
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
            <a href="#model" className="transition hover:text-white">
              Model
            </a>
            <a href="#performance" className="transition hover:text-white">
              Performance
            </a>
            <a href="#validation" className="transition hover:text-white">
              Validation
            </a>
            <a href="#verification" className="transition hover:text-white">
              Verification
            </a>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full border border-white/15 px-5 py-2 text-white transition hover:border-[#C6A86A] hover:text-[#C6A86A]"
            >
              Join Telegram
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white transition hover:border-[#C6A86A] hover:text-[#C6A86A] md:hidden"
          >
            Join
          </button>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,168,106,0.16),_transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.035)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.035)_1px,_transparent_1px)] bg-[size:82px_82px] opacity-20" />
        <div className="absolute bottom-0 left-0 h-56 w-full bg-gradient-to-t from-[#050505] to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <div className="mb-10 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-[#C6A86A]">
            Free NAS100 Telegram
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-light leading-tight tracking-tight text-white md:text-7xl">
            Rule-based NAS100 trade ideas built from data, testing and risk
            control.
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
            Join the free Edge Telegram for NAS100 model updates, performance
            insights and education around a fully mechanical trading system.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-[#C6A86A]"
            >
              Join Free Telegram
            </button>

            <a
              href="#model"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/80 transition hover:border-[#C6A86A] hover:text-[#C6A86A]"
            >
              View Model
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808] px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 text-center md:grid-cols-4">
          {[
            ["Market", "NAS100"],
            ["Output", "Up to 2 trades daily"],
            ["Style", "Fully mechanical"],
            ["Access", "Free Telegram"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                {label}
              </p>
              <p className="mt-2 text-sm text-white/70">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="model" className="bg-[#050505] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The Model"
            title="A mechanical NAS100 system delivered as daily trade opportunities."
            text="This is not a discretionary chat full of random trade calls. The model is rule-based and was developed through backtesting, robustness checks and live validation."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {modelDetails.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#C6A86A]/40 hover:bg-white/[0.05]"
              >
                <h3 className="text-2xl font-light text-white">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[#C6A86A]/20 bg-[#C6A86A]/[0.04] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-[#C6A86A]">
              Daily Delivery
            </p>
            <h3 className="mt-4 max-w-4xl text-3xl font-light tracking-tight text-white md:text-4xl">
              Join the free Telegram to learn how the model works and receive
              further instructions.
            </h3>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/50">
              The system is designed to keep execution consistent: predefined
              rules, predefined risk, predefined invalidation and clear targets.
              The free Telegram is where updates, education and next steps are
              shared.
            </p>
          </div>
        </div>
      </section>

      <section
        id="performance"
        className="border-y border-white/10 bg-[#080808] px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Performance Overview"
            title="Performance shown with return and drawdown context."
            text="The objective is not to present isolated upside. Performance is shown alongside drawdown and monthly variation so results can be understood properly."
          />

          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#C6A86A]/40 hover:bg-white/[0.05]"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  {item.label}
                </p>
                <p className="mt-5 text-3xl font-light text-white">
                  {item.value}
                </p>
                <p className="mt-3 text-sm text-white/35">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#C6A86A]">
                  2026 Monthly Analytics
                </p>
                <h3 className="mt-3 text-2xl font-light text-white">
                  Monthly Gain / Change
                </h3>
              </div>
              <p className="text-sm text-white/40">
                YTD Performance:{" "}
                <span className="text-[#C6A86A]">+23.91%</span>
              </p>
            </div>

            <div className="flex h-[320px] items-end gap-3 border-b border-white/10 px-2 md:gap-6">
              {monthlyReturns.map((item) => {
                const height = Math.abs(item.value) * 22;
                const positive = item.value >= 0;

                return (
                  <div
                    key={item.month}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                  >
                    <p
                      className={`text-xs ${
                        positive ? "text-[#C6A86A]" : "text-red-300"
                      }`}
                    >
                      {item.value > 0 ? "+" : ""}
                      {item.value.toFixed(2)}%
                    </p>

                    <div className="relative flex h-[220px] w-full items-end justify-center">
                      <div className="absolute top-1/2 h-px w-full bg-white/10" />
                      <div
                        className={`w-full max-w-20 rounded-t-sm ${
                          positive
                            ? "bg-gradient-to-t from-[#8d743d] to-[#e7ca85]"
                            : "bg-gradient-to-t from-red-950 to-red-400"
                        }`}
                        style={{ height: `${height}px` }}
                      />
                    </div>

                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                      {item.month}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="validation" className="bg-[#050505] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="System Development"
            title="Built through testing, filtering and live validation."
            text="The model was not built around a handful of profitable trades. It was developed through historical testing, regime review and ongoing live monitoring before being offered publicly."
          />

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-[#C6A86A]">
                Objective
              </p>
              <h3 className="mt-4 text-3xl font-light tracking-tight text-white">
                Robustness over curve-fitting.
              </h3>
              <p className="mt-6 text-sm leading-7 text-white/50">
                The goal was to build a NAS100 model that could survive multiple
                market regimes rather than only perform well on one hand-picked
                period. Historical return alone was not enough — drawdown,
                consistency and risk-adjusted metrics were part of the review.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {validationPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/55"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-[#080808] p-8"
              >
                <h3 className="text-2xl font-light text-white">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="history"
        className="border-y border-white/10 bg-[#080808] px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Historical Data"
            title="A long-term view of returns and drawdowns."
            text="Yearly return is displayed beside yearly drawdown because downside control matters as much as upside."
          />

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs uppercase tracking-[0.25em] text-white/45">
              <p>Year</p>
              <p className="text-right">Return</p>
              <p className="text-right">Yearly DD</p>
            </div>

            {yearlyReturns.map((item) => (
              <div
                key={item.year}
                className="grid grid-cols-3 border-b border-white/5 px-5 py-4 text-sm transition last:border-b-0 hover:bg-white/[0.025]"
              >
                <p className="text-white/75">{item.year}</p>
                <p className="text-right text-[#C6A86A]">
                  {item.returnValue}
                </p>
                <p className="text-right text-white/55">{item.drawdown}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="verification" className="bg-[#050505] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Verification"
            title="Performance displayed clearly and directly."
            text="The Myfxbook screenshot is shown as a visual reference alongside the historical and monthly data."
          />

          <div className="rounded-3xl border border-white/10 bg-black p-4 shadow-2xl shadow-black/40 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-sm uppercase tracking-[0.25em] text-white/45">
                Myfxbook Screenshot
              </p>
              <p className="text-sm text-[#C6A86A]">2026 YTD</p>
            </div>

            <Image
              src="/myfxbook.png"
              alt="Myfxbook Performance Screenshot"
              width={1600}
              height={900}
              className="w-full rounded-2xl border border-white/10"
              priority
            />
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="border-y border-white/10 bg-[#080808] px-6 py-28"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Important information before joining the free Telegram."
          />

          <div className="space-y-4">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="text-lg font-light text-white">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/50">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#050505] px-6 py-28">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center md:p-14">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#C6A86A]">
            Free Telegram Access
          </p>

          <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl">
            Join the free Edge Telegram.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/50">
            Enter the free Telegram to learn how the NAS100 model works, view
            updates, understand the process and receive further instructions.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-[#C6A86A]"
            >
              Join Free Telegram
            </button>

            <a
              href="#performance"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/75 transition hover:border-[#C6A86A] hover:text-[#C6A86A]"
            >
              View Results
            </a>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/30">
            Trading involves risk. Past performance does not guarantee future
            results. Edge Private Fund provides market research and trade ideas
            only and is not financial advice.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-10">
        <div className="mx-auto max-w-7xl text-center text-xs text-white/35">
          <p className="text-white/50">
            © 2026 Edge Private Fund. All rights reserved.
          </p>

          <p className="mx-auto mt-3 max-w-3xl leading-6">
            The information on this website is for general market research
            purposes only. It should not be considered financial advice,
            investment advice or a recommendation to buy or sell any financial
            instrument.
          </p>
        </div>
      </footer>
    </main>
  );
}