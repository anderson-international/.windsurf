// Invalid: Function with decorators missing return type
function logged(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  return descriptor
}

export class MyClass {
  @logged
  calculate(x: number, y: number) {
    return x + y
  }
}
