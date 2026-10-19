# 0018 — Tooling dependencies not named in requirements

- Status: Accepted
- Date: 2026-10-19

## Problem

Rule 2.1.7: new dependencies need a decision. M0 needed a few packages the requirements do not name.

## Options considered

1. Add the small, standard tooling packages below.
2. Write custom equivalents — more code, more bugs.

## Decision

`ts-jest` (run Jest on TS in shared/functions), `jest-expo` (Jest preset for Expo), `typescript-eslint` + `@eslint/js` (ESLint for TS), `expo-build-properties` (set minSdk 34), `firebase-tools` (emulator CLI, dev only). Distance uses a 6-line haversine in shared instead of adding `geofire-common` there; `geofire-common` will be used only in functions for geohash queries.

## Why

All are official or de-facto standard packages for the named tools. Shared stays dependency-free.

## Impact on future phases

Mobile uses Jest 30 via jest-expo; shared/functions use Jest 29 with ts-jest. Align when ts-jest supports both.
