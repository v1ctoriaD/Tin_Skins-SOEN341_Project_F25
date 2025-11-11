import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/account.css";
import "../../styles/Banner.css";
import { PiCheckCircle, PiClockUser } from "react-icons/pi";
import usePageTitle from "../../hooks/usePageTitle";

const Login = ({ onLogin, setUser, org, setOrg, setSession }) => {
  usePageTitle();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function resetPassword() { setPassword(""); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    //check for bad password
    if (!/[A-Z]/.test(password)) {
      resetPassword();
      return setMessage("Password must contain uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      resetPassword();
      return setMessage("Password must contain lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      resetPassword();
      return setMessage("Password must contain digit");
    }
    if (password.length < 8) {
      resetPassword();
      return setMessage("Password must be of at least 8 characters");
    }

    //have backend login
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, accountType }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("");
      onLogin(data.session);
      setSession(data.session);
      setUser(data.user);
      setOrg(data.org);
      setIsLoggedIn(true);
      if (data.user) {
        localStorage.setItem("role", data.user.role);
        localStorage.removeItem("isOrg");
      } else if (data.org) {
        localStorage.setItem("isOrg", "true");
        localStorage.setItem("org", JSON.stringify(data.org));
        localStorage.removeItem("role");
      }
    } else {
      setMessage(data.error);
    }
  };

  return (
    <section className="login-page">
      <div className="login-container">
        {(!isLoggedIn) ? (<>
          <h1>Welcome Back</h1>
          <p className="login-subtext">
            {accountType === "user" ? <>Log in as a <b>student</b> to <u>explore</u> amazing events</> : <>Log in as an <b>organization</b> to <u>host</u> amazing events</>}
          </p>

          <div className="account-type-toggle">
            <button
              className={`toggle-btn ${accountType === "user" ? "active" : ""}`}
              onClick={() => setAccountType("user")}
            >
              Student
            </button>
            <button
              className={`toggle-btn ${accountType === "organization" ? "active" : ""}`}
              onClick={() => setAccountType("organization")}
            >
              Organization
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div className="login-buttons">
              <button type="submit" className="button">Login</button>
            </div>
          </form>

          {message && <div className="login-message">{message}</div>}

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </>
        ) : ((accountType !== "user" && (org && !org.isApproved)) ? ( //check if this line is good...
          <>
            <PiClockUser className="warn-icon" />
            <h1 className="warn-text">You're in!</h1>
            <p className="login-subtext-dark">
              Waiting for an <b>admin</b> to approve your account...
            </p>
            <div className="banner-buttons">
              <Link className="button create-btn" to="/discover">
                Browse Events While Waiting...
              </Link>
            </div>
            <p className="login-subtext-dark">
              <i>Note: This may take up to 24 hours</i>
            </p>
          </>
        ) : (
          <>
            <PiCheckCircle className="check-icon" />
            <h1 className="success-text">You're in!</h1>
            <div className="spacer" />
            <div className="banner-buttons">
              <Link className="button" to="/">
                Home
              </Link>
              {accountType === "user" ? (
                <Link className="button create-btn" to="/discover">
                  View Events
                </Link>
              ) : (
                <Link className="button create-btn" to="/create">
                  Host Events
                </Link>
              )}
            </div>
          </>
        )
        )}
      </div>
    </section>
  );
};

export default Login;
