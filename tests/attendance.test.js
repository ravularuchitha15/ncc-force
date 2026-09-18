const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Cadet = require('../src/models/Cadet');
const { ROLES } = require('../src/config/constants');

require('./setup');

describe('Attendance Management & Duplicate Prevention Tests', () => {
  let officerToken;
  let cadetToken;
  let testCadet;

  beforeEach(async () => {
    const officer = await User.create({
      name: 'Officer Rajesh',
      email: 'officer@attendance.test',
      password: 'Password@123',
      role: ROLES.OFFICER
    });

    testCadet = await Cadet.create({
      cadetId: 'NCC/2026/KA/SD/3001',
      fullName: 'Vikram Singh',
      email: 'vikram@cadet.test',
      phoneNumber: '+91 9876543200',
      dateOfBirth: '2004-08-10',
      gender: 'Male',
      institution: 'Bangalore Military School',
      unit: '1 Karnataka Battalion NCC',
      battalion: '1 KAR BN',
      yearSemester: '1st Year'
    });

    const cadetUser = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@cadet.test',
      password: 'Password@123',
      role: ROLES.CADET,
      cadetProfile: testCadet._id
    });

    const offLogin = await request(app).post('/api/auth/login').send({
      email: 'officer@attendance.test',
      password: 'Password@123'
    });
    officerToken = offLogin.body.data.token;

    const cadLogin = await request(app).post('/api/auth/login').send({
      email: 'vikram@cadet.test',
      password: 'Password@123'
    });
    cadetToken = cadLogin.body.data.token;
  });

  it('should mark attendance for a cadet successfully', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-16',
        sessionName: 'Morning Drill Parade',
        status: 'Present',
        remarks: 'Excellent turnout'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Present');
  });

  it('should PREVENT DUPLICATE attendance records for the same cadet, date, and session', async () => {
    // 1st mark
    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-16',
        sessionName: 'Morning Drill Parade',
        status: 'Present'
      });

    // 2nd mark for same cadet, date, and session -> MUST BE REJECTED
    const duplicateRes = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-16',
        sessionName: 'Morning Drill Parade',
        status: 'Absent'
      });

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should allow marking attendance for different session on the same date', async () => {
    // Session 1: Morning Drill
    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-16',
        sessionName: 'Morning Drill Parade',
        status: 'Present'
      });

    // Session 2: Afternoon Weapon Training -> should succeed
    const session2Res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-16',
        sessionName: 'Afternoon Weapon Training',
        status: 'Present'
      });

    expect(session2Res.statusCode).toBe(201);
    expect(session2Res.body.success).toBe(true);
  });

  it('should calculate attendance percentage correctly for a cadet', async () => {
    // Session 1: Present
    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-10',
        sessionName: 'Session 1',
        status: 'Present'
      });

    // Session 2: Absent
    await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        cadet: testCadet._id.toString(),
        date: '2026-09-11',
        sessionName: 'Session 2',
        status: 'Absent'
      });

    // Cadet requests own attendance summary
    const summaryRes = await request(app)
      .get(`/api/attendance/cadet/${testCadet._id.toString()}`)
      .set('Authorization', `Bearer ${cadetToken}`);

    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.data.statistics.totalSessions).toBe(2);
    expect(summaryRes.body.data.statistics.present).toBe(1);
    expect(summaryRes.body.data.statistics.absent).toBe(1);
    expect(summaryRes.body.data.statistics.attendancePercentage).toBe('50.0%');
  });
});
