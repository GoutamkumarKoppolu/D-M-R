# 0014 — Free-only services in dev

- Status: Accepted
- Date: 2026-10-19

## Problem

The project is non-profit. Dev must cost ₹0.

## Options considered

1. Free services only, with a budget alert.
2. Paid services for convenience (Places, SMS) — cost.

## Decision

Firebase test phone numbers, Maps SDK for Android only, no Places/Geocoding/SMS/Storage, ₹100 budget alert.

## Why

Keeps dev free and avoids surprise bills.

## Impact on future phases

Production SMS OTP is an open question.
