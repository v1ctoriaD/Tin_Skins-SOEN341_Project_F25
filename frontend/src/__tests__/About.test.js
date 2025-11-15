import { render, screen } from '@testing-library/react'
import About from '../components/About'

// Mock static image imports
jest.mock('../assets/member1.jpg', () => 'member1.jpg')
jest.mock('../assets/member2.jpg', () => 'member2.jpg')
jest.mock('../assets/member3.jpg', () => 'member3.jpg')
jest.mock('../assets/ConcordiaCampus.jpg', () => 'mission.jpg')
jest.mock('../assets/ConcordiaCampus1.jpg', () => 'values.jpg')

describe('About component', () => {
  beforeEach(() => {
    render(<About />)
  })

  test('renders main heading and description', () => {
    expect(screen.getByRole('heading', { level: 1, name: /about us/i })).toBeInTheDocument()
    expect(
      screen.getByText(/We’re passionate about creating opportunities for students/i),
    ).toBeInTheDocument()
  })

  test('renders mission section', () => {
    expect(screen.getByRole('heading', { level: 2, name: /our mission/i })).toBeInTheDocument()
    expect(screen.getByAltText('Our mission')).toHaveAttribute('src', 'mission.jpg')
  })

  test('renders values section', () => {
    expect(screen.getByRole('heading', { level: 2, name: /our values/i })).toBeInTheDocument()
    expect(screen.getByAltText('Our values')).toHaveAttribute('src', 'values.jpg')
    expect(screen.getByText(/Community:/i)).toBeInTheDocument()
    expect(screen.getByText(/Innovation:/i)).toBeInTheDocument()
    expect(screen.getByText(/Integrity:/i)).toBeInTheDocument()
    expect(screen.getByText(/Growth:/i)).toBeInTheDocument()
  })

  test('renders team section with members', () => {
    expect(screen.getByRole('heading', { level: 2, name: /meet the team/i })).toBeInTheDocument()

    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByAltText('Team member 1')).toHaveAttribute('src', 'member1.jpg')

    expect(screen.getByText('Jamie Lee')).toBeInTheDocument()
    expect(screen.getByAltText('Team member 2')).toHaveAttribute('src', 'member2.jpg')

    expect(screen.getByText('Taylor Smith')).toBeInTheDocument()
    expect(screen.getByAltText('Team member 3')).toHaveAttribute('src', 'member3.jpg')
  })
})
