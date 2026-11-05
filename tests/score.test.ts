import { describe, expect, it } from "vitest";
import { COURSES } from "@/lib/courses";
import { COMMON_TAKEN, DESIGN, INTERESTS, PROFILES } from "@/lib/profiles";
import { DEFAULT_ANSWERS, decode, encode, pathTo, score, withImplied, type Answers } from "@/lib/score";

const answers = (patch: Partial<Answers>): Answers => ({ ...DEFAULT_ANSWERS, interests: ["ai"], ...patch });

// every group of prerequisites has a course in `have`
const met = (code: string, have: Set<string>) => COURSES[code].prereqs.every((g) => g.some((c) => have.has(c)));

describe("course data", () => {
  // the weekly sync from EECS Prereqs can rename or drop courses; these lists are written by hand
  it("knows every course the hand-written lists mention", () => {
    const listed = [...Object.keys(PROFILES), ...DESIGN, ...COMMON_TAKEN];
    expect(listed.filter((code) => !COURSES[code])).toEqual([]);
  });
});

describe("withImplied", () => {
  it("counts a course's prerequisites as done", () => {
    const done = withImplied(["CS170"]);
    expect(done.has("CS170")).toBe(true);
    for (const code of done) expect(met(code, done)).toBe(true);
  });

  it("ignores unknown codes", () => {
    expect([...withImplied(["NOPE999"])]).toEqual([]);
  });
});

describe("score", () => {
  it("never suggests a course you've taken", () => {
    const taken = ["CS61A", "CS61B", "CS70", "CS170"];
    const codes = score(answers({ taken })).map((r) => r.code);
    expect(codes).not.toContain("CS170");
    expect(codes).not.toContain("CS61B");
  });

  it("ranks from best to worst match, between 0 and 100", () => {
    for (const interest of INTERESTS) {
      const results = score(answers({ interests: [interest.id] }));
      expect(results.length).toBeGreaterThan(0);
      for (const [i, r] of results.entries()) {
        expect(r.match).toBeGreaterThanOrEqual(0);
        expect(r.match).toBeLessThanOrEqual(100);
        if (i) expect(r.match).toBeLessThanOrEqual(results[i - 1].match);
      }
    }
  });

  it("puts courses that are all about your interest at the top", () => {
    const top = score(answers({ interests: ["ai"] }))[0];
    expect(PROFILES[top.code].interests.ai).toBe(1);
  });

  it("sinks courses that aren't offered in the term you picked", () => {
    const anyTerm = score(answers({}));
    const fall = score(answers({ term: "Fall" }));
    const notInFall = fall.find((r) => !r.offeredInTerm && COURSES[r.code].terms?.length);
    if (!notInFall) return; // every profiled course is offered in Fall this year
    expect(notInFall.match).toBeLessThan(anyTerm.find((r) => r.code === notInFall.code)!.match);
  });

  it("only counts readiness once you've said what you've taken", () => {
    expect(score(answers({})).every((r) => !r.reasons.some((x) => x.text.includes("prerequisite")))).toBe(true);
    const ready = score(answers({ taken: ["CS61A", "CS61B", "CS70"] })).find((r) => r.code === "CS170");
    expect(ready?.missing).toEqual([]);
  });
});

describe("pathTo", () => {
  it("orders every step after the prerequisites it needs", () => {
    const taken = ["CS61A"];
    const steps = pathTo(["CS189", "CS162"], taken);
    const have = withImplied(taken);
    for (const step of steps) {
      for (const code of step) expect(met(code, have), `${code} after ${[...have].join(",")}`).toBe(true);
      step.forEach((c) => have.add(c));
    }
    expect(steps.flat()).toContain("CS189");
    expect(steps.flat()).not.toContain("CS61A");
  });

  it("is empty when you've already taken everything", () => {
    expect(pathTo(["CS61B"], ["CS61B"])).toEqual([]);
  });
});

describe("share links", () => {
  it("round-trips answers", () => {
    const a = answers({ interests: ["ai", "systems"], style: "build", goal: "swe", needDesign: true, term: "Fall", taken: ["CS61A", "CS61B"] });
    expect(decode(encode(a))).toEqual(a);
  });

  it("drops anything it doesn't recognize", () => {
    expect(decode("i=nonsense")).toBeNull();
    const a = decode("i=ai&s=weird&t=Winter&k=CS61A.FAKE1");
    expect(a).toMatchObject({ interests: ["ai"], style: "mixed", term: "any", taken: ["CS61A"] });
  });
});
