import data from "@/data/courses.json";

export type Course = {
  code: string;
  display: string;
  title: string;
  units?: string | null;
  terms?: string[];
  areas?: string[];
  description?: string;
  prereq_text?: string;
  // every group is required; any one course in a group meets it
  prereqs: string[][];
  // groups that may also be taken the same term
  coreqs: string[][];
  class_hours?: number | null;
  outside?: boolean;
  // seminars, DeCals and special topics (topic changes every term)
  kind?: string;
};

export const CHECKED: string = data.checked;
export const COURSES: Record<string, Course> = Object.fromEntries(
  [...Object.values(data.courses), ...Object.values(data.outside)].map((c) => [c.code, c as Course]),
);

// course -> how many courses list it as a prerequisite or corequisite
export const UNLOCKS: Record<string, number> = {};
for (const c of Object.values(COURSES)) {
  for (const code of new Set([...c.prereqs, ...c.coreqs].flat())) UNLOCKS[code] = (UNLOCKS[code] ?? 0) + 1;
}

export const number = (code: string) => parseInt(code.match(/\d+/)?.[0] ?? "0", 10);

// every group has a course you've taken (corequisites can be taken alongside, so they don't block)
export function missingGroups(code: string, taken: Set<string>) {
  return COURSES[code].prereqs.filter((g) => !g.some((c) => taken.has(c)));
}
