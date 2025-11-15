import '../styles/tokens.css'
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSearch,
  FaUser,
  FaBars,
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/Logo.png'
import Logout from './Account/Logout'

// Accept token/onLogout from App (backward compatible if not passed)
export default function Navbar({
  token = null,
  onLogout = () => {},
  user = null,
  org = null,
  setUser,
  setOrg,
  setSession,
}) {
  const navigate = useNavigate()
  function handleLogOut() {
    navigate('/')
    onLogout()
  }

  return (
    <header
      className="navbar-header"
      style={{ borderBottom: '1px solid #ccc', padding: '8px 16px', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Social media icons (top left) */}
        <div>
          <a href="https://twitter.com" className="nav-logo">
            <FaTwitter />
          </a>
          <a href="https://facebook.com" className="nav-logo">
            <FaFacebook />
          </a>
          <a href="https://instagram.com" className="nav-logo">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" className="nav-logo">
            <FaLinkedin />
          </a>
        </div>

        {/* Center logo */}
        <div className="nav-center">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Campus Event Logo" className="nav-logo-img" />
          </Link>
        </div>

        {/* User icons (top right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/discover" className="nav-logo">
            <FaSearch />
          </Link>

          {/* User popover on hover (unique class) */}
          <div className="nav-user has-dropdown user-dropdown">
            <span className="nav-logo">
              <FaUser onClick={() => !token && navigate('/login')} />
            </span>
            <div className="dropdown">
              {!token ? (
                <>
                  <Link className="dropdown-link" to="/login">
                    Login
                  </Link>
                  <Link className="dropdown-link" to="/signup">
                    Signup
                  </Link>
                </>
              ) : (
                <Logout
                  onLogout={handleLogOut}
                  setOrg={setOrg}
                  setUser={setUser}
                  setSession={setSession}
                  className="dropdown-link"
                />
              )}
            </div>
          </div>

          <Link to="/about" className="nav-logo">
            <FaBars />
          </Link>
        </div>
      </div>

      {/* Center options row */}
      <nav style={{ marginTop: '8px', textAlign: 'center' }}>
        <Link to="/" className="nav-option">
          Home
        </Link>
        <Link to="/discover" className="nav-option">
          Discover
        </Link>
        {user && (
          <Link to="/registrations" className="nav-option">
            Registrations
          </Link>
        )}
        {org && (
          <Link to="/myEvents" className="nav-option">
            My Events
          </Link>
        )}
        <Link to="/map" className="nav-option">
          Map
        </Link>

        {org && <Link className="nav-option" to="/qr/scan">Scan Qr Code</Link>}
        {(org || (user && user.role === "ADMIN")) && <Link to="/create" className="nav-option">Create Event</Link>}
        {(user && user.role === "ADMIN") && <Link to="/moderate/users" className="nav-option">Moderate Users</Link>}
        {(user && user.role === "ADMIN") && <Link to="/admin/analytics" className="nav-option">Analytics</Link>}
        <Link to="/about" className="nav-option">About Us</Link>
      </nav>
    </header>
  )
}
