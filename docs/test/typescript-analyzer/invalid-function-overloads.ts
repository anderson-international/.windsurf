// Invalid: Function with overloads missing return type on implementation
export function format(value: string): string
export function format(value: number): string
export function format(value: boolean): string
export function format(value: string | number | boolean) {
  return String(value)
}
