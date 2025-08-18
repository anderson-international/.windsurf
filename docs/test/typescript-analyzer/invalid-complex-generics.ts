// Invalid: Function with complex generics missing return type
export function transform<T, U>(
  data: T[], 
  mapper: (item: T) => U
) {
  const results = data.map(mapper)
  return { results, count: results.length }
}
