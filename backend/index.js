import 'dotenv/config';
import express from "express";
const app = express();
const PORT = 5000;

app.use(express.json());
import prisma from "./database/prisma.js";
let sessions = {};

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { email, password, firstName = "", lastName = "" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }
    await prisma.user.create({
      data: {
        email,
        authId: email, // For simplicity
        firstName,
        lastName,
        role: "USER",
        // Store password in plaintext for demo only; use hashing in production!
        password,
      },
    });
    res.json({ message: "Signup successful" });
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = Math.random().toString(36).substring(2);
    sessions[token] = email;
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  if (sessions[token]) {
    delete sessions[token];
    return res.json({ message: "Logout successful" });
  }
  res.status(400).json({ error: "Invalid token" });
});


app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});