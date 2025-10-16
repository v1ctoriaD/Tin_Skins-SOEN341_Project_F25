import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Discover from "./components/Discover";

import QrGenerate from "./components/QrCode/QrGenerate";
import QrScan from "./components/QrCode/QrScan";
import TicketClaim from "./components/TicketClaim";

import Signup from "./components/Account/Signup";
import Login from "./components/Account/Login";
import Logout from "./components/Account/Logout";

import "./styles/tokens.css";
import "./App.css";
import "./styles/dropdown.css";

function App() {
  const [token, setToken] = useState(null);
  const [session, setSession] = useState(null); //session from auth
  const [events, setEvents] = useState(null);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/getEvents");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {}
    };
    fetchEvents();
  }, []);

  const handleLogin = (t) => setToken(t);
  const handleLogout = () => setToken(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar token={token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover events={events} user={user}/>} />
          <Route path="/qr/generate" element={<QrGenerate />} />
          <Route path="/qr/scan" element={<QrScan />} />
          <Route path="/tickets/claim" element={<TicketClaim events={events} session={session} token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} setUser={setUser} org={org} setOrg={setOrg} setSession={setSession} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout token={token} onLogout={handleLogout} setUser={setUser} setOrg={setOrg} setSession={setSession} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;