import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";
import "./styles/tokens.css";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (token) => {
    setToken(token);
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    setToken(null);
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleSignup = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  return (
    <div className="App">
      <Navbar />
      <Banner />
      {!token ? (
        <div>
          {showLogin && (
            <>
              <Login onLogin={handleLogin} />
              <p>
                Don't have an account?{' '}
                <button onClick={() => { setShowSignup(true); setShowLogin(false); }}>
                  Signup
                </button>
              </p>
            </>
          )}
          {showSignup && (
            <>
              <Signup onSignup={handleSignup} />
              <p>
                Already have an account?{' '}
                <button onClick={() => { setShowLogin(true); setShowSignup(false); }}>
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <Logout token={token} onLogout={handleLogout} />
        </div>
      )}
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