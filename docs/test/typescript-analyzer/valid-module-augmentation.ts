// Valid: Module augmentation with return types
declare global {
  interface String {
    reverse(): string
  }
}

String.prototype.reverse = function(): string {
  return this.split('').reverse().join('')
}

export function enhanceString(str: string): string {
  return str.reverse()
}
