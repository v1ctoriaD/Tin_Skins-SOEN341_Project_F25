import StudentMapView from './StudentMapView'
import AdminMapView from './AdminMapView'
import OrganizerMapView from './OrganizerMapView'

const MapView = () => {
  // read stored data
  const storedRole = localStorage.getItem('role')
  const isOrg = localStorage.getItem('isOrg') === 'true' // check if organizer logged in

  // normalize user roles
  const normalized = storedRole === 'USER' ? 'student' : storedRole === 'ADMIN' ? 'admin' : null

  // organizer has no role (handeled separately)
  if (isOrg) {
    return <OrganizerMapView />
  }

  if (!normalized) {
    return <p>User role not defined. Please log in.</p>
  }

  switch (normalized) {
    case 'student':
      return <StudentMapView />
    case 'admin':
      return <AdminMapView />
    default:
      return <p>Invalid role. Please contact support.</p>
  }
}

export default MapView
