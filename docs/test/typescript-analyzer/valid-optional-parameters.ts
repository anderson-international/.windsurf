// Valid: Function with optional parameters and return type
export function createMessage(text: string, urgent?: boolean): string {
  return urgent ? `URGENT: ${text}` : text
}
