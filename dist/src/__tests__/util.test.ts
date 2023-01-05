import * as Util from '../util';

const iterations = 5000;

const testCollection = [
  { idx: 0 },
  { idx: 1, weight: 10 },
  { idx: 2, weight: 100 },
];

const unweightedCollection = ['hello', 'world'];

test('FloatBetween', () => {
  for (let i = iterations; i; i--) {
    expect(Util.FloatBetween(0, 1)).toBeGreaterThanOrEqual(0);
    expect(Util.FloatBetween(0, 1)).toBeLessThanOrEqual(10);
  }
});

test('WeightedSelection', () => {
  expect(Util.WeightedSelection([])).toBe(null);
  expect(Util.WeightedSelection(undefined as any)).toBe(null);

  const countArr = [0, 0, 0];
  for (let i = iterations; i; i--) {
    countArr[(Util.WeightedSelection(testCollection) as any).idx]++;
  }
  expect(countArr[0]).toBeLessThan(countArr[1]);
  expect(countArr[1]).toBeLessThan(countArr[2]);
  expect(countArr[2]).toBeGreaterThan(countArr[0]);
  expect(countArr.reduce((a, b) => a + b, 0)).toBe(iterations);

  expect(Util.WeightedSelection(unweightedCollection)).toBeOneOf([
    'hello',
    'world',
  ]);
});

test('cLog', () => {
  const consoleSpy = jest.spyOn(console, 'log');
  Util.cLog(3, 'a', 'b');
  Util.cLog(2, 'a', 'b');
  Util.cLog(1, 'a', 'b');
  expect(consoleSpy).toHaveBeenCalledTimes(3);
});
