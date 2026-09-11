# SIH presentation-ready demo

## Goal
Turn AyuCase into a reliable, judge-friendly Smart India Hackathon demo while preserving real patient privacy and staff access controls.

## Build
- Add a prominent **Start SIH Demo** area on the landing page with one-click fictional Rahul and Meera scenarios.
- Preload each scenario into the patient journey so every step can be demonstrated; Meera will visibly trigger urgent red-flag handling.
- Add a safe **Doctor Demo Dashboard** entry for fictional cases only, separate from the protected live clinic console.
- Present a responsive patient queue with OPD tokens, urgency, queue status, estimated consultation time, completion, documents digitized, and estimated doctor time saved.
- Expand case review with structured clinical summary, source labels, document confidence badges, red flags, editable notes, and working **Approve**, **Edit**, and **Reject** actions.
- Show **Human Verified** immediately after approval and clear status feedback for all actions.
- Standardize the exact safety statement on patient and doctor screens.
- Relabel ABDM/FHIR claims as **Demo-ready architecture** and explicitly state that no live government integration is claimed.
- Make Visual Guidance enlarge patient-facing content as well as showing captions; keep current audio, keyboard, screen-reader, and sign-language behavior intact.
- Reserve red styling for urgent clinical alerts; use neutral or amber treatment for validation, rejection, removal, and review states.
- Remove any visible Lovable editing badge through supported project styling/configuration if one is present.

## Validation
- Test all public routes and primary buttons through the complete English and Hindi demo journeys.
- Verify Rahul remains routine and Meera shows red flags.
- Test doctor demo actions and Human Verified state.
- Test keyboard interactions and key accessibility states.
- Check phone and desktop layouts for overflow, overlap, and readable controls.
- Confirm the final build and browser console are clean.

## Technical details
- Demo records remain fictional and local; protected real clinic records remain behind approved staff access.
- Reuse the existing case models, summary builder, confidence badges, token card, accessibility provider, and semantic design tokens.
- Add no new database permissions or public patient-data access.
