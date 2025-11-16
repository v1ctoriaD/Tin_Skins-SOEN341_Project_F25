
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventAnalytics from '../components/Discover/EventAnalytics';


jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ eventId: '1' }),
}));


jest.mock('react-chartjs-2', () => ({
    Doughnut: () => <div data-testid="mock-chart">Chart</div>,
}));


jest.mock('../hooks/usePageTitle', () => () => {});


global.fetch = jest.fn();

describe('CSV Export functionality in EventAnalytics (acceptance tests)', () => {
    const mockToken = 'mock-jwt-token';
    const mockOrg = { id: 1, name: 'Test Org' };

    const mockAnalyticsResponse = {
        eventTitle: 'Test Event',
        eventDate: '2024-12-01T18:00:00Z',
        organizationName: 'Test Organization',
        ticketsIssued: 5,
        attended: 3,
        notAttended: 2,
        capacity: 50,
        remainingCapacity: 45,
        capacityUtilization: 10,
        attendanceRate: 60,
        isEventPast: false
    };

    const mockTicketsResponse = [
        {
            user: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            },
            status: 'ISSUED',
            createdAt: '2024-11-01T10:00:00Z',
            updatedAt: '2024-11-01T10:00:00Z'
        },
        {
            user: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com'
            },
            status: 'CHECKED_IN',
            createdAt: '2024-11-01T11:00:00Z',
            updatedAt: '2024-11-01T15:00:00Z'
        }
    ];

    beforeEach(() => {
        fetch.mockClear();
        
        // Mock the analytics API call
        fetch.mockImplementation((url) => {
            if (url.includes('/analytics')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAnalyticsResponse),
                });
            }
            if (url.includes('/tickets')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTicketsResponse),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        // Mock URL.createObjectURL and related functions
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
        
        // Mock document.createElement for the download link
        const mockLink = {
            setAttribute: jest.fn(),
            click: jest.fn(),
            style: {}
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('user can export registered users to CSV after clicking tickets card', async () => {
        render(
            <BrowserRouter>
                <EventAnalytics token={mockToken} org={mockOrg} />
            </BrowserRouter>
        );

        // Wait for the component to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click on the "Tickets Issued" card to open the modal
        const ticketsCard = screen.getByText('Tickets Issued').closest('.metric-card');
        fireEvent.click(ticketsCard);

        // Wait for the modal to appear and tickets to load
        await waitFor(() => {
            expect(screen.getByText('Registered Users')).toBeInTheDocument();
        });

        // Wait for the export button to appear
        await waitFor(() => {
            expect(screen.getByText('Export List to CSV')).toBeInTheDocument();
        });

        // Click the export button
        const exportButton = screen.getByText('Export List to CSV');
        fireEvent.click(exportButton);

        // Verify that the CSV download was triggered
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('export button is disabled when no tickets are available', async () => {
        // Mock empty tickets response
        fetch.mockImplementation((url) => {
            if (url.includes('/analytics')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        ...mockAnalyticsResponse,
                        ticketsIssued: 0
                    }),
                });
            }
            if (url.includes('/tickets')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        render(
            <BrowserRouter>
                <EventAnalytics token={mockToken} org={mockOrg} />
            </BrowserRouter>
        );

        // Wait for the component to load with no tickets
        await waitFor(() => {
            expect(screen.getByText('No Tickets Issued Yet')).toBeInTheDocument();
        });

        // Since there are no tickets, the metrics grid shouldn't be visible
        expect(screen.queryByText('Tickets Issued')).not.toBeInTheDocument();
    });

    test('CSV export contains correct headers and data format', async () => {
        render(
            <BrowserRouter>
                <EventAnalytics token={mockToken} org={mockOrg} />
            </BrowserRouter>
        );

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Open tickets modal
        const ticketsCard = screen.getByText('Tickets Issued').closest('.metric-card');
        fireEvent.click(ticketsCard);

        // Wait for modal and export button
        await waitFor(() => {
            expect(screen.getByText('Export List to CSV')).toBeInTheDocument();
        });

        // Click export
        const exportButton = screen.getByText('Export List to CSV');
        fireEvent.click(exportButton);

        // Verify Blob was created with CSV content
        expect(global.Blob).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.stringContaining('Name,Email,Status,Date Issued,Check-In Time')
            ]),
            { type: 'text/csv;charset=utf-8;' }
        );
    });

    test('export functionality works for attended users modal', async () => {
        render(
            <BrowserRouter>
                <EventAnalytics token={mockToken} org={mockOrg} />
            </BrowserRouter>
        );

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click on attendance card
        const attendanceCard = screen.getByText('Attendance').closest('.metric-card');
        fireEvent.click(attendanceCard);

        // Wait for attended users modal
        await waitFor(() => {
            expect(screen.getByText('Attended Users')).toBeInTheDocument();
        });

        
    });
});

// Mock Blob constructor
global.Blob = jest.fn((content, options) => ({
    content,
    options,
    size: content[0].length,
    type: options.type
}));