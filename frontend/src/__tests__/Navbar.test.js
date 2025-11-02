import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';

// Mock react-router-dom hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock Logout component
jest.mock('../components/Account/Logout', () => ({ onLogout }) => (
  <button onClick={onLogout}>Logout</button>
));

describe('Navbar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo, and basic links', () => {
    render(<Navbar />);

    // Center logo
    expect(screen.getByAltText(/campus event logo/i)).toBeInTheDocument();

    // Basic nav options
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/discover/i)).toBeInTheDocument();
    expect(screen.getByText(/map/i)).toBeInTheDocument();
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  test('renders Login and Signup if no token', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('img', { hidden: true })); // simulate FaUser click
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/signup/i)).toBeInTheDocument();
  });

  test('renders Logout if token is provided', () => {
    render(<Navbar token="123" onLogout={jest.fn()} />);

    // Simulate dropdown click if necessary
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  test('calls onLogout when Logout button clicked', () => {
    const onLogout = jest.fn();
    render(<Navbar token="123" onLogout={onLogout} />);

    fireEvent.click(screen.getByText(/logout/i));
    expect(onLogout).toHaveBeenCalled();
  });

  test('renders conditional links for user and org', () => {
    const user = { role: 'ADMIN' };
    const org = {};
    render(<Navbar user={user} org={org} />);

    // Check user/admin links
    expect(screen.getByText(/registrations/i)).toBeInTheDocument();
    expect(screen.getByText(/my events/i)).toBeInTheDocument();
    expect(screen.getByText(/scan qr code/i)).toBeInTheDocument();
    expect(screen.getByText(/create event/i)).toBeInTheDocument();
    expect(screen.getByText(/moderate users/i)).toBeInTheDocument();
  });
});
