import { COURSES, UNLOCKS, missingGroups, number } from "@/lib/courses";
import { DESIGN, GOALS, INTERESTS, PROFILES, STYLES, type Goal, type Interest, type Style } from "@/lib/profiles";

export type Term = "Fall" | "Spring" | "any";

export type Answers = {
  interests: Interest[];
  style: Style;
  goal: Goal;
  needDesign: boolean;
  term: Term;
  taken: string[];
};

export const DEFAULT_ANSWERS: Answers = { interests: [], style: "mixed", goal: "unsure", needDesign: false, term: "any", taken: [] };

export type Result = {
  code: string;
  match: number;
  reasons: { text: string; good: boolean }[];
  missing: string[][];
  offeredInTerm: boolean;
};

// "Robotics & control" -> "robotics & control", but "AI & machine learning" keeps its acronym
const midSentence = (text: string) => (/^[A-Z]{2}/.test(text) ? text : text[0].toLowerCase() + text.slice(1));
const label = (id: Interest) => midSentence(INTERESTS.find((i) => i.id === id)!.label);

// Having taken a course means you met its prerequisites, so count those as done too (Math 54
// covers Math 51 and 52). For "any one of" requirements we can't know which, so the group is
// marked met with its first option, which only ever makes other groups easier to satisfy.
export function withImplied(taken: string[]) {
  const done = new Set<string>();
  const visit = (code: string) => {
    if (done.has(code) || !COURSES[code]) return;
    done.add(code);
    for (const g of COURSES[code].prereqs) if (!g.some((c) => done.has(c))) visit(g[0]);
  };
  taken.forEach(visit);
  return done;
}

// how much your 1st, 2nd and 3rd interests count
const RANK_WEIGHT = [1, 0.7, 0.5];

// weights add up to 1; the design weight moves to interests when it doesn't matter
const WEIGHTS = { interest: 0.5, goal: 0.15, style: 0.15, ready: 0.1, design: 0.1 };

export function score(a: Answers): Result[] {
  const taken = withImplied(a.taken);
  const boosts: Partial<Record<Interest, number>> = GOALS.find((g) => g.id === a.goal)!.boosts;

  return Object.entries(PROFILES)
    .filter(([code]) => COURSES[code] && !taken.has(code))
    .map(([code, p]) => {
      const course = COURSES[code];
      const reasons: Result["reasons"] = [];

      // interests: your first pick counts most; the strongest match counts fully, each extra one adds a little
      const hits = a.interests
        .map((i, rank) => ({ i, w: (p.interests[i] ?? 0) * RANK_WEIGHT[rank] }))
        .filter((h) => h.w > 0)
        .sort((x, y) => y.w - x.w);
      const interest = Math.min(1, (hits[0]?.w ?? 0) + 0.25 * hits.slice(1).reduce((s, h) => s + h.w, 0));
      for (const h of hits) reasons.push({ text: `${p.interests[h.i] === 1 ? "All about" : "Touches on"} ${label(h.i)}`, good: true });

      const goalScore = Math.min(1, Object.entries(p.interests).reduce((s, [i, w]) => s + (boosts[i as Interest] ?? 0) * w, 0));
      if (goalScore >= 0.5 && a.goal !== "unsure") reasons.push({ text: `Fits your goal: ${midSentence(GOALS.find((g) => g.id === a.goal)!.label)}`, good: true });

      const style = p.style === a.style ? 1 : p.style === "mixed" || a.style === "mixed" ? 0.5 : 0;
      if (style === 1) reasons.push({ text: STYLES.find((s) => s.id === p.style)!.blurb.split(",")[0], good: true });
      if (style === 0) reasons.push({ text: p.style === "math" ? "Mostly math and proofs" : "Mostly projects and labs", good: false });

      const missing = missingGroups(code, taken);
      const ready = missing.length === 0 ? 1 : missing.length === 1 ? 0.6 : missing.length === 2 ? 0.3 : 0;
      if (a.taken.length) {
        reasons.push(missing.length === 0
          ? { text: "You can take it now", good: true }
          : { text: `${missing.length} prerequisite${missing.length === 1 ? "" : "s"} to go`, good: false });
      }

      const design = DESIGN.has(code);
      if (design && a.needDesign) reasons.push({ text: "Counts as a design course", good: true });

      const terms = course.terms ?? [];
      const offeredInTerm = a.term === "any" || terms.includes(a.term);
      if (!terms.length) reasons.push({ text: "Not on recent schedules", good: false });
      else if (!offeredInTerm) reasons.push({ text: `Not usually offered in ${a.term}`, good: false });

      const w = a.needDesign ? WEIGHTS : { ...WEIGHTS, interest: WEIGHTS.interest + WEIGHTS.design, design: 0 };
      // readiness only counts once we know what you've taken
      const readyWeight = a.taken.length ? w.ready : 0;
      const total = w.interest * interest + w.goal * goalScore + w.style * style + readyWeight * ready + w.design * (design ? 1 : 0);
      const max = w.interest + w.goal + w.style + readyWeight + w.design;
      // courses you can't take in your term or that aren't being offered sink to the bottom
      const penalty = !terms.length ? 0.6 : offeredInTerm ? 1 : 0.5;

      return { code, match: Math.round((total / max) * 100 * penalty), reasons, missing, offeredInTerm };
    })
    // among equal matches, courses that open up more electives come first
    .sort((x, y) => y.match - x.match || (UNLOCKS[y.code] ?? 0) - (UNLOCKS[x.code] ?? 0) || number(x.code) - number(y.code));
}

