# 0009 — Max 5 accepted helpers

- Status: Accepted
- Date: 2026-10-19

## Problem

Lifting a patient may need several people, but too many crowd the house.

## Options considered

1. Max 5 — enough to lift and drive.
2. Max 1–2 — may not be enough to carry.
3. Unlimited — crowding.

## Decision

`MAX_ACCEPTED = 5`, enforced in a Firestore transaction in `acceptSos`.

## Why

Five people can carry a patient down stairs and drive. More is not useful.

## Impact on future phases

Concurrency test: 7 parallel accepts must give exactly 5 successes.
