import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAyu, type SpeechRate } from "./store";
import { pick, type Bilingual } from "./i18n";
import type { LanguageCode } from "./types";

export const SPEECH_RATES: Record<SpeechRate, number> = {
  slow: 0.62,
  normal: 0.95,
  fast: 1.35,
};

export const RATE_LABELS: Record<SpeechRate, Bilingual> = {
  slow: { en: "Slow", hi: "धीमा" },
  normal: { en: "Normal", hi: "सामान्य" },
  fast: { en: "Fast", hi: "तेज़" },
};

const LANG_TAGS: Record<LanguageCode, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  bn: "bn-IN",
};

interface SayOptions {
  /** Speak even when Audio Guidance is off — only for an explicit Listen press. */
  force?: boolean;
}

interface A11yCtx {
  /** Resolve a bilingual string into the patient's chosen language. */
  t: (text: Bilingual | string) => string;
  /** Speak text; silent unless Audio Guidance is on (or force is set). */
  say: (text: Bilingual | string, options?: SayOptions) => void;
  stop: () => void;
  speaking: boolean;
  /** Latest spoken line, shown as a caption for deaf / hard-of-hearing users. */
  caption: string;
  /** Running transcript of everything the guidance has said. */
  transcript: string[];
  clearTranscript: () => void;
  supported: boolean;
}

const A11yContext = createContext<A11yCtx | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const { settings } = useAyu();
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const hindi = settings.language === "hi";

  const t = useCallback(
    (text: Bilingual | string) => pick(text, hindi),
    [hindi],
  );

  const stop = useCallback(() => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      /* speech unavailable */
    }
    setSpeaking(false);
  }, []);

  const say = useCallback(
    (text: Bilingual | string, options: SayOptions = {}) => {
      const line = pick(text, hindi).trim();
      if (!line) return;

      const allowed = options.force || settings.audioGuide;

      // Captions / transcript serve deaf and hard-of-hearing patients, so they
      // are recorded whenever either guidance mode is on.
      if (allowed || settings.visualGuide) {
        setCaption(line);
        setTranscript((prev) => (prev[prev.length - 1] === line ? prev : [...prev.slice(-60), line]));
      }
      if (!allowed) return;

      try {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(line);
        utter.lang = LANG_TAGS[settings.language] ?? "en-IN";
        utter.rate = SPEECH_RATES[settings.speechRate] ?? SPEECH_RATES.normal;
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utter);
        setSpeaking(true);
      } catch {
        setSpeaking(false);
      }
    },
    [hindi, settings.audioGuide, settings.visualGuide, settings.language, settings.speechRate],
  );

  // Never keep talking after the patient switches Audio Guidance off.
  useEffect(() => {
    if (!settings.audioGuide) stop();
  }, [settings.audioGuide, stop]);

  useEffect(() => stop, [stop]);

  const value = useMemo<A11yCtx>(
    () => ({
      t,
      say,
      stop,
      speaking,
      caption,
      transcript,
      clearTranscript: () => setTranscript([]),
      supported,
    }),
    [t, say, stop, speaking, caption, transcript, supported],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside A11yProvider");
  return ctx;
}

/**
 * Reads a screen's title and instructions once the patient has turned Audio
 * Guidance on. Never autoplays while guidance is off.
 */
export function useScreenAudio(
  screen: { title: Bilingual | string; instructions: Bilingual | string } | undefined,
  ready = true,
) {
  const { say } = useA11y();
  const { settings } = useAyu();
  const spokenFor = useRef<string>("");

  useEffect(() => {
    if (!settings.audioGuide) {
      spokenFor.current = "";
      return;
    }
    if (!ready || !screen) return;
    const key = `${settings.language}|${typeof screen.title === "string" ? screen.title : screen.title.en}`;
    if (spokenFor.current === key) return;
    spokenFor.current = key;
    const title = typeof screen.title === "string" ? screen.title : screen.title;
    const instructions =
      typeof screen.instructions === "string" ? screen.instructions : screen.instructions;
    const merged: Bilingual = {
      en: `${pick(title, false)} ${pick(instructions, false)}`,
      hi: `${pick(title, true)} ${pick(instructions, true)}`,
    };
    say(merged);
  }, [ready, screen, settings.audioGuide, settings.language, say]);
}
