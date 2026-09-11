import type { SectionId } from "./types";

export interface Question {
  id: string;
  section: SectionId;
  text: string;
  helper?: string;
  chips?: string[];
  input?: "text" | "scale";
  allowSkip?: boolean;
  femaleOnly?: boolean;
  optionalSection?: boolean;
}

export const BASE_QUESTIONS: Question[] = [
  {
    id: "chief-complaint",
    section: "presenting",
    text: "What brings you to the hospital today?",
    helper: "Tell us in your own words.",
    chips: [
      "Chest pain or tightness",
      "Trouble breathing",
      "Fever",
      "Cough",
      "Stomach pain",
      "Headache",
      "Joint pain",
      "Weakness",
    ],
    allowSkip: false,
  },
  {
    id: "onset",
    section: "presenting",
    text: "When did this problem start?",
    chips: ["Today", "2-3 days ago", "About a week ago", "About a month ago", "More than a year"],
  },
  {
    id: "location",
    section: "presenting",
    text: "Where do you feel the problem?",
    chips: ["Chest", "Head", "Stomach", "Back", "Legs", "Throat", "All over the body"],
  },
  {
    id: "severity",
    section: "presenting",
    text: "How severe is it on a scale of 1 to 10?",
    helper: "1 means very mild, 10 means the worst pain you can imagine.",
    input: "scale",
  },
  {
    id: "trend",
    section: "presenting",
    text: "Is it getting better, worse, or staying the same?",
    chips: ["Getting better", "Getting worse", "Staying the same", "Comes and goes"],
  },
  {
    id: "past-illness",
    section: "history",
    text: "Do you have any long-standing health problems?",
    chips: [
      "Diabetes",
      "High blood pressure",
      "Asthma",
      "Thyroid problem",
      "Heart problem",
      "None of these",
    ],
  },
  {
    id: "hospitalisation",
    section: "history",
    text: "Have you ever stayed in a hospital overnight?",
    chips: ["No, never", "Yes, once", "Yes, more than once"],
  },
  {
    id: "surgery",
    section: "surgeries",
    text: "Have you had any operations before?",
    chips: ["No operations", "Appendix", "Gallbladder", "Caesarean", "Heart procedure", "Other"],
  },
  {
    id: "medicines",
    section: "medicines",
    text: "Which medicines do you take regularly?",
    helper: "You can also read out the names on your strip.",
    chips: ["Metformin", "Amlodipine", "Insulin", "Thyroid tablet", "Pain killer", "None"],
  },
  {
    id: "dosage",
    section: "medicines",
    text: "How many times a day do you take them?",
    chips: ["Once a day", "Twice a day", "Three times a day", "Not sure"],
  },
  {
    id: "allergies",
    section: "medicines",
    text: "Does any medicine or food cause you problems?",
    chips: ["No known allergy", "Penicillin", "Sulpha medicines", "Dust", "Certain foods"],
  },
  {
    id: "family",
    section: "family",
    text: "Do close family members have any health problems?",
    chips: ["Diabetes", "Blood pressure", "Heart disease", "Cancer", "Nothing known"],
  },
  {
    id: "smoking",
    section: "lifestyle",
    text: "Do you smoke or chew tobacco?",
    chips: ["Never", "Stopped long ago", "Sometimes", "Daily"],
  },
  {
    id: "alcohol",
    section: "lifestyle",
    text: "Do you drink alcohol?",
    chips: ["Never", "Occasionally", "Weekly", "Daily"],
  },
  {
    id: "diet",
    section: "lifestyle",
    text: "What kind of food do you usually eat?",
    chips: ["Vegetarian", "Mixed", "Mostly outside food", "Home cooked"],
  },
  {
    id: "sleep",
    section: "lifestyle",
    text: "How well do you sleep at night?",
    chips: ["Sleep well", "Wake up often", "Very little sleep", "Sleep with medicine"],
  },
  {
    id: "activity",
    section: "lifestyle",
    text: "How active are you during the day?",
    chips: ["Mostly resting", "Light housework", "Walking daily", "Heavy physical work"],
  },
  {
    id: "menstrual",
    section: "womens",
    femaleOnly: true,
    text: "How are your monthly periods these days?",
    chips: ["Regular", "Irregular", "Stopped (menopause)", "Heavy bleeding", "Prefer not to say"],
  },
  {
    id: "pregnancy",
    section: "womens",
    femaleOnly: true,
    text: "Are you pregnant, or could you be pregnant?",
    chips: ["No", "Yes", "Not sure", "Prefer not to say"],
  },
  {
    id: "obstetric",
    section: "womens",
    femaleOnly: true,
    text: "How many children have you had?",
    chips: ["None", "One", "Two", "Three or more", "Prefer not to say"],
  },
  {
    id: "prakriti",
    section: "ayurveda",
    optionalSection: true,
    text: "Optional: how would you describe your body type (Prakriti)?",
    chips: ["Vata (thin, dry)", "Pitta (warm, sharp)", "Kapha (heavy, calm)", "Not sure"],
  },
  {
    id: "agni",
    section: "ayurveda",
    optionalSection: true,
    text: "Optional: how is your digestion and appetite (Agni)?",
    chips: ["Good appetite", "Low appetite", "Heaviness after food", "Gas or acidity"],
  },
  {
    id: "bowel",
    section: "ayurveda",
    optionalSection: true,
    text: "Optional: how are your bowel habits?",
    chips: ["Regular daily", "Constipation", "Loose motions", "Irregular"],
  },
  {
    id: "ayush-treatment",
    section: "ayurveda",
    optionalSection: true,
    text: "Optional: have you taken Ayurveda, Yoga, Unani, Siddha or Homeopathy treatment before?",
    chips: ["No", "Ayurveda", "Homeopathy", "Yoga therapy", "Unani or Siddha"],
  },
];

