import "../styles/tokens.css";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

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
          <Link to="/">
            <div style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "4px" }}>
              NAME+LOGO
            </div>
          </Link>
          

          {/* Links (just below) */}
          <div>
            <Link to="/discover" className="nav-logo"><FaSearch /></Link>
            <Link to="/account" className="nav-logo"><FaUser /></Link>
        </div>
        </div>
      </div>

      {/* Center options row */}
      <nav style={{ marginTop: "8px", textAlign: "center" }}>
        <Link to="/" className="nav-option">Option1</Link>
        <Link to="/" className="nav-option">Option2</Link>
        <Link to="/" className="nav-option">Option3</Link>
        <Link to="/" className="nav-option">Option4</Link>
        <Link to="/" className="nav-option">Option5</Link>
        <Link to="/" className="nav-option">About Us</Link>
      </nav>
    </header>
  );
}