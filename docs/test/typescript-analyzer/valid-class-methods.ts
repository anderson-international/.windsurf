// Valid: Class methods with explicit return types
export class Calculator {
  add(a: number, b: number): number {
    return a + b
  }

  multiply(a: number, b: number): number {
    return a * b
  }

  getResult(): string {
    return 'calculation complete'
  }
}
