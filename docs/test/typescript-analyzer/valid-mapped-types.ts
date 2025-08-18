// Valid: Function with mapped types return type
type StringKeys<T> = {
  [K in keyof T]: string
}

export function stringifyProperties<T>(obj: T): StringKeys<T> {
  const result = {} as StringKeys<T>
  for (const key in obj) {
    result[key] = String(obj[key])
  }
  return result
}
