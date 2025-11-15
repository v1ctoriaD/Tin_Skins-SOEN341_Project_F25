import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import '../../styles/Analytics.css'
import usePageTitle from '../../hooks/usePageTitle'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Analytics({ token, user }) {
    usePageTitle();
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendedUsers, setAttendedUsers] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [showChartPointModal, setShowChartPointModal] = useState(false);
    const [chartPointData, setChartPointData] = useState([]);
    const [chartPointLabel, setChartPointLabel] = useState('');
    const [loadingChartPoint, setLoadingChartPoint] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [detailedStats, setDetailedStats] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        try {
        setLoading(true);
        const res = await fetch("/api/admin/analytics", {
            method: "GET",
            headers: token
            ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = await res.json();
        setAnalytics(data);
        } catch (err) {
        setError(err.message || "Error loading analytics");
        } finally {
        setLoading(false);
        }
    }, [token]);

    const handleRefresh = () => {
        fetchAnalytics();
    };

    useEffect(() => {
        // Only fetch if user is admin
        if (user && user.role === "ADMIN") {
            fetchAnalytics();
        } else {
            setError("Unauthorized: Admin access required");
            setLoading(false);
        }
    }, [user, fetchAnalytics]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <div className="analytics-empty">No analytics data available</div>
      </div>
    )
  }

    // Prepare chart data with formatted labels
    const labels = analytics.attendanceTrend.map((point) => {
        const date = new Date(point.label);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    });
    const rawLabels = analytics.attendanceTrend.map((point) => point.label); // Keep raw labels for matching
    const attendedData = analytics.attendanceTrend.map((point) => point.attended);
    const registeredData = analytics.attendanceTrend.map((point) => point.registered);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Attended",
                data: attendedData,
                borderColor: "#43A047",
                backgroundColor: "rgba(67, 160, 71, 0.1)",
                tension: 0.3,
                fill: true,
            },
            {
                label: "Registered",
                data: registeredData,
                borderColor: "#3D52A0",
                backgroundColor: "rgba(61, 82, 160, 0.1)",
                tension: 0.3,
                fill: true,
            },
        ],
    };

    // Handle chart point click
    const handleChartClick = async (event, elements) => {
        if (elements.length === 0) return;

        const element = elements[0];
        const index = element.index;
        const weekLabel = rawLabels[index]; // Use raw label for matching
        const formattedWeekLabel = labels[index]; // Use formatted label for display

        try {
            setLoadingChartPoint(true);
            setChartPointLabel(`Week of ${formattedWeekLabel}`);

            const res = await fetch("/api/admin/users-with-tickets", {
                method: "GET",
                headers: token
                    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load data");
            const data = await res.json();

            // Filter users based on the week - show both registered and attended status
            const pointData = [];
            if (Array.isArray(data.users)) {
                data.users.forEach(user => {
                    if (user.tickets && user.tickets.length > 0) {
                        user.tickets.forEach(ticket => {
                            if (!ticket.event?.date) return;

                            const ticketDate = new Date(ticket.event.date);
                            const ticketWeekStart = getWeekStart(ticketDate);
                            const ticketWeekLabel = ticketWeekStart.toISOString().split('T')[0];

                            // Match the week
                            if (ticketWeekLabel === weekLabel) {
                                pointData.push({
                                    name: user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.orgName || 'N/A',
                                    email: user.email,
                                    eventTitle: ticket.event.title || 'N/A',
                                    eventDate: new Date(ticket.event.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }),
                                    registered: 'Yes',
                                    attended: ticket.status === 'CHECKED_IN' ? 'Yes' : 'No',
                                    registeredDate: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : 'N/A',
                                    attendedDate: ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : 'N/A'
                                });
                            }
                        });
                    }
                });
            }

            setChartPointData(pointData);
            setShowChartPointModal(true);
        } catch (err) {
            console.error("Error fetching chart point data:", err);
            alert("Failed to load data for this point");
        } finally {
            setLoadingChartPoint(false);
        }
    };

    // Helper function to get week start (Monday) - matches backend calculation
    const getWeekStart = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0); // Set to midnight
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        family: "'Oswald', sans-serif",
                        size: 13,
                    },
                    padding: 15,
                },
            },
            title: {
                display: true,
                text: "Participation Trends Over Time (Click points for details)",
                font: {
                    family: "'Oswald', sans-serif",
                    size: 18,
                    weight: "600",
                },
                color: "#3D52A0",
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
            tooltip: {
                callbacks: {
                    afterLabel: function () {
                        return 'Click for details';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    font: {
                        family: "'Oswald', sans-serif",
                    },
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                },
            },
            x: {
                ticks: {
                    font: {
                        family: "'Oswald', sans-serif",
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

  // Calculate attendance rate
  const attendanceRate =
    analytics.totalAttendance > 0
      ? ((analytics.totalAttendance / analytics.numTickets) * 100).toFixed(1)
      : 0

    // Show detailed statistics
    const showDetailedStats = () => {
        const stats = {
            totalEvents: analytics.numEvents,
            totalTickets: analytics.numTickets,
            totalAttendance: analytics.totalAttendance,
            noShows: analytics.numTickets - analytics.totalAttendance,
            attendanceRate: attendanceRate,
            noShowRate: (100 - parseFloat(attendanceRate)).toFixed(1),
            avgTicketsPerEvent: (analytics.numTickets / analytics.numEvents).toFixed(1),
            avgAttendancePerEvent: (analytics.totalAttendance / analytics.numEvents).toFixed(1),
            trend: analytics.attendanceTrend
        };
        setDetailedStats(stats);
        setShowStatsModal(true);
    };

    // Fetch all registered users with their tickets
    const fetchRegisteredUsers = async () => {
        try {
            setLoadingUsers(true);
            const res = await fetch("/api/admin/users-with-tickets", {
                method: "GET",
                headers: token
                    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load users");
            const data = await res.json();

            // Flatten users with their tickets for table display
            const usersWithTickets = [];
            if (Array.isArray(data.users)) {
                data.users.forEach(user => {
                    if (user.tickets && user.tickets.length > 0) {
                        user.tickets.forEach(ticket => {
                            usersWithTickets.push({
                                userId: user.id,
                                name: user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.orgName || 'N/A',
                                email: user.email,
                                eventTitle: ticket.event?.title || 'N/A',
                                ticketStatus: ticket.status || 'ISSUED',
                                dateIssued: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) : 'N/A'
                            });
                        });
                    }
                });
            }

            setRegisteredUsers(usersWithTickets);
            setShowUsersModal(true);
        } catch (err) {
            console.error("Error fetching users:", err);
            alert("Failed to load registered users");
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch users who attended events (CHECKED_IN tickets only)
    const fetchAttendedUsers = async () => {
        try {
            setLoadingAttendance(true);
            const res = await fetch("/api/admin/users-with-tickets", {
                method: "GET",
                headers: token
                    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load attendance data");
            const data = await res.json();

            // Flatten users with CHECKED_IN tickets only
            const usersWhoAttended = [];
            if (Array.isArray(data.users)) {
                data.users.forEach(user => {
                    if (user.tickets && user.tickets.length > 0) {
                        user.tickets.forEach(ticket => {
                            if (ticket.status === 'CHECKED_IN') {
                                usersWhoAttended.push({
                                    userId: user.id,
                                    name: user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.orgName || 'N/A',
                                    email: user.email,
                                    eventTitle: ticket.event?.title || 'N/A',
                                    checkInDate: ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'
                                });
                            }
                        });
                    }
                });
            }

            setAttendedUsers(usersWhoAttended);
            setShowAttendanceModal(true);
        } catch (err) {
            console.error("Error fetching attendance data:", err);
            alert("Failed to load attendance data");
        } finally {
            setLoadingAttendance(false);
        }
    };

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <div className="analytics-header">
                    <h1 className="analytics-title">Administrator Analytics Dashboard</h1>
                    <button
                        className="analytics-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh data"
                    >
                        <svg
                            className="analytics-refresh-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="analytics-summary">
                    <div
                        className="analytics-card analytics-card-clickable"
                        onClick={() => navigate('/discover')}
                        title="Click to view all events"
                    >
                        <div className="analytics-icon-wrapper">
                            <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="analytics-card-content">
                            <div className="analytics-card-label">Total Events</div>
                            <div className="analytics-card-value">{analytics.numEvents}</div>
                            <div className="analytics-card-hint">Click to view all events</div>
                        </div>
                    </div>

                    <div
                        className="analytics-card analytics-card-clickable"
                        onClick={fetchRegisteredUsers}
                        title="Click to view ticket details"
                    >
                        <div className="analytics-icon-wrapper">
                            <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div className="analytics-card-content">
                            <div className="analytics-card-label">Total Tickets</div>
                            <div className="analytics-card-value">{analytics.numTickets}</div>
                            <div className="analytics-card-hint">Click to view details</div>
                        </div>
                    </div>

                    <div
                        className="analytics-card analytics-card-clickable"
                        onClick={fetchAttendedUsers}
                        title="Click to view attended users"
                    >
                        <div className="analytics-icon-wrapper">
                            <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="analytics-card-content">
                            <div className="analytics-card-label">Total Attendance</div>
                            <div className="analytics-card-value">{analytics.totalAttendance}</div>
                            <div className="analytics-card-hint">Click to view attendees</div>
                        </div>
                    </div>

                    <div
                        className="analytics-card analytics-card-clickable"
                        onClick={showDetailedStats}
                        title="Click to view detailed statistics"
                    >
                        <div className="analytics-icon-wrapper">
                            <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="analytics-card-content">
                            <div className="analytics-card-label">Attendance Rate</div>
                            <div className="analytics-card-value">{attendanceRate}%</div>
                            <div className="analytics-card-hint">Click for detailed stats</div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="analytics-chart-container">
                    <div className="analytics-chart-wrapper">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="analytics-info">
                    <p className="analytics-info-text">
                        This dashboard provides an overview of event participation across the platform.
                        Track registered attendees versus actual attendance to understand engagement trends.
                    </p>
                </div>
            </div>

            {/* Registered Users Modal */}
            {showUsersModal && (
                <div className="analytics-modal-overlay" onClick={() => setShowUsersModal(false)}>
                    <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="analytics-modal-header">
                            <h2>All Ticket Details</h2>
                            <button
                                className="analytics-modal-close-btn"
                                onClick={() => setShowUsersModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="analytics-modal-body">
                            {loadingUsers ? (
                                <div className="analytics-modal-loading">Loading users...</div>
                            ) : registeredUsers.length === 0 ? (
                                <div className="analytics-modal-empty">No registered users found</div>
                            ) : (
                                <div className="analytics-users-table-container">
                                    <table className="analytics-users-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Event</th>
                                                <th>Ticket Status</th>
                                                <th>Date Issued</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registeredUsers.map((user, index) => (
                                                <tr key={`${user.userId}-${index}`}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.eventTitle}</td>
                                                    <td>
                                                        <span className={`analytics-status-badge analytics-status-${user.ticketStatus.toLowerCase()}`}>
                                                            {user.ticketStatus === 'CHECKED_IN' ? 'Checked In' : 'Issued'}
                                                        </span>
                                                    </td>
                                                    <td>{user.dateIssued}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="analytics-modal-footer">
                            <div className="analytics-user-count">Total Tickets: {registeredUsers.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Attendance Modal */}
            {showAttendanceModal && (
                <div className="analytics-modal-overlay" onClick={() => setShowAttendanceModal(false)}>
                    <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="analytics-modal-header">
                            <h2>Event Attendance</h2>
                            <button
                                className="analytics-modal-close-btn"
                                onClick={() => setShowAttendanceModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="analytics-modal-body">
                            {loadingAttendance ? (
                                <div className="analytics-modal-loading">Loading attendance data...</div>
                            ) : attendedUsers.length === 0 ? (
                                <div className="analytics-modal-empty">No attendance records found</div>
                            ) : (
                                <div className="analytics-users-table-container">
                                    <table className="analytics-users-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Event</th>
                                                <th>Check-In Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendedUsers.map((user, index) => (
                                                <tr key={`${user.userId}-${index}`}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.eventTitle}</td>
                                                    <td>{user.checkInDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="analytics-modal-footer">
                            <div className="analytics-user-count">Total Attendees: {attendedUsers.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Point Details Modal */}
            {showChartPointModal && (
                <div className="analytics-modal-overlay" onClick={() => setShowChartPointModal(false)}>
                    <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="analytics-modal-header">
                            <h2>{chartPointLabel}</h2>
                            <button
                                className="analytics-modal-close-btn"
                                onClick={() => setShowChartPointModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="analytics-modal-body">
                            {loadingChartPoint ? (
                                <div className="analytics-modal-loading">Loading data...</div>
                            ) : chartPointData.length === 0 ? (
                                <div className="analytics-modal-empty">No data found for this period</div>
                            ) : (
                                <div className="analytics-users-table-container">
                                    <table className="analytics-users-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Event</th>
                                                <th>Event Date</th>
                                                <th>Registered</th>
                                                <th>Attended</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartPointData.map((data, index) => (
                                                <tr key={`${data.email}-${index}`}>
                                                    <td>{data.name}</td>
                                                    <td>{data.email}</td>
                                                    <td>{data.eventTitle}</td>
                                                    <td>{data.eventDate}</td>
                                                    <td>
                                                        <span className="analytics-status-badge analytics-status-yes">
                                                            {data.registered}
                                                        </span>
                                                        <br />
                                                        <small>{data.registeredDate}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`analytics-status-badge analytics-status-${data.attended.toLowerCase()}`}>
                                                            {data.attended}
                                                        </span>
                                                        {data.attended === 'Yes' && (
                                                            <>
                                                                <br />
                                                                <small>{data.attendedDate}</small>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="analytics-modal-footer">
                            <div className="analytics-user-count">Total: {chartPointData.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Statistics Modal */}
            {showStatsModal && detailedStats && (
                <div className="analytics-modal-overlay" onClick={() => setShowStatsModal(false)}>
                    <div className="analytics-modal-content analytics-stats-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="analytics-modal-header">
                            <h2>Detailed Analytics Statistics</h2>
                            <button
                                className="analytics-modal-close-btn"
                                onClick={() => setShowStatsModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="analytics-modal-body">
                            <div className="analytics-stats-grid">
                                <div className="analytics-stat-card">
                                    <div className="analytics-stat-icon-wrapper">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Total Events</div>
                                        <div className="analytics-stat-value">{detailedStats.totalEvents}</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card">
                                    <div className="analytics-stat-icon-wrapper">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Total Tickets Issued</div>
                                        <div className="analytics-stat-value">{detailedStats.totalTickets}</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card analytics-highlight-green">
                                    <div className="analytics-stat-icon-wrapper analytics-highlight-green">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Total Attendance</div>
                                        <div className="analytics-stat-value">{detailedStats.totalAttendance}</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card analytics-highlight-red">
                                    <div className="analytics-stat-icon-wrapper analytics-highlight-red">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">No-Shows</div>
                                        <div className="analytics-stat-value">{detailedStats.noShows}</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card analytics-highlight-blue">
                                    <div className="analytics-stat-icon-wrapper analytics-highlight-blue">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Attendance Rate</div>
                                        <div className="analytics-stat-value">{detailedStats.attendanceRate}%</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card">
                                    <div className="analytics-stat-icon-wrapper">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">No-Show Rate</div>
                                        <div className="analytics-stat-value">{detailedStats.noShowRate}%</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card">
                                    <div className="analytics-stat-icon-wrapper">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Avg Tickets/Event</div>
                                        <div className="analytics-stat-value">{detailedStats.avgTicketsPerEvent}</div>
                                    </div>
                                </div>

                                <div className="analytics-stat-card">
                                    <div className="analytics-stat-icon-wrapper">
                                        <svg className="analytics-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="analytics-stat-info">
                                        <div className="analytics-stat-label">Avg Attendance/Event</div>
                                        <div className="analytics-stat-value">{detailedStats.avgAttendancePerEvent}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-stats-summary">
                                <h3>Summary</h3>
                                <p>
                                    Out of <strong>{detailedStats.totalTickets}</strong> tickets issued across <strong>{detailedStats.totalEvents}</strong> events,
                                    <strong className="analytics-text-success"> {detailedStats.totalAttendance}</strong> attendees checked in
                                    (<strong>{detailedStats.attendanceRate}%</strong> attendance rate) while
                                    <strong className="analytics-text-danger"> {detailedStats.noShows}</strong> were no-shows
                                    (<strong>{detailedStats.noShowRate}%</strong>).
                                </p>
                                <p>
                                    On average, each event has <strong>{detailedStats.avgTicketsPerEvent}</strong> registered participants
                                    with <strong>{detailedStats.avgAttendancePerEvent}</strong> actual attendees.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
