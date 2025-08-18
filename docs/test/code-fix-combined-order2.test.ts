

const add = (a: number, b: number) => {

  console.warn('warn', a + b)
  console.error('error', a + b)
  return a + b
}

console.log('top-level log')
console.error('top-level error')

export { add }
