import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import '../../styles/EventAnalytics.css'
import usePageTitle from '../../hooks/usePageTitle'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function EventAnalytics({ token, org }) {
    usePageTitle();

    const { eventId } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [lastGoodData, setLastGoodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showTicketsModal, setShowTicketsModal] = useState(false);
    const [ticketsList, setTicketsList] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [showAttendedModal, setShowAttendedModal] = useState(false);
    const [attendedList, setAttendedList] = useState([]);
    const [loadingAttended, setLoadingAttended] = useState(false);
    const [showCapacityModal, setShowCapacityModal] = useState(false);

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

        setError(null)

        const res = await fetch(`/api/events/${eventId}/analytics`, {
          method: 'GET',
          headers: token
            ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            : { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Event not found')
          }
          throw new Error('Failed to load analytics')
        }

        const data = await res.json()
        setAnalytics(data)
        setLastGoodData(data) // Save as last good data
      } catch (err) {
        setError(err.message || 'Error loading analytics')
        // Keep last good data visible if refresh fails
        if (isRefresh) {
          setAnalytics(prevAnalytics => prevAnalytics || null)
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [eventId, token],
  )

  useEffect(() => {
    if (eventId) {
      fetchAnalytics()
    }
  }, [eventId, fetchAnalytics])

    const handleRefresh = () => {
        fetchAnalytics(true);
    };

    const fetchRegisteredUsers = async () => {
        setShowTicketsModal(true);
        setLoadingTickets(true);
        try {
            const res = await fetch(`/api/events/${eventId}/tickets`, {
                method: "GET",
                headers: token
                    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load tickets");
            const data = await res.json();

            // Format the data for display
            const formattedTickets = data.map(ticket => ({
                name: ticket.user.firstName && ticket.user.lastName
                    ? `${ticket.user.firstName} ${ticket.user.lastName}`
                    : 'N/A',
                email: ticket.user.email,
                status: ticket.status,
                dateIssued: new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                checkInTime: ticket.status === 'CHECKED_IN' && ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : '-'
            }));

            setTicketsList(formattedTickets);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setTicketsList([]);
        } finally {
            setLoadingTickets(false);
        }
    };

    const fetchAttendedUsers = async () => {
        setShowAttendedModal(true);
        setLoadingAttended(true);
        try {
            const res = await fetch(`/api/events/${eventId}/tickets`, {
                method: "GET",
                headers: token
                    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load attendance data");
            const data = await res.json();

            // Filter only CHECKED_IN tickets and format for display
            const attendedTickets = data
                .filter(ticket => ticket.status === 'CHECKED_IN')
                .map(ticket => ({
                    name: ticket.user.firstName && ticket.user.lastName
                        ? `${ticket.user.firstName} ${ticket.user.lastName}`
                        : 'N/A',
                    email: ticket.user.email,
                    checkInTime: ticket.updatedAt
                        ? new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : 'N/A'
                }));

            setAttendedList(attendedTickets);
        } catch (err) {
            console.error("Error fetching attended users:", err);
            setAttendedList([]);
        } finally {
            setLoadingAttended(false);
        }
    };

  if (loading) {
    return (
      <div className="event-analytics-page">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading event analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !lastGoodData) {
    return (
      <div className="event-analytics-page">
        <div className="analytics-error">
          <h2>Unable to Load Analytics</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchAnalytics()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="event-analytics-page">
        <div className="analytics-empty">
          <h2>No Analytics Available</h2>
          <p>Analytics data for this event could not be found.</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = {
    labels: ['Attended', 'Not Attended', 'Available'],
    datasets: [
      {
        data: [analytics.attended, analytics.notAttended, analytics.remainingCapacity],
        backgroundColor: [
          '#43A047', // Green for attended
          '#F4B400', // Yellow for not attended
          '#ADBBDA', // Light blue for available
        ],
        borderColor: ['#43A047', '#F4B400', '#ADBBDA'],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Oswald', sans-serif",
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = analytics.capacity
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="event-analytics-page">
      <div className="event-analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-content">
            <h1 className="event-title">{analytics.eventTitle}</h1>
            <p className="event-date">{formatDate(analytics.eventDate)}</p>
            <p className="event-org">Organized by: {analytics.organizationName}</p>
          </div>
          <button
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              'Refreshing...'
            ) : (
              <>
                <svg
                  className="refresh-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Error banner if refresh failed but showing last data */}
        {error && lastGoodData && (
          <div className="error-banner">
            <svg
              className="warning-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Failed to refresh: {error}. Showing last successful data.
          </div>
        )}

        {/* Empty state for zero tickets */}
        {analytics.ticketsIssued === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h2>No Tickets Issued Yet</h2>
            <p>This event hasn't sold any tickets yet. Check back later for analytics.</p>
          </div>
        )}

                {/* Metrics Grid */}
                {analytics.ticketsIssued > 0 && (
                    <>
                        <div className="metrics-grid">
                            {/* Tickets Issued */}
                            <div
                                className="metric-card metric-card-clickable"
                                onClick={fetchRegisteredUsers}
                                title="Click to view registered users"
                            >
                                <div className="metric-icon-wrapper tickets">
                                    <svg className="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                        />
                                    </svg>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Tickets Issued</div>
                                    <div className="metric-value">{analytics.ticketsIssued}</div>
                                    <div className="metric-subtext">
                                        of {analytics.capacity} capacity ({analytics.capacityUtilization}%)
                                    </div>
                                    <div className="metric-hint">Click to view details</div>
                                </div>
                            </div>

                            {/* Attendance */}
                            <div
                                className="metric-card metric-card-clickable"
                                onClick={fetchAttendedUsers}
                                title="Click to view attended users"
                            >
                                <div className="metric-icon-wrapper attendance">
                                    <svg className="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Attendance</div>
                                    <div className="metric-value">{analytics.attended}</div>
                                    <div className="metric-subtext">
                                        {analytics.attendanceRate}% of ticket holders attended
                                    </div>
                                    <div className="metric-hint">Click to view details</div>
                                </div>
                            </div>

                            {/* Remaining Capacity */}
                            <div
                                className="metric-card metric-card-clickable"
                                onClick={() => setShowCapacityModal(true)}
                                title="Click to view capacity breakdown"
                            >
                                <div className="metric-icon-wrapper capacity">
                                    <svg className="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Remaining Capacity</div>
                                    <div className="metric-value">{analytics.remainingCapacity}</div>
                                    <div className="metric-subtext">
                                        {analytics.remainingCapacity === 0 ? "Event is full!" : "spots available"}
                                    </div>
                                    <div className="metric-hint">Click to view details</div>
                                </div>
                            </div>
                        </div>

            {/* Chart Section */}
            <div className="chart-section">
              <h3 className="chart-title">Capacity Breakdown</h3>
              <div className="chart-container">
                <div className="chart-wrapper">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
                <div className="chart-legend-custom">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#43A047' }}></span>
                    <span className="legend-label">Attended: {analytics.attended}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#F4B400' }}></span>
                    <span className="legend-label">Not Attended: {analytics.notAttended}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#ADBBDA' }}></span>
                    <span className="legend-label">Available: {analytics.remainingCapacity}</span>
                  </div>
                </div>
              </div>
            </div>

                        {/* Event Status */}
                        <div className="event-status">
                            {analytics.isEventPast ? (
                                <div className="status-badge past">
                                    <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Event has ended
                                </div>
                            ) : (
                                <div className="status-badge live">
                                    <svg className="status-icon" fill="currentColor" viewBox="0 0 24 24" width="12" height="12">
                                        <circle cx="12" cy="12" r="8" />
                                    </svg>
                                    Live Event
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Tickets Modal */}
            {showTicketsModal && (
                <div className="event-modal-overlay" onClick={() => setShowTicketsModal(false)}>
                    <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h2>Registered Users</h2>
                            <button
                                className="event-modal-close-btn"
                                onClick={() => setShowTicketsModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="event-modal-body">
                            {loadingTickets ? (
                                <div className="event-modal-loading">Loading tickets...</div>
                            ) : ticketsList.length === 0 ? (
                                <div className="event-modal-empty">No tickets found</div>
                            ) : (
                                <div className="event-table-container">
                                    <table className="event-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Date Issued</th>
                                                <th>Check-In Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ticketsList.map((ticket, index) => (
                                                <tr key={index}>
                                                    <td>{ticket.name}</td>
                                                    <td>{ticket.email}</td>
                                                    <td>
                                                        <span className={`event-status-badge event-status-${ticket.status.toLowerCase()}`}>
                                                            {ticket.status === 'CHECKED_IN' ? 'Checked In' : 'Issued'}
                                                        </span>
                                                    </td>
                                                    <td>{ticket.dateIssued}</td>
                                                    <td>{ticket.checkInTime}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="event-modal-footer">
                            <div className="event-ticket-count">Total Tickets: {ticketsList.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attended Users Modal */}
            {showAttendedModal && (
                <div className="event-modal-overlay" onClick={() => setShowAttendedModal(false)}>
                    <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h2 className="event-modal-title">Attended Users</h2>
                            <button
                                className="event-modal-close"
                                onClick={() => setShowAttendedModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="event-modal-body">
                            {loadingAttended ? (
                                <div className="event-modal-loading">Loading attendance data...</div>
                            ) : attendedList.length === 0 ? (
                                <div className="event-modal-empty">No attendees yet</div>
                            ) : (
                                <div className="event-table-container">
                                    <table className="event-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Check-In Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendedList.map((attendee, index) => (
                                                <tr key={index}>
                                                    <td>{attendee.name}</td>
                                                    <td>{attendee.email}</td>
                                                    <td>{attendee.checkInTime}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="event-modal-footer">
                            <div className="event-ticket-count">Total Attended: {attendedList.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Capacity Breakdown Modal */}
            {showCapacityModal && analytics && (
                <div className="event-modal-overlay" onClick={() => setShowCapacityModal(false)}>
                    <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h2 className="event-modal-title">Capacity Breakdown</h2>
                            <button
                                className="event-modal-close"
                                onClick={() => setShowCapacityModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="event-modal-body">
                            <div className="capacity-breakdown-grid">
                                <div className="capacity-stat-card">
                                    <div className="capacity-stat-icon total">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="capacity-stat-label">Total Capacity</div>
                                    <div className="capacity-stat-value">{analytics.capacity}</div>
                                    <div className="capacity-stat-description">Maximum event capacity</div>
                                </div>

                                <div className="capacity-stat-card">
                                    <div className="capacity-stat-icon issued">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <div className="capacity-stat-label">Tickets Issued</div>
                                    <div className="capacity-stat-value">{analytics.ticketsIssued}</div>
                                    <div className="capacity-stat-description">{analytics.capacityUtilization}% of capacity used</div>
                                </div>

                                <div className="capacity-stat-card">
                                    <div className="capacity-stat-icon attended">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="capacity-stat-label">Attended</div>
                                    <div className="capacity-stat-value">{analytics.attended}</div>
                                    <div className="capacity-stat-description">{analytics.attendanceRate}% attendance rate</div>
                                </div>

                                <div className="capacity-stat-card">
                                    <div className="capacity-stat-icon remaining">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="capacity-stat-label">Remaining Capacity</div>
                                    <div className="capacity-stat-value">{analytics.remainingCapacity}</div>
                                    <div className="capacity-stat-description">
                                        {analytics.remainingCapacity === 0 ? "Event is full!" : "Spots still available"}
                                    </div>
                                </div>
                            </div>

                            <div className="capacity-progress-section">
                                <h3 className="capacity-section-title">Capacity Utilization</h3>
                                <div className="capacity-progress-bar">
                                    <div
                                        className="capacity-progress-fill"
                                        style={{ width: `${analytics.capacityUtilization}%` }}
                                    >
                                        <span className="capacity-progress-text">{analytics.capacityUtilization}%</span>
                                    </div>
                                </div>
                                <div className="capacity-progress-labels">
                                    <span>0</span>
                                    <span>{analytics.capacity}</span>
                                </div>
                            </div>

                            <div className="capacity-insights">
                                <h3 className="capacity-section-title">Quick Insights</h3>
                                <div className="capacity-insight-items">
                                    {analytics.remainingCapacity === 0 && (
                                        <div className="capacity-insight-item full">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Event is at full capacity
                                        </div>
                                    )}
                                    {analytics.remainingCapacity > 0 && analytics.capacityUtilization >= 75 && (
                                        <div className="capacity-insight-item warning">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Almost full - only {analytics.remainingCapacity} spots left
                                        </div>
                                    )}
                                    {analytics.attendanceRate < 50 && analytics.ticketsIssued > 0 && (
                                        <div className="capacity-insight-item info">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Low attendance rate - consider follow-up with registrants
                                        </div>
                                    )}
                                    {analytics.attendanceRate >= 80 && analytics.attended > 0 && (
                                        <div className="capacity-insight-item success">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Excellent attendance rate!
                                        </div>
                                    )}
                                    {analytics.ticketsIssued === 0 && (
                                        <div className="capacity-insight-item info">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            No tickets issued yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
