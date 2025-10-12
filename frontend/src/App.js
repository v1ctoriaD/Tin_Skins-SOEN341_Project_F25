import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Discover from "./components/Discover"; // or wherever you save it

//qr code tester component
import QrGenerate from "./components/QrCode/QrGenerate";
import QrScan from "./components/QrCode/QrScan";

//styles
import "./styles/tokens.css";
import "./App.css";
import "./styles/qrcodeMenu.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching backend:", err));
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover />} />

          {/*qr code routes*/}
          <Route path="/qr/generate" element={<QrGenerate />} />
          <Route path="/qr/scan" element={<QrScan/>} />
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