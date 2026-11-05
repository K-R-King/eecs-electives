import SuiteNav from "@/components/SuiteNav";
import { INTERESTS, PROFILES } from "@/lib/profiles";

const FLOATING_CODES = [
  { code: "CS 188", className: "left-[6%] top-[22%] -rotate-6 animate-float" },
  { code: "EECS 151", className: "left-[14%] bottom-[18%] rotate-3 animate-float-slow" },
  { code: "CS 161", className: "right-[8%] top-[18%] rotate-6 animate-float-slow" },
  { code: "EE 123", className: "right-[4%] bottom-[24%] -rotate-3 animate-float" },
];

// an example of what the results look like
const PREVIEW = [
  { code: "CS 189", title: "Machine Learning", match: 96 },
  { code: "CS 188", title: "Artificial Intelligence", match: 91 },
  { code: "CS C182", title: "Deep Neural Networks", match: 88 },
];

const STATS = [
  { value: String(Object.keys(PROFILES).length), label: "electives ranked" },
  { value: String(INTERESTS.length), label: "interests" },
  { value: "5", label: "quick questions" },
  { value: "Official", label: "prerequisites" },
];

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-berkeley bg-linear-to-br from-berkeley-dark via-berkeley to-[#0b4a7a] px-4 pb-36 text-white">
      {/* background: grid + moving glows + floating course codes */}
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 animate-aurora rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-112 w-md animate-aurora rounded-full bg-berkeley-light/40 blur-3xl [animation-delay:-7s]" />

      {FLOATING_CODES.map((c) => (
        <span
          key={c.code}
          className={`pointer-events-none absolute hidden rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs text-blue-100/70 backdrop-blur-sm xl:block ${c.className}`}
        >
          {c.code}
        </span>
      ))}

      {/* nav */}
      <nav className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 py-6">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-8 w-8" />
          EECS Electives
        </div>
        <SuiteNav current="electives" />
      </nav>

      <div className="relative mx-auto mt-8 grid max-w-6xl items-center gap-12 lg:mt-14 lg:grid-cols-[1.15fr_1fr]">

        {/* pitch */}
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            Upper-division EECS electives
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Find the electives{" "}
            <span className="animate-shimmer bg-linear-to-r from-gold via-amber-200 to-gold bg-size-[200%_auto] bg-clip-text text-transparent">
              made for you
            </span>
            .
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-blue-100/90 sm:text-lg lg:mx-0">
            Answer five quick questions about what you love and where you&apos;re headed. Get ranked
            picks, why each one fits, and the path of prerequisites to get there.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href="#finder"
              className="rounded-xl bg-gold px-6 py-3 font-semibold text-berkeley shadow-lg shadow-gold/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start the quiz ↓
            </a>
            <span className="flex items-center gap-4 px-2 text-sm text-blue-200">
              <span>✓ 2 minutes</span>
              <span>✓ No signup</span>
            </span>
          </div>
        </div>

        {/* animated results preview */}
        <div className="relative mx-auto hidden w-full max-w-md animate-fade-up [animation-delay:200ms] sm:block">
          <div className="absolute -inset-4 rounded-4xl bg-gold/10 blur-2xl" />
          <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between text-xs text-blue-100">
              <span className="font-semibold uppercase tracking-wider">Your top picks</span>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-emerald-300">🤖 AI &amp; ML</span>
            </div>
            <ul className="space-y-3">
              {PREVIEW.map((p, i) => (
                <li
                  key={p.code}
                  className="flex animate-fade-up items-center gap-4 rounded-xl bg-white/10 px-4 py-3"
                  style={{ animationDelay: `${400 + i * 250}ms` }}
                >
                  <span className="w-7 text-center text-sm font-bold text-gold">#{i + 1}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{p.code}</span>
                    <span className="block text-xs text-blue-200">{p.title}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-lg font-extrabold text-gold">{p.match}%</span>
                    <span className="mt-1 block h-1.5 w-16 overflow-hidden rounded-full bg-white/15">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${p.match}%` }} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* stats */}
      <dl className="relative mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-berkeley-dark/40 px-4 py-4 text-center">
            <dt className="text-2xl font-extrabold text-gold">{s.value}</dt>
            <dd className="text-xs text-blue-200">{s.label}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
