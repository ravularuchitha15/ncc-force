const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Cadet = require('../src/models/Cadet');
const Rank = require('../src/models/Rank');
const { ROLES } = require('../src/config/constants');

require('./setup');

describe('Dashboard APIs Tests', () => {
  let officerToken;
  let cadetToken;
  let testCadet;

  beforeEach(async () => {
    const rank = await Rank.create({
      name: 'Cadet',
      abbreviation: 'Cdt',
      level: 1,
      wing: 'All'
    });

    testCadet = await Cadet.create({
      cadetId: 'NCC/2026/KA/SD/4001',
      fullName: 'Siddharth Rao',
      email: 'siddharth@cadet.test',
      phoneNumber: '+91 9876543233',
      dateOfBirth: '2004-09-20',
      gender: 'Male',
      institution: 'St. Joseph College',
      unit: '1 Karnataka Battalion NCC',
      battalion: '1 KAR BN',
      yearSemester: '1st Year',
      currentRank: rank._id
    });

    const officer = await User.create({
      name: 'Major Officer',
      email: 'major@ncc.test',
      password: 'Password@123',
      role: ROLES.OFFICER
    });

    const cadetUser = await User.create({
      name: 'Siddharth Rao',
      email: 'siddharth@cadet.test',
      password: 'Password@123',
      role: ROLES.CADET,
      cadetProfile: testCadet._id
    });

    const offLogin = await request(app).post('/api/auth/login').send({
      email: 'major@ncc.test',
      password: 'Password@123'
    });
    officerToken = offLogin.body.data.token;

    const cadLogin = await request(app).post('/api/auth/login').send({
      email: 'siddharth@cadet.test',
      password: 'Password@123'
    });
    cadetToken = cadLogin.body.data.token;
  });

  it('should return aggregate metrics on the Officer Dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/officer')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.totalCadets).toBe(1);
    expect(res.body.data.metrics.activeCadets).toBe(1);
    expect(Array.isArray(res.body.data.recentAttendance)).toBe(true);
    expect(Array.isArray(res.body.data.upcomingTraining)).toBe(true);
    expect(Array.isArray(res.body.data.upcomingCamps)).toBe(true);
  });

  it('should return personal dossier on the Cadet Dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/cadet')
      .set('Authorization', `Bearer ${cadetToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.cadetId).toBe(testCadet.cadetId);
    expect(res.body.data.profile.fullName).toBe(testCadet.fullName);
    expect(res.body.data.attendanceSummary).toBeDefined();
    expect(Array.isArray(res.body.data.upcomingTraining)).toBe(true);
  });
});
