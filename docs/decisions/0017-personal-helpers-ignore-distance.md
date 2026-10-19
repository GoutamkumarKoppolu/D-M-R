# 0017 — Personal helpers ignore distance; mock radius 1 km

- Status: Accepted
- Date: 2026-10-19

## Problem

Section 8.3 lists "distance within stage radius" for all helpers but stage 1 (personal helpers) has no radius. Section 9 says mock rings within 1 km.

## Options considered

1. Personal helpers rung at any distance — matches "always rung" (8.2) / a far relative can only call.
2. Apply 500 m to personal helpers — could skip a trusted relative.

## Decision

Stage 1 radius is unlimited. Mock SOS uses 1 km at every stage (`MOCK_RADIUS_M`). Personal helpers still need an FCM token and matching mock mode.

## Why

The household chose these people; even a far relative can call or come. Simplest reading of 6.5 and 8.2.

## Impact on future phases

Listed in `docs/open-questions.md` for review.
