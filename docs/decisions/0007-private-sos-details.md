# 0007 — Private SOS details in a separate document

- Status: Accepted
- Date: 2026-10-19

## Problem

Medical notes, address and phone numbers must be visible only to helpers who accepted. Firestore rules grant access per document, not per field.

## Options considered

1. Separate `sos/{id}/private/details` document — clean rules / two reads.
2. One document with field masking in functions — clients could still read the full doc.

## Decision

The public summary is `sos/{id}` (readable by rung helpers). Private data is in `sos/{id}/private/details` (readable only by household, family and accepted helpers).

## Why

Per-document rules are the only reliable way to hide fields in Firestore.

## Impact on future phases

Any new sensitive SOS field goes into `private/details`, never into `sos/{id}`.
