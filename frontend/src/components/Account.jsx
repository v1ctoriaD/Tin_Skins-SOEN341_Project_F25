import { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";
import Logout from "./Logout";

function Account({session, setSession}) {
    const [showLogin, setShowLogin] = useState(true);
    const [showSignup, setShowSignup] = useState(false);

    const handleLogin = (session) => {
        setSession(session);
        setShowLogin(false);
        setShowSignup(false);
    };

    const handleLogout = () => {
        setSession(null);
        setShowLogin(true);
        setShowSignup(false);
    };

    const handleSignup = () => {
        setShowSignup(false);
        setShowLogin(true);
    };

    return ( <div> {!session ? (
        <div>
          {showLogin && (
            <>
              <Login onLogin={handleLogin} />
              <p>
                Don't have an account?{' '}
                <button onClick={() => { setShowSignup(true); setShowLogin(false); }}>
                  Signup
                </button>
              </p>
            </>
          )}
          {showSignup && (
            <>
              <Signup onSignup={handleSignup} />
              <p>
                Already have an account?{' '}
                <button onClick={() => { setShowLogin(true); setShowSignup(false); }}>
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <Logout onLogout={handleLogout} />
        </div>
      )}
    </div> );
}

export default Account;