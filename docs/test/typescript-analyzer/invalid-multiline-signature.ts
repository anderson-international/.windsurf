// Invalid: Function with multiline signature without return type
export function processData(
  items: string[],
  options: { sort: boolean; limit: number },
  callback: (item: string) => void
) {
  const processed = items.slice(0, options.limit)
  processed.forEach(callback)
  return { processed, count: processed.length }
}
