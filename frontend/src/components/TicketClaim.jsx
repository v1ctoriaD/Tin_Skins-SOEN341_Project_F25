import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/tokens.css";

// Simple in-memory mock of ticket availability per type
const INITIAL_STOCK = {
  free: 50,
  paid: 20,
  vip: 5,
};

export default function TicketClaim() {
  const navigate = useNavigate();
  const [stock, setStock] = useState(INITIAL_STOCK);

  const [form, setForm] = useState({ name: "", email: "", type: "free", qty: 1 });
  const [errors, setErrors] = useState([]);
  const [stage, setStage] = useState("form"); // form, payment, processing, done

  function validate() {
    const e = [];
    if (!form.name.trim()) e.push("Name is required");
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.push("Valid email is required");
    if (form.qty < 1) e.push("Quantity must be at least 1");
    if (form.qty > 10) e.push("You can claim up to 10 tickets at once");
    const available = stock[form.type] ?? 0;
    if (form.qty > available) e.push(`Only ${available} ${form.type} tickets left`);
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const eList = validate();
    setErrors(eList);
    if (eList.length) return;

    // If paid ticket, go to mock payment step
    if (form.type === "paid" || form.type === "vip") {
      setStage("payment");
      return;
    }

    // For free tickets, process immediately
    processClaim();
  }

  function processClaim() {
    setStage("processing");
    // simulate server call
    setTimeout(() => {
      // decrement stock
      setStock((s) => ({ ...s, [form.type]: s[form.type] - form.qty }));
      setStage("done");
    }, 900);
  }

  function onPay() {
    setStage("processing");
    setTimeout(() => {
      setStock((s) => ({ ...s, [form.type]: s[form.type] - form.qty }));
      setStage("done");
    }, 1200);
  }

  if (stage === "done") {
    return (
      <div className="page">
        <h2>Tickets claimed ✅</h2>
        <p>Thanks {form.name}. Your {form.qty} {form.type} ticket(s) are reserved.</p>
        <button onClick={() => navigate("/discover")}>Back to events</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Claim Tickets</h2>
      <p>Simple ticket claim form. Select ticket type and quantity.</p>

      <div style={{ marginBottom: 12 }}>
        <strong>Availability:</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <span>Free: {stock.free}</span>
          <span>Paid: {stock.paid}</span>
          <span>VIP: {stock.vip}</span>
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ color: "#a33", marginBottom: 12 }}>
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {stage === "form" && (
        <form onSubmit={onSubmit} style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 8 }}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Ticket Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="vip">VIP (paid)</option>
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Quantity</label>
            <input type="number" min={1} max={10} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit">Continue</button>
            <button type="button" onClick={() => { setForm({ name: "", email: "", type: "free", qty: 1 }); setErrors([]); }}>Reset</button>
          </div>
        </form>
      )}

      {stage === "payment" && (
        <div>
          <h3>Mock Payment</h3>
          <p>You're about to pay for {form.qty} {form.type} ticket(s).</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onPay}>Pay (mock)</button>
            <button onClick={() => setStage("form")}>Back</button>
          </div>
        </div>
      )}

      {stage === "processing" && (
        <div>
          <h3>Processing...</h3>
          <p>Please wait while we reserve your tickets.</p>
        </div>
      )}
    </div>
  );
}
