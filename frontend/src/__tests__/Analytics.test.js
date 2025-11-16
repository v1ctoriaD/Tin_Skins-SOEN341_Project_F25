import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Analytics from '../components/Admin/Analytics'

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Chart</div>,
}))

jest.mock('../hooks/usePageTitle', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockAnalyticsData = {
  numEvents: 25,
  numTickets: 150,
  totalAttendance: 120,
  attendanceTrend: [
    { label: '2025-11-01', registered: 30, attended: 25 },
    { label: '2025-11-08', registered: 40, attended: 32 },
  ],
}

describe('Analytics Component', () => {
  const mockUser = { id: 1, email: 'admin@test.com', role: 'ADMIN' }
  const mockToken = 'test-token'

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should display loading state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={mockUser} />
      </BrowserRouter>,
    )

    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument()
  })

  it('should render analytics dashboard with data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    })

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={mockUser} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/administrator analytics dashboard/i)).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()
    })
  })

  it('should display attendance rate correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    })

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={mockUser} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('80.0%')).toBeInTheDocument() // 120/150
    })
  })

  it('should block non-admin users', async () => {
    const regularUser = { ...mockUser, role: 'USER' }

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={regularUser} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    })
  })

  it('should refresh data when button clicked', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData,
    })

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={mockUser} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should render chart component', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    })

    render(
      <BrowserRouter>
        <Analytics token={mockToken} user={mockUser} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
