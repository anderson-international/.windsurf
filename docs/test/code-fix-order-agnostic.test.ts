

export function sample(a: number, b: number) {

  console.warn('warn line', a, b)
  console.error('error line', a, b)
  const sum = a + b
  return sum
}

console.warn('top-level warn')
console.error('top-level error')
