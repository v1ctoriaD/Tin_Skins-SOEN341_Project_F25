import StudentMapView from './StudentMapView';

const MapView = () => {
  // read the role saved in localStorage after login
  const storedRole = localStorage.getItem("role");

  // normalize Prisma roles to the app roles
  const normalized =
    storedRole === "USER" ? "student" :
    storedRole === "ADMIN" ? "admin" :
    null;

  if (!normalized) {
    return <p>User role not defined. Please log in.</p>;
  }

  switch (normalized) {
    case 'student':
      return <StudentMapView />;
    case 'admin':
      return "loading..."; // Placeholder for future AdminMapView
    default:
      return <p>Invalid role. Please contact support.</p>;
  }
};

export default MapView;