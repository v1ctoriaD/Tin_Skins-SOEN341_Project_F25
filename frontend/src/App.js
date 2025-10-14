import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Discover from "./components/Discover";
import Account from "./components/Account";

import QrGenerate from "./components/QrCode/QrGenerate";
import QrScan from "./components/QrCode/QrScan";
import TicketClaim from "./components/TicketClaim";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";

import "./styles/tokens.css";
import "./App.css";
import "./styles/qrcodeMenu.css";

function App() {
  const [token, setToken] = useState(null);
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState(null);
  const [, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/getEvents");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvents();
  }, []);

  const handleLogin = (t) => setToken(t);
  const handleLogout = () => setToken(null);
  function onSetSessionHandler(s) { setSession(s); }

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar token={token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover events={events} />} />
          <Route path="/account" element={<Account session={session} setSession={onSetSessionHandler} />} />
          <Route path="/qr/generate" element={<QrGenerate />} />
          <Route path="/qr/scan" element={<QrScan />} />
          <Route path="/tickets/claim" element={<TicketClaim events={events} session={session} token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout token={token} onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;


// import React, { useEffect, useState } from "react";
// import Navbar from "./components/Navbar";
// import Banner from "./components/Banner";   // or Hero, depending on your file
// import "./styles/tokens.css";
// import "./App.css";

// function App() {


//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetch("/api/hello")
//       .then((res) => res.json())
//       .then((data) => setMessage(data.message))
//       .catch((err) => console.error("Error fetching backend:", err));
//   }, []);

//   return (
//     <div className="App">
//       <Navbar />
//       <Banner />
//     </div>
//   );
// }

// export default App;

/**
 * import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
 */
