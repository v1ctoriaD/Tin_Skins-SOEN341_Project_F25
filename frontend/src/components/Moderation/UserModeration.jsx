import "../../styles/Moderation.css";
import { FaTrashAlt, FaUser, FaUserSecret } from "react-icons/fa";
import { FaBuildingCircleExclamation, FaBuildingCircleCheck/*, FaBuildingCircleXmark*/ } from "react-icons/fa6";
import usePageTitle from "../../hooks/usePageTitle";

export default function UserModerations({ organizations, setOrganizations, users, setUsers, user }) {
  usePageTitle();

  const handleChangeAdminStatus = async (e, userId, role) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, role: role, reqType: "ChangeAdminStatus" }),
    });
    await res.json();
    if (res.ok) {
      //updates local copy
      const updatedUsers = users.map(user => user.id === userId ? { ...user, role: role } : user);
      setUsers(updatedUsers);
    }
  };

  const handleApproveOrganization = async (e, orgId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: orgId, reqType: "ApproveOrganization" }),
    });
    await res.json();
    if (res.ok) {
      //updates local copy
      const updatedOrganizations = organizations.map(org => org.id === orgId ? { ...org, isApproved: true } : org);
      setOrganizations(updatedOrganizations);
    }
  };

  const handleUnapproveOrganization = async (e, orgId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: orgId, reqType: "UnapproveOrganization" }),
    });
    await res.json();
    if (res.ok) {
      //updates local copy
      const updatedOrganizations = organizations.map(org => org.id === orgId ? { ...org, isApproved: false } : org);
      setOrganizations(updatedOrganizations);
    }
  };

  const handleDeleteUser = async (e, authId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId: authId , reqType: "DeleteUser" }),
    });
    await res.json();
    if (res.ok) {
      const updatedUsers = users.filter(user => user.authId !== authId);
      setUsers(updatedUsers);
    }
  };

  const handleDeleteOrganization = async (e, authId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId: authId , reqType: "DeleteOrganization" }),
    });
    await res.json();
    if (res.ok) {
     const updatedOrganizations = organizations.filter(org => org.authId !== authId);
     setOrganizations(updatedOrganizations); 
    }
  };
 
  const orgRequests = organizations.filter(org => org.isApproved === false);
  const orgApproved = organizations.filter(org => org.isApproved === true);

  return (
    <div className="moderation-page">
      {/* Organization Requests */}
      <div className="moderation-container">
        <h2>Pending Organization Requests...</h2>
        <div className="moderation-list">
          {orgRequests.map((org) => (
            <div key={org.id} className="moderation-card">
              <div className="card-left">
                <FaBuildingCircleExclamation className="card-icon-yellow" />
                <span className="card-name">{org.orgName}</span>
              </div>
              <div className="card-actions">
                <button className="approve-btn" onClick={(e) => handleApproveOrganization(e, org.id)} >Approve</button>
                <button className="reject-btn" onClick={(e) => handleDeleteOrganization(e, org.authId)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users & Organizations Moderation */}
      <div className="moderation-container">
        <h2>Manage Students and Organization</h2>

        {/* Organizations Section */}
        <div className="moderation-subsection">
          <h3>Organizations</h3>
          {orgApproved.map((org) => (
            <div key={org.id} className="moderation-card">
              <div className="card-left">
                <FaBuildingCircleCheck className="card-icon" />
                <span className="card-name">{org.orgName}</span>
              </div>
              <div className="card-actions">
                <button className="reject-btn" onClick={(e) => handleUnapproveOrganization(e, org.id)}>
                  Disable
                </button>
                <FaTrashAlt className="trash-icon" onClick={(e) => handleDeleteOrganization(e, org.authId)} />
              </div>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <div className="moderation-subsection">
          <h3>Students</h3>
          {users.map((user) => (
            <div key={user.id} className="moderation-card">
              <div className="card-left">
                {user.role === "ADMIN" ? (
                  <FaUserSecret className="card-icon" />
                ) : (
                  <FaUser className="card-icon" />
                )}
                <span className="card-name">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="card-actions">
                {user.role === "USER" ? (
                  <button className="approve-btn" onClick={(e) => handleChangeAdminStatus(e, user.id, "ADMIN")}>
                    Make Admin
                  </button>
                ) : (
                  <button className="reject-btn" onClick={(e) => handleChangeAdminStatus(e, user.id, "USER")}>
                    Remove Admin
                  </button>
                )}
                <FaTrashAlt className="trash-icon" onClick={(e) => handleDeleteUser(e, user.authId)}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}