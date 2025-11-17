/**
 * Escapes CSV values properly
 * @param {*} value - Value to escape
 * @returns {string} - Escaped CSV value
 */
const escapeCSVValue = value => {
  if (value == null || value === undefined) return 'N/A'
  const str = String(value)
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Exports data to CSV format with proper escaping and error handling
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header strings
 * @param {string} filename - Base filename (without extension)
 * @param {Function} rowMapper - Function to map each data item to CSV row array
 */
export const exportToCSV = (data, headers, filename, rowMapper) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return false
  }

  if (!headers || headers.length === 0) {
    alert('No headers specified for export')
    return false
  }

  if (!rowMapper || typeof rowMapper !== 'function') {
    alert('Invalid row mapper function')
    return false
  }

  try {
    // Create CSV rows using the provided mapper
    const csvRows = data.map(item => {
      const rowData = rowMapper(item)
      return rowData.map(escapeCSVValue).join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.map(escapeCSVValue).join(','), ...csvRows].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.setAttribute('data-testid', 'csv-download-link')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Export error:', error)
    alert('Failed to export CSV. Please try again.')
    return false
  }
}

// Predefined export configurations
export const CSV_CONFIGS = {
  REGISTERED_USERS: {
    headers: ['Name', 'Email', 'Event', 'Ticket Status', 'Date Issued'],
    rowMapper: row => [
      row.name || 'N/A',
      row.email || 'N/A',
      row.eventTitle || 'N/A',
      row.ticketStatus || row.status || 'N/A',
      row.dateIssued || 'N/A',
    ],
  },
  EVENT_TICKETS: {
    headers: ['Name', 'Email', 'Status', 'Date Issued', 'Check-In Time'],
    rowMapper: row => [
      row.name || 'N/A',
      row.email || 'N/A',
      row.status || 'N/A',
      row.dateIssued || 'N/A',
      row.checkInTime || 'N/A',
    ],
  },
  ATTENDED_USERS: {
    headers: ['Name', 'Email', 'Event', 'Check-In Date'],
    rowMapper: row => [
      row.name || 'N/A',
      row.email || 'N/A',
      row.eventTitle || 'N/A',
      row.checkInDate || row.checkInTime || 'N/A',
    ],
  },
}

// Convenience functions for common exports
export const exportRegisteredUsers = (data, filename = 'registered-users') => {
  const config = CSV_CONFIGS.REGISTERED_USERS
  return exportToCSV(data, config.headers, filename, config.rowMapper)
}

export const exportEventTickets = (data, filename = 'event-tickets') => {
  const config = CSV_CONFIGS.EVENT_TICKETS
  return exportToCSV(data, config.headers, filename, config.rowMapper)
}

export const exportAttendedUsers = (data, filename = 'attended-users') => {
  const config = CSV_CONFIGS.ATTENDED_USERS
  return exportToCSV(data, config.headers, filename, config.rowMapper)
}

// Export the escapeCSVValue function for testing
export { escapeCSVValue }
