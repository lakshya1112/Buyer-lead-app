// lib/utils.ts
export function isValidBudget(min?: number, max?: number): boolean {
  // If either budget is not provided, it's considered valid for this check.
  if (min === undefined || max === undefined) {
    return true;
  }
  // If both are provided, max must be greater than or equal to min.
  return max >= min;
}