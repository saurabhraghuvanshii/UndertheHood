import type { SectionId } from "./types";

/** Default titles for the 20-part lesson template, in teaching order. */
export const SECTION_TITLES: Record<SectionId, string> = {
  objectives: "Learning objectives",
  prerequisites: "Prerequisites",
  intuition: "Intuition first",
  definition: "Formal definition",
  why: "Why it exists",
  internals: "Under the hood",
  walkthrough: "Execution walkthrough",
  memory: "Memory and runtime",
  visualization: "Visualize it",
  examples: "Code examples",
  "edge-cases": "Edge cases",
  mistakes: "Common mistakes",
  tradeoffs: "Trade-offs",
  "real-world": "In production",
  "interview-short": "Interview answer (30–90 s)",
  "interview-deep": "Deep interview answer",
  "follow-ups": "Follow-up questions",
  practice: "Practice",
  glossary: "Key terminology",
  summary: "Revision summary",
};

/** Which of the five teaching goals (What/Why/How/Visualize/Interview) each section serves. */
export const SECTION_GOAL: Partial<Record<SectionId, "What" | "Why" | "How" | "Visualize" | "Interview">> = {
  intuition: "What", definition: "What", why: "Why", internals: "How", walkthrough: "How", memory: "How",
  visualization: "Visualize", "interview-short": "Interview", "interview-deep": "Interview", "follow-ups": "Interview",
};
