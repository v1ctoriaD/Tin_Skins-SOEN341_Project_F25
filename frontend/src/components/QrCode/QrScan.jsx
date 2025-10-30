import React, { useState } from "react";
import jsQR from "jsqr";
import "../../styles/tokens.css";
import "../../styles/qr.css";
import usePageTitle from "../../hooks/usePageTitle";

export default function QrScan() {
  usePageTitle();

  const [scanResult, setScanResult] = useState("");
  const [status, setStatus] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          setScanResult(code.data);
          try {
            const parsed = JSON.parse(code.data);
            if (parsed.t) {
              validateToken(parsed.t);
            } else {
              setStatus("Invalid QR format");
            }
          } catch {
            setStatus("QR code content is not JSON");
          }
        } else {
          setStatus("Could not read QR code");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const validateToken = async (token) => {
    setStatus("...");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setStatus(
        data.ok
          ? `Ticket #${data.ticketId} checked in!`
          : `${data.reason || "Validation failed"}`
      );
    } catch {
      setStatus("Server error while validating");
    }
  };

  return (
    <main className="qr-page">
      <div style={{ width: "100%", maxWidth: 680 }}>
        {/* Title ABOVE the box */}
        <h2 className="qr-page-title">Scan QR from Image</h2>
        <p className="qr-page-subtitle">Upload a photo or screenshot of a QR code.</p>

        <section className="qr-card">
          <input
            className="qr-file"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />

          {scanResult && (
            <div className="qr-decoded">
              <strong>Decoded:</strong> {scanResult}
            </div>
          )}

          <div className="qr-status">{status}</div>
        </section>
      </div>
    </main>
  );
}
