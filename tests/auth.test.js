const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

require('./setup');

describe('Authentication API Tests', () => {
  const sampleUser = {
    name: 'Officer Rajesh Sharma',
    email: 'officer@ncc.test',
    password: 'Password@123'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(sampleUser.email);
    expect(res.body.data.token).toBeDefined();
  });

  it('should not allow registration with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/register').send(sampleUser);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login with valid credentials and return JWT token', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: sampleUser.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(sampleUser.email);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: 'WrongPassword'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should access /api/auth/me with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(sampleUser.email);
  });

  it('should reject access to protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