// Everything you'd still need for the chosen courses, in the order you could take it: each step
// only needs courses from earlier steps (or ones you've taken). For "any one of" requirements we
// pick the option that's already on the path, else the one with the shortest chain of its own.
export function pathTo(goals: string[], taken: string[]) {
  const have = withImplied(taken);
  const need = new Set<string>();

  const depth = (code: string, seen = new Set<string>()): number => {
    if (seen.has(code) || have.has(code)) return 0;
    seen.add(code);
    const c = COURSES[code];
    return 1 + Math.max(0, ...c.prereqs.map((g) => Math.min(...g.map((x) => depth(x, new Set(seen))))));
  };

  const add = (code: string) => {
    if (have.has(code) || need.has(code)) return;
    need.add(code);
    for (const group of COURSES[code].prereqs) {
      if (group.some((c) => have.has(c) || need.has(c))) continue;
      // official text lists the usual route first (CS 61A before ENGIN 7), so that breaks ties
      add([...group].sort((x, y) => depth(x) - depth(y) || group.indexOf(x) - group.indexOf(y))[0]);
    }
  };
  goals.forEach(add);

  // step = 1 + the latest step among its prerequisites on the path
  const step: Record<string, number> = {};
  const stepOf = (code: string): number => {
    if (step[code] !== undefined) return step[code];
    step[code] = 0; // guards against cycles
    const before = COURSES[code].prereqs.flatMap((g) => g.filter((c) => need.has(c)));
    return (step[code] = 1 + Math.max(0, ...before.map(stepOf)));
  };
  const steps: string[][] = [];
  for (const code of need) (steps[stepOf(code) - 1] ??= []).push(code);
  return steps.map((s) => s.sort((x, y) => Number(goals.includes(x)) - Number(goals.includes(y)) || number(x) - number(y)));
}

// answers <-> a short string for share links, e.g. "i=ai.systems&s=build&g=ml&d=1&t=Fall&k=CS61A.CS61B"
export function encode(a: Answers) {
  return new URLSearchParams({
    i: a.interests.join("."), s: a.style, g: a.goal, d: a.needDesign ? "1" : "0", t: a.term, k: a.taken.join("."),
  }).toString();
}

export function decode(text: string): Answers | null {
  const p = new URLSearchParams(text);
  const interests = (p.get("i") ?? "").split(".").filter((i): i is Interest => INTERESTS.some((x) => x.id === i));
  if (!interests.length) return null;
  const pick = <T extends string>(value: string | null, options: readonly { id: T }[], fallback: T) =>
    options.find((o) => o.id === value)?.id ?? fallback;
  const term = p.get("t");
  return {
    interests,
    style: pick(p.get("s"), STYLES, "mixed"),
    goal: pick(p.get("g"), GOALS, "unsure"),
    needDesign: p.get("d") === "1",
    term: term === "Fall" || term === "Spring" ? term : "any",
    taken: (p.get("k") ?? "").split(".").filter((c) => COURSES[c]),
  };
}
