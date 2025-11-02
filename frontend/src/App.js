import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Discover from "./components/Discover/Discover";
import MapView from "./components/MapViews/MapView";

import QrScan from "./components/QrCode/QrScan";
import TicketClaim from "./components/Discover/TicketClaim";
import UserModerations from "./components/Moderation/UserModeration";

import Signup from "./components/Account/Signup";
import Login from "./components/Account/Login";

import "./styles/tokens.css";
import "./App.css";
import "./styles/dropdown.css";
import About from "./components/About";

function App() {
  const [events, setEvents] = useState(null); //all events
  const [organizations, setOrganizations] = useState(null); //all organizations
  const [users, setUsers] = useState(null); //all users

  const [token, setToken] = useState(null);
  const [/*session*/, setSession] = useState(null); //session from auth
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/getEvents", {
           method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store" 
      });
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {}
    };
    const fetchOrganizations = async () => {
      try {
        const res = await fetch("/api/getOrganizations");
        if (!res.ok) throw new Error("Failed to fetch organizations");
        const data = await res.json();
        setOrganizations(data.organizations);
      } catch (err) {}
    };
    const fethcUsers = async () => {
      try {
        const res = await fetch("/api/getUsers");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {}
    };
    
    fetchEvents();
    fetchOrganizations();
    fethcUsers();
  }, []);

  const handleLogin = (t) => setToken(t);
  const handleLogout = () => setToken(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar token={token} onLogout={handleLogout} user={user} org={org} setUser={setUser} setOrg={setOrg} setSession={setSession} />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover events={events} user={user} org={org} isRegistrations={false} isMyEvent={false} />} />
          <Route path="/discover/:id" element={<Discover events={events} user={user} org={org} isRegistrations={false} isMyEvent={false} />} />
          <Route path="/map" element={<MapView events={events} user={user} org={org} />} />
          <Route path="/registrations" element={<Discover events={events} user={user} org={org} isRegistrations={true} isMyEvent={false} />} />
          <Route path="/myEvents" element={<Discover events={events} user={user} org={org} isRegistrations={false} isMyEvent={true} />} />
          <Route path="/qr/scan" element={<QrScan />} />
          <Route path="/register" element={<TicketClaim setEvents={setEvents} user={user} setUser={setUser} />} />
          <Route path="/moderate/users" element ={<UserModerations organizations={organizations} setOrganizations={setOrganizations} users={users} setUsers={setUsers} user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} setUser={setUser} org={org} setOrg={setOrg} setSession={setSession} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;