import {
  autoCloseAt,
  checkAccept,
  extendUntil,
  isEligibleHelper,
  isRateLimited,
  shouldAutoClose,
  shouldRunStage,
  stageDelayS,
  stageRadiusM,
  type EligibilityCandidate,
  type EligibilityContext,
} from '../src';

describe('checkAccept', () => {
  const base = {
    status: 'OPEN' as const,
    acceptedHelperIds: [] as string[],
    rungHelperIds: ['h1'],
  };

  it('ok when rung and room left', () => expect(checkAccept(base, 'h1')).toBe('ok'));
  it('sos-closed', () =>
    expect(checkAccept({ ...base, status: 'CLOSED' }, 'h1')).toBe('sos-closed'));
  it('already (idempotent)', () =>
    expect(checkAccept({ ...base, acceptedHelperIds: ['h1'] }, 'h1')).toBe('already'));
  it('not-invited', () => expect(checkAccept(base, 'x')).toBe('not-invited'));
  it('sos-full at 5', () =>
    expect(
      checkAccept(
        { status: 'ACTIVE', acceptedHelperIds: ['a', 'b', 'c', 'd', 'e'], rungHelperIds: ['h1'] },
        'h1',
      ),
    ).toBe('sos-full'));
});

describe('stage timing', () => {
  it('delays are 0 / 30 / 90 s', () => {
    expect([1, 2, 3].map((s) => stageDelayS(s as 1 | 2 | 3))).toEqual([0, 30, 90]);
  });
  it('radii are none / 500 / 1000, mock always 1000', () => {
    expect(stageRadiusM(1, false)).toBe(Infinity);
    expect(stageRadiusM(2, false)).toBe(500);
    expect(stageRadiusM(3, false)).toBe(1000);
    expect(stageRadiusM(2, true)).toBe(1000);
  });
  it('stage 2 runs until full, stage 3 only with zero accepted', () => {
    expect(shouldRunStage(2, 4)).toBe(true);
    expect(shouldRunStage(2, 5)).toBe(false);
    expect(shouldRunStage(3, 0)).toBe(true);
    expect(shouldRunStage(3, 1)).toBe(false);
  });
  it('auto-close 30 min after raise', () => {
    expect(autoCloseAt(new Date(0)).getTime()).toBe(30 * 60_000);
  });
  it('extend adds 30 min to max(now, extendedUntil)', () => {
    const now = new Date(1_000_000);
    expect(extendUntil(now, null).getTime()).toBe(1_000_000 + 30 * 60_000);
    expect(extendUntil(now, new Date(500)).getTime()).toBe(1_000_000 + 30 * 60_000);
    expect(extendUntil(now, new Date(2_000_000)).getTime()).toBe(2_000_000 + 30 * 60_000);
  });
  it('auto-close skips closed and extended SOS', () => {
    const now = new Date(1000);
    expect(shouldAutoClose({ status: 'OPEN', extendedUntil: null }, now)).toBe(true);
    expect(shouldAutoClose({ status: 'ACTIVE', extendedUntil: new Date(999) }, now)).toBe(true);
    expect(shouldAutoClose({ status: 'ACTIVE', extendedUntil: new Date(2000) }, now)).toBe(false);
    expect(shouldAutoClose({ status: 'CLOSED', extendedUntil: null }, now)).toBe(false);
  });
});

describe('isRateLimited', () => {
  const now = new Date(Date.UTC(2026, 0, 2));
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

  it('allows the 3rd, blocks the 4th within 24 h', () => {
    expect(isRateLimited([hoursAgo(1), hoursAgo(2)], now, false)).toBe(false);
    expect(isRateLimited([hoursAgo(1), hoursAgo(2), hoursAgo(3)], now, false)).toBe(true);
  });
  it('rolling window ignores older than 24 h', () => {
    expect(isRateLimited([hoursAgo(1), hoursAgo(2), hoursAgo(25)], now, false)).toBe(false);
  });
  it('mock is never limited', () => {
    expect(isRateLimited([hoursAgo(1), hoursAgo(2), hoursAgo(3)], now, true)).toBe(false);
  });
});

describe('isEligibleHelper', () => {
  const helper: EligibilityCandidate = {
    uid: 'h1',
    helper: { status: 'APPROVED', available: true, alarmTested: true, areaOnly: false },
    mockMode: false,
    fcmTokens: ['t'],
  };
  const ctx: EligibilityContext = {
    stage: 2,
    isMock: false,
    distanceM: 400,
    rungHelperIds: [],
    householdMemberIds: [],
    isPersonalHelper: false,
  };
  const withHelper = (h: Partial<EligibilityCandidate['helper']>) => ({
    ...helper,
    helper: { ...helper.helper, ...h },
  });

  it('eligible when all conditions hold', () => expect(isEligibleHelper(helper, ctx)).toBe(true));

  it.each([
    ['not approved', withHelper({ status: 'PENDING' }), ctx],
    ['not available', withHelper({ available: false }), ctx],
    ['alarm not tested', withHelper({ alarmTested: false }), ctx],
    ['no FCM token', { ...helper, fcmTokens: [] }, ctx],
    ['too far', helper, { ...ctx, distanceM: 501 }],
    ['already rung', helper, { ...ctx, rungHelperIds: ['h1'] }],
    ['household member', helper, { ...ctx, householdMemberIds: ['h1'] }],
    ['in mock mode for a real SOS', { ...helper, mockMode: true }, ctx],
    [
      'areaOnly at stage 3',
      withHelper({ areaOnly: true }),
      { ...ctx, stage: 3 as const, distanceM: 700 },
    ],
  ])('not eligible: %s', (_name, c, x) => expect(isEligibleHelper(c, x)).toBe(false));

  it('areaOnly is fine at stage 2', () =>
    expect(isEligibleHelper(withHelper({ areaOnly: true }), ctx)).toBe(true));

  it('stage 3 reaches 1 km', () =>
    expect(isEligibleHelper(helper, { ...ctx, stage: 3, distanceM: 1000 })).toBe(true));

  describe('personal helpers', () => {
    const pctx = { ...ctx, stage: 1 as const, isPersonalHelper: true, distanceM: 50_000 };
    const untrusted = withHelper({ status: 'NONE', available: false, alarmTested: false });

    it('rung regardless of status, available, alarmTested and distance', () =>
      expect(isEligibleHelper(untrusted, pctx)).toBe(true));
    it('still need an FCM token', () =>
      expect(isEligibleHelper({ ...untrusted, fcmTokens: [] }, pctx)).toBe(false));
    it('never rung twice', () =>
      expect(isEligibleHelper(untrusted, { ...pctx, rungHelperIds: ['h1'] })).toBe(false));
    it('mock rule still applies', () =>
      expect(isEligibleHelper({ ...untrusted, mockMode: true }, pctx)).toBe(false));
  });

  describe('mock SOS', () => {
    const mctx = { ...ctx, isMock: true, distanceM: 900 };
    const mockUser = {
      ...withHelper({ status: 'NONE', available: false, alarmTested: false }),
      mockMode: true,
    };

    it('rings mock users within 1 km regardless of helper state', () =>
      expect(isEligibleHelper(mockUser, mctx)).toBe(true));
    it('never rings users with mock mode off', () =>
      expect(isEligibleHelper(helper, mctx)).toBe(false));
    it('not beyond 1 km', () =>
      expect(isEligibleHelper(mockUser, { ...mctx, distanceM: 1001 })).toBe(false));
  });
});