/** Adaptive follow-ups, chosen from the chief complaint wording. */
const FOLLOW_UPS: { match: RegExp; questions: Question[] }[] = [
  {
    match: /(chest|breath|breathless|heart)/i,
    questions: [
      {
        id: "fu-exertion",
        section: "presenting",
        text: "Does it get worse when you walk or climb stairs?",
        chips: ["Yes, much worse", "A little worse", "No change", "Not sure"],
      },
      {
        id: "fu-swelling",
        section: "presenting",
        text: "Have your feet or ankles been swelling?",
        chips: ["Yes", "No", "Sometimes in the evening"],
      },
      {
        id: "fu-night",
        section: "presenting",
        text: "Do you wake up at night feeling breathless?",
        chips: ["Yes", "No", "Sometimes"],
      },
    ],
  },
  {
    match: /(fever|cough|throat|cold)/i,
    questions: [
      {
        id: "fu-fever-pattern",
        section: "presenting",
        text: "Is the fever there all day or does it come and go?",
        chips: ["All day", "Comes in the evening", "Comes with chills", "Not sure"],
      },
      {
        id: "fu-throat",
        section: "presenting",
        text: "Is it painful to swallow food or water?",
        chips: ["Yes, very", "A little", "No"],
      },
      {
        id: "fu-contact",
        section: "presenting",
        text: "Is anyone at home having the same problem?",
        chips: ["Yes", "No", "Not sure"],
      },
    ],
  },
  {
    match: /(stomach|abdomen|vomit|loose|acid)/i,
    questions: [
      {
        id: "fu-food",
        section: "presenting",
        text: "Does the pain change after eating?",
        chips: ["Worse after food", "Better after food", "No change"],
      },
      {
        id: "fu-vomit",
        section: "presenting",
        text: "Have you had vomiting or loose motions?",
        chips: ["Vomiting", "Loose motions", "Both", "Neither"],
      },
    ],
  },
  {
    match: /(head|migraine|dizzy)/i,
    questions: [
      {
        id: "fu-head-type",
        section: "presenting",
        text: "Where does the head pain sit?",
        chips: ["One side", "Both sides", "Back of head", "All over"],
      },
      {
        id: "fu-vision",
        section: "presenting",
        text: "Any problem with your eyesight along with it?",
        chips: ["Blurred vision", "Light hurts my eyes", "No problem"],
      },
    ],
  },
  {
    match: /(joint|back|knee|pain in leg)/i,
    questions: [
      {
        id: "fu-stiff",
        section: "presenting",
        text: "Are your joints stiff in the morning?",
        chips: ["Yes, long time", "A few minutes", "No"],
      },
      {
        id: "fu-walk",
        section: "presenting",
        text: "Can you walk without support?",
        chips: ["Yes", "With difficulty", "Need support"],
      },
    ],
  },
];

export function followUpsFor(chiefComplaint: string): Question[] {
  const hit = FOLLOW_UPS.find((f) => f.match.test(chiefComplaint));
  return hit ? hit.questions : [];
}

export function buildQuestionFlow(
  chiefComplaint: string,
  gender: string,
  includeAyurveda: boolean,
): Question[] {
  const flow: Question[] = [];
  for (const q of BASE_QUESTIONS) {
    if (q.femaleOnly && gender !== "female") continue;
    if (q.optionalSection && !includeAyurveda) continue;
    flow.push(q);
    if (q.id === "trend" && chiefComplaint) flow.push(...followUpsFor(chiefComplaint));
  }
  return flow;
}
