// Invalid: Function with optional parameters without return type
export function createMessage(text: string, urgent?: boolean) {
  return urgent ? `URGENT: ${text}` : text
}
