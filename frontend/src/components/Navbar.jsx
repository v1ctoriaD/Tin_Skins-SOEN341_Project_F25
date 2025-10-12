import React from "react";
import "../styles/tokens.css";
import {
  FaTwitter, FaFacebook, FaInstagram, FaLinkedin,
  FaSearch, FaUser, FaBars
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/Logo.png";

// Accept token/onLogout from App (backward compatible if not passed)
export default function Navbar({ token = null, onLogout = () => {} }) {
  return (
    <header className="navbar-header" style={{ borderBottom: "1px solid #ccc", padding: "8px 16px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Social media icons (top left) */}
        <div>
          <a href="https://twitter.com" className="nav-logo"><FaTwitter /></a>
          <a href="https://facebook.com" className="nav-logo"><FaFacebook /></a>
          <a href="https://instagram.com" className="nav-logo"><FaInstagram /></a>
          <a href="https://linkedin.com" className="nav-logo"><FaLinkedin /></a>
        </div>

        {/* Center logo */}
        <div className="nav-center">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Campus Event Logo" className="nav-logo-img" />
          </Link>
        </div>

        {/* User icons (top right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/discover" className="nav-logo"><FaSearch /></Link>

          {/* User popover on hover (unique class) */}
          <div className="nav-user has-dropdown user-dropdown">
            <span className="nav-logo"><FaUser /></span>
            <div className="dropdown">
              {!token ? (
                <>
                  <Link className="dropdown-link" to="/login">Login</Link>
                  <Link className="dropdown-link" to="/signup">Signup</Link>
                </>
              ) : (
                <button className="dropdown-link" onClick={onLogout}>Logout</button>
              )}
            </div>
          </div>

          <Link to="#" className="nav-logo"><FaBars /></Link>
        </div>
      </div>

      {/* Center options row */}
      <nav style={{ marginTop: "8px", textAlign: "center" }}>
        <Link to="/" className="nav-option">Home</Link>
        <Link to="/discover" className="nav-option">Discover</Link>
        <a href="/map" className="nav-option">Map</a>
        <a href="#" className="nav-option">Option</a>
        <a href="#" className="nav-option">Option</a>
        <a href="#" className="nav-option">Option</a>

        <div className="nav-item has-dropdown">
          <span className="nav-option">QR Code Test ▾</span>
          <div className="dropdown">
            <Link className="dropdown-link" to="/qr/generate">Generate QR</Link>
            <Link className="dropdown-link" to="/qr/scan">Scan from Image</Link>
          </div>
        </div>

        <a href="#" className="nav-option">About Us</a>
      </nav>
    </header>
  );
}