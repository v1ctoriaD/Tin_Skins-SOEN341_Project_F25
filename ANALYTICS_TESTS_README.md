# Analytics Testing

Testing suite for Admin and Organizer Dashboard analytics.

## Running Tests

### Backend Tests

```bash
cd backend
npm test analytics.test.js
```

### Frontend Tests

```bash
cd frontend
npm test Analytics.test.js EventAnalytics.test.js
```

## What's Tested

### Backend (13 tests)

**Admin Analytics:**

- ✅ Total events, tickets, attendance counts
- ✅ Participation trends over time
- ✅ Data validation: Attendance ≤ tickets
- ✅ Performance: Loads under 3 seconds

**Organizer Event Analytics (#115):**

- ✅ Attendance rate calculation (attended / issued)
- ✅ Ticket count updates after new claims
- ✅ Attendance updates when checked in
- ✅ Analytics match database queries
- ✅ Capacity calculations

### Frontend (14 tests)

**Admin Dashboard:**

- ✅ Dashboard rendering and data display
- ✅ Attendance rate calculation
- ✅ Chart rendering (line and doughnut)
- ✅ Access control (admin only)
- ✅ Refresh functionality

**Organizer Dashboard (#115):**

- ✅ UI displays backend data accurately
- ✅ Attendance rate displayed correctly
- ✅ Capacity utilization displayed correctly
- ✅ No console errors on load

## Acceptance Criteria

### Issue #116 (Admin Dashboard)

✅ Stats are accurate across datasets  
✅ Dashboard loads under 3 seconds  
✅ No incorrect counts after operations

### Issue #115 (Organizer Dashboard)

✅ All tests pass successfully  
✅ Analytics values match database queries  
✅ No console or runtime errors  
✅ Ticket updates reflected in real time  
✅ Correct attendance rate calculation

**Total: 27 tests covering all analytics functionality**
