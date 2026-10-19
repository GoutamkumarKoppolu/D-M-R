# 0012 — Task queues for timers

- Status: Accepted
- Date: 2026-10-19

## Problem

We need exact delays of 30 s, 90 s and 30 min after an SOS.

## Options considered

1. Cloud Functions task queues (`onTaskDispatched`) — exact delay, no server.
2. Scheduled function polling every minute — imprecise, wasteful.
3. Client timers — unreliable if the phone dies.

## Decision

Use task queues for `sosStage` and `sosAutoClose`.

## Why

Exact delays without running a server or polling.

## Impact on future phases

Tasks must be idempotent and re-check SOS state, since a task may run after the SOS changed.
