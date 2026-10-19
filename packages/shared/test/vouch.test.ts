import {
  canSignupAsHelper,
  checkVouch,
  isApprovedByVouches,
  vouchBlockedUntil,
  type Voucher,
} from '../src';

const now = new Date(Date.UTC(2026, 5, 1));
const approved: Voucher = {
  uid: 'v',
  isAdmin: false,
  helper: { status: 'APPROVED', vouchBlockedUntil: null },
};
const pending = { uid: 'p', status: 'PENDING' as const };

describe('checkVouch', () => {
  it('ok for approved voucher within 1 km', () =>
    expect(checkVouch(approved, pending, 1000, now)).toBe('ok'));

  it('V2: pending voucher cannot vouch', () =>
    expect(
      checkVouch(
        { ...approved, helper: { status: 'PENDING', vouchBlockedUntil: null } },
        pending,
        10,
        now,
      ),
    ).toBe('not-approved'));

  it('V3: cannot vouch for self', () =>
    expect(checkVouch({ ...approved, uid: 'p' }, pending, 0, now)).toBe('self'));

  it('V4: more than 1 km away is rejected', () =>
    expect(checkVouch(approved, pending, 1001, now)).toBe('too-far'));

  it('V4: admin is exempt from distance and status', () =>
    expect(
      checkVouch(
        { uid: 'a', isAdmin: true, helper: { status: 'NONE', vouchBlockedUntil: null } },
        pending,
        50_000,
        now,
      ),
    ).toBe('ok'));

  it('V7: blocked voucher is rejected until the block ends', () => {
    const blocked = {
      ...approved,
      helper: { ...approved.helper, vouchBlockedUntil: new Date(now.getTime() + 1) },
    };
    expect(checkVouch(blocked, pending, 10, now)).toBe('blocked');
    const expired = {
      ...approved,
      helper: { ...approved.helper, vouchBlockedUntil: new Date(now.getTime() - 1) },
    };
    expect(checkVouch(expired, pending, 10, now)).toBe('ok');
  });

  it('only PENDING users can be vouched for', () =>
    expect(checkVouch(approved, { uid: 'p', status: 'APPROVED' }, 10, now)).toBe('not-pending'));
});

describe('vouch helpers', () => {
  it('1 vouch approves (V1)', () => {
    expect(isApprovedByVouches(0)).toBe(false);
    expect(isApprovedByVouches(1)).toBe(true);
  });
  it('V7 block lasts 30 days', () =>
    expect(vouchBlockedUntil(now).getTime() - now.getTime()).toBe(30 * 24 * 3600_000));
  it('V8: removed/rejected cannot sign up again', () => {
    expect(canSignupAsHelper('REMOVED')).toBe(false);
    expect(canSignupAsHelper('REJECTED')).toBe(false);
    expect(canSignupAsHelper('NONE')).toBe(true);
  });
});
