import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as database from './database/database.js';
import { generateQr, validateQr } from './database/qr.js';
import prisma from "./database/prisma.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Get all Events endpoint
app.get("/api/getEvents", async (req, res) => {
  const events = await database.getAllEvents();
  if (!events) {
    return res.status(500).json({ error: "Either no events or database error" });
  }
  res.json({ events });
});

// Get events owned by a specific organization
app.get("/api/getEventsOwned/:orgId", async (req, res) => {
  try {
    const { orgId } = req.params;
    const org = await database.getAllEventsOwnedByOrgId(Number(orgId));
    if (!org || org.length === 0) {
      return res.status(404).json({ error: "No events found for this organization" });
    }
    res.json({ events: org });
  } catch (error) {
    console.error("Error fetching org events:", error);
    res.status(500).json({ error: "Database error fetching organization events" });
  }
});

app.get("/api/admin/region-stats", async (_req, res) => {
  try {
    const stats = await database.getRegionStats();
    res.json({ stats });
  } catch (e) {
    console.error("region-stats error:", e);
    res.status(500).json({ error: "Failed to load region stats" });
  }
});

// Get all Organizations endpoint
app.get("/api/getOrganizations", async (req, res) => {
  const organizations = await database.getAllOrganizations();
  if (!organizations) {
    return res.status(500).json({ error: "Either no organizations or database error" });
  }
  res.json({ organizations });
});

// Get all Users endpoint
app.get("/api/getUsers", async (req, res) => {
  const users = await database.getAllUsers();
  if (!users) {
    return res.status(500).json({ error: "Either no users or database error" });
  }
  res.json({ users });
});

// Get all users with their ticket information
app.get("/api/admin/users-with-tickets", async (req, res) => {
  try {
    const users = await database.getAllUsersWithTickets();
    if (!users) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users with tickets:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { formData, accountType } = req.body;
  if (accountType === "user") {
    try {
      const email = await database.createUser(formData.email, formData.password, formData.firstName, formData.lastName);
      if (!email) {
        return res.status(409).json({ error: "User already exists" });
      }
      res.json({ message: "Signup successful", email });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    try {
      const email = await database.createOrganization(formData.email, formData.password, formData.organizationName, false);
      if (!email) {
        return res.status(409).json({ error: "Organization already exists" });
      }
      res.json({ message: "Signup successful", email });
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
    let user = null;
    let org = null;

    if (accountType === "user") {
      user = await database.getUser(session);
      // Validate that this is actually a user account
      if (!user) {
        return res.status(401).json({ error: "This account is not a student account. Please select 'Organization' to log in." });
      }
    } else {
      org = await database.getOrganization(session);
      // Validate that this is actually an organization account
      if (!org) {
        return res.status(401).json({ error: "This account is not an organization account. Please select 'Student' to log in." });
      }
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

// Resend Email Verification
app.post("/api/resendEmail", async (req, res) => {
  const { email } = req.body;
  const success = await database.resendConfirmationEmail(email);

  if (success) {
    return res.json({ message: "Email sent" });
  } else {
    return res.status(500).json({ error: "Failed to resend email" });
  }
});

app.post("/api/tickets/:ticketId/qr", generateQr);
app.post("/api/checkin", validateQr);

// Get tickets for an event
app.get('/api/events/:eventId/tickets', async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const tickets = await database.getTicketsByEventId(Number(eventId));
    return res.status(200).json(tickets);
  } catch (err) {
    console.error('Ticket fetch error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create tickets for an event (enforce capacity, support mock-paid)
app.post('/api/events/:eventId/tickets', async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    await database.registerToEvent(userId, eventId);
    const result = await database.createTicketForEvent(eventId, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Ticket created', ticket: result.ticket });
  } catch (err) {
    console.error('Ticket creation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

//Admin Moderation
app.post('/api/moderate/user', async (req, res) => {
  const { reqType, userId, role, orgId, authId } = req.body;
  let wasSuccess = false;
  switch (reqType) {
    case "ChangeAdminStatus":
      wasSuccess = await database.updateUser(userId, { role: role });
      break;
    case "ApproveOrganization":
      wasSuccess = await database.updateOrganization(orgId, { isApproved: true });
      break;
    case "UnapproveOrganization":
      wasSuccess = await database.updateOrganization(orgId, { isApproved: false });
      break;
    case "DeleteUser":
      wasSuccess = await database.deleteUser(authId);
      break;
    case "DeleteOrganization":
      wasSuccess = await database.deleteOrganization(authId);
      break;
    default:
      return res.status(400).json({ message: "Invalid moderation request" });
  }
  if (wasSuccess) {
    return res.status(201).json({ message: "Moderation request processed successfully" });
  } else {
    return res.status(401).json({ message: "Moderation request failed to process" });
  }
});

// Admin Analytics endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // In a production app, you'd verify the user is an admin via token/session
    // For now, we'll return the data (frontend checks admin status)
    const analytics = await database.getAdminAnalytics();
    return res.status(200).json(analytics);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Event Analytics endpoint - for organizers to view stats for their event
app.get('/api/events/:eventId/analytics', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Valid event ID is required' });
    }

    const analytics = await database.getEventAnalytics(Number(eventId));
    return res.status(200).json(analytics);
  } catch (err) {
    console.error('Error fetching event analytics:', err);

    if (err.message === 'Event not found') {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(500).json({ error: 'Failed to fetch event analytics data' });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;