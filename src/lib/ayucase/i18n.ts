/**
 * Bilingual strings for AyuCase Accessibility Mode (MVP: English + Hindi).
 * Spoken guidance, screen scripts and the Indian Sign Language demo phrases
 * all read from here so new languages or ISL clips can be added in one place.
 */

export interface Bilingual {
  en: string;
  hi: string;
}

export function pick(text: Bilingual | string, hindi: boolean): string {
  return typeof text === "string" ? text : hindi ? text.hi : text.en;
}

/** Screen title + instruction scripts read aloud when Audio Guidance is on. */
export const SCREEN_GUIDE: Record<string, { title: Bilingual; instructions: Bilingual }> = {
  home: {
    title: {
      en: "Welcome to AyuCase.",
      hi: "आयुकेस में आपका स्वागत है।",
    },
    instructions: {
      en: "Please select your language. Then choose Start New Case to begin.",
      hi: "कृपया अपनी भाषा चुनें। फिर नया केस शुरू करें दबाएँ।",
    },
  },
  consent: {
    title: {
      en: "Your consent and basic details.",
      hi: "आपकी सहमति और बुनियादी जानकारी।",
    },
    instructions: {
      en: "Please listen to the consent, tick the agree box, and fill your name, age, gender, mobile number and city.",
      hi: "कृपया सहमति सुनें, सहमति का बॉक्स चुनें, और अपना नाम, उम्र, लिंग, मोबाइल नंबर और शहर भरें।",
    },
  },
  interview: {
    title: {
      en: "Guided health questions.",
      hi: "स्वास्थ्य से जुड़े सवाल।",
    },
    instructions: {
      en: "One question at a time. You can pick an option, speak your answer, or type it. Press Listen to hear a question again.",
      hi: "एक बार में एक सवाल। आप विकल्प चुन सकते हैं, बोल सकते हैं, या लिख सकते हैं। सवाल दोबारा सुनने के लिए सुनें दबाएँ।",
    },
  },
  documents: {
    title: {
      en: "Add your old prescriptions and reports.",
      hi: "अपने पुराने पर्चे और रिपोर्ट जोड़ें।",
    },
    instructions: {
      en: "Please upload your medical documents. Take a photo of each paper. AyuCase will read the details and you can correct anything.",
      hi: "कृपया अपने मेडिकल दस्तावेज़ अपलोड करें। हर कागज़ की फ़ोटो लें। आयुकेस जानकारी पढ़ेगा और आप उसे सुधार सकते हैं।",
    },
  },
  review: {
    title: {
      en: "Check your case before sending it.",
      hi: "भेजने से पहले अपना केस जाँच लें।",
    },
    instructions: {
      en: "Please check everything on this page. If something is wrong you can change it, then send it to the doctor.",
      hi: "कृपया इस पेज पर सब कुछ जाँच लें। कुछ ग़लत हो तो बदल सकते हैं, फिर डॉक्टर को भेजें।",
    },
  },
};

export const CONFIRMATIONS = {
  answerSaved: {
    en: "Answer saved. Here is the next question.",
    hi: "जवाब सुरक्षित हो गया। अगला सवाल यह है।",
  },
  caseSent: {
    en: "Your information is ready for doctor review. Please wait for your name to be called.",
    hi: "आपकी जानकारी डॉक्टर की समीक्षा के लिए तैयार है। कृपया अपने नाम की पुकार का इंतज़ार करें।",
  },
  documentAdded: {
    en: "Document added. AyuCase is reading it now.",
    hi: "दस्तावेज़ जुड़ गया। आयुकेस उसे पढ़ रहा है।",
  },
  emergency: {
    en: "Emergency help may be needed. Please tell the hospital staff right away.",
    hi: "आपको तुरंत मदद की ज़रूरत हो सकती है। कृपया अस्पताल के स्टाफ़ को तुरंत बताएँ।",
  },
  audioOn: {
    en: "Audio guidance is on. Screens and questions will be read aloud.",
    hi: "आवाज़ सहायता चालू है। स्क्रीन और सवाल पढ़कर सुनाए जाएँगे।",
  },
} satisfies Record<string, Bilingual>;

/**
 * Indian Sign Language demo phrases. `clipUrl` is intentionally empty for the
 * MVP — drop in an ISL video URL per phrase later and the panel plays it
 * instead of the animated avatar placeholder.
 */
export interface SignPhrase {
  id: string;
  text: Bilingual;
  icon: "welcome" | "language" | "complaint" | "symptoms" | "documents" | "ready" | "emergency";
  clipUrl?: string;
}

