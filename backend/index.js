import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as database from './database/database.js';
import { generateQr, validateQr } from './database/qr.js';
import { buildIcsForEvent } from './database/calendar.js';

const app = express();


app.use(express.json());
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


// Calendar endpoints
app.get("/api/events/:eventId/ics", async (req, res) => {
  const { eventId } = req.params;
  const event = await database.getEventById(eventId);
  
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const ics = buildIcsForEvent(event);
  if (!ics) {
    return res.status(500).json({ error: "Failed to generate calendar file" });
  }

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=event-${event.id}.ics`);
  res.send(ics);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
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

// Create event endpoint
app.post("/api/events", async (req, res) => {
  try {
    const {
      title,
      description,
      cost = 0,
      maxAttendees,
      date,
      locationName = null,
      latitude = null,
      longitude = null,
      tags = [],
      eventOwnerId,
      imageUrl = null
    } = req.body;

    if (!title || !description || !maxAttendees || !date || !eventOwnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const created = await database.createEvent({
      title,
      description,
      cost,
      maxAttendees,
      date,
      locationName,
      latitude,
      longitude,
      tags,
      eventOwnerId,
      imageUrl
    });

    return res.status(201).json({ event: created });
  } catch (err) {
    console.error("Create event error:", err);
    return res.status(500).json({ error: "Server error creating event" });
  }
});

// PUT
app.put("/api/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: "Valid event ID is required" });
    }

    const {
      title, description, cost, maxAttendees, date,
      locationName, latitude = null, longitude = null,
      tags, imageUrl
    } = req.body;

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (cost !== undefined) updatedFields.cost = Number(cost);
    if (maxAttendees !== undefined) updatedFields.maxAttendees = Number(maxAttendees);
    if (date !== undefined) updatedFields.date = date; // ISO string OK
    if (locationName !== undefined) updatedFields.locationName = locationName;
    if (latitude !== undefined) updatedFields.latitude = latitude;
    if (longitude !== undefined) updatedFields.longitude = longitude;
    if (Array.isArray(tags)) updatedFields.tags = tags;
    if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;

    const updated = await database.updateEvent(Number(eventId), updatedFields);
    if (!updated) return res.status(500).json({ error: "Failed to update event" });

    return res.status(200).json({ event: updated });
  } catch (err) {
    console.error("Update event error:", err);
    return res.status(500).json({ error: "Server error updating event" });
  }
});

// PATCH
app.patch("/api/events/:eventId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId) {
      return res.status(400).json({ error: "Valid event ID is required" });
    }

    const {
      title,
      description,
      cost,
      maxAttendees,
      date,
      locationName,
      latitude,
      longitude,
      tags,
      imageUrl,
    } = req.body;

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (cost !== undefined) updatedFields.cost = cost;
    if (maxAttendees !== undefined) updatedFields.maxAttendees = maxAttendees;
    if (date !== undefined) updatedFields.date = date;
    if (locationName !== undefined) updatedFields.locationName = locationName;
    if (latitude !== undefined) updatedFields.latitude = latitude;
    if (longitude !== undefined) updatedFields.longitude = longitude;
    if (Array.isArray(tags)) updatedFields.tags = tags;
    if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;

    const updatedEvent = await database.updateEvent(eventId, updatedFields);
    if (!updatedEvent) return res.status(500).json({ error: "Failed to update event" });

    // IMPORTANT: no supabase.auth.* calls here
    return res.status(200).json({ event: updatedEvent });
  } catch (err) {
    console.error("Update event error:", err);
    return res.status(500).json({ error: "Server error updating event" });
  }
});

// Delete event
app.delete("/api/events/:eventId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId) return res.status(400).json({ error: "Valid event ID is required" });

    const ok = await database.deleteEvent(eventId);
    if (!ok) return res.status(500).json({ error: "Failed to delete event" });

    return res.status(204).end();
  } catch (err) {
    console.error("Delete event error:", err);
    return res.status(500).json({ error: "Server error deleting event" });
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
