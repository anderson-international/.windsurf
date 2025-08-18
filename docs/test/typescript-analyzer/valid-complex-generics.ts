// Valid: Function with complex generics and return type
export function transform<T, U>(
  data: T[], 
  mapper: (item: T) => U
): { results: U[]; count: number } {
  const results = data.map(mapper)
  return { results, count: results.length }
}
