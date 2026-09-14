import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Camera, FileText, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicalDisclaimer } from "@/components/ayucase/Brand";
import { ListenButton, VisualQuestionCard } from "@/components/ayucase/Accessibility";
import { KioskShell } from "@/components/ayucase/Stepper";
import { ConfidenceBadge } from "@/components/ayucase/ConfidenceBadge";
import { useAyu } from "@/lib/ayucase/store";
import { useA11y, useScreenAudio } from "@/lib/ayucase/a11y";
import { CONFIRMATIONS, SCREEN_GUIDE } from "@/lib/ayucase/i18n";
import { uploadDocumentPhoto } from "@/lib/ayucase/documentStorage";
import { extractDocumentFields } from "@/lib/ayucase/ocr.functions";
import { MOCK_OCR_TEMPLATES } from "@/lib/ayucase/demoData";
import type { DocumentKind, MedicalDocument } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Add old prescriptions & reports — AyuCase" },
      {
        name: "description",
        content:
          "Photograph old prescriptions, lab reports and discharge summaries. AyuCase reads the key details and marks how confident it is, so you can correct anything before the doctor sees it.",
      },
      { property: "og:title", content: "Add old prescriptions & reports — AyuCase" },
      {
        property: "og:description",
        content:
          "Digitise past medical records with confidence labels and patient-side correction before the OPD consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsPage,
});

const KINDS: DocumentKind[] = ["Prescription", "Lab report", "Discharge summary"];

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DocumentsPage() {
  const navigate = useNavigate();
  const { activeCase, ensureCase, addDocument, updateDocument, removeDocument, hydrated } =
    useAyu();
  const [kind, setKind] = useState<DocumentKind>("Prescription");
  const [facility, setFacility] = useState("");
  const { say } = useA11y();
  useScreenAudio(SCREEN_GUIDE["documents"], hydrated);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated) ensureCase();
  }, [hydrated, ensureCase]);

  const documents = activeCase?.documents ?? [];

  // A reliable, explicitly fictional scan keeps the judging demo independent
  // of network connectivity or AI credits. Real uploads still use the OCR flow
  // below and never receive these placeholder values.
  const addDemoScan = () => {
    const id = `demo-scan-${Date.now()}`;
    addDocument({
      id,
      fileName: `fictional-${kind.toLowerCase().replaceAll(" ", "-")}-sample.jpg`,
      kind,
      documentDate: "12 Sep 2026",
      facility: "Fictional SIH Demo Clinic",
      status: "extracted",
      fields: (MOCK_OCR_TEMPLATES[kind] ?? []).map((field) => ({ ...field })),
    });
    say({
      en: "Fictional sample scan added. These are demo values only.",
      hi: "काल्पनिक नमूना स्कैन जोड़ा गया। ये केवल डेमो के लिए हैं।",
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const facilityLabel = facility.trim() || "Not mentioned";
    Array.from(files).forEach((file, index) => {
      const id = `doc-${Date.now()}-${index}`;
      const doc: MedicalDocument = {
        id,
        fileName: file.name || `${kind.toLowerCase()}-${id}.jpg`,
        kind,
        documentDate: todayLabel(),
        facility: facilityLabel,
        status: "processing",
        fields: [],
        ...(file.type.startsWith("image/") ? { previewUrl: URL.createObjectURL(file) } : {}),
      };
      addDocument(doc);
      if (file.type.startsWith("image/") && activeCase?.id) {
        void uploadDocumentPhoto(activeCase.id, id, file).then((path) => {
          if (path) updateDocument(id, { storagePath: path });
        });
      }

      const fallback = (message: string) => {
        updateDocument(id, {
          status: "extracted",
          fields: [
            { label: "Document date", value: todayLabel(), confidence: "Needs Review" },
            { label: "Hospital, clinic or lab", value: facilityLabel, confidence: "Needs Review" },
            { label: "Details from this paper", value: message, confidence: "Needs Review" },
          ],
        });
        say({
          en: `The document could not be read clearly. ${message}`,
          hi: "दस्तावेज़ साफ़ नहीं पढ़ा जा सका। कृपया जानकारी खुद भरें।",
        });
      };

      if (!file.type.startsWith("image/")) {
        fallback("Please type the important details from this file yourself.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!dataUrl) {
          fallback("Please type the important details from this paper yourself.");
          return;
        }
        void extractDocumentFields({ data: { kind, dataUrl } })
          .then((result) => {
            if (!result.fields.length) {
              fallback(result.error ?? "Please type the details from this paper yourself.");
              return;
            }
            updateDocument(id, { status: "extracted", fields: result.fields });
          })
          .catch(() => fallback("Please type the details from this paper yourself."));
      };
      reader.onerror = () => fallback("Please type the details from this paper yourself.");
      reader.readAsDataURL(file);
    });
    setFacility("");
    say(CONFIRMATIONS.documentAdded);
  };

  return (
    <KioskShell step="documents">
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add your old prescriptions and reports
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Take a clear photo of each paper, one at a time. AyuCase reads the important details and
            shows how sure it is. You can correct anything that looks wrong.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ListenButton text={SCREEN_GUIDE["documents"]!.instructions} />
          </div>
          <VisualQuestionCard text={SCREEN_GUIDE["documents"]!.instructions} icon="documents" />

          <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kind" className="text-base font-semibold">
                  What is this paper?
                </Label>
                <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind)}>
                  <SelectTrigger id="kind" className="h-12 rounded-2xl text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k} value={k} className="text-base">
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facility" className="text-base font-semibold">
                  Hospital, clinic or lab (optional)
                </Label>
                <Input
                  id="facility"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. Sanjivani Diagnostics"
                  className="h-12 rounded-2xl text-base"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-16 justify-start gap-3 rounded-2xl text-lg"
                onClick={() => cameraRef.current?.click()}
              >
                <Camera className="size-5" aria-hidden />
                Take a photo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 justify-start gap-3 rounded-2xl border-2 text-lg"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-5" aria-hidden />
                Choose from phone
              </Button>
            </div>
            <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/40 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm text-foreground">
                <strong>SIH demo:</strong> add a fictional sample scan to demonstrate extraction and
                patient-side correction without uploading real health information.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 shrink-0 rounded-xl border-2 sm:mt-0"
                onClick={addDemoScan}
              >
                Add sample scan
              </Button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Tip: keep the paper flat, in good light, and make sure the whole page is inside the
              photo.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <h2 className="text-xl font-semibold text-foreground">
              Added documents ({documents.length})
            </h2>

            {documents.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
                <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 font-medium text-foreground">No documents added yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This step is optional — you can continue without adding any paper.
                </p>
              </div>
            )}

            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onChange={(patch) => updateDocument(doc.id, patch)}
                onRemove={() => removeDocument(doc.id)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">What the labels mean</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <ConfidenceBadge confidence="High" />
                Read clearly. Still worth a quick look.
              </li>
              <li className="flex items-start gap-3">
                <ConfidenceBadge confidence="Medium" />
                Mostly clear. Please confirm.
              </li>
              <li className="flex items-start gap-3">
                <ConfidenceBadge confidence="Needs Review" />
                Hard to read. Please correct it.
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Anything you correct is marked as confirmed by you when the doctor sees it.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <Button
              variant="outline"
              className="h-12 w-full rounded-2xl border-2"
              onClick={() => navigate({ to: "/interview" })}
            >
              Back to questions
            </Button>
            <Button
              className="mt-3 h-12 w-full justify-between rounded-2xl text-base"
              onClick={() => navigate({ to: "/review" })}
            >
              Review and send
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>

          <ClinicalDisclaimer />
        </aside>
      </div>
    </KioskShell>
  );
}

