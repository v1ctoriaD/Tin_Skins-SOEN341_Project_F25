const Logout = ({ onLogout, setUser, setOrg, setSession, className }) => {
  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      onLogout && onLogout();
      setUser(null);
      setOrg(null);
      setSession(null);
      alert("Logout successful!");
    } else {
      alert(data.error);
    }
  };

  return (
    <button className={className} onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
