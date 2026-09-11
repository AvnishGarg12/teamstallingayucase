import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_CASES } from "./demoData";
import { createDemoCase, type DemoScenarioId } from "./demo";
import { fetchCases, pushCase, pushCaseNote, pushCaseStatus } from "./cases";
import type {
  Answer,
  CaseRecord,
  LanguageCode,
  MedicalDocument,
  PatientProfile,
  RedFlag,
} from "./types";

export type SpeechRate = "slow" | "normal" | "fast";

interface Settings {
  language: LanguageCode;
  largeText: boolean;
  highContrast: boolean;
  /** Reads screens, questions and confirmations aloud. Never autoplays when off. */
  audioGuide: boolean;
  /** Large text + icons + captions for deaf and hard-of-hearing patients. */
  visualGuide: boolean;
  /** Optional Indian Sign Language demo panel on the interview screen. */
  signPanel: boolean;
  speechRate: SpeechRate;
}

interface Persisted {
  settings: Settings;
  activeCase: CaseRecord | null;
  submitted: CaseRecord[];
}

const STORAGE_KEY = "ayucase-state-v1";

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  largeText: false,
  highContrast: false,
  audioGuide: false,
  visualGuide: false,
  signPanel: false,
  speechRate: "normal",
};


export const emptyProfile: PatientProfile = {
  name: "",
  age: "",
  gender: "",
  mobile: "",
  city: "",
  abhaId: "",
  emergencyContact: "",
};

function newCase(language: LanguageCode): CaseRecord {
  return {
    id: `case-${Date.now()}`,
    profile: { ...emptyProfile },
    language,
    consentGiven: false,
    answers: [],
    documents: [],
    redFlags: [],
    status: "in-progress",
    createdAt: new Date().toISOString(),
  };
}

interface Ctx {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  activeCase: CaseRecord | null;
  startCase: () => CaseRecord;
  startDemoCase: (scenario: DemoScenarioId) => CaseRecord;
  ensureCase: () => CaseRecord;
  loadDemo: (caseRecord: CaseRecord) => void;
  updateCase: (patch: Partial<CaseRecord>) => void;
  saveAnswer: (answer: Answer) => void;
  addDocument: (doc: MedicalDocument) => void;
  updateDocument: (id: string, patch: Partial<MedicalDocument>) => void;
  removeDocument: (id: string) => void;
  addRedFlags: (flags: RedFlag[]) => void;
  submitCase: () => void;
  doctorCases: CaseRecord[];
  setCaseStatus: (id: string, status: CaseRecord["status"]) => void;
  saveNote: (id: string, note: string) => void;
  refreshCases: () => Promise<void>;
  casesLoading: boolean;
  hydrated: boolean;
}

const AyuContext = createContext<Ctx | null>(null);

