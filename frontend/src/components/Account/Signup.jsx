import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/account.css";

const Signup = ({ onSignup, setUser, setOrg, setSession }) => {
  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  function resetPassword() { setFormData({...formData, password:"", confirmPassword:""}); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    //check for bad password (1 uppercase, 1 lowercase, 1 digit, length >= 8)
    if (formData.password !== formData.confirmPassword) {
      resetPassword();
      return setMessage("Passwords must match");
    }
    if (!/[A-Z]/.test(formData.password)) {
      resetPassword();
      return setMessage("Password must contain uppercase letter");
    }
    if (!/[a-z]/.test(formData.password)) {
      resetPassword();
      return setMessage("Password must contain lowercase letter");
    }
    if (!/[0-9]/.test(formData.password)) {
      resetPassword();
      return setMessage("Password must contain digit");
    }
    if (formData.password.length < 8) {
      resetPassword();
      return setMessage("Password must be of at least 8 characters");
    }
    
    //send to backend
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({formData, accountType}),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Signup successful!");
      onSignup();
      setSession(data.session);
      setUser(data.user);
      setOrg(data.org);
      navigate("/");
    } else {
      setMessage(data.error);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="login-page">
      <div className="login-container">
        <h1>New Account</h1>
        <p className="login-subtext">
          {accountType === "user" ? <>Join as a <b>student</b> to <u>explore</u> amazing events</> : <>Join as an <b>organization</b> to <u>host</u> amazing events</>}
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
          {accountType === "user" ? (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <input
              type="text"
              name="organizationName"
              placeholder="Organization Name"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="login-buttons">
            <button type="submit" className="button">Sign Up</button>
          </div>
        </form>

        {message && <div className="login-message">{message}</div>}

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Signup;
