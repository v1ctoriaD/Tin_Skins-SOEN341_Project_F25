import express from 'express';
import 'dotenv/config';
import * as database from './database/database.js';
import { generateQr, validateQr } from './database/qr.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Lightweight mock mode: if DATABASE_URL is not set, serve mock events/tickets
const useMock = !process.env.DATABASE_URL;
let mockEvents = [];
let mockTickets = [];
if (useMock) {
  // create a few sample events
  mockEvents = [
    // For testing keep just three events and give each its own availability by ticket type
    { id: 1, title: 'Campus Concert', description: 'Live music night', cost: 0, maxAttendees: 50, availability: { free: 40, paid: 5, vip: 2 } },
    { id: 2, title: 'Tech Workshop', description: 'Intro to React', cost: 10.0, maxAttendees: 30, availability: { free: 10, paid: 15, vip: 1 } },
    { id: 3, title: 'Career Fair', description: 'Meet employers', cost: 0, maxAttendees: 100, availability: { free: 80, paid: 0, vip: 0 } },
  ];
}

// Get all Events endpoint
app.get("/api/getEvents", async (req, res) => {
  if (useMock) {
    return res.json({ events: mockEvents });
  }
  const events = await database.getAllEvents();
  if (!events) {
    return res.status(500).json({ error: "Either no events or database error" });
  }
  res.json({ events });
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { formData, accountType } = req.body;
  if(accountType === "user") {
    try {
      const session = await database.createUser(formData.email, formData.password, formData.firstName, formData.lastName);
      if (!session) {
        return res.status(409).json({ error: "User already exists" });
      }
      const user = await database.getUser(session);
      const org = null;
      res.json({ message: "Signup successful", session, user, org });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    try {
      const session = await database.createOrganization(formData.email, formData.password, formData.organizationName, false);
      if (!session) {
        return res.status(409).json({ error: "Organization already exists" });
      }
      const user = null;
      const org = await database.getOrganization(session);
      res.json({ message: "Signup successful", session, user, org });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password, accountType } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const session = await database.signIn(email, password);
    if (!session) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = null;
    const org = null;
    if(accountType === "user") {
      user = await database.getUser(session);
    } else {
      org = await database.getOrganization(session);
    }
    res.json({ message: "Login successful", session, user, org });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  database.signOut();
  return res.json({ message: "Logout successful" });
});

app.post("/api/tickets/:ticketId/qr", generateQr);
app.post("/api/checkin", validateQr);

// Create tickets for an event (enforce capacity, support mock-paid)
app.post('/api/events/:eventId/tickets', async (req, res) => {
  const { eventId } = req.params;
  const { name, email, ticketType = 'free', qty: quantity = 1 } = req.body;
  const { buyerId = null } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ error: 'Event ID and buyer email are required' });
  }

  if (useMock) {
    const ev = mockEvents.find((e) => Number(e.id) === Number(eventId));
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    // validate availability by ticket type if provided
    const type = ticketType || 'free';
    if (!ev.availability || typeof ev.availability[type] !== 'number') {
      return res.status(400).json({ error: 'Ticket type not supported for this event' });
    }
    const avail = ev.availability[type];
    if (Number(quantity) > avail) {
      return res.status(400).json({ error: 'Not enough tickets available for this type' });
    }
    // decrement availability and create mock tickets
    ev.availability[type] = avail - Number(quantity);
    const created = [];
    for (let i = 0; i < Number(quantity); i++) {
      const ticket = { id: mockTickets.length + 1, eventId: Number(eventId), buyerId: buyerId ? Number(buyerId) : null, name, email, ticketType: type, status: 'ISSUED', createdAt: new Date() };
      mockTickets.push(ticket);
      created.push(ticket);
    }
    return res.status(201).json({ message: 'Tickets created (mock)', tickets: created });
  }

  try {
    const result = await database.createTicketsForEvent(name, email, Number(eventId), ticketType, Number(quantity), buyerId ? Number(buyerId) : null);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Tickets created', tickets: result.tickets });
  } catch (err) {
    console.error('Ticket creation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});