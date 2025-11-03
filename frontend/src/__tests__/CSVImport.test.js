//not implemented yet - tests will be skipped
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CSVImport from '../components/Admin/CSVImport'; // to be created

describe.skip('CSVImport component (acceptance tests)', () => {
    test('admin can generate a downloadable CSV of attendees', async () => {
        //fake admin and event data
        const admin = { 
            id: 1, 
            authID: 'auth0|admin123',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const user = {
            id: 2,
            authID: 'auth0|user123',
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const sampleEvents = {
            id: 3,
            title: "Event 1",
            description: "Description 1",
            cost: 0,
            maxAttendees: 50,
            date: "2025-12-01T18:00:00",
            tags: ["Tech"],
            locationName: "Hall A",
            imageUrl: "image1.jpg",
            eventOwnerId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            eventAttendees: [user],
        };

        test('admin can generate a CSV file of attendees', () => {
            render(<CSVImport user={admin} event={sampleEvents} />);
        
        //then the admin should see a button to download CSV
        expect(screen.getByText(/Generate Attendee List/i)).toBeInTheDocument();

        //when the admin clicks the generate button
        const generateButton = screen.getByText(/Generate Attendee List/i);
        fireEvent.click(generateButton);

        //then a CSV file should be generated (mock the download action)
        const downloadLink = screen.getByTestId('csv-download-link');
        expect(downloadLink).toBeInTheDocument();
        expect(downloadLink.getAttribute('href')).toContain('data:text/csv');
        });

    });

    test('non-admin users cannot see the CSV generation option', () => {
        render(<CSVImport user={user} event={sampleEvents} />);

        //then the user should NOT see a button to download CSV
        expect(screen.queryByText(/Generate Attendee List/i)).not.toBeInTheDocument();
    });

    test('admin sees appropriate message when no attendees are registered', () => {
        const emptyEvent = {
            id: 4,
            title: "Event 2",
            description: "Description 2",
            cost: 10,
            maxAttendees: 30,
            date: "2025-12-02T18:00:00",
            tags: ["Social"],
            locationName: "Hall B",
            imageUrl: "image2.jpg",
            eventOwnerId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            eventAttendees: [],
        };
        
        render(<CSVImport user={admin} event={emptyEvent} />);

        //then the admin should see a message indicating no attendees
        expect(screen.getByText(/No attendees registered for this event./i)).toBeInTheDocument();
    });

    test('admin sees appropriate message when event data is missing', () => {
        render(<CSVImport user={admin} event={null} />);
        
        //then the admin should see a message indicating event data is missing
        expect(screen.getByText(/Event data is unavailable./i)).toBeInTheDocument();
    });

});