export const SIGN_PHRASES: SignPhrase[] = [
  { id: "welcome", icon: "welcome", text: { en: "Welcome", hi: "स्वागत है" } },
  {
    id: "language",
    icon: "language",
    text: { en: "Please select your language", hi: "कृपया अपनी भाषा चुनें" },
  },
  {
    id: "complaint",
    icon: "complaint",
    text: {
      en: "What brings you to the hospital today?",
      hi: "आज आप अस्पताल क्यों आए हैं?",
    },
  },
  {
    id: "symptoms",
    icon: "symptoms",
    text: {
      en: "Please tell us about your symptoms",
      hi: "कृपया अपने लक्षण बताएँ",
    },
  },
  {
    id: "documents",
    icon: "documents",
    text: {
      en: "Please upload your medical documents",
      hi: "कृपया अपने मेडिकल दस्तावेज़ अपलोड करें",
    },
  },
  {
    id: "ready",
    icon: "ready",
    text: {
      en: "Your information is ready for doctor review",
      hi: "आपकी जानकारी डॉक्टर की समीक्षा के लिए तैयार है",
    },
  },
  {
    id: "emergency",
    icon: "emergency",
    text: {
      en: "Emergency help may be needed",
      hi: "तुरंत मदद की ज़रूरत हो सकती है",
    },
  },
];

/** Hindi wording for every interview question, keyed by question id. */
export const QUESTION_HI: Record<string, string> = {
  "chief-complaint": "आज आप अस्पताल क्यों आए हैं? अपने शब्दों में बताएँ।",
  onset: "यह तकलीफ़ कब शुरू हुई?",
  location: "तकलीफ़ शरीर के किस हिस्से में महसूस होती है?",
  severity: "एक से दस के पैमाने पर तकलीफ़ कितनी है?",
  trend: "यह ठीक हो रही है, बढ़ रही है, या वैसी ही है?",
  "past-illness": "क्या आपको कोई पुरानी बीमारी है?",
  hospitalisation: "क्या आप कभी रात भर अस्पताल में भर्ती रहे हैं?",
  surgery: "क्या आपका पहले कोई ऑपरेशन हुआ है?",
  medicines: "आप नियमित रूप से कौन सी दवाइयाँ लेते हैं?",
  dosage: "आप ये दवाइयाँ दिन में कितनी बार लेते हैं?",
  allergies: "क्या कोई दवा या खाना आपको नुकसान करता है?",
  family: "क्या घर के किसी करीबी सदस्य को कोई बीमारी है?",
  smoking: "क्या आप बीड़ी, सिगरेट या तंबाकू लेते हैं?",
  alcohol: "क्या आप शराब पीते हैं?",
  diet: "आप आम तौर पर कैसा खाना खाते हैं?",
  sleep: "रात में आपकी नींद कैसी रहती है?",
  activity: "दिन भर आप कितने सक्रिय रहते हैं?",
  menstrual: "इन दिनों आपके मासिक धर्म कैसे हैं?",
  pregnancy: "क्या आप गर्भवती हैं, या हो सकती हैं?",
  obstetric: "आपके कितने बच्चे हैं?",
  prakriti: "वैकल्पिक: आपकी शरीर की प्रकृति कैसी है?",
  agni: "वैकल्पिक: आपकी पाचन शक्ति और भूख कैसी है?",
  bowel: "वैकल्पिक: आपका शौच कैसा रहता है?",
  "ayush-treatment": "वैकल्पिक: क्या आपने पहले आयुर्वेद, योग, यूनानी, सिद्ध या होम्योपैथी इलाज लिया है?",
  "fu-exertion": "चलने या सीढ़ी चढ़ने पर तकलीफ़ बढ़ती है?",
  "fu-swelling": "क्या आपके पैरों या टखनों में सूजन आ रही है?",
  "fu-night": "क्या रात में साँस फूलने से नींद खुल जाती है?",
  "fu-fever-pattern": "बुखार पूरे दिन रहता है या आता-जाता है?",
  "fu-throat": "खाना या पानी निगलने में दर्द होता है?",
  "fu-contact": "घर में किसी और को भी यही तकलीफ़ है?",
  "fu-food": "खाना खाने के बाद दर्द बदलता है?",
  "fu-vomit": "क्या उल्टी या दस्त हुए हैं?",
  "fu-head-type": "सिर में दर्द कहाँ होता है?",
  "fu-vision": "इसके साथ आँखों की रोशनी में कोई तकलीफ़ है?",
  "fu-stiff": "सुबह जोड़ों में जकड़न रहती है?",
  "fu-walk": "क्या आप सहारे के बिना चल सकते हैं?",
};

/** Bilingual text for a question, falling back to English when no Hindi exists. */
export function questionBilingual(id: string, english: string): Bilingual {
  return { en: english, hi: QUESTION_HI[id] ?? english };
}
