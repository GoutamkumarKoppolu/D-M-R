# Progress

## M0 — Repo and foundations (2026-10-19)

Done:

- npm workspaces: `apps/mobile` (Expo SDK 58, blank, minSdk 34), `functions` (empty), `packages/shared`.
- TypeScript strict everywhere; ESLint + Prettier at the root.
- `packages/shared`: types (section 11), all constants, pure logic `checkAccept`, `isEligibleHelper`, stage timing, rate limit, vouch rules V2–V4/V7/V8, distance + rounding. 50 unit tests pass.
- Firebase config in `firebase/` (emulators: auth, firestore, functions, tasks), deny-all rules, empty indexes.
- ADR-0001 … 0018, `docs/setup.md`.

Not verified on this machine (needs a human):

- Emulator start — machine has no Java and no logged-in Firebase CLI.
- `npx expo run:android` on a device — no Android SDK/device here. `expo-doctor` passes 20/20.

Left: M1 onwards.
