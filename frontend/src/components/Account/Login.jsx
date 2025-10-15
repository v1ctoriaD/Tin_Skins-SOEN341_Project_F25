import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/account.css";

const Login = ({ onLogin, setUser, setOrg, setSession }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("user");
  const navigate = useNavigate();

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
      setMessage("Login successful!");
      onLogin(data.session);
      setSession(data.session);
      setUser(data.user);
      setOrg(data.org);
      navigate("/");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <section className="login-page">
      <div className="login-container">
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
      </div>
    </section>
  );
};

export default Login;
