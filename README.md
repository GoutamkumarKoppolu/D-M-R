# Daivam Manushya Roopena

> 🚧 **Development in progress.** The app is not ready to use yet. Milestone M0 (repo and foundations) is done; M1 is next. See [docs/progress.md](docs/progress.md).

One press of an SOS button opens the 108 dialer and rings trusted neighbours within 500 m so they can come and help.

A free, non-profit, open-source app. Android only in v1.

## How it works

1. An elder (or family in another city) holds the big red **SOS** button. A 10-second cancel countdown runs.
2. The phone dialer opens with **108** filled in.
3. The elder's personal helpers get a loud alarm straight away. 30 seconds later, every approved helper within 500 m gets one too.
4. A helper taps **Going** and only then sees the address, phone number, medical notes and a map pin.
5. Family get notified ("Ravi is going") and can follow the helper on a map until someone taps **Resolved**.

Helpers are approved by vouching from people nearby, so the alarm only reaches trusted neighbours.

## Tech stack

- **Mobile:** Expo (React Native) with a custom Kotlin alarm module, Android 14+ (API 34)
- **Backend:** Firebase — Auth (phone), Firestore, Cloud Functions, task queues
- **Shared logic:** pure TypeScript in `packages/shared`, unit-tested without a phone or Firebase

## Repo layout

```
apps/mobile/       Expo app
functions/         Cloud Functions
packages/shared/   Types, constants and business rules
firebase/          Firestore rules, indexes, emulator config
docs/              Setup, progress, decision records, open questions
requirements.md    The v1 spec — single source of truth
```

## Getting started

```sh
npm install
npm test
npm run typecheck
npm run lint
```

Firebase project, emulators and running on a phone: see [docs/setup.md](docs/setup.md).

## Roadmap

- [x] M0 — Repo and foundations
- [ ] M1 — Auth, profile, household, family
- [ ] M2 — Helpers and vouching
- [ ] M3 — Alarm
- [ ] M4 — SOS core
- [ ] M5 — After accept: contact, location, family
- [ ] M6 — Mock (practice) mode
- [ ] M7 — Language, elder mode, retention, polish

## Docs

- Spec: [requirements.md](requirements.md)
- Setup: [docs/setup.md](docs/setup.md)
- Progress: [docs/progress.md](docs/progress.md)
- Decisions: [docs/decisions/](docs/decisions/)
- Open questions: [docs/open-questions.md](docs/open-questions.md)

## License

Not chosen yet (AGPL-3.0 is the default under consideration).
