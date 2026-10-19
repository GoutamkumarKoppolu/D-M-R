# 0005 — Fixed home pin, no background location

- Status: Accepted
- Date: 2026-10-19

## Problem

To find nearby helpers we need their location. Continuous GPS drains battery, hurts privacy and needs Play background-location review.

## Options considered

1. Fixed home pin — private, no battery cost / only finds helpers at home.
2. Background live location — finds helpers anywhere / battery, privacy, Play review.

## Decision

Each user drops a fixed home pin. Live location is only used in the foreground by an accepted helper during an SOS.

## Why

Emergencies we target are at night when people are at home. Privacy and battery matter more than coverage in v1.

## Impact on future phases

If daytime coverage becomes a goal, a new decision is needed; it will require background location review.
