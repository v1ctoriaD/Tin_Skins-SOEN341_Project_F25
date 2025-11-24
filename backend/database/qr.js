import crypto from 'node:crypto'
import prisma from './prisma.js'

//              -- generates a unique QR token for a given ticket --
//route: POST /api/tickets/:ticketId/qr
export async function generateQr(req, res) {
  try {
    const ticketId = Number(req.params.ticketId)
    //console.log(ticketId)
    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({ ok: false, reason: 'Invalid ticket id' })
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ ok: false, reason: 'Ticket not found' })
    }

    // generate a secure random token
    const token = crypto.randomBytes(24).toString('base64url')

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { qrToken: token, status: 'ISSUED', validatedAt: null },
    })

    return res.json({ ok: true, payload: { t: token } })
  } catch (err) {
    console.error('QR generation error:', err)
    return res.status(500).json({ ok: false, reason: 'Server error' })
  }
}

//     -- validates a QR code token and marks the ticket as checked-in --
//route: POST /api/checkin

export async function validateQr(req, res) {
  try {
    const { token } = req.body || {}
    if (!token) {
      return res.status(400).json({ ok: false, reason: 'Missing token' })
    }

    const ticket = await prisma.ticket.findFirst({ where: { qrToken: token } })
    if (!ticket) {
      return res.status(404).json({ ok: false, reason: 'Invalid code' })
    }

    if (ticket.status === 'CHECKED_IN') {
      return res.status(409).json({ ok: false, reason: 'Already checked in' })
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'CHECKED_IN', validatedAt: new Date() },
    })

    return res.json({ ok: true, ticketId: updated.id })
  } catch (err) {
    console.error('QR validation error:', err)
    return res.status(500).json({ ok: false, reason: 'Server error' })
  }
}
