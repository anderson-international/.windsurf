// Invalid: Module augmentation missing return types
declare global {
  interface String {
    reverse(): string
  }
}

String.prototype.reverse = function() {
  return this.split('').reverse().join('')
}

export function enhanceString(str: string) {
  return str.reverse()
}