function DocumentCard({
  doc,
  onChange,
  onRemove,
}: {
  doc: MedicalDocument;
  onChange: (patch: Partial<MedicalDocument>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const setField = (index: number, value: string) => {
    const fields = doc.fields.map((f, i) =>
      i === index ? { ...f, value, confidence: "High" as const } : f,
    );
    onChange({ fields });
  };

  return (
    <article className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {doc.previewUrl ? (
            <img
              src={doc.previewUrl}
              alt={`Photo of ${doc.kind.toLowerCase()}`}
              className="size-16 shrink-0 rounded-2xl border border-border object-cover"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface">
              <FileText className="size-6 text-muted-foreground" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{doc.kind}</h3>
            <p className="truncate text-sm text-muted-foreground">{doc.fileName}</p>
            <p className="text-sm text-muted-foreground">
              {doc.documentDate} · {doc.facility}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.status === "extracted" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-2"
              onClick={() => setEditing((e) => !e)}
            >
              <Pencil className="size-4" aria-hidden />
              {editing ? "Done" : "Correct"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-warning hover:text-warning"
            onClick={onRemove}
            aria-label={`Remove ${doc.fileName}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {doc.status === "processing" ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Reading the document…
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {doc.fields.map((field, index) => (
            <li
              key={field.label}
              className={cn(
                "rounded-2xl border px-4 py-3",
                field.confidence === "Needs Review"
                  ? "border-warning/40 bg-warning-soft/40"
                  : "border-border bg-surface",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{field.label}</span>
                <ConfidenceBadge confidence={field.confidence} />
              </div>
              {editing ? (
                <Input
                  value={field.value}
                  onChange={(e) => setField(index, e.target.value)}
                  className="mt-2 h-11 rounded-xl text-base"
                  aria-label={field.label}
                />
              ) : (
                <p className="mt-1 text-base text-foreground">{field.value || "—"}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
