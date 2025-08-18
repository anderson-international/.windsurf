// Invalid: Function with nested functions missing return types
export function createProcessor() {
  const process = (data: string) => {
    return data.toUpperCase()
  }
  
  const validate = (data: string) => {
    return data.length > 0
  }
  
  return { process, validate }
}