export function AyuProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeCase, setActiveCase] = useState<CaseRecord | null>(null);
  const [submitted, setSubmitted] = useState<CaseRecord[]>([]);
  const [remoteCases, setRemoteCases] = useState<CaseRecord[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [hydrated, loadDemo, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...parsed.settings });
        if (parsed.activeCase) setActiveCase(parsed.activeCase);
        if (Array.isArray(parsed.submitted)) setSubmitted(parsed.submitted);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, activeCase, submitted }));
    } catch {
      /* storage full or unavailable */
    }
  }, [settings, activeCase, submitted, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("text-xl-mode", settings.largeText || settings.visualGuide);
    root.classList.toggle("hc", settings.highContrast);
  }, [settings.largeText, settings.highContrast]);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((s) => ({ ...s, ...patch }));
  }, []);

  const startCase = useCallback(() => {
    const created = newCase(settings.language);
    setActiveCase(created);
    return created;
  }, [settings.language]);

  const startDemoCase = useCallback((scenario: DemoScenarioId) => {
    const created = createDemoCase(scenario);
    setSettingsState((current) => ({ ...current, language: created.language }));
    setActiveCase(created);
    return created;
  }, []);

  const ensureCase = useCallback(() => {
    if (activeCase) return activeCase;
    const created = newCase(settings.language);
    setActiveCase(created);
    return created;
  }, [activeCase, settings.language]);

  const updateCase = useCallback((patch: Partial<CaseRecord>) => {
    setActiveCase((c) => (c ? { ...c, ...patch } : c));
  }, []);

  const saveAnswer = useCallback((answer: Answer) => {
    setActiveCase((c) => {
      if (!c) return c;
      const rest = c.answers.filter((a) => a.questionId !== answer.questionId);
      return { ...c, answers: [...rest, answer] };
    });
  }, []);

  const addDocument = useCallback((doc: MedicalDocument) => {
    setActiveCase((c) => (c ? { ...c, documents: [...c.documents, doc] } : c));
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<MedicalDocument>) => {
    setActiveCase((c) =>
      c
        ? { ...c, documents: c.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) }
        : c,
    );
  }, []);

  const removeDocument = useCallback((id: string) => {
    setActiveCase((c) => (c ? { ...c, documents: c.documents.filter((d) => d.id !== id) } : c));
  }, []);

  const addRedFlags = useCallback((flags: RedFlag[]) => {
    if (!flags.length) return;
    setActiveCase((c) => {
      if (!c) return c;
      const known = new Set(c.redFlags.map((f) => f.id));
      const fresh = flags.filter((f) => !known.has(f.id));
      return fresh.length ? { ...c, redFlags: [...c.redFlags, ...fresh] } : c;
    });
  }, []);

  const submitCase = useCallback(() => {
    setActiveCase((c) => {
      if (!c) return c;
      const finished: CaseRecord = {
        ...c,
        status: "submitted",
        queueTime: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setSubmitted((prev) => [finished, ...prev.filter((p) => p.id !== finished.id)]);
      void pushCase(finished).catch(() => {
        /* kiosk keeps the local copy if the network is down */
      });
      return finished;
    });
  }, []);

  const setCaseStatus = useCallback((id: string, status: CaseRecord["status"]) => {
    setSubmitted((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setRemoteCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setActiveCase((c) => (c && c.id === id ? { ...c, status } : c));
    void pushCaseStatus(id, status).catch(() => {
      /* demo cases are not stored in the shared queue */
    });
  }, []);

  const saveNote = useCallback((id: string, note: string) => {
    setSubmitted((prev) => prev.map((c) => (c.id === id ? { ...c, doctorNote: note } : c)));
    setRemoteCases((prev) => prev.map((c) => (c.id === id ? { ...c, doctorNote: note } : c)));
    setActiveCase((c) => (c && c.id === id ? { ...c, doctorNote: note } : c));
    void pushCaseNote(id, note).catch(() => {
      /* demo cases are not stored in the shared queue */
  const loadDemo = useCallback((c: CaseRecord) => {
    setSettingsState((s) => ({ ...s, language: c.language as any }));
    setActiveCase(c);
  }, []);
    });
  }, []);

  const refreshCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      setRemoteCases(await fetchCases());
    } catch {
      /* leave the last known queue on screen */
    } finally {
      setCasesLoading(false);
    }
  }, []);

  const doctorCases = useMemo(() => {
    const seen = new Set<string>();
    const merged: CaseRecord[] = [];
    for (const c of [...remoteCases, ...submitted, ...DEMO_CASES]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      merged.push(c);
    }
    return merged;
  }, [remoteCases, submitted]);

  const value: Ctx = {
    settings,
    setSettings,
    activeCase,
    startCase,
    startDemoCase,
    ensureCase,
    updateCase,
    saveAnswer,
    addDocument,
    updateDocument,
    removeDocument,
    addRedFlags,
    submitCase,
    doctorCases,
    setCaseStatus,
    saveNote,
    refreshCases,
    casesLoading,
    hydrated, loadDemo,
  };

  return <AyuContext.Provider value={value}>{children}</AyuContext.Provider>;
}

export function useAyu() {
  const ctx = useContext(AyuContext);
  if (!ctx) throw new Error("useAyu must be used inside AyuProvider");
  return ctx;
}

/** Speaks text when audio-guided mode is on. Silently no-ops if unsupported. */
export function speak(text: string, enabled: boolean, lang: LanguageCode = "en") {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const map: Record<LanguageCode, string> = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      bn: "bn-IN",
    };
    utter.lang = map[lang];
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  } catch {
    /* speech unavailable */
  }
}
