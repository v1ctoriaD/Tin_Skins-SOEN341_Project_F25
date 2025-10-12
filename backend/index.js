import express from 'express';
import 'dotenv/config';
import * as database from './database/database.js';
import { generateQr, validateQr } from './database/qr.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Get all Events endpoint
app.get("/api/getEvents", async (req, res) => {
  const events = await database.getAllEvents();
  if (!events) {
    return res.status(500).json({ error: "Either no events or database error" });
  }
  res.json({ events });
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { email, password, firstName = "", lastName = "" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const session = await database.createUser(email, password, firstName, lastName);
    if (!session) {
      return res.status(409).json({ error: "User already exists" });
    }
    res.json({ message: "Signup successful", session });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const session = await database.signIn(email, password);
    if (!session) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful", session });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  database.signOut();
  return res.json({ message: "Logout successful" });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api/tickets/:ticketId/qr", generateQr);
app.post("/api/checkin", validateQr);

// Create tickets for an event (enforce capacity, support mock-paid)
app.post('/api/events/:eventId/tickets', async (req, res) => {
  const { eventId } = req.params;
  const { name, email, ticketType = 'free', qty = 1 } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ error: 'Event ID and buyer email are required' });
  }

  try {
    const result = await database.createTicketsForEvent(name, email, Number(eventId), ticketType, Number(qty));
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