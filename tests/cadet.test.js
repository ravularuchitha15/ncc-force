const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Rank = require('../src/models/Rank');
const { ROLES } = require('../src/config/constants');

require('./setup');

describe('Cadet Management API Tests', () => {
  let officerToken;
  let cadetToken;
  let testRank;

  beforeEach(async () => {
    testRank = await Rank.create({
      name: 'Cadet',
      abbreviation: 'Cdt',
      level: 1,
      wing: 'All'
    });

    const officer = await User.create({
      name: 'Officer Sharma',
      email: 'officer@ncc.test',
      password: 'Password@123',
      role: ROLES.OFFICER
    });

    const cadetUser = await User.create({
      name: 'Cadet Amit',
      email: 'cadet@ncc.test',
      password: 'Password@123',
      role: ROLES.CADET
    });

    const offLogin = await request(app).post('/api/auth/login').send({
      email: 'officer@ncc.test',
      password: 'Password@123'
    });
    officerToken = offLogin.body.data.token;

    const cadLogin = await request(app).post('/api/auth/login').send({
      email: 'cadet@ncc.test',
      password: 'Password@123'
    });
    cadetToken = cadLogin.body.data.token;
  });

  const validCadetData = {
    cadetId: 'NCC/2026/KA/SD/2001',
    fullName: 'Rahul Nair',
    email: 'rahul.cadet@ncc.test',
    phoneNumber: '+91 9876543210',
    dateOfBirth: '2004-05-15',
    gender: 'Male',
    institution: 'National Engineering College',
    unit: '1 Karnataka Battalion NCC',
    battalion: '1 KAR BN',
    yearSemester: '2nd Year / Sem 3',
    bloodGroup: 'O+'
  };

  it('should allow an Officer to create a new cadet', async () => {
    const res = await request(app)
      .post('/api/cadets')
      .set('Authorization', `Bearer ${officerToken}`)
      .send(validCadetData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cadetId).toBe(validCadetData.cadetId);
    expect(res.body.data.fullName).toBe(validCadetData.fullName);
  });

  it('should forbid a Cadet from creating another cadet profile (Role RBAC)', async () => {
    const res = await request(app)
      .post('/api/cadets')
      .set('Authorization', `Bearer ${cadetToken}`)
      .send(validCadetData);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate cadetId with 409 Conflict', async () => {
    await request(app)
      .post('/api/cadets')
      .set('Authorization', `Bearer ${officerToken}`)
      .send(validCadetData);

    const duplicateRes = await request(app)
      .post('/api/cadets')
      .set('Authorization', `Bearer ${officerToken}`)
      .send(validCadetData);

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should search and filter cadets by unit and status', async () => {
    await request(app)
      .post('/api/cadets')
      .set('Authorization', `Bearer ${officerToken}`)
      .send(validCadetData);

    const res = await request(app)
      .get('/api/cadets?unit=1 Karnataka&status=Active')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(1);
  });
});
