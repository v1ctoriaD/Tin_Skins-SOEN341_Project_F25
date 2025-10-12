//qr code
import { generateQr, validateQr } from "./database/qr.js";
import express from 'express';
import 'dotenv/config';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api/tickets/:ticketId/qr", generateQr);
app.post("/api/checkin", validateQr);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});