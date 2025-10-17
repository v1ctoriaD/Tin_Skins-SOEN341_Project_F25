import "../../styles/Moderation.css";
import { FaTrashAlt, FaUser, FaUserSecret } from "react-icons/fa";
import { FaBuildingCircleExclamation, FaBuildingCircleCheck, FaBuildingCircleXmark } from "react-icons/fa6";
import usePageTitle from "../../hooks/usePageTitle";

export default function UserModerations({ organizations, users, user }) {
  usePageTitle();

  const handleChangeAdminStatus = async (e, userId, role) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, role: role, reqType: "ChangeAdminStatus" }),
    });
    const data = await res.json();
    if (res.ok) {
      
    } else {
      
    }
  };

  const handleApproveOrganization = async (e, orgId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: orgId, reqType: "ApproveOrganization" }),
    });
    const data = await res.json();
    if (res.ok) {
      
    } else {
      
    }
  }; 

  const handleUnapproveOrganization = async (e, orgId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: orgId, reqType: "UnapproveOrganization" }),
    });
    const data = await res.json();
    if (res.ok) {
      
    } else {
      
    }
  };

  const handleDeleteUser = async (e, authId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId: authId , reqType: "DeleteUser" }),
    });
    const data = await res.json();
    if (res.ok) {
      
    } else {
      
    }
  };

  const handleDeleteOrganization = async (e, authId) => {
    e.preventDefault();
    const res = await fetch("/api/moderate/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId: authId , reqType: "DeleteOrganization" }),
    });
    const data = await res.json();
    if (res.ok) {
      
    } else {
      
    }
  };
 
  const orgRequests = [{ id: 1, name: "Tech Society" }];
  users = [{ id: 1, firstName: "John", lastName: "Doe", role: "ADMIN" }, { id: 2, firstName: "Jane", lastName: "Doe", role: "USER" }];
  organizations = [{ id: 1, name: "Student Club" }, { id: 2, name: "Another Club", disabled: true }];

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
                <span className="card-name">{org.name}</span>
              </div>
              <div className="card-actions">
                <button className="approve-btn">Approve</button>
                <button className="reject-btn">Reject</button>
                <FaTrashAlt className="trash-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users & Organizations Moderation */}
      <div className="moderation-container">
        <h2>Manage Students and Organization</h2>

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
                <button className={user.role === "ADMIN" ? "reject-btn" : "approve-btn"}>
                  {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                </button>
                <FaTrashAlt className="trash-icon" />
              </div>
            </div>
          ))}
        </div>

        {/* Organizations Section */}
        <div className="moderation-subsection">
          <h3>Organizations</h3>
          {organizations.map((org) => (
            <div key={org.id} className="moderation-card">
              <div className="card-left">
                {org.disabled ? (
                  <FaBuildingCircleXmark className="card-icon-red" />
                ) : (
                  <FaBuildingCircleCheck className="card-icon-green" />
                )}
                <span className="card-name">{org.name}</span>
              </div>
              <div className="card-actions">
                <button className={org.disabled ? "approve-btn" : "reject-btn"}>
                  {org.disabled ? "Enable" : "Disable"}
                </button>
                <FaTrashAlt className="trash-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}