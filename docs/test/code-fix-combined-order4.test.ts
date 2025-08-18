/**
 * Example JSDoc to remove
 */

// Single line comment to remove

const add = (a: number, b: number) => {
  // inline comment: compute sum (should be removed)
  console.log('debug log', a, b)
  console.debug('debugging', { a, b })
  console.info('info', a + b)
  console.warn('warn', a + b) // should remain
  console.error('error', a + b) // should remain
  return a + b // end-of-line comment should be removed
}

/* Multi-line
   comment block to remove */

console.log('top-level log') // should be removed
console.error('top-level error') // should remain

export { add }
