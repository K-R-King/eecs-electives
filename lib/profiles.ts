// What each elective is about and how it's taught. Prerequisites, terms, units and areas come
// from the official data (data/courses.json); the interest weights and teaching style here are
// our own reading of each course's catalog description and official related areas.

export const INTERESTS = [
  { id: "ai", icon: "🤖", label: "AI & machine learning", blurb: "Models that learn, reason, see and talk" },
  { id: "systems", icon: "⚙️", label: "Systems", blurb: "Operating systems, networks, databases, architecture" },
  { id: "software", icon: "🧑‍💻", label: "Software engineering", blurb: "Big codebases, languages, compilers, teamwork" },
  { id: "security", icon: "🔐", label: "Security & cryptography", blurb: "Breaking and defending systems" },
  { id: "theory", icon: "∑", label: "Theory & algorithms", blurb: "Proofs, complexity, clever algorithms" },
  { id: "data", icon: "📊", label: "Data", blurb: "Data science, databases, data engineering" },
  { id: "graphics", icon: "🎨", label: "Graphics & vision", blurb: "Rendering, images, games, computational photography" },
  { id: "hci", icon: "🖐️", label: "Human-computer interaction", blurb: "Designing interfaces people love" },
  { id: "hardware", icon: "🔲", label: "Hardware & chips", blurb: "Digital design, processors, integrated circuits" },
  { id: "robotics", icon: "🦾", label: "Robotics & control", blurb: "Robots, embedded systems, feedback control" },
  { id: "signals", icon: "📡", label: "Signals & communications", blurb: "Signal processing, wireless, information" },
  { id: "devices", icon: "⚡", label: "Devices, physics & energy", blurb: "Transistors, optics, power, renewables" },
  { id: "quantum", icon: "⚛️", label: "Quantum computing", blurb: "Qubits, quantum algorithms" },
] as const;
export type Interest = (typeof INTERESTS)[number]["id"];

export const STYLES = [
  { id: "build", icon: "🛠️", label: "Building things", blurb: "Big projects, labs and code I can show off" },
  { id: "mixed", icon: "⚖️", label: "A bit of both", blurb: "Some projects, some problem sets" },
  { id: "math", icon: "📐", label: "Math and proofs", blurb: "Problem sets, derivations and theory" },
] as const;
export type Style = (typeof STYLES)[number]["id"];

export const GOALS = [
  { id: "swe", icon: "💼", label: "Software engineer", boosts: { software: 1, systems: 1, data: 0.5, security: 0.5, hci: 0.5 } },
  { id: "ml", icon: "🧠", label: "ML / AI engineer", boosts: { ai: 1, data: 1, theory: 0.5 } },
  { id: "hardware", icon: "🔌", label: "Hardware or chip engineer", boosts: { hardware: 1, devices: 1, signals: 0.5 } },
  { id: "robotics", icon: "🚗", label: "Robotics or autonomy", boosts: { robotics: 1, ai: 0.5, hardware: 0.5 } },
  { id: "research", icon: "🎓", label: "Grad school or research", boosts: { theory: 1, ai: 0.5, quantum: 0.5 } },
  { id: "startup", icon: "🚀", label: "Start a company", boosts: { software: 1, hci: 1, ai: 0.5, data: 0.5 } },
  { id: "unsure", icon: "🤷", label: "Not sure yet", boosts: {} },
] as const satisfies readonly { id: string; icon: string; label: string; boosts: Partial<Record<Interest, number>> }[];
export type Goal = (typeof GOALS)[number]["id"];

type Profile = { interests: Partial<Record<Interest, 1 | 0.5>>; style: Style };

