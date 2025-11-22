import { render, screen, fireEvent } from '@testing-library/react'
import EventCard from '../components/Discover/EventCard'

describe('EventCard', () => {
const mockEvent = {
title: 'Sample Event',
date: '2025-12-01T15:30:00Z',
locationName: 'Main Hall',
imageUrl: '',
tags: ['WORKSHOP', 'NETWORKING'],
}

beforeAll(() => {
// Mock date formatting for deterministic output
jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('12/1/2025')
jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('03:30 PM')
})

afterAll(() => {
jest.restoreAllMocks()
})

test('renders event details correctly', () => {
render(<EventCard event={mockEvent} onClick={() => {}} />)

// Title
expect(screen.getByRole('heading', { name: /sample event/i })).toBeInTheDocument()

// Location
expect(screen.getByText(/main hall/i)).toBeInTheDocument()

})

test('renders default image when imageUrl is empty', () => {
render(<EventCard event={mockEvent} onClick={() => {}} />)
const img = screen.getByRole('img', { name: /sample event/i })
expect(img).toHaveAttribute(
'src',
expect.stringContaining('default_event_image.png')
)
})

test('renders tags correctly', () => {
render(<EventCard event={mockEvent} onClick={() => {}} />)
expect(screen.getByText('WORKSHOP')).toBeInTheDocument()
expect(screen.getByText('NETWORKING')).toBeInTheDocument()
})

test('calls onClick with event when clicked', () => {
const handleClick = jest.fn()
const { container } = render(<EventCard event={mockEvent} onClick={handleClick} />)
const card = container.querySelector('.event-card')
fireEvent.click(card)
expect(handleClick).toHaveBeenCalledWith(mockEvent)
})
})
