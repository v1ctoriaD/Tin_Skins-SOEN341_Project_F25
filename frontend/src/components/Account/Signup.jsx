import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/account.css";
import "../../styles/Banner.css";
import { PiWarning  } from "react-icons/pi";

const Signup = () => {
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
  const [isAccountCreated, setIsAccountCreated] = useState(false);

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
      setFormData({
        firstName: "",
        lastName: "",
        organizationName: "",
        email: data.email,
        password: "",
        confirmPassword: "",
      });
      setIsAccountCreated(true);
      setMessage("");
    } else {
      setMessage(data.error);
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    setMessage("Resent email");
    const email = formData.email;
    const res = await fetch("/api/resendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email}),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
    } else {
      setMessage(data.error || "Failed to resend email");
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="login-page">
      <div className="login-container">
        {!isAccountCreated ? (
          <>
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
          </>
        ):(
          <>
            <PiWarning className="warn-icon" />
            <h1 className="warn-text">Verify Email</h1>
            <p className="login-subtext-dark">
              Make sure to verify your email before logging in!
            </p>
            <div className="banner-buttons">
              <button className="button" onClick={handleResendEmail}>
                Resend Email
              </button>
              <Link className="button create-btn" to="/login">
                Log In
              </Link>
            </div>
            {message && <div className="signup-message">{message}</div>}
          </>
        )}
        
      </div>
    </section>
  );
};

export default Signup;
