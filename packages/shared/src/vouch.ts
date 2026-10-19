import { VOUCH_BLOCK_DAYS, VOUCH_RADIUS_M, VOUCHES_REQUIRED } from './constants';
import type { HelperProfile, HelperStatus } from './types';

export type VouchCheck = 'ok' | 'self' | 'not-pending' | 'not-approved' | 'blocked' | 'too-far';

export interface Voucher {
  uid: string;
  isAdmin: boolean;
  helper: Pick<HelperProfile, 'status' | 'vouchBlockedUntil'>;
}

/** Rules V2, V3, V4, V7 (section 6.4). `distanceM` = voucher home pin to pending home pin. */
export function checkVouch(
  voucher: Voucher,
  pending: { uid: string; status: HelperStatus },
  distanceM: number,
  now: Date,
): VouchCheck {
  if (voucher.uid === pending.uid) return 'self';
  if (pending.status !== 'PENDING') return 'not-pending';
  if (voucher.isAdmin) return 'ok';
  if (voucher.helper.status !== 'APPROVED') return 'not-approved';
  if (voucher.helper.vouchBlockedUntil && voucher.helper.vouchBlockedUntil > now) return 'blocked';
  if (distanceM > VOUCH_RADIUS_M) return 'too-far';
  return 'ok';
}

export function isApprovedByVouches(vouchCount: number): boolean {
  return vouchCount >= VOUCHES_REQUIRED;
}

/** V7: when a helper is removed, each of their vouchers is blocked until this date. */
export function vouchBlockedUntil(now: Date): Date {
  return new Date(now.getTime() + VOUCH_BLOCK_DAYS * 24 * 60 * 60_000);
}

/** V8: removed or rejected users cannot sign up again. */
export function canSignupAsHelper(status: HelperStatus): boolean {
  return status !== 'REMOVED' && status !== 'REJECTED';
}
