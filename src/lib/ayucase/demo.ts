import { MEERA, RAHUL } from "./demoData";
import type { CaseRecord } from "./types";

export type DemoScenarioId = "rahul" | "meera";

const DEMO_SOURCE: Record<DemoScenarioId, CaseRecord> = {
  rahul: RAHUL,
  meera: MEERA,
};

export function createDemoCase(id: DemoScenarioId): CaseRecord {
  const source = DEMO_SOURCE[id];
  const { queueTime: _queueTime, ...caseWithoutQueueTime } = structuredClone(source);
  return {
    ...caseWithoutQueueTime,
    id: `sih-${id}-${Date.now()}`,
    consentGiven: false,
    status: "in-progress",
    doctorNote: "",
  };
}

export function demoToken(record: CaseRecord) {
  return record.profile.name === "Meera Sharma" ? "A-17" : "A-18";
}

export function demoMetrics(record: CaseRecord) {
  const requiredAnswers = 20;
  return {
    department: "General Medicine OPD",
    queueStatus: record.redFlags.length ? "Priority triage" : "Waiting",
    estimatedConsultation: record.redFlags.length ? "Immediate review" : "10:10 AM",
    completion: Math.min(100, Math.round((record.answers.length / requiredAnswers) * 100)),
    documents: record.documents.length,
    timeSaved: Math.max(4, Math.round(record.answers.length * 0.45 + record.documents.length * 1.5)),
  };
}