import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicalDisclaimer, OpdTokenCard } from "@/components/ayucase/Brand";
import { KioskShell } from "@/components/ayucase/Stepper";
import { ListenButton, VisualQuestionCard } from "@/components/ayucase/Accessibility";
import { useAyu, emptyProfile } from "@/lib/ayucase/store";
import { useScreenAudio } from "@/lib/ayucase/a11y";
import { SCREEN_GUIDE } from "@/lib/ayucase/i18n";
import type { PatientProfile } from "@/lib/ayucase/types";

export const Route = createFileRoute("/consent")({
  head: () => ({
    meta: [
      { title: "Consent & registration — AyuCase" },
      {
        name: "description",
        content:
          "Give informed consent in simple language and register basic patient details before the AyuCase guided interview.",
      },
      { property: "og:title", content: "Consent & registration — AyuCase" },
      {
        property: "og:description",
        content: "Plain-language consent and patient registration for hospital OPD pre-consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsentPage,
});

function ConsentPage() {
  const navigate = useNavigate();
  const { activeCase, ensureCase, updateCase, hydrated } = useAyu();
  const [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<PatientProfile>(emptyProfile);
  const [touched, setTouched] = useState(false);
  useScreenAudio(SCREEN_GUIDE["consent"], hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const record = ensureCase();
    setConsent(record.consentGiven);
    setProfile((p) => (p.name || !record.profile.name ? p : record.profile));
  }, [hydrated, ensureCase]);

  const set = (key: keyof PatientProfile, value: string) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const missing =
    !profile.name.trim() ||
    !profile.age.trim() ||
    !profile.gender ||
    profile.mobile.replace(/\D/g, "").length < 10 ||
    !profile.city.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!consent || missing) return;
    updateCase({ profile, consentGiven: true });
    navigate({ to: "/interview" });
  };

  return (
    <KioskShell step="profile">

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              Your consent and basic details
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              सहमति और बुनियादी जानकारी — takes about one minute.
            </p>
          </div>
          {!missing && (
            <OpdTokenCard
              name={profile.name}
              tokenNumber={`A-${String(((activeCase?.id?.length ?? 0) % 40) + 12).padStart(2, "0")}`}
              department="General Medicine OPD"
              queueAhead={4}
            />
          )}
        </div>

        <section className="mt-6 rounded-3xl border-2 border-primary/30 bg-primary-soft p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">Consent — in simple words</h2>
            <ListenButton text={SCREEN_GUIDE["consent"]!.instructions} />
          </div>
          <VisualQuestionCard text={SCREEN_GUIDE["consent"]!.instructions} icon="welcome" />
          <p className="mt-2 text-base text-foreground">
            AyuCase will ask you questions about your health and store your answers and uploaded
            documents. Your doctor at this hospital will see them. Nobody else sees your information
            without your permission. You can stop at any time.
          </p>
          <p className="mt-3 border-t border-primary/30 pt-3 text-base text-foreground" lang="hi">
            <strong className="font-semibold">सहमति (हिंदी):</strong> AyuCase आपसे आपकी सेहत के बारे
            में सवाल पूछेगा और आपके जवाब तथा दस्तावेज़ सुरक्षित रखेगा। यह जानकारी सिर्फ़ इस अस्पताल के
            डॉक्टर को दिखाई जाएगी। आपकी अनुमति के बिना कोई और इसे नहीं देख सकता। आप कभी भी रोक सकते
            हैं।
          </p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border bg-card p-4">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-1 size-6"
              aria-describedby="consent-help"
            />
            <span>
              <span className="block text-base font-semibold text-foreground">
                I agree to share this information with my doctor. / मैं सहमत हूँ।
              </span>
              <span id="consent-help" className="block text-sm text-muted-foreground">
                Required before you can continue.
              </span>
            </span>
          </label>
          {touched && !consent && (
            <p className="mt-2 text-sm font-semibold text-danger" role="alert" aria-live="assertive">
              Please tick the consent box to continue.
            </p>
          )}
        </section>

        <form onSubmit={onSubmit} className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-foreground">Patient details</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input
                aria-label="Full name, required"
                value={profile.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Meera Sharma"
                className="h-12 text-base"
                autoComplete="name"
              />
            </Field>
            <Field label="Age" required>
              <Input
                aria-label="Age, required"
                value={profile.age}
                onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="54"
                inputMode="numeric"
                className="h-12 text-base"
              />
            </Field>
            <Field label="Gender" required>
              <Select
                value={profile.gender}
                onValueChange={(v) => set("gender", v as PatientProfile["gender"])}
              >
                <SelectTrigger className="h-12 w-full text-base">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mobile number" required>
              <Input
                aria-label="Mobile number, required"
                value={profile.mobile}
                onChange={(e) => set("mobile", e.target.value.replace(/[^\d ]/g, "").slice(0, 12))}
                placeholder="98220 41127"
                inputMode="tel"
                className="h-12 text-base"
              />
            </Field>
            <Field label="City / town" required>
              <Input
                aria-label="City or town, required"
                value={profile.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Nagpur"
                className="h-12 text-base"
              />
            </Field>
            <Field label="ABHA ID (optional)">
              <Input
                aria-label="ABHA ID, optional"
                value={profile.abhaId ?? ""}
                onChange={(e) => set("abhaId", e.target.value)}
                placeholder="12-3456-7890-1234"
                className="h-12 text-base"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Emergency contact (optional)">
                <Input
                  aria-label="Emergency contact, optional"
                  value={profile.emergencyContact ?? ""}
                  onChange={(e) => set("emergencyContact", e.target.value)}
                  placeholder="Name and phone number"
                  className="h-12 text-base"
                />
              </Field>
            </div>
          </div>

          {touched && missing && (
            <p className="mt-4 text-sm font-semibold text-danger" role="alert" aria-live="assertive">
              Please fill name, age, gender, a 10-digit mobile number and city.
            </p>
          )}

          <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your information is encrypted and shared only with your consent.
          </p>

          <Button type="submit" size="lg" className="mt-5 h-14 w-full rounded-2xl text-lg sm:w-auto">
            Continue to questions
            <ArrowRight className="size-5" aria-hidden />
          </Button>
          {activeCase?.answers.length ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You already answered {activeCase.answers.length} questions. They are saved.
            </p>
          ) : null}
        </form>

        <ClinicalDisclaimer className="mt-6" />
    </KioskShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      {children}
    </div>
  );
}
