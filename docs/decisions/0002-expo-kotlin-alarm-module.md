# 0002 — Expo + Kotlin alarm module

- Status: Accepted
- Date: 2026-10-19

## Problem

We need a cross-platform-ready UI and one piece of deep Android behaviour (a loud alarm on a locked, silent phone).

## Options considered

1. Expo (dev build) + local Kotlin Expo module — TypeScript for 95% of code, native only for the alarm.
2. Fully native Kotlin app — full control / no shared TS with functions, slower to build.
3. Expo Go — easiest / cannot load custom native code.

## Decision

Expo with a development build (`npx expo run:android`), and a local Kotlin Expo module in `apps/mobile/modules/alarm`.

## Why

Reuses TypeScript skills and shares types with Cloud Functions. Native code is limited to where Android needs it.

## Impact on future phases

Expo Go will never work for this app. Every native change needs a rebuild.
