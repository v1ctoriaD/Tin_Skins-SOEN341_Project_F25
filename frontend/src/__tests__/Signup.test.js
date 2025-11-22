// src/__tests__/Signup.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Signup from '../components/Account/Signup'
import { BrowserRouter } from 'react-router-dom'

// Mock page title hook
jest.mock('../hooks/usePageTitle', () => jest.fn())

// Wrap component with Router
const renderWithRouter = ui => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Signup Component', () => {
  test('renders initial signup form', () => {
    renderWithRouter(<Signup />)

    expect(screen.getByText('New Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  test('toggles to organization account type', () => {
    renderWithRouter(<Signup />)

    fireEvent.click(screen.getByText('Organization'))

    expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('First Name')).not.toBeInTheDocument()
  })

  test('shows error when passwords do not match', async () => {
    renderWithRouter(<Signup />)

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Different1' },
    })

    fireEvent.click(screen.getByText('Sign Up'))

    await waitFor(() => expect(screen.getByText('Passwords must match')).toBeInTheDocument())
  })

  test('shows error when password has no uppercase', async () => {
    renderWithRouter(<Signup />)

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password1' },
    })

    fireEvent.click(screen.getByText('Sign Up'))

    await waitFor(() =>
      expect(screen.getByText('Password must contain uppercase letter')).toBeInTheDocument(),
    )
  })

  test('successful signup shows verify email screen', async () => {
    renderWithRouter(<Signup />)

    // Mock success response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com' }),
    })

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Sign Up'))

    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument()
    })
  })

  test('resend email updates message', async () => {
    renderWithRouter(<Signup />)

    // First mock signup success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com' }),
    })

    // Fill minimal fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Sign Up'))

    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument()
    })

    // Mock resend email response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email sent again' }),
    })

    fireEvent.click(screen.getByText('Resend Email'))

    await waitFor(() => expect(screen.getByText('Email sent again')).toBeInTheDocument())
  })
})
