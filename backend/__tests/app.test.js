import request from 'supertest';
import app from '../index.js';
import { jest } from '@jest/globals';

const mockDatabase = {
  getAllEvents: jest.fn(),
  getAllOrganizations: jest.fn(),
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  createOrganization: jest.fn(),
  signIn: jest.fn(),
  getUser: jest.fn(),
  getOrganization: jest.fn(),
  signOut: jest.fn(),
  resendConfirmationEmail: jest.fn(),
  registerToEvent: jest.fn(),
  createTicketForEvent: jest.fn(),
  updateUser: jest.fn(),
  updateOrganization: jest.fn(),
  deleteUser: jest.fn(),
  deleteOrganization: jest.fn(),
};

jest.unstable_mockModule('../database/database.js', () => mockDatabase);

// Now import the mocked module
const database = await import('../database/database.js');

// Mock the QR module
jest.mock('../database/qr.js', () => ({
  generateQr: (req, res) => res.json({ message: 'QR generated' }),
  validateQr: (req, res) => res.json({ message: 'QR validated' })
}));

describe('Express API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- GET endpoints ----------
  test('GET /api/getEvents returns events', async () => {
    const res = await request(app).get('/api/getEvents');
    expect(res.status).toBe(200);
  });

  test('GET /api/getOrganizations returns organizations', async () => {
    database.getAllOrganizations.mockResolvedValue([{ id: 1, organizationName: 'OrgX' }]);
    const res = await request(app).get('/api/getOrganizations');
    expect(res.status).toBe(200);
  });

  test('GET /api/getUsers returns users', async () => {
    const res = await request(app).get('/api/getUsers');
    expect(res.status).toBe(200);
  });

  // ---------- Login ----------
  test('POST /api/login returns session and user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user1@example.com', password: 'Password123!', accountType: 'user' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user.email).toBe('user1@example.com');
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

  // ---------- Moderation ----------
  test('POST /api/moderate/user invalid reqType fails', async () => {
    const res = await request(app)
      .post('/api/moderate/user')
      .send({ reqType: 'SomethingInvalid' });
    expect(res.status).toBe(400);
  });
});
