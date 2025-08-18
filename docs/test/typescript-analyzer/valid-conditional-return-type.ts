// Valid: Function with conditional return type
export function getValue<T extends boolean>(includeData: T): T extends true ? { data: string } : null {
  return includeData ? { data: 'value' } as any : null as any
}
