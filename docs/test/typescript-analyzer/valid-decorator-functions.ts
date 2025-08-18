// Valid: Function with decorators and return type
function logged(target: any, propertyName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return descriptor
}

export class MyClass {
  @logged
  calculate(x: number, y: number): number {
    return x + y
  }
}
