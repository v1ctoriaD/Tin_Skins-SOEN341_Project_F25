jest.mock('../database/supabase.js')
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import * as database from '../database/database.js'

const prisma = new PrismaClient()

describe('Analytics API Tests', () => {
  let testOrg
  let testUsers = []
  let testEvents = []
  let testTickets = []

  // Setup: Create test data
  beforeAll(async () => {
    // Create organization
    testOrg = await prisma.organization.create({
      data: {
        authId: `test-org-auth-${Date.now()}`,
        email: `testorg${Date.now()}@analytics.com`,
        orgName: 'Test Analytics Org',
        isApproved: true,
      },
    })

    // Create users
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          authId: `test-user-auth-${Date.now()}-${i}`,
          email: `testuser${i}-${Date.now()}@analytics.com`,
          firstName: `User${i}`,
          lastName: 'Test',
          role: 'USER',
        },
      })
      testUsers.push(user)
    }

    // Create events
    for (let i = 0; i < 3; i++) {
      const event = await prisma.event.create({
        data: {
          title: `Analytics Test Event ${i}`,
          description: 'Test event for analytics',
          date: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000), // Future dates
          locationName: `Test Location ${i}`,
          maxAttendees: 50,
          cost: 0,
          tags: ['WORKSHOP', 'NETWORKING'],
          eventOwnerId: testOrg.id,
        },
      })
      testEvents.push(event)

      // Create tickets for each event
      for (let j = 0; j < 3; j++) {
        const ticket = await prisma.ticket.create({
          data: {
            userId: testUsers[j].id,
            eventId: event.id,
            status: j < 2 ? 'CHECKED_IN' : 'ISSUED', // 2 attended, 1 registered
            qrToken: `QR-${event.id}-${testUsers[j].id}-${Date.now()}`,
          },
        })
        testTickets.push(ticket)
      }
    }
  })

  // Cleanup: Remove test data
  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { id: { in: testTickets.map(t => t.id) } },
    })
    await prisma.event.deleteMany({
      where: { id: { in: testEvents.map(e => e.id) } },
    })
    await prisma.user.deleteMany({
      where: { id: { in: testUsers.map(u => u.id) } },
    })
    await prisma.organization.deleteMany({
      where: { id: testOrg.id },
    })
    await prisma.$disconnect()
  })

  describe('Admin Analytics', () => {
    it('should return accurate total counts', async () => {
      const analytics = await database.getAdminAnalytics()

      expect(analytics).toHaveProperty('numEvents')
      expect(analytics).toHaveProperty('numTickets')
      expect(analytics).toHaveProperty('totalAttendance')
      expect(analytics.numEvents).toBeGreaterThanOrEqual(3)
      expect(analytics.numTickets).toBeGreaterThanOrEqual(9)
      expect(analytics.totalAttendance).toBeGreaterThanOrEqual(6)
    })

    it('should return participation trend data', async () => {
      const analytics = await database.getAdminAnalytics()

      expect(analytics).toHaveProperty('attendanceTrend')
      expect(Array.isArray(analytics.attendanceTrend)).toBe(true)
    })

    it('should validate attendance never exceeds tickets', async () => {
      const analytics = await database.getAdminAnalytics()

      expect(analytics.totalAttendance).toBeLessThanOrEqual(analytics.numTickets)
    })
  })

  describe('Event Analytics', () => {
    it('should return accurate event metrics', async () => {
      const analytics = await database.getEventAnalytics(testEvents[0].id)

      expect(analytics).toHaveProperty('ticketsIssued', 3)
      expect(analytics).toHaveProperty('attended', 2)
      expect(analytics).toHaveProperty('capacity', 50)
      expect(analytics).toHaveProperty('remainingCapacity', 47)
    })

    it('should calculate correct percentages', async () => {
      const analytics = await database.getEventAnalytics(testEvents[0].id)

      expect(analytics.attendanceRate).toBeCloseTo(66.7, 1) // 1 decimal place
      expect(analytics.capacityUtilization).toBeCloseTo(6, 1)
    })

    it('should handle non-existent event', async () => {
      await expect(database.getEventAnalytics(99999)).rejects.toThrow('Event not found')
    })
  })

  describe('Performance', () => {
    it('should load analytics under 3 seconds', async () => {
      const startTime = Date.now()
      await database.getAdminAnalytics()
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(3000)
    })
  })

  describe('Organizer Event Analytics Dashboard', () => {
    it('should calculate attendance rate correctly (attended / issued)', async () => {
      const analytics = await database.getEventAnalytics(testEvents[0].id)

      // 2 attended out of 3 issued = 66.7%
      const expectedRate = (2 / 3) * 100
      expect(analytics.attendanceRate).toBeCloseTo(expectedRate, 1)
    })

    it('should update ticket count after new ticket issued', async () => {
      const beforeAnalytics = await database.getEventAnalytics(testEvents[1].id)

      // Issue new ticket
      const newTicket = await prisma.ticket.create({
        data: {
          userId: testUsers[3].id,
          eventId: testEvents[1].id,
          status: 'ISSUED',
          qrToken: `QR-new-${Date.now()}`,
        },
      })

      const afterAnalytics = await database.getEventAnalytics(testEvents[1].id)

      expect(afterAnalytics.ticketsIssued).toBe(beforeAnalytics.ticketsIssued + 1)
      expect(afterAnalytics.remainingCapacity).toBe(beforeAnalytics.remainingCapacity - 1)

      // Cleanup
      await prisma.ticket.delete({ where: { id: newTicket.id } })
    })

    it('should update attendance when ticket checked in', async () => {
      const beforeAnalytics = await database.getEventAnalytics(testEvents[2].id)

      // Find an ISSUED ticket and check it in
      const issuedTicket = testTickets.find(
        t => t.eventId === testEvents[2].id && t.status === 'ISSUED',
      )

      await prisma.ticket.update({
        where: { id: issuedTicket.id },
        data: { status: 'CHECKED_IN', validatedAt: new Date() },
      })

      const afterAnalytics = await database.getEventAnalytics(testEvents[2].id)

      expect(afterAnalytics.attended).toBe(beforeAnalytics.attended + 1)
      expect(afterAnalytics.attendanceRate).toBeGreaterThan(beforeAnalytics.attendanceRate)

      // Cleanup - revert status
      await prisma.ticket.update({
        where: { id: issuedTicket.id },
        data: { status: 'ISSUED', validatedAt: null },
      })
    })

    it('should match database query values', async () => {
      const eventId = testEvents[0].id

      // Direct database queries
      const ticketCount = await prisma.ticket.count({
        where: { eventId },
      })
      const attendedCount = await prisma.ticket.count({
        where: { eventId, status: 'CHECKED_IN' },
      })
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      // Analytics function result
      const analytics = await database.getEventAnalytics(eventId)

      expect(analytics.ticketsIssued).toBe(ticketCount)
      expect(analytics.attended).toBe(attendedCount)
      expect(analytics.capacity).toBe(event.maxAttendees)
    })

    it('should calculate capacity correctly', async () => {
      const analytics = await database.getEventAnalytics(testEvents[0].id)

      expect(analytics.capacity).toBe(50)
      expect(analytics.ticketsIssued).toBe(3)
      expect(analytics.remainingCapacity).toBe(50 - 3)
      expect(analytics.capacityUtilization).toBeCloseTo(6, 1) // 3/50 * 100
    })
  })
})