// upper-division courses offered as electives; labs taken alongside a lecture (EECS 151LA/LB),
// bioengineering labs, the 1-unit ethics seminar and the business course are left out
export const PROFILES: Record<string, Profile> = {
  CS150: { interests: { hardware: 1 }, style: "build" },
  CS152: { interests: { hardware: 1, systems: 0.5 }, style: "mixed" },
  CS160: { interests: { hci: 1, software: 0.5 }, style: "build" },
  CS161: { interests: { security: 1, systems: 0.5 }, style: "mixed" },
  CS162: { interests: { systems: 1, software: 0.5, security: 0.5 }, style: "build" },
  CS164: { interests: { software: 1, systems: 0.5, theory: 0.5 }, style: "build" },
  CS168: { interests: { systems: 1, security: 0.5 }, style: "mixed" },
  CS169A: { interests: { software: 1, hci: 0.5 }, style: "build" },
  CS169L: { interests: { software: 1 }, style: "build" },
  CS170: { interests: { theory: 1, ai: 0.5 }, style: "math" },
  CS171: { interests: { security: 1, theory: 1 }, style: "math" },
  CS172: { interests: { theory: 1 }, style: "math" },
  CS174: { interests: { theory: 1 }, style: "math" },
  CS176: { interests: { data: 1, theory: 0.5 }, style: "math" },
  CS180: { interests: { graphics: 1, ai: 1 }, style: "mixed" },
  CS184: { interests: { graphics: 1, software: 0.5 }, style: "build" },
  CS185: { interests: { ai: 1, robotics: 0.5 }, style: "mixed" },
  CS186: { interests: { data: 1, systems: 1, software: 0.5 }, style: "build" },
  CS188: { interests: { ai: 1 }, style: "mixed" },
  CS189: { interests: { ai: 1, data: 0.5, theory: 0.5 }, style: "math" },
  CSC100: { interests: { data: 1, ai: 0.5 }, style: "mixed" },
  CSC177: { interests: { theory: 1, ai: 0.5 }, style: "math" },
  CSC182: { interests: { ai: 1 }, style: "mixed" },
  CSC187: { interests: { data: 1, software: 0.5, systems: 0.5 }, style: "build" },
  CSC191: { interests: { quantum: 1, theory: 0.5 }, style: "math" },
  EE105: { interests: { devices: 1, hardware: 0.5 }, style: "mixed" },
  EE108: { interests: { devices: 1 }, style: "mixed" },
  EE113: { interests: { devices: 1 }, style: "mixed" },
  EE113B: { interests: { devices: 1 }, style: "build" },
  EE117: { interests: { devices: 1, signals: 0.5 }, style: "math" },
  EE117B: { interests: { devices: 1, signals: 0.5 }, style: "build" },
  EE118: { interests: { devices: 1, signals: 0.5 }, style: "mixed" },
  EE120: { interests: { signals: 1, robotics: 0.5 }, style: "math" },
  EE121: { interests: { signals: 1 }, style: "math" },
  EE122: { interests: { signals: 1, systems: 0.5 }, style: "mixed" },
  EE123: { interests: { signals: 1 }, style: "mixed" },
  EE130: { interests: { devices: 1, hardware: 0.5 }, style: "math" },
  EE134: { interests: { devices: 1 }, style: "mixed" },
  EE137A: { interests: { devices: 1 }, style: "mixed" },
  EE140: { interests: { hardware: 1, devices: 0.5 }, style: "mixed" },
  EE141: { interests: { hardware: 1 }, style: "mixed" },
  EE142: { interests: { hardware: 1, signals: 0.5 }, style: "mixed" },
  EE143: { interests: { devices: 1, hardware: 0.5 }, style: "build" },
  EE147: { interests: { devices: 1, robotics: 0.5 }, style: "mixed" },
  EE192: { interests: { robotics: 1, hardware: 0.5 }, style: "build" },
  EEC106A: { interests: { robotics: 1, ai: 0.5 }, style: "build" },
  EEC106B: { interests: { robotics: 1, ai: 0.5 }, style: "build" },
  EEC145B: { interests: { signals: 1 }, style: "math" },
  EECS116: { interests: { robotics: 1, ai: 1 }, style: "mixed" },
  EECS126: { interests: { signals: 1, theory: 0.5, ai: 0.5 }, style: "math" },
  EECS127: { interests: { ai: 0.5, theory: 0.5, robotics: 0.5 }, style: "math" },
  EECS144: { interests: { hardware: 1, software: 0.5 }, style: "mixed" },
  EECS149: { interests: { hardware: 1, robotics: 0.5, systems: 0.5 }, style: "build" },
  EECS151: { interests: { hardware: 1 }, style: "build" },
  EECS183: { interests: { ai: 1 }, style: "mixed" },
  EECSC128: { interests: { robotics: 1, signals: 0.5 }, style: "math" },
  EECSC191A: { interests: { quantum: 1 }, style: "math" },
  EECSC191B: { interests: { quantum: 1 }, style: "math" },
};

// courses that meet the EECS design requirement, as listed by the EECS Planner
export const DESIGN = new Set(["CS160", "CS161", "CS162", "CS164", "CS169A", "CS184", "CS186", "CSC182", "EEC106A", "EECS149", "EECS151"]);

// what students have often taken by the time they pick electives, shown first in the quiz
export const COMMON_TAKEN = ["CS61A", "CS61B", "CS61C", "CS70", "EE66", "EE64", "MATH51", "MATH52", "MATH53", "MATH54", "PHYS7A", "PHYS7B"];
