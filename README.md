# SOEN-341-Project
Tin Skins' version of the SOEN 341 Project.

We are developping a Campus Events & Ticketing Web application meant for students to be involved and participate in campus activies and the student life.

We plan on coding using JavaScript as the main language and React as the Framework.


# How to run
In the root folder run:
```bash
npm start
```

# Objectives/Core Features
Technologies to be used: React or Node.js, JavaScript, CSS, HTML, PostgreSQL(Supabase + Prisma)

We identify three primary users: Students, Organizers, and Administrators.
1. Student Event Experience
   - Event Discovery
     - Browse and search events with filters (date, category, organization).
   - Event Management
     - Save events to a personal calendar.
     - Claim tickets (free or mock paid).
     - Receive a digital ticket with a unique QR code.
2. Organizer Event Management 
   - Event Creation
     - Enter event details: title, description, date/time, location, ticket capacity, ticket type (free or paid).
   - Event Analytics
     - Dashboard per event with stats: tickets issued, attendance rates, and remaining capacity.
   - Tools
     - Export the attendee list in CSV.
     - Integrated QR scanner for ticket validation (for simplicity, you can assume the QR code image can be provided via file upload).
3. Administrator Dashboard & Moderation
   - Platform Oversight
     - Approve organizer accounts.
     - Moderate event listings for policy compliance.
   - Analytics
     - View global stats: number of events, tickets issued, and participation trends.
   - Management
     - Manage organizations and assign roles.
4. Geographical Event Visualization
   - Event Waypoints
     - Enter the event location and it will be displayed as a waypoint on an interactive map.
   - Map Based Discovery
     - View events around an area, and their details.


# Team Members : 
- Nicolas David Chacon Pabon ; 40302889 ; Arceton500
- Alesia Kulagina; 40260096; lesyak1
- Neil Bryan Moukam-Tchuangou; 40316930; shinehiro
- Victoria Doan ; 40317044 ; v1ctoriaD
- Basma Ennajimi ; 40314332 ; BasmaEnnajimi
- Hiba Maifi ; 40289223 ; hibamai
- Daniel Ganchev ; 40315755 ; dan-gan
- Adrian Charbonneau ; 40310777 ; Alphabot54

# Responsibilities :
- Alesia: Event Browsing, CSV exporting, Map feature
- Hiba: Event Browsing, CSV exporting, Map feature
- Neil: Saving to Calendar, LogIn/LogOut, Account Moderation
- Victoria: UI design, Creating/editing events, QR codes
- Basma: UI design, Creating/editing events, QR codes
- Daniel: Event signup, moc pay, Event Analytics
- Adrian: PM, Database, Creating/editing events, Account Moderation
