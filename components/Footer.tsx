import { CHECKED } from "@/lib/courses";
import { siteUrl } from "@/lib/suite";

const STEPS = [
  { icon: "💬", title: "Answer five questions", text: "What excites you, how you like to learn, and where you're headed." },
  { icon: "🎯", title: "Get ranked picks", text: "Every elective scored, with the reasons it fits (or doesn't)." },
  { icon: "🧭", title: "See your path", text: "The prerequisites you still need, in an order that works." },
];

const SIBLINGS = [
  { id: "planner", icon: "🗺️", title: "EECS Planner", text: "Map your whole degree, semester by semester." },
  { id: "prereqs", icon: "🧭", title: "EECS Prereqs", text: "What every EECS course needs first, and what it unlocks." },
  { id: "links", icon: "🔗", title: "EECS Links", text: "Every important Berkeley link in one place." },
] as const;

// a Google Form (or any page) where students can report problems; the link only shows when it's set
const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL;

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-linear-to-br from-berkeley-dark via-berkeley to-[#0b4a7a] px-4 pt-16 pb-10 text-white">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 animate-aurora rounded-full bg-gold/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          How it <span className="text-gold">works</span>
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold text-gold">STEP {i + 1}</span>
              </div>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-blue-200">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {SIBLINGS.map((s) => (
            <a
              key={s.id}
              href={siteUrl(s.id)}
              className="group flex flex-col justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/10 p-6 transition hover:border-gold"
            >
              <span>
                <span className="block font-semibold">{s.icon} {s.title}</span>
                <span className="block text-sm text-blue-200">{s.text}</span>
              </span>
              <span className="self-start rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-berkeley shadow-lg shadow-gold/30 transition group-hover:-translate-y-0.5">
                Open →
              </span>
            </a>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-7 w-7" />
            EECS Electives
          </div>
          <p className="text-center text-xs text-blue-200">
            Unofficial student tool. Prerequisites from the EECS course pages and Berkeley catalog, checked {CHECKED}.
            <br />Always confirm with the Class Schedule or your advisor.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {FEEDBACK_URL && (
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-berkeley transition hover:bg-gold-dark hover:text-white"
              >
                💬 Send feedback
              </a>
            )}
            <a href="#top" className="rounded-full border border-white/20 px-4 py-1.5 text-xs transition hover:border-gold hover:text-gold">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
