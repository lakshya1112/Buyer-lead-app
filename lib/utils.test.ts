// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { isValidBudget } from './utils';

describe('isValidBudget', () => {
  it('should return true when max is greater than min', () => {
    expect(isValidBudget(100, 200)).toBe(true);
  });

  it('should return true when max is equal to min', () => {
    expect(isValidBudget(150, 150)).toBe(true);
  });

  it('should return false when max is less than min', () => {
    expect(isValidBudget(200, 100)).toBe(false);
  });

  it('should return true when min is undefined', () => {
    expect(isValidBudget(undefined, 200)).toBe(true);
  });

  it('should return true when max is undefined', () => {
    expect(isValidBudget(100, undefined)).toBe(true);
  });

  it('should return true when both are undefined', () => {
    expect(isValidBudget(undefined, undefined)).toBe(true);
  });
});