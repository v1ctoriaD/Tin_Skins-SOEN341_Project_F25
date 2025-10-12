import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Core components
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Discover from "./components/Discover";

// QR pages
import QrGenerate from "./components/QrCode/QrGenerate";
import QrScan from "./components/QrCode/QrScan";

// Auth pages
import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";

// Styles
import "./styles/tokens.css";
import "./App.css";
import "./styles/qrcodeMenu.css";

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (t) => {
    setToken(t);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        {/* Navbar stays at the top */}
        <Navbar token={token} onLogout={handleLogout} />

        {/* All routed pages */}
        <Routes>
          {/* Home & Discover */}
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover />} />

          {/* QR Code pages */}
          <Route path="/qr/generate" element={<QrGenerate />} />
          <Route path="/qr/scan" element={<QrScan />} />

          {/* Auth pages */}
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