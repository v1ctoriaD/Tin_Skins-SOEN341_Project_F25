// src/__tests__/Logout.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Logout from '../components/Account/Logout'

beforeEach(() => {
  jest.clearAllMocks()

  // Mock fetch
  global.fetch = jest.fn()

  // Mock alert
  global.alert = jest.fn()

  // Mock localStorage
  Storage.prototype.removeItem = jest.fn()
})

describe('Logout Component', () => {
  test('successful logout triggers callbacks and clears localStorage', async () => {
    const mockOnLogout = jest.fn()
    const mockSetUser = jest.fn()
    const mockSetOrg = jest.fn()
    const mockSetSession = jest.fn()

    // Mock fetch success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    })

    render(
      <Logout
        onLogout={mockOnLogout}
        setUser={mockSetUser}
        setOrg={mockSetOrg}
        setSession={mockSetSession}
        className="logout-btn"
      />
    )

    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    expect(mockOnLogout).toHaveBeenCalled()
    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockSetOrg).toHaveBeenCalledWith(null)
    expect(mockSetSession).toHaveBeenCalledWith(null)

    expect(localStorage.removeItem).toHaveBeenCalledWith('role')
    expect(localStorage.removeItem).toHaveBeenCalledWith('session')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')

    expect(global.alert).toHaveBeenCalledWith('Logout successful!')
  })

  test('shows error alert if logout fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Logout failed' }),
    })

    render(
      <Logout
        onLogout={jest.fn()}
        setUser={jest.fn()}
        setOrg={jest.fn()}
        setSession={jest.fn()}
      />
    )

    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Logout failed')
    })
  })

  test('does not crash if onLogout is not provided', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    })

    const mockSetUser = jest.fn()
    const mockSetOrg = jest.fn()
    const mockSetSession = jest.fn()

    render(
      <Logout
        setUser={mockSetUser}
        setOrg={mockSetOrg}
        setSession={mockSetSession}
      />
    )

    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Logout successful!')
    })

    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockSetOrg).toHaveBeenCalledWith(null)
    expect(mockSetSession).toHaveBeenCalledWith(null)
  })
})
