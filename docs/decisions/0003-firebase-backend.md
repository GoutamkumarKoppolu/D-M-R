# 0003 — Firebase as backend

- Status: Accepted
- Date: 2026-10-19

## Problem

We need auth, a database, push notifications and server logic with no server to run and no cost in dev.

## Options considered

1. Firebase (Auth, Firestore, Functions, FCM) — free push, managed, emulator suite / vendor lock-in.
2. Own server (Node + Postgres) — full control / must host, secure and pay for it.
3. Supabase — Postgres / no free equivalent of FCM; still need Firebase for push.

## Decision

Firebase: phone Auth, Firestore, Cloud Functions v2, FCM, Crashlytics. One dev project `daivam-dev`.

## Why

FCM is required for Android push anyway. Everything else in the same project keeps setup simple and free at pilot scale.

## Impact on future phases

Cloud Functions and task queues need the Blaze plan (budget alert at ₹100). A production project is an open question.
