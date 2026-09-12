AyuCase Health Companion

Build a polished, responsive web MVP named AyuCase for Smart India Hackathon problem statement SIH26047: Patient Case-Taking Software.

AyuCase is an AI-assisted, multilingual patient pre-consultation and medical-record digitization platform for Indian hospital OPDs. It helps patients provide a complete case history before meeting a doctor, organizes old medical records, detects urgent warning signs, and creates a doctor-verifiable summary. It must never diagnose, prescribe, or claim clinical certainty. Clearly show: “AyuCase supports documentation and triage. A doctor makes the final clinical decision.”

Use this stack:

React + TypeScript + Vite

Tailwind CSS and shadcn/ui

Supabase-ready data model, but use local mock data if backend credentials are unavailable

Clean healthcare visual design: white background, teal/blue accents, large accessible text, rounded cards, high contrast

Build with reusable components and realistic demo data

Create these screens and flows:

Landing / Patient Start screen

AyuCase logo and tagline: “Your health story, ready before your consultation.”

Language selection: English, Hindi, Marathi, Tamil, Bengali

Buttons: “Start New Case”, “Continue Existing Case”, “Doctor Login”

Accessibility controls: large text toggle, high-contrast toggle, audio-guided mode toggle

Short privacy note: “Your information is encrypted and shared only with your consent.”

Consent and Patient Registration

Consent checkbox required before continuing

Explain consent in simple language and include a Hindi version

Form fields: patient name, age, gender, mobile number, city, ABHA ID optional, emergency contact optional

Display a progress stepper: Profile → Symptoms → Medical History → Documents → Review

AI-Guided Patient Case-Taking Chat

Conversational chat interface with a visible “Speak” button and text-input alternative

AI should ask one simple question at a time, with quick-select answer chips and a “Skip for now” option

Include a right-side live “Case Progress” panel showing completed sections

Start with:

“What brings you to the hospital today?”

“When did this problem start?”

“Where do you feel the problem?”

“How severe is it on a scale of 1 to 10?”

“Is it getting better, worse, or staying the same?”

Adaptively ask relevant follow-up questions based on the patient’s chief complaint.

Then cover all of these sections:

Current symptoms and history of present illness

Past illnesses and hospitalizations

Past surgeries

Current medicines, dosage, and allergies

Family history

Lifestyle: smoking, alcohol, diet, sleep, activity

For female patients when relevant: menstrual, pregnancy, and obstetric history

Ayurveda section as optional: Prakriti, digestion/Agni, sleep, diet, bowel habits, lifestyle, and prior AYUSH treatment

Keep questions patient-friendly and avoid medical jargon.

Red-Flag Triage Safety Layer

Add deterministic, rule-based red-flag detection. Do not diagnose.

When answers mention emergency indicators such as severe chest pain, trouble breathing, stroke-like symptoms, fainting, severe bleeding, confusion, seizures, suicidal thoughts, or very high fever in an infant, show an immediate red warning card:

“Urgent symptoms may be present. Please alert hospital staff or seek emergency care immediately.”

Add a “Notify Triage Desk” demo button that only shows a mock confirmation; do not actually send anything.

Mark red-flag items prominently in the doctor view.

Medical Document Upload and OCR Demo

Allow uploading images or PDFs of prescriptions, lab reports, and discharge summaries.

Show an OCR processing state and then display realistic mock extracted data.

Extracted fields should include: document date, diagnosis, medicines, dosage, lab values, allergy mentions, and doctor/hospital name.

Add a confidence badge for every extracted item: High, Medium, or Needs Review.

Display documents in a chronological timeline.

Clearly state that extracted data needs doctor verification.

Patient Review Screen

Show every captured answer in editable sections.

Allow the patient to edit answers before submission.

Show a privacy reminder and a “Generate Doctor Summary” button.

Doctor Dashboard

Create a professional dashboard with a patient queue.

Include one selected sample patient: “Meera Sharma, 54, Hindi”.

Display:

Chief complaint

HPI / symptom timeline

Past medical and surgical history

Medicines and allergies

Family and lifestyle history

Uploaded document findings with confidence levels

Red flags, if any

Timeline of records

Create a concise, one-page structured clinical summary in a format suitable for doctor review.

Include three prominent actions: “Approve”, “Edit”, “Reject”

Add a visible source label beside every summary item, such as “Patient interview” or “Lab report uploaded on 12 Sep 2026.”

Do not include any diagnosis recommendation, prescription, or automated treatment plan.

Demo Data
Create two realistic fictional patient records:

Meera Sharma, 54, Hindi-speaking, diabetes and hypertension, takes metformin and amlodipine, reports worsening shortness of breath and chest tightness. This must trigger a red-flag warning.

Rahul Verma, 27, English-speaking, fever, sore throat, and headache for two days, with no emergency red flags.

Important product rules:

This is a clinical documentation and pre-consultation tool, not a diagnostic tool.

Doctor verification must be required before a case is considered complete.

Keep the interface usable for elderly and low-literacy users: large buttons, icons, minimal text per screen, optional audio guidance, and clear progress indication.

Design the app as a compelling hackathon demo with realistic interactions, not as static mockup pages.

Add a small “ABDM / FHIR-ready” badge, but do not claim live government-system integration.


**Live app**: https://teamstalling.in/

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
