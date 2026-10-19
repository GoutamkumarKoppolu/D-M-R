# 0015 — Households need no vouching; rate-limited instead

- Status: Accepted
- Date: 2026-10-19

## Problem

An elder in danger must never wait for approval, but SOS could be abused.

## Options considered

1. No vouching for households, rate limits — fast / some abuse possible.
2. Vouch households too — safer / dangerous delay.

## Decision

Households need no approval. Max 3 real SOS per household per rolling 24 h; one open SOS at a time.

## Why

Help must never be blocked. Rate limits and logging limit abuse.

## Impact on future phases

108 is never blocked: the dialer opens even if `raiseSos` fails.
