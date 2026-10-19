import {
  AUTO_CLOSE_MIN,
  EXTEND_MIN,
  MAX_ACCEPTED,
  MAX_SOS_PER_DAY,
  MOCK_RADIUS_M,
  RADIUS_1_M,
  RADIUS_2_M,
  RATE_LIMIT_WINDOW_H,
  STAGE2_DELAY_S,
  STAGE3_DELAY_S,
} from './constants';
import type { HelperProfile, Sos } from './types';

const MIN_MS = 60_000;

export type AcceptCheck = 'ok' | 'already' | 'sos-closed' | 'sos-full' | 'not-invited';

/** Section 8.4. */
export function checkAccept(
  sos: Pick<Sos, 'status' | 'acceptedHelperIds' | 'rungHelperIds'>,
  uid: string,
): AcceptCheck {
  if (sos.status === 'CLOSED') return 'sos-closed';
  if (sos.acceptedHelperIds.includes(uid)) return 'already';
  if (!sos.rungHelperIds.includes(uid)) return 'not-invited';
  if (sos.acceptedHelperIds.length >= MAX_ACCEPTED) return 'sos-full';
  return 'ok';
}

export type Stage = 1 | 2 | 3;

/** Seconds after raise at which a stage rings (section 8.2). */
export function stageDelayS(stage: Stage): number {
  return stage === 1 ? 0 : stage === 2 ? STAGE2_DELAY_S : STAGE3_DELAY_S;
}

/** Ring radius of a stage. Stage 1 (personal helpers) has no radius (ADR-0017). Mock is always 1 km (section 9). */
export function stageRadiusM(stage: Stage, isMock: boolean): number {
  if (isMock) return MOCK_RADIUS_M;
  return stage === 1 ? Infinity : stage === 2 ? RADIUS_1_M : RADIUS_2_M;
}

/** Stage 2 rings while not full; stage 3 only if nobody accepted. */
export function shouldRunStage(stage: 2 | 3, acceptedCount: number): boolean {
  return stage === 2 ? acceptedCount < MAX_ACCEPTED : acceptedCount === 0;
}

/** "Still in progress": extendedUntil = max(now, extendedUntil) + 30 min. */
export function extendUntil(now: Date, extendedUntil: Date | null): Date {
  const base = extendedUntil && extendedUntil > now ? extendedUntil : now;
  return new Date(base.getTime() + EXTEND_MIN * MIN_MS);
}

/** When the first auto-close task runs. */
export function autoCloseAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + AUTO_CLOSE_MIN * MIN_MS);
}

/** sosAutoClose: close unless already closed or extendedUntil is in the future. */
export function shouldAutoClose(sos: Pick<Sos, 'status' | 'extendedUntil'>, now: Date): boolean {
  if (sos.status === 'CLOSED') return false;
  return !(sos.extendedUntil && sos.extendedUntil > now);
}

/** Section 8.6. `recentRealSos` = createdAt of the household's non-mock SOS docs. */
export function isRateLimited(recentRealSos: Date[], now: Date, isMock: boolean): boolean {
  if (isMock) return false;
  const since = now.getTime() - RATE_LIMIT_WINDOW_H * 60 * MIN_MS;
  return recentRealSos.filter((d) => d.getTime() > since).length >= MAX_SOS_PER_DAY;
}

export interface EligibilityCandidate {
  uid: string;
  helper: Pick<HelperProfile, 'status' | 'available' | 'alarmTested' | 'areaOnly'>;
  mockMode: boolean;
  fcmTokens: string[];
}

export interface EligibilityContext {
  stage: Stage;
  isMock: boolean;
  distanceM: number;
  rungHelperIds: string[];
  /** Residents + family of the SOS household. They get family notifications instead. */
  householdMemberIds: string[];
  /** True when the candidate is a personal helper of this household (section 6.5). */
  isPersonalHelper: boolean;
}

/** Section 8.3 + section 9 (mock) + ADR-0017 (personal helpers ignore distance). */
export function isEligibleHelper(c: EligibilityCandidate, ctx: EligibilityContext): boolean {
  if (c.mockMode !== ctx.isMock) return false;
  if (c.fcmTokens.length === 0) return false;
  if (ctx.rungHelperIds.includes(c.uid)) return false;
  if (ctx.householdMemberIds.includes(c.uid)) return false;
  if (ctx.isPersonalHelper) return true;
  if (ctx.distanceM > stageRadiusM(ctx.stage, ctx.isMock)) return false;
  if (ctx.isMock) return true;
  if (ctx.stage === 3 && c.helper.areaOnly) return false;
  return c.helper.status === 'APPROVED' && c.helper.available && c.helper.alarmTested;
}
