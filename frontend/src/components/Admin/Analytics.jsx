import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
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
  usePageTitle()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/analytics', {
          method: 'GET',
          headers: token
            ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            : { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Failed to load analytics')
        const data = await res.json()
        setAnalytics(data)
      } catch (err) {
        setError(err.message || 'Error loading analytics')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if user is admin
    if (user && user.role === 'ADMIN') {
      fetchAnalytics()
    } else {
      setError('Unauthorized: Admin access required')
      setLoading(false)
    }
  }, [token, user])

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

  // Prepare chart data
  const labels = analytics.attendanceTrend.map(point => point.label)
  const attendedData = analytics.attendanceTrend.map(point => point.attended)
  const registeredData = analytics.attendanceTrend.map(point => point.registered)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Attended',
        data: attendedData,
        borderColor: '#43A047',
        backgroundColor: 'rgba(67, 160, 71, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Registered',
        data: registeredData,
        borderColor: '#3D52A0',
        backgroundColor: 'rgba(61, 82, 160, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
        text: 'Participation Trends Over Time',
        font: {
          family: "'Oswald', sans-serif",
          size: 18,
          weight: '600',
        },
        color: '#3D52A0',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
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
          color: 'rgba(0, 0, 0, 0.05)',
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
  }

  // Calculate attendance rate
  const attendanceRate =
    analytics.totalAttendance > 0
      ? ((analytics.totalAttendance / analytics.numTickets) * 100).toFixed(1)
      : 0

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <h1 className="analytics-title">Administrator Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="analytics-summary">
          <div className="analytics-card">
            <div className="analytics-icon-wrapper">
              <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Total Events</div>
              <div className="card-value">{analytics.numEvents}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-wrapper">
              <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Total Tickets</div>
              <div className="card-value">{analytics.numTickets}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-wrapper">
              <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Total Attendance</div>
              <div className="card-value">{analytics.totalAttendance}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-wrapper">
              <svg className="analytics-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Attendance Rate</div>
              <div className="card-value">{attendanceRate}%</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="analytics-chart-container">
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="analytics-info">
          <p className="info-text">
            This dashboard provides an overview of event participation across the platform. Track
            registered attendees versus actual attendance to understand engagement trends.
          </p>
        </div>
      </div>
    </div>
  )
}
