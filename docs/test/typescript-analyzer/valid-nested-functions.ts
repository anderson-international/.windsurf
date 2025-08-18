// Valid: Function with nested functions and return types
export function createProcessor(): {
  process: (data: string) => string;
  validate: (data: string) => boolean;
} {
  const process = (data: string): string => {
    return data.toUpperCase()
  }
  
  const validate = (data: string): boolean => {
    return data.length > 0
  }
  
  return { process, validate }
}
