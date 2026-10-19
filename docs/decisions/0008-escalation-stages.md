# 0008 — Escalation 0 s / 30 s / 90 s, 500 m to 1 km

- Status: Accepted
- Date: 2026-10-19

## Problem

We want the most trusted and nearest people first, without waiting too long if nobody answers.

## Options considered

1. Staged: personal helpers 0 s, 500 m at 30 s, 1 km + family at 90 s.
2. Ring everyone at once — fastest / disturbs many people for every SOS.

## Decision

Constants `STAGE2_DELAY_S = 30`, `STAGE3_DELAY_S = 90`, `RADIUS_1_M = 500`, `RADIUS_2_M = 1000`, max 20 rung per stage.

## Why

Personal helpers are trusted and fastest. Widening slowly limits disturbance while keeping total wait under 2 minutes.

## Impact on future phases

Timings are constants in `packages/shared/src/constants.ts`; change them with a new decision.
