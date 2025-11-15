import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

// Mock child components
jest.mock('../components/Navbar', () => () => <div>Navbar</div>)
jest.mock('../components/Banner', () => () => <div>Banner</div>)
jest.mock('../components/Discover/Discover', () => () => <div>Discover</div>)
jest.mock('../components/MapViews/MapView', () => () => <div>MapView</div>)
jest.mock('../components/QrCode/QrScan', () => () => <div>QrScan</div>)
jest.mock('../components/Discover/TicketClaim', () => () => <div>TicketClaim</div>)
jest.mock('../components/Moderation/UserModeration', () => () => <div>UserModerations</div>)
jest.mock('../components/Account/Signup', () => () => <div>Signup</div>)
jest.mock('../components/Account/Login', () => () => <div>Login</div>)
jest.mock('../components/About', () => () => <div>About</div>)

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ events: [], organizations: [], users: [] }),
  }),
)

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders Navbar and Banner on home route', async () => {
    render(<App />)

    expect(screen.getByText('Navbar')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Banner')).toBeInTheDocument()
    })
  })

  test('fetch is called to load events, organizations, and users', async () => {
    render(<App />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(global.fetch).toHaveBeenCalledWith('/api/getEvents', expect.any(Object))
      expect(global.fetch).toHaveBeenCalledWith('/api/getOrganizations')
      expect(global.fetch).toHaveBeenCalledWith('/api/getUsers')
    })
  })
})
