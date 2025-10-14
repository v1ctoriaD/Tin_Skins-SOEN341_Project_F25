import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/tokens.css";

// Simple in-memory mock of ticket availability per type
const INITIAL_STOCK = {
  free: 50,
  paid: 20,
  vip: 5,
};

export default function TicketClaim({ events = null }) {
  const navigate = useNavigate();
  const [stock, setStock] = useState(INITIAL_STOCK);
  // For testing, only show a small subset of events (first 3)
  const VISIBLE_COUNT = 100;
  // normalize to an array so consumers don't have to null-check
  const visibleEvents = useMemo(() => (events && events.length) ? events.slice(0, VISIBLE_COUNT) : [], [events]);
  const defaultEventId = (visibleEvents.length) ? visibleEvents[0].id : null;
  // maintain a local mutable copy of the visible events so the UI can reflect immediate changes
  const [localEvents, setLocalEvents] = useState(visibleEvents);
  useEffect(() => {
    setLocalEvents(visibleEvents);
  }, [visibleEvents]);

  // compute aggregated availability across local events (used when no single event selected)
  const aggregated = localEvents.reduce(
    (acc, ev) => {
      const avail = ev.availability || {};
      acc.free += Number(avail.free ?? 0);
      acc.paid += Number(avail.paid ?? 0);
      acc.vip += Number(avail.vip ?? 0);
      return acc;
    },
    { free: 0, paid: 0, vip: 0 }
  );
  // form state (declared before effects that reference it)
  const [form, setForm] = useState({ name: "", email: "", type: "free", qty: 1, eventId: defaultEventId });

  // currently selected event object (from the visible events slice)
  const [selectedEvent, setSelectedEvent] = useState(localEvents ? localEvents.find((ev) => ev.id === defaultEventId) : null);

  useEffect(() => {
    // update selectedEvent when form.eventId or localEvents change
    if (!localEvents || localEvents.length === 0) {
      setSelectedEvent(null);
      return;
    }
    const ev = localEvents.find((x) => Number(x.id) === Number(form.eventId));
    setSelectedEvent(ev || null);
  }, [form.eventId, localEvents]);
  const [errors, setErrors] = useState([]);
  const [stage, setStage] = useState("form"); // form, payment, processing, done

  function validate() {
    const e = [];
    if (!form.name.trim()) e.push("Name is required");
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.push("Valid email is required");
    if (form.qty < 1) e.push("Quantity must be at least 1");
    if (form.qty > 10) e.push("You can claim up to 10 tickets at once");
  // Determine available count from selected event availability if present, otherwise from aggregated availability across visible events or local stock
  const perEventAvail = (selectedEvent && selectedEvent.availability) ? (selectedEvent.availability[form.type] ?? 0) : null;
  const available = perEventAvail !== null
    ? perEventAvail
    : (aggregated && aggregated[form.type] !== undefined ? aggregated[form.type] : (stock[form.type] ?? 0));
  if (form.qty > available) e.push(`Only ${available} ${form.type} tickets left`);
    if (!form.eventId) e.push('Please select an event');
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

    // For free tickets, call backend endpoint to create tickets
    if (form.type === "free") {
      await submitToBackend();
      return;
    }
  }
  // Small helper to simulate async delay
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function onPay() {
    try {
      setStage("processing");
      // simulate payment processing delay
      await sleep(1200);
      // after mock payment, call backend
      await submitToBackend();
    } catch (err) {
      setErrors([err?.message || 'Payment failed']);
      setStage('form');
    }
  }

  async function submitToBackend() {
    setStage('processing');
    try {
      const res = await fetch(`/api/events/${form.eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, ticketType: form.type, qty: form.qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.error || 'Failed to create tickets']);
        setStage('form');
        return;
      }
      // update local stock if applicable
      setStock((s) => ({ ...s, [form.type]: (s[form.type] ?? 0) - form.qty }));
      // also update localEvents availability for immediate UI feedback
      setLocalEvents((list) => {
        return list.map((ev) => {
          if (Number(ev.id) !== Number(form.eventId)) return ev;
          const newAvail = { ...(ev.availability || {}) };
          newAvail[form.type] = (Number(newAvail[form.type] ?? 0) - Number(form.qty));
          return { ...ev, availability: newAvail };
        });
      });
      setStage('done');
    } catch (err) {
      setErrors([err.message || 'Network error']);
      setStage('form');
    }
  }

  if (stage === "done") {
    const selectedEvent = events && events.find((ev) => ev.id === form.eventId);
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div style={{ width: 560, padding: 24, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', background: '#fff' }}>
          <h2 style={{ marginTop: 0 }}>Tickets claimed ✅</h2>
          <p>Thanks <strong>{form.name}</strong>. Your <strong>{form.qty}</strong> {form.type} ticket(s) for <strong>{selectedEvent ? selectedEvent.title : 'selected event'}</strong> are reserved.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => navigate("/discover")}>Back to events</button>
            <button onClick={() => { setForm({ name: "", email: "", type: "free", qty: 1, eventId: defaultEventId }); setStage('form'); }}>Claim more</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 32 }}>
      <div style={{ width: 560, padding: 24, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', background: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Claim Tickets</h2>
  <p style={{ color: '#555' }}>Fill the form below to claim tickets. Select an event and ticket type.</p>

        <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ color: '#333' }}>
            <strong>Availability:</strong>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <span>Free: {selectedEvent && selectedEvent.availability ? selectedEvent.availability.free : (aggregated ? aggregated.free : stock.free)}</span>
              <span>Paid: {selectedEvent && selectedEvent.availability ? selectedEvent.availability.paid : (aggregated ? aggregated.paid : stock.paid)}</span>
              <span>VIP: {selectedEvent && selectedEvent.availability ? selectedEvent.availability.vip : (aggregated ? aggregated.vip : stock.vip)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', color: '#666' }}>
            <small>Events: {visibleEvents ? visibleEvents.length : (events ? events.length : '—')}</small>
          </div>
        </div>

        {errors.length > 0 && (
          <div style={{ color: '#a33', marginBottom: 12 }}>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {stage === 'form' && (
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label htmlFor="event-select" style={{ display: 'block', marginBottom: 6 }}>Event</label>
                <select id="event-select" value={form.eventId ?? ''} onChange={(e) => setForm({ ...form, eventId: e.target.value ? Number(e.target.value) : null })} style={{ width: '100%', padding: 8 }}>
                  <option value="" disabled>{(visibleEvents && visibleEvents.length) ? 'Select an event' : 'No events available'}</option>
                  {visibleEvents && visibleEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
            </div>

            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: 6 }}>Name</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 8 }} />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 6 }}>Email</label>
              <input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: 8 }} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="type" style={{ display: 'block', marginBottom: 6 }}>Ticket Type</label>
                <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 8 }}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="vip">VIP (paid)</option>
                </select>
              </div>

              <div style={{ width: 120 }}>
                <label htmlFor="qty" style={{ display: 'block', marginBottom: 6 }}>Quantity</label>
                <input id="qty" type="number" min={1} max={10} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} style={{ width: '100%', padding: 8 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" onClick={() => { setForm({ name: "", email: "", type: "free", qty: 1, eventId: defaultEventId }); setErrors([]); }}>Reset</button>
              <button type="submit">Continue</button>
            </div>
          </form>
        )}

        {stage === 'payment' && (
          <div>
            <h3>Mock Payment</h3>
            <p>You're about to pay for {form.qty} {form.type} ticket(s).</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onPay}>Pay (mock)</button>
              <button onClick={() => setStage('form')}>Back</button>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div>
            <h3>Processing...</h3>
            <p>Please wait while we reserve your tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
