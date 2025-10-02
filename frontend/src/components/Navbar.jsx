import React from "react";
import "../styles/tokens.css";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaSearch, FaUser } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="navbar-header" style={{ borderBottom: "1px solid #ccc", padding: "8px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: social logos //TO DO */}
        <div>
        <div>
            <a href="https://twitter.com" className="nav-logo"><FaTwitter /></a>
            <a href="https://facebook.com" className="nav-logo"><FaFacebook /></a>
            <a href="https://instagram.com" className="nav-logo"><FaInstagram /></a>
            <a href="https://linkedin.com" className="nav-logo"><FaLinkedin /></a>
        </div>
        </div>

        {/* Right: Site name and links */}
        <div style={{ textAlign: "right" }}>
          {/* Site name (on top) */}
          <div style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "4px" }}>
            NAME+LOGO
          </div>

          {/* Links (just below) */}
          <div>
            <a href="/discover" className="nav-logo"><FaSearch /></a>
            <a href="/login" className="nav-logo"><FaUser /></a>
        </div>
        </div>
      </div>

      {/* Center options row */}
      <nav style={{ marginTop: "8px", textAlign: "center"}}>
        <a href="#" className="nav-option">Option1</a>
        <a href="#" className="nav-option">Option2</a>
        <a href="#" className="nav-option">Option3</a>
        <a href="#" className="nav-option">Option4</a>
        <a href="#" className="nav-option">Option5</a>
        <a href="#" className="nav-option">About Us</a>
      </nav>
    </header>
  );
}