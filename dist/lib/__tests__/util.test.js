"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util = __importStar(require("../util"));
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
    expect(Util.WeightedSelection(undefined)).toBe(null);
    const countArr = [0, 0, 0];
    for (let i = iterations; i; i--) {
        countArr[Util.WeightedSelection(testCollection).idx]++;
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
