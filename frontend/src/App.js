import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Account from "./components/Account";
import Discover from "./components/Discover";
import "./styles/tokens.css";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";

function App() {
  const [ session, setSession ] = useState(null); //user session
  const [ events, setEvents ] = useState(null);
  const [, setError] = useState("");

  //on load, get all events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/getEvents");
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchEvents();
  }, []);

  function onSetSessionHandler(session) {
    setSession(session);
  }


  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/discover" element={<Discover events={events} />} />
          <Route path="/account" element={<Account session={session} setSession={onSetSessionHandler} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;