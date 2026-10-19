import { distanceM, roundDistance } from '../src';

describe('distanceM', () => {
  it('is 0 for the same point', () =>
    expect(distanceM({ lat: 17.4, lng: 78.5 }, { lat: 17.4, lng: 78.5 })).toBe(0));

  it('0.001 deg latitude is about 111 m', () =>
    expect(distanceM({ lat: 17.4, lng: 78.5 }, { lat: 17.401, lng: 78.5 })).toBeCloseTo(111.2, 0));

  it('Hyderabad to Bengaluru is about 500 km', () => {
    const d = distanceM({ lat: 17.385, lng: 78.4867 }, { lat: 12.9716, lng: 77.5946 });
    expect(d / 1000).toBeGreaterThan(495);
    expect(d / 1000).toBeLessThan(505);
  });
});

describe('roundDistance', () => {
  it('rounds to 50 m', () => {
    expect(roundDistance(324, 50)).toBe(300);
    expect(roundDistance(325, 50)).toBe(350);
  });
  it('rounds to 100 m', () => expect(roundDistance(949, 100)).toBe(900));
  it('never shows a positive distance as 0', () => expect(roundDistance(10, 100)).toBe(100));
  it('0 stays 0', () => expect(roundDistance(0, 50)).toBe(0));
});
