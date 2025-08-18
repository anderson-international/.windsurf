// Invalid: Class methods without return types
export class Calculator {
  add(a: number, b: number) {
    return a + b
  }

  multiply(a: number, b: number) {
    return a * b
  }

  getResult() {
    return 'calculation complete'
  }
}
