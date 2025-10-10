import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Account from "./components/Account";
import Discover from "./components/Discover";
import "./styles/tokens.css";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";

function App() {
  const [ session, setSession ] = useState(null);

  function onSetSessionHandler(session) {
    setSession(session);
  }


  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/account" element={<Account session={session} setSession={onSetSessionHandler} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;