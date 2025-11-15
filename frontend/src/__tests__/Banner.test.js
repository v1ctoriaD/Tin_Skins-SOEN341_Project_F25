import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Banner from '../components/Banner'

// Mock the usePageTitle hook (since it has a side effect)
jest.mock('../hooks/usePageTitle', () => jest.fn())

describe('Banner component', () => {
  test('renders heading, paragraph, and links', () => {
    render(
      <MemoryRouter>
        <Banner />
      </MemoryRouter>,
    )

    // Check heading
    expect(
      screen.getByRole('heading', { name: /Experience Campus Life Like Never Before/i }),
    ).toBeInTheDocument()

    // Check paragraph
    expect(
      screen.getByText(/Discover and participate in the events that make Concordia come alive/i),
    ).toBeInTheDocument()

    // Check "Explore Events" link
    const exploreLink = screen.getByRole('link', { name: /Explore Events/i })
    expect(exploreLink).toBeInTheDocument()
    expect(exploreLink).toHaveAttribute('href', '/discover')

    // Check "Host Your Own" link
    const hostLink = screen.getByRole('link', { name: /Host Your Own/i })
    expect(hostLink).toBeInTheDocument()
    expect(hostLink).toHaveAttribute('href', '/create')
  })
})
