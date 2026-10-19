# 0004 — All sensitive writes via Cloud Functions

- Status: Accepted
- Date: 2026-10-19

## Problem

SOS, vouching and helper status must follow strict rules. Enforcing them in Firestore rules alone is hard to test and easy to get wrong.

## Options considered

1. All sensitive writes through callable functions — one tested place for logic / extra latency.
2. Clients write directly, rules validate — fast / complex rules, logic duplicated.

## Decision

Clients write only their own profile fields and their own tracking doc. Everything else goes through Cloud Functions.

## Why

Business logic lives in `packages/shared` (pure, unit-tested) and is called from functions. Rules stay small.

## Impact on future phases

Never add a client-side write to `sos`, `helper`, invites or vouches. Add a callable function instead.
