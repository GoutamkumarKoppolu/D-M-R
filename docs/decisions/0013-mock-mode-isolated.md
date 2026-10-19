# 0013 — Mock mode isolated from real users

- Status: Accepted
- Date: 2026-10-19

## Problem

We need to test the full flow with two phones without ringing real people.

## Options considered

1. Mock flag on SOS + user; mock SOS rings only mock users and vice versa.
2. Separate Firebase project for testing — safe / more setup.

## Decision

`isMock` on SOS must equal the helper's `mockMode`. Mock SOS ignores helper status and is not rate-limited.

## Why

Safe end-to-end testing in the same project; real users are never disturbed.

## Impact on future phases

Mock SOS is excluded from stats.
