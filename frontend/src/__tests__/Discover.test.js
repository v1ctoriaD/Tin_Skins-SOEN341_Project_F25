import { render, screen, fireEvent } from '@testing-library/react'
import Discover from '../components/Discover/Discover'
import { MemoryRouter } from 'react-router-dom'

// Mock hooks and external dependencies
jest.mock('react-qr-code', () => ({ value }) => <div data-testid="qr-code">{value}</div>)
jest.mock('../hooks/usePageTitle', () => jest.fn())

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}))

const sampleEvents = [
  {
    id: 1,
    title: 'Event 1',
    date: '2025-12-01T18:00:00',
    locationName: 'Hall A',
    description: 'Description 1',
    maxAttendees: 50,
    eventAttendees: [],
    cost: 0,
    tags: ['Tech'],
    imageUrl: 'image1.jpg',
    eventOwner: { orgName: 'Org1', id: 1 },
  },
  {
    id: 2,
    title: 'Event 2',
    date: '2025-12-02T18:00:00',
    locationName: 'Hall B',
    description: 'Description 2',
    maxAttendees: 30,
    eventAttendees: [{ id: 1 }],
    cost: 10,
    tags: ['Social'],
    imageUrl: 'image2.jpg',
    eventOwner: { orgName: 'Org2', id: 2 },
  },
]

describe('Discover component', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  test('renders event titles', () => {
    render(
      <MemoryRouter>
        <Discover
          events={sampleEvents}
          user={null}
          org={null}
          isRegistrations={false}
          isMyEvent={false}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Discover Events/i)).toBeInTheDocument()
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
  })

  test('register button navigates to login if no user', () => {
    render(
      <MemoryRouter>
        <Discover
          events={sampleEvents}
          user={null}
          org={null}
          isRegistrations={false}
          isMyEvent={false}
        />
      </MemoryRouter>,
    )

    // Click first event card
    fireEvent.click(screen.getByText('Event 1'))
    const registerBtn = screen.getByText(/Register/i)
    fireEvent.click(registerBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('close button resets selectedEvent', () => {
    render(
      <MemoryRouter>
        <Discover
          events={sampleEvents}
          user={{ id: 1 }}
          org={null}
          isRegistrations={false}
          isMyEvent={false}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('Event 1'))
    const closeBtn = screen.getByText(/Close/i)
    fireEvent.click(closeBtn)

    expect(screen.queryByText(/Location: Hall A/i)).not.toBeInTheDocument()
  })
})
