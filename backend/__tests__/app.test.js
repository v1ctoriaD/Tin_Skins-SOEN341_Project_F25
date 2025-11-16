jest.mock('../database/supabase.js');
import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../database/database.js', () => ({
  getAllEvents: jest.fn().mockResolvedValue([{ id: 1, name: 'Event1' }]),
  getAllOrganizations: jest.fn().mockResolvedValue([{ id: 1, organizationName: 'OrgX' }]),
  getAllUsers: jest.fn().mockResolvedValue([{ id: 1, email: 'user1@example.com' }]),
  createUser: jest.fn().mockResolvedValue('user1@example.com'),
  createOrganization: jest.fn().mockResolvedValue('org1@example.com'),
  signIn: jest.fn().mockResolvedValue('session1'),
  getUser: jest.fn().mockResolvedValue({ id: 1, email: 'user1@example.com' }),
  getOrganization: jest.fn().mockResolvedValue({ id: 1, organizationName: 'OrgX' }),
  signOut: jest.fn(),
  resendConfirmationEmail: jest.fn().mockResolvedValue(true),
  registerToEvent: jest.fn().mockResolvedValue(true),
  createTicketForEvent: jest.fn().mockResolvedValue({ success: true, ticket: { id: 1 } }),
  updateUser: jest.fn().mockResolvedValue(true),
  updateOrganization: jest.fn().mockResolvedValue(true),
  deleteUser: jest.fn().mockResolvedValue(true),
  deleteOrganization: jest.fn().mockResolvedValue(true),
  getRegionStats: jest.fn().mockResolvedValue([{ region: 'North', count: 5 }])
}));

jest.mock('../database/qr.js', () => ({
  generateQr: (req, res) => res.json({ message: 'QR generated' }),
  validateQr: (req, res) => res.json({ message: 'QR validated' })
}));

const app = await import('../index.js').then(mod => mod.default);
const database = await import('../database/database.js'); // mocked version

describe('Express API routes (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- GET endpoints ----------
  test('GET /api/getEvents returns events', async () => {
    const res = await request(app).get('/api/getEvents');
    expect(res.status).toBe(200);
    expect(res.body.events[0].name).toBe('Event1');
  });

  test('GET /api/getOrganizations returns organizations', async () => {
    const res = await request(app).get('/api/getOrganizations');
    expect(res.status).toBe(200);
    expect(res.body.organizations[0].organizationName).toBe('OrgX');
  });

  test('GET /api/getUsers returns users', async () => {
    const res = await request(app).get('/api/getUsers');
    expect(res.status).toBe(200);
    expect(res.body.users[0].email).toBe('user1@example.com');
  });

  test('GET /api/admin/region-stats returns stats', async () => {
    const res = await request(app).get('/api/admin/region-stats');
    expect(res.status).toBe(200);
    expect(res.body.stats[0].region).toBe('North');
  });

  // ---------- Signup ----------
  test('POST /api/signup user succeeds', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ formData: { email: 'user1@example.com', password: 'pass', firstName: 'A', lastName: 'B' }, accountType: 'user' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('user1@example.com');
  });

  test('POST /api/signup organization succeeds', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ formData: { email: 'org1@example.com', password: 'pass', organizationName: 'OrgX' }, accountType: 'organization' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('org1@example.com');
  });

  // ---------- Login ----------
  test('POST /api/login user succeeds', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user1@example.com', password: 'Password123!', accountType: 'user' });
    expect(res.status).toBe(200);
    expect(res.body.session).toBe('session1');
    expect(res.body.user.email).toBe('user1@example.com');
  });

  test('POST /api/login organization succeeds', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'org1@example.com', password: 'Password123!', accountType: 'organization' });
    expect(res.status).toBe(200);
    expect(res.body.org.organizationName).toBe('OrgX');
  });

  test('POST /api/login fails if missing credentials', async () => {
    const res = await request(app).post('/api/login').send({ email: '', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password required');
  });

  // ---------- Logout ----------
  test('POST /api/logout returns success message', async () => {
    const res = await request(app).post('/api/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });

  // ---------- Resend Email ----------
  test('POST /api/resendEmail succeeds', async () => {
    const res = await request(app).post('/api/resendEmail').send({ email: 'user1@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email sent');
  });

  // ---------- Ticket creation ----------
  test('POST /api/events/:eventId/tickets succeeds', async () => {
    const res = await request(app).post('/api/events/1/tickets').send({ userId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.ticket.id).toBe(1);
  });

  // ---------- Moderation ----------
  test('POST /api/moderate/user with invalid reqType fails', async () => {
    const res = await request(app).post('/api/moderate/user').send({ reqType: 'Invalid' });
    expect(res.status).toBe(400);
  });

  test('POST /api/moderate/user ChangeAdminStatus succeeds', async () => {
    const res = await request(app).post('/api/moderate/user').send({ reqType: 'ChangeAdminStatus', userId: 1, role: 'admin' });
    expect(res.status).toBe(201);
  });

  test('POST /api/moderate/user ApproveOrganization succeeds', async () => {
    const res = await request(app).post('/api/moderate/user').send({ reqType: 'ApproveOrganization', orgId: 1 });
    expect(res.status).toBe(201);
  });

  test('POST /api/moderate/user DeleteUser succeeds', async () => {
    const res = await request(app).post('/api/moderate/user').send({ reqType: 'DeleteUser', authId: 'auth1' });
    expect(res.status).toBe(201);
  });
});
