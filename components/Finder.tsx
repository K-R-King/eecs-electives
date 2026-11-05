"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COURSES, number } from "@/lib/courses";
import { COMMON_TAKEN, DESIGN, GOALS, INTERESTS, PROFILES, STYLES } from "@/lib/profiles";
import { DEFAULT_ANSWERS, decode, encode, pathTo, score, type Answers, type Result, type Term } from "@/lib/score";
import { rememberedTaken, rememberTaken, takeIncoming } from "@/lib/handoff";
import { siteUrl } from "@/lib/suite";

const STORAGE_KEY = "eecs-electives:answers";
const MAX_INTERESTS = 3;
const STEPS = ["Interests", "Style", "Goal", "Requirements", "Taken"] as const;

function load(): Answers | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? decode(raw) : null;
  } catch {
    return null;
  }
}

function save(a: Answers) {
  try {
    window.localStorage.setItem(STORAGE_KEY, encode(a));
  } catch {
    // storage blocked (e.g. private browsing); answers just won't be remembered
  }
}

export default function Finder() {
  const [answers, setAnswers] = useState<Answers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // a shared link (#i=ai...) opens straight to its results; otherwise pick up where you left off
  useEffect(() => {
    const shared = decode(window.location.hash.slice(1));
    const saved = shared ?? load();
    // add courses marked as taken on a sister site (?taken=...)
    const incoming = (takeIncoming() ?? []).filter((c) => COURSES[c] && !saved?.taken.includes(c));
    const start = incoming.length ? { ...(saved ?? DEFAULT_ANSWERS), taken: [...(saved?.taken ?? []), ...incoming] } : saved;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (start) setAnswers(start);
    if (saved) {
      setDone(true);
      if (incoming.length) save(start!);
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // hand the taken list to the sister sites (keeping any courses this site doesn't list)
  useEffect(() => {
    if (loaded) rememberTaken([...answers.taken, ...rememberedTaken().filter((c) => !COURSES[c])]);
  }, [loaded, answers.taken]);

  const update = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));

  function go(to: number) {
    setStep(to);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finish() {
    save(answers);
    history.replaceState(null, "", `#${encode(answers)}`);
    setDone(true);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function edit() {
    setDone(false);
    setStep(0);
    history.replaceState(null, "", window.location.pathname);
  }

  const canNext = step !== 0 || answers.interests.length > 0;

  return (
    <section id="finder" ref={topRef} className="relative mx-auto -mt-24 max-w-6xl scroll-mt-4">
      {done ? (
        <Results answers={answers} onEdit={edit} onChange={(a) => { setAnswers(a); save(a); history.replaceState(null, "", `#${encode(a)}`); }} />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl shadow-berkeley/10 ring-1 ring-slate-200 dark:ring-slate-700 sm:p-10">
          {/* progress */}
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            <span>Question {step + 1} of {STEPS.length}</span>
            <span className="text-gold-dark dark:text-gold">{STEPS[step]}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Quiz progress">
            <div className="h-full rounded-full bg-linear-to-r from-gold to-amber-300 transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div key={step} className="mt-8 animate-fade-up">
            {step === 0 && (
              <Question title="What sounds most exciting?" hint={`Pick up to ${MAX_INTERESTS}. Your top interest matters most.`}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {INTERESTS.map((i) => {
                    const at = answers.interests.indexOf(i.id);
                    const full = answers.interests.length >= MAX_INTERESTS && at < 0;
                    return (
                      <Option
                        key={i.id}
                        icon={i.icon}
                        label={i.label}
                        blurb={i.blurb}
                        selected={at >= 0}
                        badge={at >= 0 ? String(at + 1) : undefined}
                        disabled={full}
                        onClick={() => update({ interests: at >= 0 ? answers.interests.filter((x) => x !== i.id) : [...answers.interests, i.id] })}
                      />
                    );
                  })}
                </div>
              </Question>
            )}

            {step === 1 && (
              <Question title="How do you like to learn?" hint="Some electives are big projects; others are mostly problem sets and proofs.">
                <div className="grid gap-3 sm:grid-cols-3">
                  {STYLES.map((s) => (
                    <Option key={s.id} icon={s.icon} label={s.label} blurb={s.blurb} selected={answers.style === s.id} onClick={() => update({ style: s.id })} />
                  ))}
                </div>
              </Question>
            )}

            {step === 2 && (
              <Question title="What are you aiming for after Berkeley?" hint="Courses that build toward it get a boost.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {GOALS.map((g) => (
                    <Option key={g.id} icon={g.icon} label={g.label} selected={answers.goal === g.id} onClick={() => update({ goal: g.id })} />
                  ))}
                </div>
              </Question>
            )}

            {step === 3 && (
              <Question title="A couple of practical things" hint="These help sort what fits your schedule and requirements.">
                <p className="mb-3 font-semibold">Do you still need a design course?</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Option icon="✅" label="Yes, I still need one" blurb="Every EECS major takes one" selected={answers.needDesign} onClick={() => update({ needDesign: true })} />
                  <Option icon="👍" label="Already done, or not sure" selected={!answers.needDesign} onClick={() => update({ needDesign: false })} />
                </div>
                <p className="mt-8 mb-3 font-semibold">When do you want to take it?</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {([["Fall", "🍂"], ["Spring", "🌸"], ["any", "📅"]] as [Term, string][]).map(([t, icon]) => (
                    <Option key={t} icon={icon} label={t === "any" ? "Either works" : t} selected={answers.term === t} onClick={() => update({ term: t })} />
                  ))}
                </div>
              </Question>
            )}

            {step === 4 && (
              <Question title="What have you already taken?" hint="So we can tell you what you're ready for. Skip it if you'd rather not say.">
                <TakenPicker taken={answers.taken} onChange={(taken) => update({ taken })} />
              </Question>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:invisible dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => go(step + 1)}
                disabled={!canNext}
                className="rounded-xl bg-berkeley px-6 py-3 font-semibold text-white shadow-lg shadow-berkeley/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-600"
              >
                {canNext ? "Next →" : "Pick at least one"}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-xl bg-gold px-6 py-3 font-semibold text-berkeley shadow-lg shadow-gold/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Show my electives ✨
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Question({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-berkeley dark:text-blue-300 sm:text-3xl">{title}</h2>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Option({ icon, label, blurb, selected, badge, disabled, onClick }: {
  icon: string; label: string; blurb?: string; selected: boolean; badge?: string; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition ${
        selected
          ? "bg-gold/15 ring-2 ring-gold shadow-md shadow-gold/20"
          : "bg-slate-50 ring-slate-200 hover:-translate-y-0.5 hover:ring-gold/60 hover:shadow-md dark:bg-slate-800/60 dark:ring-slate-700"
      } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0`}
    >
      <span className="text-2xl leading-none" aria-hidden>{icon}</span>
      <span className="min-w-0">
        <span className="block font-semibold text-slate-900 dark:text-slate-100">{label}</span>
        {blurb && <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-400">{blurb}</span>}
      </span>
      {badge && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-berkeley" aria-label={`choice ${badge}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function TakenPicker({ taken, onChange }: { taken: string[]; onChange: (taken: string[]) => void }) {
  const [query, setQuery] = useState("");
  const toggle = (code: string) => onChange(taken.includes(code) ? taken.filter((c) => c !== code) : [...taken, code]);
  // the catalog and CalCentral say ELENG and COMPSCI; this data says EE and CS
  const q = query.trim().toLowerCase().replace(/\s+/g, "").replace(/^eleng(?=\d|$)/, "ee").replace(/^compsci(?=\d|$)/, "cs");
  const extra = taken.filter((c) => !COMMON_TAKEN.includes(c));
  const suggestions = q
    ? Object.values(COURSES)
        // seminars and DeCals change topic every term, so having taken one says nothing about readiness
        .filter((c) => !COMMON_TAKEN.includes(c.code) && !taken.includes(c.code) && !c.kind)
        .filter((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().replace(/\s+/g, "").includes(q))
        .sort((a, b) => number(a.code) - number(b.code))
        .slice(0, 8)
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...COMMON_TAKEN, ...extra].map((code) => {
          const on = taken.includes(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              aria-pressed={on}
              title={COURSES[code].title}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                on
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {on && "✓ "}{COURSES[code].display}
            </button>
          );
        })}
      </div>

      <label htmlFor="more" className="mt-6 block text-sm font-semibold text-slate-600 dark:text-slate-300">Taken an upper-division course already?</label>
      <div className="relative mt-2 max-w-md">
        <input
          id="more"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search, e.g. CS 170 or algorithms"
          className="w-full rounded-xl bg-slate-50 px-4 py-2.5 text-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold dark:bg-slate-800/60 dark:ring-slate-700"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            {suggestions.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => { toggle(c.code); setQuery(""); }}
                  className="flex w-full items-baseline gap-2 px-4 py-2 text-left text-sm hover:bg-gold/10"
                >
                  <span className="font-semibold">{c.display}</span>
                  <span className="truncate text-slate-600 dark:text-slate-400">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MatchRing({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0" aria-label={`${value}% match`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="6" strokeLinecap="round" stroke="#FDB515"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-berkeley dark:text-blue-200">{value}%</span>
    </div>
  );
}

function Results({ answers, onEdit, onChange }: { answers: Answers; onEdit: () => void; onChange: (a: Answers) => void }) {
  const results = useMemo(() => score(answers), [answers]);
  const [picked, setPicked] = useState<string[]>(() => results.slice(0, 3).map((r) => r.code));
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const steps = useMemo(() => pathTo(picked, answers.taken), [picked, answers.taken]);

  const top = results.slice(0, 3);
  const rest = results.slice(3, showAll ? undefined : 12);
  const togglePick = (code: string) => setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; the address bar already has the link
    }
  }

  return (
    <div>
      {/* summary bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-xl shadow-berkeley/10 ring-1 ring-slate-200 dark:ring-slate-700 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark dark:text-gold">Your matches</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {answers.interests.map((i) => INTERESTS.find((x) => x.id === i)!.icon + " " + INTERESTS.find((x) => x.id === i)!.label).join(" · ")}
              {" · "}{STYLES.find((s) => s.id === answers.style)!.label}
              {" · "}{GOALS.find((g) => g.id === answers.goal)!.label}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={share} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              {copied ? "✓ Link copied" : "🔗 Share"}
            </button>
            <button type="button" onClick={onEdit} className="rounded-xl bg-berkeley px-4 py-2 text-sm font-semibold text-white shadow-md shadow-berkeley/30 transition hover:-translate-y-0.5 dark:bg-blue-600">
              ✏️ Change answers
            </button>
          </div>
        </div>
        {/* quick tweaks without retaking the quiz */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {(["Fall", "Spring", "any"] as Term[]).map((t) => (
            <Chip key={t} active={answers.term === t} onClick={() => onChange({ ...answers, term: t })}>
              {t === "any" ? "Any term" : t}
            </Chip>
          ))}
          <Chip active={answers.needDesign} onClick={() => onChange({ ...answers, needDesign: !answers.needDesign })}>
            Need a design course
          </Chip>
        </div>
      </div>

      {/* top picks */}
      <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-berkeley dark:text-blue-300">🏆 Your top picks</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {top.map((r, i) => (
          <ResultCard key={r.code} result={r} rank={i + 1} big picked={picked.includes(r.code)} onPick={() => togglePick(r.code)} />
        ))}
      </div>

      {/* path */}
      <div className="mt-12 rounded-3xl bg-berkeley bg-linear-to-br from-berkeley-dark via-berkeley to-[#0b4a7a] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">🧭 Your path</h2>
            <p className="mt-1 text-sm text-blue-200">
              Everything you&apos;d still need for {picked.length ? "the courses you picked" : "your picks"}, in an order that works.
              Toggle courses with <span className="font-semibold text-gold">+ Path</span>.
            </p>
          </div>
          {/* the planner schedules the picked electives first (it reads ?electives=) */}
          <a
            href={picked.length ? `${siteUrl("planner")}/?electives=${picked.join(".")}` : siteUrl("planner")}
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-berkeley shadow-lg shadow-gold/30 transition hover:-translate-y-0.5"
          >
            {picked.length ? `Add ${picked.length === 1 ? "it" : `these ${picked.length}`} to my 4-year plan →` : "Plan it semester by semester →"}
          </a>
        </div>
        {steps.length ? (
          <ol className="mt-6 grid gap-4 md:grid-flow-col md:auto-cols-fr">
            {steps.map((s, i) => (
              <li key={i} className="relative min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-gold">Step {i + 1}</p>
                <ul className="mt-2 space-y-1.5">
                  {s.map((code) => (
                    <li key={code}>
                      <a
                        href={`${siteUrl("prereqs")}/#${code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-w-0 items-baseline gap-2 rounded-lg px-2 py-1 text-sm transition hover:bg-white/10 ${picked.includes(code) ? "font-bold text-gold" : ""}`}
                      >
                        <span className="shrink-0 font-semibold">{COURSES[code].display}</span>
                        <span className="truncate text-xs text-blue-200">{COURSES[code].title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-blue-100">
            {picked.length ? "🎉 You've met the prerequisites for everything you picked." : "Add courses to your path to see what you'd need first."}
          </p>
        )}
      </div>

      {/* everything else */}
      <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-berkeley dark:text-blue-300">More good fits</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {rest.map((r) => (
          <li key={r.code}><ResultCard result={r} picked={picked.includes(r.code)} onPick={() => togglePick(r.code)} /></li>
        ))}
      </ul>
      {results.length > 12 && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setShowAll(!showAll)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            {showAll ? "Show fewer" : `Show all ${results.length} electives`}
          </button>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-slate-600 dark:text-slate-400">
        Matches weigh your interests most, then your goal, learning style, readiness and the design requirement.
        Prerequisites and terms are official; how each course leans (topics, projects vs. proofs) is our own read of its catalog description.
      </p>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-berkeley text-white shadow-md shadow-berkeley/30 dark:bg-gold dark:text-berkeley"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function ResultCard({ result, rank, big, picked, onPick }: { result: Result; rank?: number; big?: boolean; picked: boolean; onPick: () => void }) {
  const c = COURSES[result.code];
  const p = PROFILES[result.code];
  return (
    <article className={`flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 transition hover:shadow-lg hover:shadow-berkeley/10 dark:bg-slate-900 ${
      big ? "ring-gold/50 sm:p-6" : "ring-slate-200 dark:ring-slate-700"
    }`}>
      <div className="flex items-start gap-4">
        <MatchRing value={result.match} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            {rank && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-berkeley">#{rank}</span>}
            <span className="text-lg font-extrabold text-berkeley dark:text-blue-300">{c.display}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{c.units}u</span>
          </p>
          <p className="font-semibold leading-snug text-slate-800 dark:text-slate-100">{c.title}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(c.terms ?? []).filter((t) => t !== "Summer").map((t) => (
          <span key={t} className="rounded-full bg-berkeley/10 px-2.5 py-0.5 text-xs text-berkeley dark:bg-blue-400/15 dark:text-blue-200">{t}</span>
        ))}
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {p.style === "build" ? "🛠️ Project-heavy" : p.style === "math" ? "📐 Math-heavy" : "⚖️ Mixed"}
        </span>
        {DESIGN.has(result.code) && <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold-dark dark:text-gold">Design course</span>}
      </div>

      <ul className="mt-3 space-y-1">
        {result.reasons.slice(0, big ? 5 : 3).map((r) => (
          <li key={r.text} className={`text-sm ${r.good ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            {r.good ? "✓" : "•"} {r.text}
          </li>
        ))}
      </ul>

      {big && c.description && <p className="mt-3 line-clamp-4 text-sm text-slate-600 dark:text-slate-400">{c.description}</p>}

      {result.missing.length > 0 && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          Needs first: {result.missing.map((g) => g.map((x) => COURSES[x].display).join(" or ")).join("; ")}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button
          type="button"
          onClick={onPick}
          aria-pressed={picked}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            picked ? "bg-gold text-berkeley shadow-md shadow-gold/30" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {picked ? "✓ On path" : "+ Path"}
        </button>
        <a
          href={`${siteUrl("prereqs")}/#${result.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-berkeley-light transition hover:bg-berkeley/10 dark:text-blue-300"
        >
          Prereq chain ↗
        </a>
      </div>
    </article>
  );
}
