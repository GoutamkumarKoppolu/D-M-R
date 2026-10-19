# 0006 — Vouching with 1 approval, admin seeds new areas

- Status: Accepted
- Date: 2026-10-19

## Problem

A stranger who becomes a helper learns which house has a weak, alone elder. We must block strangers without stopping the pilot.

## Options considered

1. 1 vouch from an approved helper within 1 km; admin approves first helpers — simple, blocks strangers.
2. 2+ vouches — safer / slow in a small pilot.
3. No vouching / ID checks — easy / unsafe or costly.

## Decision

`VOUCHES_REQUIRED = 1`. Admin approves when no approved helper is nearby. Vouchers lose vouching rights for 30 days if their helper is removed (V7).

## Why

One vouch keeps a small pilot moving. Voucher accountability discourages careless vouching.

## Impact on future phases

Raise `VOUCHES_REQUIRED` to 2 later by changing the constant; `vouch` already counts `vouchedBy`.
