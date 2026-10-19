# Daivam Manushya Roopena — v1 Requirements (Dev build)

> **Read this whole file before writing any code.**
> This file is the single source of truth. If something is not written here, do NOT build it.
> If something is unclear, follow the rule in section 2.3.

---

## 0. Table of contents

1. What we are building (in plain words)
2. Rules for the implementing agent
3. Glossary (words used in this file)
4. Scope: what is IN and what is OUT
5. Users and roles
6. The vouching system (helper approval) — IMPORTANT
7. Feature specs (screens and behaviour)
8. The SOS lifecycle (exact timings and states)
9. Mock (practice) mode
10. Architecture
11. Data model (Firestore)
12. Cloud Functions (backend API)
13. Security rules
14. The alarm (making the helper's phone ring)
15. Location and maps
16. Language, elder mode, accessibility
17. Cost rules (everything must be free in dev)
18. Testing requirements
19. Milestones and acceptance criteria
20. Decision log (docs/decisions) — required
21. Open questions (do not build these yet)

---

## 1. What we are building

**One line:** When an elder has a medical emergency at home at night, one press of a button (by the elder or by family in another city) opens the phone dialer for 108 and, at the same time, rings trusted neighbours ("helpers") within 500 m so they can come and physically help (lift, carry, drive, sit with the patient).

**Example story:**
At 2 AM, Lakshmi (68) finds her husband unconscious. She holds the big red SOS button for 5 seconds. A 10-second "Cancel" countdown runs. Then:
- Her phone dialer opens with **108** filled in.
- Her two "personal helpers" (her nephew and the neighbour she added) get a loud alarm immediately.
- 30 seconds later, all approved helpers within 500 m get a loud alarm.
- Ravi (a neighbour, approved helper) taps **Going**. He now sees the address, phone number, medical notes and a map pin.
- Lakshmi's son in Bengaluru gets a notification: "Ravi is going" and can watch Ravi's location on a map.
- Ravi arrives, taps **Arrived**. Later someone taps **Resolved**.

This is a **free, non-profit, open-source** app. Android only in v1.

---

## 2. Rules for the implementing agent

### 2.1 General rules
1. Build **only** what is in this file. No extra features, screens, settings or "for later" code.
2. Work **one milestone at a time** (section 19). Do not start the next milestone until all acceptance criteria of the current one pass.
3. Every non-trivial piece of logic must have a unit test (section 18).
4. Put **business logic in pure functions** inside `packages/shared` so it can be tested without a phone or Firebase.
5. **Never use a paid API or paid service.** See section 17. If you think you need one, stop and write it in `docs/open-questions.md`.
6. **Never commit secrets** (API keys, `google-services.json`, service account files). Add them to `.gitignore`. Provide `*.example` files instead.
7. Do not add a new npm dependency unless this file names it, or you write a decision file (section 20) explaining why.
8. Use **TypeScript strict mode** everywhere (`"strict": true`).
9. Every user-visible string must go through i18n (section 16). No hard-coded text in components.

### 2.2 Decision log rule (very important)
Every time you make a choice that a future developer would ask "why?", write a decision file in `docs/decisions/` using the template in section 20. Examples: choosing a library, a data shape, a timing value, a workaround for an Android limitation.

### 2.3 When something is unclear
1. Pick the **simplest** option that satisfies this file.
2. Write it as a decision file (section 20).
3. Add one line to `docs/open-questions.md` so the human can review it later.
4. Continue working. Do not stop and wait.

### 2.4 Definition of Done for any task
- Code compiles with no TypeScript errors.
- `npm test` passes in every workspace.
- New logic has tests.
- Decision files written for any new choices.
- No hard-coded user-facing strings.
- No secrets committed.

---

## 3. Glossary

| Word | Meaning |
|---|---|
| **User** | Anyone with an account (signed in with phone number). |
| **Household** | One home where a patient lives. Has an address and a home pin. |
| **Resident** | A user who lives in the household (e.g. the elder). |
| **Family member** | A user linked to a household who lives elsewhere (e.g. son in another city). Can raise SOS remotely. |
| **Helper** | A user who has agreed to help others nearby. |
| **Pending helper** | A helper who signed up but is not yet approved. Gets NO SOS alerts. |
| **Approved helper** | A helper who has been vouched for. Gets SOS alerts. |
| **Vouch** | An approved helper (or admin) saying "I know this person in real life." One vouch approves a pending helper. |
| **Personal helper** | Someone a household added by name/phone as "my helper" (relative, known neighbour). Rung first for that household only. |
| **Admin** | The app owner (Goutam). Can approve the first helpers in an area, see reports, remove helpers. |
| **SOS** | One emergency event. |
| **Home pin** | A latitude/longitude the user drops on the map for their house. Fixed. Not live GPS. |
| **Mock mode** | Practice mode. Rings only other phones in mock mode. Never real people. |

---

## 4. Scope

### 4.1 IN scope (v1, dev build)
- Phone OTP login (dev uses Firebase **test phone numbers**, no real SMS).
- Profile, household creation, family linking (max 5 family members per household).
- Home pin on Google Map (drop pin only, no address search).
- Helper signup, vouching, admin approval of first helpers.
- Personal helpers list per household.
- SOS: hold 5 s → 10 s cancel countdown → open dialer (108) → ring helpers in stages.
- Up to **5** helpers can accept one SOS.
- After accept: both sides see each other's phone number; helper sees address, medical notes, map pin; family sees helper's live location.
- Escalation: personal helpers at 0 s → approved helpers within 500 m at 30 s → within 1 km + all family at 90 s.
- Auto-close after 30 min unless someone taps "Still in progress" (adds 30 min each time).
- Loud alarm on helper phone (works on silent, locked screen).
- "Test alarm" button for helpers.
- "Available" ON/OFF switch for helpers.
- Report a helper → admin queue.
- Mock (practice) mode.
- English + Telugu.
- Elder mode (large text, big buttons) for residents.
- Delete SOS data after 90 days.
- Firebase **dev** project only.

### 4.2 OUT of scope (do NOT build)
- iOS.
- Play Store release, store listing, production Firebase project.
- Quiet hours (only the Available switch).
- Number masking / in-app calling.
- Photos (profile photo, gate photo) — no Firebase Storage in v1.
- Address search / autocomplete (Places API costs money).
- Voice trigger, power-button trigger, missed-call trigger, home-screen widget, lock-screen shortcut.
- Web admin panel (admin screens are inside the app).
- Points, badges, leaderboards, ads, analytics SDKs (except Crashlytics).
- Background live tracking when the helper app is closed.
- Auto-dialing 108 (Android does not allow it; we only open the dialer).

---

## 5. Users and roles

One user account can have several roles at once (e.g. a resident who is also a helper).

| Role | How you get it | What you can do |
|---|---|---|
| Resident | Create a household or accept a resident invite | Raise SOS for own household, edit household profile, manage personal helpers, invite family |
| Family member | Accept a family invite code from a household | Raise SOS for that household remotely, see SOS status + helper live location, edit household profile |
| Helper (pending) | Say "Yes" to "Do you want to be a helper?" | Nothing SOS-related yet. Waits for a vouch |
| Helper (approved) | Get 1 vouch | Receive SOS alarms, accept, vouch for pending helpers nearby, report |
| Admin | Set manually by Goutam with a script (custom claim `admin: true`) | Approve any pending helper, see reports, remove helpers |

**Households do NOT need vouching.** An elder in danger must never wait for approval. Abuse is limited by rate limits (section 8.6).

---

## 6. The vouching system (helper approval)

### 6.1 Why it exists (the problem)
If anyone could become a helper instantly, a thief could install the app, wait for an SOS at 2 AM, and learn exactly which house has a weak, alone, elderly person. Vouching blocks strangers: **someone who is already trusted must say "I know this person in real life."**

### 6.2 The story (use this to understand the logic)
1. **Ravi** installs the app and answers **Yes** to "Do you want to be a helper?"
2. Ravi's helper status becomes **PENDING**. Ravi gets **no SOS alarms**. Ravi **cannot vouch** for anyone.
3. The app sends a push notification to every **APPROVED** helper whose home pin is within **1 km** of Ravi's home pin:
   *"Ravi joined as a helper near you. Do you know him personally?"*
4. **Suresh** (approved helper, lives on the same street) taps the notification, sees Ravi's name, tags and colony name, and taps **"Yes, I know Ravi in real life"**.
5. Ravi's status becomes **APPROVED**. Ravi's profile now shows **"Vouched by Suresh"**.
6. Ravi now receives SOS alarms and can vouch for others.

```
Sign up as helper ──> PENDING ──(1 vouch from an approved helper OR admin)──> APPROVED
                         │                                                    │
                         └──(admin rejects)──> REJECTED      (admin removes)──> REMOVED
```

### 6.3 Who approves the very first helper in a new area?
When no approved helper exists within 1 km, nobody can vouch. In that case **the admin** approves. The admin sees all pending helpers in the "Admin → Pending helpers" screen.

### 6.4 Rules (implement exactly)
| # | Rule |
|---|---|
| V1 | Number of vouches needed: **1** (constant `VOUCHES_REQUIRED = 1` in `packages/shared/src/constants.ts`). |
| V2 | Only users with helper status **APPROVED** (or admin) can vouch. |
| V3 | A user cannot vouch for themselves. |
| V4 | A voucher must have a home pin within **1 km** of the pending helper's home pin (admin is exempt). |
| V5 | The vouch button text must be "Yes, I know this person in real life" (i18n key `vouch.confirm`). |
| V6 | "I don't know this person" just hides the request for that voucher. It does NOT reject. |
| V7 | **Voucher accountability:** if a helper is REMOVED by the admin, every user who vouched for them loses vouching rights for **30 days** (`vouchBlockedUntil = now + 30 days`). |
| V8 | A REMOVED or REJECTED user cannot sign up as a helper again with the same account. |
| V9 | The pending list shows only: name, helper tags, colony/area name (free text), distance rounded to 100 m. **Never** the exact home pin or phone number. |
| V10 | Approved helper profile shows "Vouched by <names>". |

### 6.5 Personal helpers are different
A household can add **personal helpers** (relatives, known neighbours) by phone number. The invited person must have the app and accept the invite. A personal helper is rung for **that household only**, even if their global helper status is PENDING or they never signed up as a helper. Reason: the household already trusts them personally.

---

## 7. Feature specs (screens)

Screen names are given in `PascalCase` — use these as file names under `apps/mobile/src/screens/`.

### 7.1 Onboarding & auth
1. **LanguageScreen** — choose English / తెలుగు. Saved locally and on the user doc.
2. **PhoneLoginScreen** — enter phone number (+91 default) → OTP → signed in. Dev: works with Firebase test numbers.
3. **NameScreen** — full name (required, 2–50 chars).
4. **RoleChoiceScreen** — three checkboxes (at least one required):
   - "I want to set up emergency help for my home" → creates household (resident).
   - "I want to set up emergency help for my parents / relatives" → asks for family invite code OR creates a household on their behalf (user becomes family member; can later invite the elder as resident).
   - "I want to help people near me (helper)".
5. **HomePinScreen** — Google Map centred on current location (ask foreground location permission; if denied, centre on India and let user pan). User drags a pin to their house. Below the map: text fields **Address line** (required), **Landmark** (optional), **Colony/area name** (required, free text). Save.

### 7.2 Household
6. **HouseholdProfileScreen** (residents and family can edit):
   - Address line, landmark, colony name, home pin (edit opens map).
   - Floor number (number), "Lift available" (yes/no), "Needs to be carried" (yes/no), "Car available at home" (yes/no).
   - Medical notes (free text, max 500 chars) — e.g. conditions, medicines, allergies.
   - Blood group (dropdown: A+, A−, B+, B−, AB+, AB−, O+, O−, Unknown).
   - Preferred hospital (free text, optional).
   - Patient age (number, optional).
7. **FamilyScreen** — list family members (max 5), "Invite family" generates a 6-digit invite code valid for 24 h. "Remove" button.
8. **PersonalHelpersScreen** — list personal helpers, "Add" by phone number → sends invite; invitee sees "<Household name> wants you as their personal helper. Accept?" Max 10 personal helpers.

### 7.3 Helper
9. **HelperSignupScreen** — tags (multi-select): Neighbour, Security guard, Shop owner, Driver, Youth volunteer, Medically trained. Options: "Only help within my area (500 m, never escalate to 1 km)" and "I prefer to go with one more person". Then status = PENDING.
10. **HelperHomeScreen** — shows status (Pending / Approved), big **Available** ON/OFF switch, **Test alarm** button, alarm setup checklist (section 14.4), "New helpers near you" list (approved helpers only).
11. **VouchRequestScreen** — opened from the notification or list. Shows pending person (V9 fields). Buttons: "Yes, I know this person in real life" / "I don't know this person".

### 7.4 SOS (patient side)
12. **HomeScreen (resident/family)** — one giant red **SOS** button (min 200 dp). Family members with more than one household choose the household first.
    - Hold for **5 seconds** (show a filling ring). Releasing early does nothing.
    - Then **SosCountdownScreen**: big number 10 → 0 and a giant **CANCEL** button. Cancel = nothing is sent.
    - Optional one-tap help type chips on the countdown screen: "Lift / carry", "Drive to hospital", "Sit with patient". Skippable. Default = "Help needed".
    - At 0: call `raiseSos`, then open the dialer with `tel:108`.
13. **ActiveSosScreen (patient side)** — shows:
    - Big status text: "Calling helpers…" → "Ravi is going" → "Ravi arrived".
    - Text-to-speech reads the status aloud in the user's language (use `expo-speech`) including "Help is coming. Open the door if you can."
    - Buttons: **Call 108**, **Call 112**, **Call family** (list), **Still in progress** (extend 30 min), **Resolved** (close).
    - List of accepted helpers: name, tags, "Vouched by …", phone (tap to call), and a map with their live location (if sharing).

### 7.5 SOS (helper side)
14. **AlarmScreen** — full-screen, opened by the alarm (section 14). Shows: help type, distance (e.g. "350 m"), patient age if set, colony name. Two equal-size buttons: **Going** / **Can't today**. No penalty for "Can't today". Sound stops on either tap.
15. **HelperActiveSosScreen** — after **Going** succeeds: address, landmark, floor/lift/carry flags, medical notes, blood group, patient phone (tap to call), "Open in Google Maps" (opens `geo:` / maps intent — free), buttons **Arrived**, **Can't make it** (withdraw), **Resolved**.
   - If the helper chose "I prefer to go with one more person", show a banner: "You will be told when another helper is going."
   - If accept fails because 5 helpers are already going: show "Enough helpers are going. Thank you!"

### 7.6 Family view
16. Family members get push notifications for: SOS raised, each helper accepted, helper arrived, SOS resolved/auto-closed, "No helper has accepted yet" (at 90 s). Tapping opens **ActiveSosScreen**.

### 7.7 Reports & admin
17. **ReportScreen** — from any helper's profile: reason (dropdown: Rude, Did not come after accepting, Unsafe behaviour, Fake account, Other) + text (max 300). Goes to admin.
18. **AdminScreen** (visible only if custom claim `admin: true`): tabs **Pending helpers** (approve/reject), **Reports** (list, mark reviewed, "Remove helper"), **Recent SOS** (last 50, read-only).

### 7.8 Settings
19. **SettingsScreen** — language, elder mode toggle (default ON for residents), mock mode toggle (section 9), sign out, delete my account (deletes user doc and memberships; keeps anonymised SOS stats).

---

## 8. The SOS lifecycle

### 8.1 States
```
OPEN ──(first helper accepts)──> ACTIVE ──(Resolved tapped / auto-close)──> CLOSED
  │                                                                          ^
  └──────────(cancel within app is NOT possible after raise; Resolved/auto-close)┘
```
- `OPEN`: no helper has accepted yet.
- `ACTIVE`: at least one helper accepted.
- `CLOSED`: finished. `closeReason` = `RESOLVED` | `AUTO_CLOSED`.

### 8.2 Timeline (constants in `packages/shared/src/constants.ts`)
| Time after raise | What happens | Constant |
|---|---|---|
| 0 s | Ring all **personal helpers** of the household (if Available or not — personal helpers are always rung). Notify all family members "SOS raised". | — |
| 30 s | If fewer than `MAX_ACCEPTED` accepted: ring approved, Available helpers within **500 m** who were not already rung. | `STAGE2_DELAY_S = 30`, `RADIUS_1_M = 500` |
| 90 s | If **zero** accepted: ring approved, Available helpers within **1 km** not already rung (skip helpers with `areaOnly = true`). Notify family "No helper has accepted yet". | `STAGE3_DELAY_S = 90`, `RADIUS_2_M = 1000` |
| 30 min | Auto-close unless `extendedUntil` is in the future. | `AUTO_CLOSE_MIN = 30` |
| "Still in progress" tapped | `extendedUntil = max(now, extendedUntil) + 30 min`. Schedule another auto-close check. | `EXTEND_MIN = 30` |

- Each stage rings at most `MAX_RING_PER_STAGE = 20` helpers, nearest first.
- A helper is never rung twice for the same SOS.
- Do not ring a user who is a resident or family member of the same household as a "helper" (they already get family notifications).

### 8.3 Who is "eligible" to be rung (pure function `isEligibleHelper` in shared)
All must be true:
- `helper.status === 'APPROVED'` (except personal helpers — see 6.5)
- `helper.available === true` (except personal helpers)
- `helper.alarmTested === true` (except personal helpers — they get the alarm even if untested; show a warning on PersonalHelpersScreen if untested)
- has at least one FCM token
- distance(home pin, household pin) ≤ stage radius
- not already rung for this SOS
- `isMock` of the SOS equals the helper's `mockMode` (section 9)

### 8.4 Accepting
- `MAX_ACCEPTED = 5`.
- Accept is a **Firestore transaction** in callable function `acceptSos`:
  1. Read SOS. If `status === 'CLOSED'` → error `sos-closed`.
  2. If `acceptedHelperIds.length >= MAX_ACCEPTED` → error `sos-full`.
  3. If caller already accepted → return success (idempotent).
  4. If caller was not rung for this SOS → error `not-invited`.
  5. Append caller to `acceptedHelperIds`, set `status = 'ACTIVE'`, set `firstAcceptedAt` if empty.
- After commit (outside transaction):
  - Notify household residents + family: "<name> is going".
  - If now `acceptedHelperIds.length === MAX_ACCEPTED`: send "Enough helpers are going, thank you" to all rung helpers who did not accept, and stop further stages.
  - If any accepted helper has `goWithPartner = true` and this is the 2nd+ accept: notify them "<name> is also going".

Reference implementation of the core check (put the pure part in shared, the transaction in functions):
```ts
// packages/shared/src/sos.ts
export type AcceptCheck = 'ok' | 'already' | 'sos-closed' | 'sos-full' | 'not-invited';
export function checkAccept(sos: Pick<Sos,'status'|'acceptedHelperIds'|'rungHelperIds'>, uid: string): AcceptCheck {
  if (sos.status === 'CLOSED') return 'sos-closed';
  if (sos.acceptedHelperIds.includes(uid)) return 'already';
  if (!sos.rungHelperIds.includes(uid)) return 'not-invited';
  if (sos.acceptedHelperIds.length >= MAX_ACCEPTED) return 'sos-full';
  return 'ok';
}
```

### 8.5 Other helper actions
- **Withdraw** ("Can't make it"): remove from `acceptedHelperIds`; if list becomes empty, `status` goes back to `OPEN`; notify family "<name> cannot come". Stages continue if they had not finished.
- **Arrived**: set `arrivedAt[helperId] = now`; notify family; stop sharing live location.
- **Resolved**: any resident, family member or accepted helper can close. `status = CLOSED`, `closeReason = RESOLVED`. Notify everyone involved.

### 8.6 Rate limits (abuse protection)
- Real SOS: max `MAX_SOS_PER_DAY = 3` per household per rolling 24 h. 4th attempt → error `rate-limited`; UI shows "Too many SOS today. Please call 108 directly." with a Call 108 button.
- Only one non-closed SOS per household at a time. Raising again while one is open just opens the existing ActiveSosScreen.
- Mock SOS: no limit.

### 8.7 Never block 108
The dialer must open even if `raiseSos` fails (no internet, rate-limited, error). Order: start `raiseSos` call → immediately open dialer → show result when back in app.

---

## 9. Mock (practice) mode

Purpose: test the full flow with two phones without disturbing real people.

- Toggle in Settings: **Mock mode**. When ON, a large orange **PRACTICE** banner is shown on every screen.
- Mock SOS = SOS created while mock mode is ON. Stored with `isMock: true`.
- A mock SOS rings **only** users who have mock mode ON, whose home pin is within 1 km, regardless of helper status, vouching, Available or alarmTested.
- A real SOS never rings a user who has mock mode ON. (So: turn mock mode OFF to be a real helper.)
- Mock SOS does not count toward rate limits and is excluded from stats.
- Typical test: Phone A (mock, resident) raises SOS → Phone B (mock, helper) alarm rings → B taps Going → A sees "B is going".

---

## 10. Architecture

### 10.1 Stack (all free)
| Part | Technology |
|---|---|
| Mobile app | **Expo (React Native) with TypeScript**, using a **development build** (EAS local build or `npx expo run:android`). NOT Expo Go. |
| Native alarm | A local **Expo module written in Kotlin** in `apps/mobile/modules/alarm` |
| Navigation | `@react-navigation/native` + native stack |
| Firebase SDK | `@react-native-firebase/app`, `/auth`, `/firestore`, `/functions`, `/messaging`, `/crashlytics` |
| Maps | `react-native-maps` with Google provider (Maps SDK for Android) |
| Location | `expo-location` (foreground only) |
| Speech | `expo-speech` |
| i18n | `i18next` + `react-i18next` |
| Backend | Firebase Cloud Functions **v2**, Node 20, TypeScript |
| Delayed jobs | Cloud Functions **task queues** (`onTaskDispatched`) for the 30 s / 90 s / 30 min timers |
| Database | Cloud Firestore |
| Geo queries | `geofire-common` (geohash) |
| Tests | Jest, `@firebase/rules-unit-testing`, Firebase Emulator Suite |
| Monorepo | **npm workspaces** (no Turborepo/Nx) |

- **Min Android: 14 (API 34).** `minSdkVersion = 34`. Test devices: Samsung and Redmi.

### 10.2 Repository layout
```
/
├─ apps/
│  └─ mobile/                 # Expo app
│     ├─ src/
│     │  ├─ screens/          # one file per screen (names from section 7)
│     │  ├─ components/
│     │  ├─ navigation/
│     │  ├─ services/         # firebase wrappers: auth.ts, sos.ts, helpers.ts, households.ts, push.ts
│     │  ├─ i18n/             # en.json, te.json, index.ts
│     │  └─ theme/            # sizes, colours, elder-mode scale
│     └─ modules/alarm/       # Kotlin Expo module
├─ functions/                 # Cloud Functions
│  └─ src/
│     ├─ callable/            # raiseSos.ts, acceptSos.ts, ...
│     ├─ tasks/               # sosStage.ts, sosAutoClose.ts
│     ├─ triggers/            # onHelperSignup.ts, ...
│     ├─ scheduled/           # retention.ts
│     └─ lib/                 # fcm.ts, geo.ts, firestore.ts
├─ packages/
│  └─ shared/                 # pure TS: types, constants, logic. NO Firebase imports.
│     └─ src/ types.ts constants.ts sos.ts geo.ts vouch.ts
├─ firebase/
│  ├─ firestore.rules
│  ├─ firestore.indexes.json
│  └─ firebase.json
├─ scripts/
│  └─ set-admin.ts            # node script: give a phone number the admin claim (uses local service account, never committed)
├─ docs/
│  ├─ decisions/              # ADR files (section 20)
│  └─ open-questions.md
├─ requirements.md            # this file
└─ package.json               # npm workspaces root
```

### 10.3 Big picture flow
```
[Patient phone] --raiseSos (callable)--> [Cloud Function]
      |                                      | writes sos doc, finds personal helpers
      | opens dialer tel:108                 | sends FCM data msg (type=SOS_ALERT, priority=high)
      v                                      | enqueues task: stage2 at +30s, stage3 at +90s, autoClose at +30min
                                             v
                                   [Helper phones] --FCM--> background handler --> Kotlin alarm module
                                             | full-screen AlarmScreen
                                             | Going --> acceptSos (callable, transaction)
                                             v
                                   [Family phones] <-- FCM notifications on each change
```
**Principle:** all writes to SOS, vouching, and helper status go through **Cloud Functions**. Clients only write their own profile fields and their own live-location doc. This keeps security rules simple and logic in one tested place.

---

## 11. Data model (Firestore)

All timestamps are Firestore `Timestamp`. Put these interfaces in `packages/shared/src/types.ts` (use `Date`/`number` wrappers as needed for the pure layer).

```ts
type Lang = 'en' | 'te';
type HelperStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED';
type HelperTag = 'NEIGHBOUR' | 'GUARD' | 'SHOP_OWNER' | 'DRIVER' | 'YOUTH' | 'MEDICAL';
type HelpType = 'HELP_NEEDED' | 'LIFT' | 'DRIVE' | 'SIT_WITH';
type SosStatus = 'OPEN' | 'ACTIVE' | 'CLOSED';

// users/{uid}   — private to the user (and functions)
interface User {
  uid: string;
  phone: string;                 // E.164, from auth
  name: string;
  lang: Lang;
  elderMode: boolean;
  mockMode: boolean;
  homePin: { lat: number; lng: number } | null;
  geohash: string | null;        // geofire-common, precision 9
  colonyName: string | null;
  fcmTokens: string[];           // max 5, newest kept
  helper: {
    status: HelperStatus;
    tags: HelperTag[];
    areaOnly: boolean;           // never ring at 1 km stage
    goWithPartner: boolean;
    available: boolean;
    alarmTested: boolean;
    vouchedBy: { uid: string; name: string; at: Timestamp }[];
    vouchBlockedUntil: Timestamp | null;
  };
  householdIds: string[];        // as resident
  familyOfHouseholdIds: string[];// as family member
  createdAt: Timestamp;
}

// helperDirectory/{uid}  — public-safe subset, written ONLY by functions
interface HelperDirectoryEntry {
  uid: string; name: string; tags: HelperTag[]; colonyName: string;
  status: HelperStatus; vouchedByNames: string[];
}

// households/{hid}
interface Household {
  id: string;
  name: string;                  // e.g. "Lakshmi's home"
  residentIds: string[];
  familyIds: string[];           // max 5
  personalHelperIds: string[];   // max 10 (accepted invites only)
  addressLine: string; landmark: string | null; colonyName: string;
  homePin: { lat: number; lng: number }; geohash: string;
  floor: number | null; liftAvailable: boolean | null;
  needsCarrying: boolean | null; carAvailable: boolean | null;
  medicalNotes: string | null;   // max 500
  bloodGroup: string | null;
  preferredHospital: string | null;
  patientAge: number | null;
  createdAt: Timestamp;
}

// invites/{code}  — 6-digit, 24h
interface Invite {
  code: string; householdId: string;
  kind: 'FAMILY' | 'RESIDENT' | 'PERSONAL_HELPER';
  targetPhone: string | null;    // required for PERSONAL_HELPER
  createdBy: string; expiresAt: Timestamp; usedBy: string | null;
}

// sos/{sosId}  — summary readable by rung helpers
interface Sos {
  id: string;
  householdId: string;
  raisedBy: string;
  isMock: boolean;
  status: SosStatus;
  closeReason: 'RESOLVED' | 'AUTO_CLOSED' | null;
  helpType: HelpType;
  colonyName: string;
  patientAge: number | null;
  stage: 1 | 2 | 3;
  rungHelperIds: string[];
  acceptedHelperIds: string[];
  arrivedAt: Record<string, Timestamp>;
  createdAt: Timestamp; firstAcceptedAt: Timestamp | null;
  extendedUntil: Timestamp | null; closedAt: Timestamp | null;
}

// sos/{sosId}/private/details  — ONLY household members, family, ACCEPTED helpers
interface SosPrivate {
  addressLine: string; landmark: string | null;
  homePin: { lat: number; lng: number };
  floor: number | null; liftAvailable: boolean | null;
  needsCarrying: boolean | null; carAvailable: boolean | null;
  medicalNotes: string | null; bloodGroup: string | null; preferredHospital: string | null;
  raisedByPhone: string;
  residentPhones: string[]; familyPhones: { name: string; phone: string }[];
  acceptedHelpers: { uid: string; name: string; phone: string }[];
}

// sos/{sosId}/tracking/{helperUid}  — written by that helper only while ACTIVE and not arrived
interface Tracking { lat: number; lng: number; updatedAt: Timestamp; }

// vouchRequests/{pendingUid}/hidden/{voucherUid}  — "I don't know this person"
// reports/{reportId}
interface Report {
  id: string; reportedUid: string; reporterUid: string;
  reason: 'RUDE' | 'NO_SHOW' | 'UNSAFE' | 'FAKE' | 'OTHER'; text: string;
  sosId: string | null; status: 'OPEN' | 'REVIEWED'; createdAt: Timestamp;
}

// stats/daily/{yyyy-mm-dd}  — anonymous counters only (no ids, no names)
interface DailyStats { sosRaised: number; sosWithAccept: number; medianSecondsToAccept: number | null; }
```

**Why `private/details` is separate:** medical info and address must be visible only to helpers who **accepted**. Firestore rules work per document, so we keep private data in its own document. (Write this as decision ADR-0007.)

**Why `helperDirectory` exists:** clients must never read another user's `users/{uid}` (it contains phone and home pin). The directory holds only safe fields.

---

## 12. Cloud Functions

All callable functions: require auth, validate input (reject unknown fields), return typed results, and throw `HttpsError` with the codes named below. Region: `asia-south1`.

| Name | Type | Input | What it does |
|---|---|---|---|
| `createHousehold` | callable | household fields | Creates household, adds caller as resident (or family if `asFamily: true`). |
| `createInvite` | callable | `{householdId, kind, targetPhone?}` | Caller must be resident/family. Creates 6-digit code, 24 h. |
| `acceptInvite` | callable | `{code}` | Validates, links user. Enforce max 5 family / 10 personal helpers. For PERSONAL_HELPER the caller's phone must equal `targetPhone`. |
| `removeMember` | callable | `{householdId, uid, kind}` | Resident/family only. |
| `signupHelper` | callable | `{tags, areaOnly, goWithPartner}` | Requires home pin. Sets status PENDING (reject if REJECTED/REMOVED). Writes `helperDirectory`. Notifies approved helpers within 1 km (FCM type `VOUCH_REQUEST`). |
| `listPendingNearby` | callable | — | Caller must be APPROVED or admin. Returns pending helpers within 1 km (admin: all), V9 fields only, excluding hidden ones. |
| `vouch` | callable | `{pendingUid}` | Enforce V2–V4, V7 block. Add to `vouchedBy`; if count ≥ `VOUCHES_REQUIRED` → APPROVED; notify the new helper. |
| `hideVouchRequest` | callable | `{pendingUid}` | Writes hidden marker. |
| `setAvailability` | callable | `{available}` | Updates helper.available. |
| `markAlarmTested` | callable | — | Sets helper.alarmTested = true. Called by the app after the user confirms "I heard the test alarm". |
| `raiseSos` | callable | `{householdId, helpType}` | Checks caller is resident/family, rate limits (8.6), one-open rule. Creates `sos` + `private/details`. Rings personal helpers (stage 1). Notifies family. Enqueues `sosStage` (+30 s, stage 2), `sosStage` (+90 s, stage 3), `sosAutoClose` (+30 min). Returns `{sosId}`. |
| `acceptSos` | callable | `{sosId}` | Section 8.4. On success add helper to `private.acceptedHelpers`. |
| `withdrawSos` | callable | `{sosId}` | Section 8.5. |
| `markArrived` | callable | `{sosId}` | Section 8.5. |
| `extendSos` | callable | `{sosId}` | Section 8.2. Enqueue another `sosAutoClose`. |
| `resolveSos` | callable | `{sosId}` | Section 8.5. |
| `reportUser` | callable | `{reportedUid, reason, text, sosId?}` | Creates report. |
| `adminApprove` / `adminReject` | callable | `{uid}` | Admin claim required. |
| `adminRemoveHelper` | callable | `{uid}` | Admin. Sets REMOVED, applies V7 to vouchers, removes from directory. |
| `sosStage` | task queue | `{sosId, stage}` | If SOS closed → exit. Stage 2: if accepted < MAX → ring eligible within 500 m. Stage 3: if accepted == 0 → ring eligible within 1 km (skip areaOnly) + notify family "no helper yet". Update `stage`, `rungHelperIds`. |
| `sosAutoClose` | task queue | `{sosId}` | If closed → exit. If `extendedUntil > now` → exit (a newer task exists). Else close with AUTO_CLOSED, notify all. |
| `retention` | scheduled (daily 03:00 IST) | — | Delete `sos` docs (and subcollections) older than 90 days. Before deleting, make sure the day's `stats/daily` counters are already updated. |

### 12.1 FCM message types
All pushes to helpers for alarms are **data-only** messages, `android.priority = "high"`, with a TTL of 120 s for `SOS_ALERT`.

| type | To | Data fields | App behaviour |
|---|---|---|---|
| `SOS_ALERT` | helpers | sosId, helpType, distanceM, colonyName, patientAge, isMock | Start alarm (section 14) |
| `SOS_COVERED` | rung non-accepted helpers | sosId | Stop alarm if ringing, show "Enough helpers are going" |
| `SOS_CLOSED` | everyone involved | sosId, closeReason | Stop alarm, normal notification |
| `SOS_UPDATE` | residents + family (+ accepted helpers) | sosId, text key + params | Normal high-importance notification |
| `VOUCH_REQUEST` | approved helpers within 1 km | pendingUid, name | Normal notification → VouchRequestScreen |
| `HELPER_APPROVED` | new helper | — | Normal notification |

`distanceM` is computed **on the server** from household pin to helper home pin and rounded to 50 m. The helper never receives the household pin until they accept.

### 12.2 Geo query (in `functions/src/lib/geo.ts`)
Use `geofire-common`: `geohashQueryBounds([lat,lng], radiusM)` → query `users` where `geohash` in each range and `helper.status == 'APPROVED'` (or mockMode for mock SOS) → filter by real distance with `distanceBetween` → apply `isEligibleHelper` → sort nearest first → take `MAX_RING_PER_STAGE`. Add the needed composite indexes to `firestore.indexes.json`.

---

## 13. Security rules (`firebase/firestore.rules`)

Rules must implement exactly this. Write rules tests for every line (section 18).

| Path | Read | Write |
|---|---|---|
| `users/{uid}` | only `uid == auth.uid` | only `uid == auth.uid`, and only fields: `name, lang, elderMode, mockMode, homePin, geohash, colonyName, fcmTokens`. The `helper` map, `householdIds`, `familyOfHouseholdIds` are function-only. |
| `helperDirectory/{uid}` | any signed-in user | none (functions only) |
| `households/{hid}` | residents + family of that household | residents + family, only profile fields (not `residentIds`, `familyIds`, `personalHelperIds`) |
| `invites/{code}` | none | none |
| `sos/{id}` | residents + family of the household, and users in `rungHelperIds` | none |
| `sos/{id}/private/details` | residents + family of the household, and users in `acceptedHelperIds` | none |
| `sos/{id}/tracking/{helperUid}` | residents + family of the household, and accepted helpers | only `helperUid == auth.uid`, and only if auth.uid in `acceptedHelperIds` and SOS status != CLOSED |
| `vouchRequests/**`, `reports/**`, `stats/**` | none (admin reads via functions) | none |

Default: deny everything else.

---

## 14. The alarm (making the helper's phone ring)

This is the hardest technical part. Follow exactly.

### 14.1 Receiving
- Use `@react-native-firebase/messaging` `setBackgroundMessageHandler` (registered in `index.ts` before the app component) **and** `onMessage` for the foreground.
- If `data.type === 'SOS_ALERT'` → call `Alarm.start({...data})` from the Kotlin module.
- If `data.type` is `SOS_COVERED` or `SOS_CLOSED` → call `Alarm.stop(sosId)`.

### 14.2 Kotlin module `modules/alarm` — API
```ts
Alarm.start(payload: { sosId: string; title: string; body: string; isMock: boolean }): Promise<void>
Alarm.stop(sosId: string): Promise<void>
Alarm.test(): Promise<void>                 // same as start with a test payload, auto-stops after 15 s
Alarm.getSetupStatus(): Promise<{
  notificationsAllowed: boolean;            // POST_NOTIFICATIONS
  fullScreenAllowed: boolean;               // NotificationManager.canUseFullScreenIntent()
  dndAccessGranted: boolean;                // isNotificationPolicyAccessGranted
  ignoringBatteryOptimizations: boolean;    // PowerManager.isIgnoringBatteryOptimizations
}>
Alarm.openSettings(which: 'notifications' | 'fullScreen' | 'dnd' | 'battery' | 'autostart'): Promise<void>
```

### 14.3 Kotlin module — behaviour
1. Create a notification channel `sos_alarm`, importance HIGH, `setBypassDnd(true)`, sound = default alarm URI with `AudioAttributes.USAGE_ALARM`, vibration pattern long.
2. `start()` posts a notification on `sos_alarm` with `setFullScreenIntent(pendingIntentToMainActivity, true)`, category `CATEGORY_ALARM`, ongoing, and an intent extra `sosId` so the JS app opens **AlarmScreen**.
3. Also play the sound in a loop with `MediaPlayer`/`Ringtone` using `USAGE_ALARM` (so it plays when the ringer is silent) for max **60 seconds**, plus vibration.
4. `stop()` cancels the notification, sound and vibration.
5. If full-screen intent permission is NOT granted, the heads-up notification on the alarm channel is the fallback (still loud).
6. Manifest permissions: `POST_NOTIFICATIONS`, `USE_FULL_SCREEN_INTENT`, `ACCESS_NOTIFICATION_POLICY`, `VIBRATE`, `WAKE_LOCK`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Add via an Expo config plugin inside the module.
7. Main activity must show over the lock screen when opened from the alarm: `setShowWhenLocked(true)` and `setTurnScreenOn(true)` only while AlarmScreen is shown.

### 14.4 Alarm setup checklist (on HelperHomeScreen)
Show each item with ✅/❌ from `getSetupStatus()` and a "Fix" button calling `openSettings`:
1. Allow notifications
2. Allow full-screen alerts
3. Allow "Do Not Disturb" access
4. Battery: no restrictions
5. Auto-start (show only on Xiaomi/Redmi/POCO: check `Build.MANUFACTURER`); open MIUI autostart screen if available, else app settings. This item cannot be auto-checked; user ticks "Done".

Then **Test alarm** → rings → user taps "I heard it" → `markAlarmTested`. Until tested, an APPROVED helper is NOT rung (8.3). Re-check setup status on every app open; if any of items 1–4 becomes ❌, show a red banner.

### 14.5 Must be verified on a real device (manual test, write results in `docs/device-tests.md`)
App killed, screen locked, phone on silent, phone on DND, overnight idle (Doze) — on one Samsung and one Redmi with Android 14+.

---

## 15. Location and maps

- **Home pin only** for finding helpers. No background location. No continuous GPS.
- **Live location during help:** after a helper taps Going, while `HelperActiveSosScreen` is open (foreground), write the helper's location to `sos/{id}/tracking/{uid}` every **15 s** or every **30 m** moved (whichever first). Stop when: Arrived, Withdraw, SOS closed, or screen left. Use `expo-location` foreground `watchPositionAsync`. No foreground service in v1.
- Patient/family see accepted helpers' tracking points on a `react-native-maps` map.
- "Open in Google Maps" uses `Linking.openURL('geo:lat,lng?q=lat,lng')` — free.
- Maps API key: Android-restricted key for **Maps SDK for Android only**, stored in `apps/mobile/.env` (not committed) and injected through `app.config.ts`.

---

## 16. Language, elder mode, accessibility

- i18next with `en.json` and `te.json`. Keys are nested by screen, e.g. `sos.hold`, `vouch.confirm`. Every key must exist in both files (write a test that compares key sets).
- Telugu strings: the agent writes a first version; mark the file with a top comment `// Needs review by a native Telugu speaker`.
- **Elder mode** (default ON for residents): font scale ×1.4, min touch target 64 dp, max 3 actions per screen on SOS screens, high contrast.
- All buttons have accessibility labels. SOS button: `accessibilityHint` explains "Hold for 5 seconds".
- TTS on ActiveSosScreen uses the selected language (`te-IN` / `en-IN`); if Telugu voice is missing, fall back to English.

---

## 17. Cost rules (must stay ₹0 in dev)

| Item | Rule |
|---|---|
| Firebase project | One project: `daivam-dev`. Blaze plan is needed for Cloud Functions/task queues; set a **budget alert at ₹100**. Document the setup steps in `docs/setup.md`. |
| Phone auth | Use **Firebase test phone numbers** only (Console → Auth → Phone → test numbers). No real SMS in dev. |
| Maps | Maps SDK for Android (map display + pin) only. **Do not use** Places, Geocoding, Directions or Distance Matrix APIs. Set a daily quota cap in Google Cloud console. |
| Storage | Not used in v1. |
| Analytics | Not used. Crashlytics only. |
| Other services | None. No Twilio/Exotel/SMS providers. |
| Local development | Use the **Firebase Emulator Suite** for all development and tests. Deploy to `daivam-dev` only for real-device testing. |

---

## 18. Testing requirements

| Layer | Tool | Must cover |
|---|---|---|
| `packages/shared` | Jest | `checkAccept` (all 5 results), `isEligibleHelper` (each condition true/false, personal helper exceptions, mock rules), stage timing helper, vouch rules V2–V4, V7, distance rounding, rate-limit check, i18n key parity |
| `functions` | Jest + emulator | raiseSos (normal, rate-limited, one-open rule, not a member), acceptSos (concurrency: 7 parallel accepts → exactly 5 succeed), withdraw → status back to OPEN, sosStage (closed → no-op; stage 2 skips already rung; stage 3 only if zero accepted; areaOnly skipped), sosAutoClose (extended → no-op), vouch (approve after 1; blocked voucher rejected; distance > 1 km rejected), adminRemoveHelper applies V7, retention deletes old only |
| Rules | `@firebase/rules-unit-testing` | Every row of section 13, allowed and denied |
| Mobile | Jest + React Native Testing Library | SOS hold (released before 5 s → nothing), countdown cancel → no `raiseSos` call, dialer opens even if `raiseSos` rejects |
| Manual | `docs/device-tests.md` | Section 14.5 matrix + full mock flow with 2 phones |

Root `npm test` runs all workspaces. Emulator tests run with `firebase emulators:exec`.

---

## 19. Milestones and acceptance criteria

Do them **in order**. At the end of each milestone: all tests pass, decision files written, and a short note appended to `docs/progress.md` (what was done, what is left).

### M0 — Repo and foundations
- npm workspaces monorepo as in 10.2; TypeScript strict; ESLint + Prettier.
- `packages/shared` with types, constants (all constants named in this file), empty function stubs + tests.
- Firebase emulator config; `firestore.rules` deny-all placeholder; `docs/setup.md`.
- Decision files ADR-0001 … ADR-0015 from section 20.3 written.
- ✅ Accept: `npm test` passes; emulator starts; `npx expo run:android` launches a blank app on a device.

### M1 — Auth, profile, household, family
- Screens 1–8 (except personal helpers invite acceptance UI can be basic).
- Functions: createHousehold, createInvite, acceptInvite, removeMember.
- Rules for users, households, invites.
- ✅ Accept: sign in with a test number; create household with pin; invite code links a second account as family; family can edit household profile; rules tests pass.

### M2 — Helpers and vouching
- Screens 9–11, 17, 18 (Pending + Reports tabs).
- Functions: signupHelper, listPendingNearby, vouch, hideVouchRequest, setAvailability, reportUser, adminApprove, adminReject, adminRemoveHelper. `scripts/set-admin.ts`.
- ✅ Accept: admin approves first helper; that helper vouches a second (within 1 km) → second becomes APPROVED; a helper 2 km away cannot vouch; removing a helper blocks its voucher for 30 days; pending list never shows phone or pin.

### M3 — Alarm
- Kotlin module (section 14), setup checklist, Test alarm, markAlarmTested, FCM token registration (save to `users.fcmTokens`).
- ✅ Accept: test alarm rings on silent and on lock screen on Samsung and Redmi (Android 14+); results written in `docs/device-tests.md`.

### M4 — SOS core
- Screens 12–15. Functions: raiseSos, acceptSos, withdrawSos, markArrived, extendSos, resolveSos, sosStage, sosAutoClose. FCM types SOS_ALERT, SOS_COVERED, SOS_CLOSED, SOS_UPDATE.
- ✅ Accept: hold 5 s + 10 s countdown → dialer opens with 108 and helpers are rung in stages at 0/30/90 s; 6th accept gets "Enough helpers"; withdraw returns to OPEN when last helper leaves; auto-close at 30 min; "Still in progress" extends; rate limit works; concurrency test passes.

### M5 — After accept: contact, location, family
- Private details visible only after accept; phone numbers both ways; live tracking (section 15); family notifications (7.6); ActiveSosScreen map.
- ✅ Accept: non-accepted helper cannot read private details (rules test); family sees the helper moving on the map; tracking stops on Arrived.

### M6 — Mock mode
- Section 9 fully.
- ✅ Accept: two phones in mock mode complete the full flow; a phone with mock OFF is never rung by a mock SOS and vice versa; PRACTICE banner visible on all screens.

### M7 — Language, elder mode, retention, polish
- Telugu strings, elder mode, TTS, retention job, stats counters, Settings (delete account).
- ✅ Accept: whole app usable in Telugu; i18n parity test passes; retention test passes; no TODOs left without an entry in `docs/open-questions.md`.

---

## 20. Decision log (`docs/decisions/`)

### 20.1 Rule
One Markdown file per decision: `docs/decisions/NNNN-short-title.md` (4-digit number, increasing). Never edit an old decision's choice; if it changes, write a new file that says "Supersedes NNNN" and mark the old one "Superseded by NNNN".

### 20.2 Template (copy exactly, keep it short and simple English)
```md
# NNNN — <Title>
- Status: Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Problem
<What problem are we solving? 2–4 lines.>

## Options considered
1. <Option A> — <pros / cons>
2. <Option B> — <pros / cons>

## Decision
<What we chose.>

## Why
<Reason in 2–5 lines.>

## Impact on future phases
<What a future developer must know. E.g. "When we add iOS, ...">
```

### 20.3 Decisions already made — write these files in M0
| # | Title | Decision (summary) |
|---|---|---|
| 0001 | Android only, min API 34 | Pilot phones are Samsung/Redmi on Android 14+. Keep code iOS-ready (no Android-only logic outside the alarm module). |
| 0002 | Expo + Kotlin alarm module | Reuse TypeScript skills; native code only where Android needs it. |
| 0003 | Firebase as backend | Free push + database + functions, no server to run. |
| 0004 | All sensitive writes via Cloud Functions | One tested place for logic; simple security rules. |
| 0005 | Fixed home pin, no background location | Privacy, battery, no Play background-location review. Weakness: only finds helpers at home (fine at night). |
| 0006 | Vouching with 1 approval, admin seeds new areas | Blocks strangers; 1 vouch keeps a small pilot moving. Constant can be raised to 2 later. |
| 0007 | Private SOS details in a separate document | Firestore rules are per document; medical info/address only for accepted helpers. |
| 0008 | Escalation 0 s / 30 s / 90 s, 500 m → 1 km | Personal helpers first, then nearby, then wider + family. |
| 0009 | Max 5 accepted helpers | Lifting may need several people; more than 5 crowds the house. |
| 0010 | Auto-close 30 min with "Still in progress" | Avoids stuck SOS; hospital trips can extend. |
| 0011 | Show real phone numbers after accept (no masking) | Masking costs money; numbers only after mutual commitment. |
| 0012 | Task queues for timers | Exact 30 s / 90 s / 30 min delays without a server or polling. |
| 0013 | Mock mode isolated from real users | Safe testing with two phones; real users never disturbed. |
| 0014 | Free-only services in dev | Test phone numbers, Maps SDK only, no Places/SMS/Storage; ₹100 budget alert. |
| 0015 | Households need no vouching; rate-limited instead | An elder must never wait for approval; 3 SOS/day + logging limit abuse. |

Add new decision files during implementation whenever rule 2.2 applies (examples: Kotlin alarm workaround details, geohash precision, index design, how FCM tokens are cleaned).

---

## 21. Open questions (do NOT build; listed so you don't guess)
These are known and parked. Do not implement them. If your work touches them, note it in `docs/open-questions.md`.
1. Real SMS OTP provider and cost for production.
2. Play Store: personal vs organization account, store name, closed-testing plan.
3. Legal disclaimer and helper consent text (needs a lawyer).
4. Open-source license file — default AGPL-3.0; confirm before making the repo public.
5. Integration with 108 / 112 control rooms.
6. Production Firebase project and environments.
7. iOS.
