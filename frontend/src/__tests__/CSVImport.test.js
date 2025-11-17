// Mock DOM APIs properly
global.alert = jest.fn()
global.Blob = jest.fn()
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Create proper DOM mocks
const mockElement = {
  setAttribute: jest.fn(),
  click: jest.fn(),
  style: {},
}

// Override document methods at global level
Object.defineProperty(global.document, 'createElement', {
  value: jest.fn(() => mockElement),
  writable: true,
})

Object.defineProperty(global.document.body, 'appendChild', {
  value: jest.fn(),
  writable: true,
})

Object.defineProperty(global.document.body, 'removeChild', {
  value: jest.fn(),
  writable: true,
})

import { exportEventTickets, exportRegisteredUsers, escapeCSVValue } from '../components/CSVImport'

describe('CSV Export Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockData = [{ name: 'John', email: 'john@test.com' }]

  test('no export if empty array', () => {
    const result = exportEventTickets([], 'test')
    expect(result).toBe(false)
    expect(global.alert).toHaveBeenCalledWith('No data to export')
  })

  test('no export if null data', () => {
    const result = exportEventTickets(null, 'test')
    expect(result).toBe(false)
    expect(global.alert).toHaveBeenCalledWith('No data to export')
  })

  test('escapeCSVValue handles commas', () => {
    expect(escapeCSVValue('hello, world')).toBe('"hello, world"')
  })

  test('escapeCSVValue handles null', () => {
    expect(escapeCSVValue(null)).toBe('N/A')
  })
})
