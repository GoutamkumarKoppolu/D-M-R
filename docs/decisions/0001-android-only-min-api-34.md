# 0001 — Android only, min API 34

- Status: Accepted
- Date: 2026-10-19

## Problem

Pilot users have Samsung and Redmi phones. Supporting old Android versions and iOS would slow down v1.

## Options considered

1. Android 14+ only — small test matrix; modern notification and full-screen-intent APIs / excludes older phones.
2. Android 8+ — more users / many permission edge cases to handle and test.
3. Android + iOS — more users / iOS cannot ring a loud alarm without critical-alert entitlement.

## Decision

`minSdkVersion = 34` (set with `expo-build-properties` in `apps/mobile/app.config.ts`). No iOS build in v1.

## Why

Pilot phones are Android 14+. One API level means one set of alarm behaviours to verify.

## Impact on future phases

Keep all logic outside `modules/alarm` platform-neutral so iOS can be added later. When adding iOS, the alarm module needs a separate design (critical alerts).
