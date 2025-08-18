export function unusedHelper(a: number, b: number): number {
  const x = a + b;
  if (x > 10) {
    return x - 1;
  }
  return x + 1;
}

export const unusedValue: number = 42;
