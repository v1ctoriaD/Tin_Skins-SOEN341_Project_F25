import React, { useState } from "react";
import QRCode from "react-qr-code";
import "../../styles/tokens.css";
import "../../styles/qr.css";

export default function QrGenerate() {
  const [ticketId, setTicketId] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");

  const generateQr = async () => {
    setResult("...");
    try {
      const res = await fetch(`/api/tickets/${ticketId}/qr`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setToken(data.payload.t);
        setResult("✅ QR generated successfully");
      } else {
        setResult(`❌ ${data.reason || "Failed to generate QR"}`);
      }
    } catch {
      setResult("❌ Server error while generating QR");
    }
  };

  const qrValue = token ? JSON.stringify({ t: token }) : "";

  return (
    <main className="qr-page">
      <div style={{ width: "100%", maxWidth: 680 }}>
        {/* Title ABOVE the box */}
        <h2 className="qr-page-title">Generate QR Code</h2>
        <p className="qr-page-subtitle">(Enter <strong>1</strong> for testing)</p>

        <section className="qr-card">
          <label>
            Ticket ID
            <input
              className="qr-input"
              type="number"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Enter ticket id"
            />
          </label>

          <div className="qr-actions">
            <button className="qr-btn" onClick={generateQr} disabled={!ticketId}>
              Generate QR
            </button>
          </div>

          {token && (
            <>
              <div className="qr-decoded">
                <strong>Token:</strong> {token}
              </div>
              <div className="qr-preview">
                <QRCode value={qrValue} size={220} />
              </div>
            </>
          )}

          <div className="qr-status">{result}</div>
        </section>
      </div>
    </main>
  );
}
