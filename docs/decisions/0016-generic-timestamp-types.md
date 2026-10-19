# 0016 — Generic timestamp type in shared types

- Status: Accepted
- Date: 2026-10-19

## Problem

`packages/shared` must not import Firebase, but section 11 types use Firestore `Timestamp`.

## Options considered

1. Interfaces generic over the timestamp type, default `Date` — one set of types / slightly longer type names.
2. Two copies of each interface — drift.

## Decision

Each interface with timestamps is `Name<TS = Date>`. Pure code uses `Date`; functions use `Name<Timestamp>`.

## Why

One source of truth for shapes, with no Firebase import in shared.

## Impact on future phases

Convert `Timestamp` to `Date` (`.toDate()`) before calling shared logic.
