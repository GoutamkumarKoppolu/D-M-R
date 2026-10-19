# 0011 — Show real phone numbers after accept (no masking)

- Status: Accepted
- Date: 2026-10-19

## Problem

Patient and helper need to talk. Number masking services cost money.

## Options considered

1. Show real numbers after accept — free / privacy cost.
2. Masked calling (Exotel/Twilio) — private / paid.

## Decision

Phone numbers are shown both ways only after a helper accepts.

## Why

Numbers are shared only after a mutual commitment, and only with vouched helpers.

## Impact on future phases

If masking is added later, only `private/details` and the call buttons change.
