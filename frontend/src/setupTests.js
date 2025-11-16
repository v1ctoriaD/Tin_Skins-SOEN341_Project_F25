import '@testing-library/jest-dom'
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (msg, ...args) => {
    if (
      msg.includes('React Router Future Flag Warning') ||
      msg.includes('Relative route resolution within Splat')
    )
      return
    originalWarn(msg, ...args)
  }
})
