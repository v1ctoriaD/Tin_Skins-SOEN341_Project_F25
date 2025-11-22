import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import Login from '../components/Account/Login'

global.fetch = jest.fn()

const setup = (props = {}) =>
  render(
    <BrowserRouter>
      <Login
        onLogin={props.onLogin || jest.fn()}
        setUser={props.setUser || jest.fn()}
        setOrg={props.setOrg || jest.fn()}
        setSession={props.setSession || jest.fn()}
        org={props.org || null}
      />
    </BrowserRouter>,
  )

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockReset()
    localStorage.clear()
  })

  test('renders initial login screen', () => {
    setup()
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  test('toggles account type', () => {
    setup()
    const orgBtn = screen.getByText('Organization')
    fireEvent.click(orgBtn)
    expect(orgBtn).toHaveClass('active')
  })

  test('shows error for password missing uppercase', async () => {
    setup()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'lowercase1' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText('Password must contain uppercase letter')).toBeInTheDocument()
  })

  test('shows error for password missing lowercase', async () => {
    setup()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'UPPERCASE1' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText('Password must contain lowercase letter')).toBeInTheDocument()
  })

  test('shows error for password missing digit', async () => {
    setup()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText('Password must contain digit')).toBeInTheDocument()
  })

  test('successful user login', async () => {
    const onLogin = jest.fn()
    const setUser = jest.fn()
    const setOrg = jest.fn()
    const setSession = jest.fn()

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        session: 'session123',
        user: { name: 'Test User', role: 'student' },
        org: null,
      }),
    })

    setup({ onLogin, setUser, setOrg, setSession })

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText("You're in!")).toBeInTheDocument()

    expect(onLogin).toHaveBeenCalledWith('session123')
    expect(setSession).toHaveBeenCalled()
    expect(setUser).toHaveBeenCalled()
    expect(localStorage.getItem('role')).toBe('student')
  })

  test('successful org login (approved)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        session: 'sessionXYZ',
        user: null,
        org: { name: 'Org B', isApproved: true },
      }),
    })

    setup()

    fireEvent.click(screen.getByText('Organization'))

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'org@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText("You're in!")).toBeInTheDocument()
  })

  test('backend returns error message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    })

    setup()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Login'))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})
