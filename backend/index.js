import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as database from './database/database.js';
import { generateQr, validateQr } from './database/qr.js';

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

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { formData, accountType } = req.body;
  if(accountType === "user") {
    try {
      const email = await database.createUser(formData.email, formData.password, formData.firstName, formData.lastName);
      if (!email) {
        return res.status(409).json({ error: "User already exists" });
      }
      res.json({ message: "Signup successful", email});
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
      wasSuccess = await database.updateUser(userId, {role: role});
      break;
    case "ApproveOrganization":
      wasSuccess = await database.updateOrganization(orgId, {isApproved: true});
      break;
    case "UnapproveOrganization":
      wasSuccess = await database.updateOrganization(orgId, {isApproved: false});
      break;
    case "DeleteUser":
      wasSuccess = await database.deleteUser(authId);
      break;
    case "DeleteOrganization":
      wasSuccess = await database.deleteOrganization(authId);
      break;
    default:
      return res.status(400).json({ message: "Invalid moderation request"});
  }
  if(wasSuccess) {
    return res.status(201).json({ message: "Moderation request processed successfully" });
  } else {
    return res.status(401).json({ message: "Moderation request failed to process" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});