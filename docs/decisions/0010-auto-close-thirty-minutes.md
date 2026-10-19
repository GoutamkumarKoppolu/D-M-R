# 0010 — Auto-close 30 min with "Still in progress"

- Status: Accepted
- Date: 2026-10-19

## Problem

An SOS that nobody closes stays open forever and blocks new SOS for the household.

## Options considered

1. Auto-close at 30 min, extendable by 30 min — no stuck SOS.
2. Manual close only — stuck SOS.

## Decision

`AUTO_CLOSE_MIN = 30`, `EXTEND_MIN = 30`. `extendedUntil = max(now, extendedUntil) + 30 min`.

## Why

Hospital trips can take longer, so users can extend. Otherwise the SOS closes itself.

## Impact on future phases

Each extend enqueues another `sosAutoClose`; old tasks exit if `extendedUntil` is in the future.
