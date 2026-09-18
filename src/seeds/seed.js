require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Cadet = require('../models/Cadet');
const Rank = require('../models/Rank');
const RankHistory = require('../models/RankHistory');
const Unit = require('../models/Unit');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const Camp = require('../models/Camp');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Performance = require('../models/Performance');
const { ROLES, CADET_STATUS, ATTENDANCE_STATUS, TRAINING_STATUS, CAMP_STATUS } = require('../config/constants');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Wiping existing data for clean seed...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Cadet.deleteMany({}),
      Rank.deleteMany({}),
      RankHistory.deleteMany({}),
      Unit.deleteMany({}),
      Attendance.deleteMany({}),
      Training.deleteMany({}),
      Camp.deleteMany({}),
      Certificate.deleteMany({}),
      Achievement.deleteMany({}),
      Performance.deleteMany({})
    ]);

    console.log('[Seed] Inserting NCC Ranks...');
    const ranks = await Rank.insertMany([
      { name: 'Cadet', abbreviation: 'Cdt', level: 1, wing: 'All', description: 'Entry level cadet undergoing basic training' },
      { name: 'Lance Corporal', abbreviation: 'L/Cpl', level: 2, wing: 'All', description: 'First promotion rank for distinguished performance' },
      { name: 'Corporal', abbreviation: 'Cpl', level: 3, wing: 'All', description: 'Section second-in-command leader' },
      { name: 'Sergeant', abbreviation: 'Sgt', level: 4, wing: 'All', description: 'Section commander responsible for discipline and drill' },
      { name: 'Company Quarter Master Sergeant', abbreviation: 'CQMS', level: 5, wing: 'Army', description: 'Manages company stores and logistics' },
      { name: 'Company Sergeant Major', abbreviation: 'CSM', level: 6, wing: 'Army', description: 'Senior non-commissioned leader of the cadet company' },
      { name: 'Junior Under Officer', abbreviation: 'JUO', level: 7, wing: 'All', description: 'Platoon commander in cadet hierarchy' },
      { name: 'Senior Under Officer', abbreviation: 'SUO', level: 8, wing: 'All', description: 'Highest rank for an NCC cadet in a battalion' }
    ]);

    const cdtRank = ranks.find((r) => r.abbreviation === 'Cdt');
    const cplRank = ranks.find((r) => r.abbreviation === 'Cpl');
    const sgtRank = ranks.find((r) => r.abbreviation === 'Sgt');

    console.log('[Seed] Inserting NCC Units...');
    const units = await Unit.insertMany([
      {
        unitName: '1 Karnataka Battalion NCC',
        battalion: '1 KAR BN',
        directorate: 'Karnataka & Goa Directorate',
        location: 'Bengaluru, Karnataka',
        description: 'Premier infantry battalion with Army and Mixed wings'
      },
      {
        unitName: '39 Uttarakhand Battalion NCC',
        battalion: '39 UK BN',
        directorate: 'Uttarakhand Directorate',
        location: 'Dehradun, Uttarakhand',
        description: 'Elite mountain training and youth battalion'
      },
      {
        unitName: '7 Maharashtra Battalion NCC',
        battalion: '7 MAH BN',
        directorate: 'Maharashtra Directorate',
        location: 'Mumbai, Maharashtra',
        description: 'Coastal and urban training division'
      }
    ]);

    console.log('[Seed] Inserting Admin & Officer Users...');
    const adminUser = await User.create({
      name: 'Group Commander Saxena',
      email: 'admin@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.ADMIN
    });

    const officer1 = await User.create({
      name: 'Major Rajesh Sharma',
      email: 'officer.sharma@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.OFFICER
    });

    const officer2 = await User.create({
      name: 'Captain Priya Verma',
      email: 'officer.verma@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.OFFICER
    });

    console.log('[Seed] Inserting Cadets & Linking Cadet Accounts...');
    // Cadet 1: Rahul Nair (Sgt)
    const cadet1 = await Cadet.create({
      cadetId: 'NCC/2025/KA/SD/1001',
      fullName: 'Rahul Nair',
      email: 'cadet.rahul@ncc.gov.in',
      phoneNumber: '+91 9876543210',
      dateOfBirth: new Date('2004-05-15'),
      gender: 'Male',
      institution: 'National College of Engineering',
      unit: '1 Karnataka Battalion NCC',
      battalion: '1 KAR BN',
      enrollmentDate: new Date('2024-07-01'),
      yearSemester: '2nd Year / Sem 4',
      bloodGroup: 'O+',
      address: {
        street: '12 Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      emergencyContact: {
        name: 'Suresh Nair',
        relation: 'Father',
        phoneNumber: '+91 9876500001'
      },
      currentRank: sgtRank._id,
      status: CADET_STATUS.ACTIVE
    });

    const userCadet1 = await User.create({
      name: 'Rahul Nair',
      email: 'cadet.rahul@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.CADET,
      cadetProfile: cadet1._id
    });
    cadet1.user = userCadet1._id;
    await cadet1.save();

    // Cadet 2: Ananya Sen (Cpl)
    const cadet2 = await Cadet.create({
      cadetId: 'NCC/2025/KA/SW/1002',
      fullName: 'Ananya Sen',
      email: 'cadet.ananya@ncc.gov.in',
      phoneNumber: '+91 9876543211',
      dateOfBirth: new Date('2005-02-20'),
      gender: 'Female',
      institution: 'St. Teresa Degree College',
      unit: '1 Karnataka Battalion NCC',
      battalion: '1 KAR BN',
      enrollmentDate: new Date('2024-07-01'),
      yearSemester: '2nd Year / Sem 3',
      bloodGroup: 'B+',
      address: {
        street: '45 Residency Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560025'
      },
      emergencyContact: {
        name: 'Sunita Sen',
        relation: 'Mother',
        phoneNumber: '+91 9876500002'
      },
      currentRank: cplRank._id,
      status: CADET_STATUS.ACTIVE
    });

    const userCadet2 = await User.create({
      name: 'Ananya Sen',
      email: 'cadet.ananya@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.CADET,
      cadetProfile: cadet2._id
    });
    cadet2.user = userCadet2._id;
    await cadet2.save();

    // Cadet 3: Amit Patel (Cdt)
    const cadet3 = await Cadet.create({
      cadetId: 'NCC/2026/KA/SD/1003',
      fullName: 'Amit Patel',
      email: 'cadet.amit@ncc.gov.in',
      phoneNumber: '+91 9876543212',
      dateOfBirth: new Date('2005-11-10'),
      gender: 'Male',
      institution: 'Government Science College',
      unit: '1 Karnataka Battalion NCC',
      battalion: '1 KAR BN',
      enrollmentDate: new Date('2025-07-15'),
      yearSemester: '1st Year / Sem 2',
      bloodGroup: 'A+',
      address: {
        street: '88 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560002'
      },
      emergencyContact: {
        name: 'Dinesh Patel',
        relation: 'Father',
        phoneNumber: '+91 9876500003'
      },
      currentRank: cdtRank._id,
      status: CADET_STATUS.ACTIVE
    });

    const userCadet3 = await User.create({
      name: 'Amit Patel',
      email: 'cadet.amit@ncc.gov.in',
      password: 'Password@123',
      role: ROLES.CADET,
      cadetProfile: cadet3._id
    });
    cadet3.user = userCadet3._id;
    await cadet3.save();

    console.log('[Seed] Inserting Rank Promotion Histories...');
    await RankHistory.create({
      cadet: cadet1._id,
      previousRank: cdtRank._id,
      newRank: cplRank._id,
      promotionDate: new Date('2025-01-15'),
      reason: 'Exemplary drill precision and attendance',
      approvedBy: officer1._id
    });
    await RankHistory.create({
      cadet: cadet1._id,
      previousRank: cplRank._id,
      newRank: sgtRank._id,
      promotionDate: new Date('2025-08-15'),
      reason: 'Leadership during Republic Day camp parade',
      approvedBy: officer1._id
    });
    await RankHistory.create({
      cadet: cadet2._id,
      previousRank: cdtRank._id,
      newRank: cplRank._id,
      promotionDate: new Date('2025-03-20'),
      reason: 'Meritorious conduct and shooting qualification',
      approvedBy: officer2._id
    });

    console.log('[Seed] Inserting Training Programs...');
    const training1 = await Training.create({
      trainingId: 'TRG-2026-001',
      name: 'Weapon Training: 0.22 Rifle Simulator & Stripping',
      description: 'Handling, safety precautions, stripping, assembling, and sight alignment.',
      trainingType: 'Weapon Training',
      date: new Date(Date.now() + 86400000 * 2), // 2 days later
      startTime: '06:30 AM',
      endTime: '08:30 AM',
      location: '1 KAR BN Firing Range / Armory',
      instructor: officer1._id,
      assignedCadets: [cadet1._id, cadet2._id, cadet3._id],
      status: TRAINING_STATUS.SCHEDULED,
      remarks: 'Full uniform required with beret and lanyard'
    });

    const training2 = await Training.create({
      trainingId: 'TRG-2026-002',
      name: 'Drill & Ceremonial Guard of Honour',
      description: 'Slow march, quick march, saluting on the move, and rifle ceremonial drill.',
      trainingType: 'Drill',
      date: new Date(Date.now() + 86400000 * 5), // 5 days later
      startTime: '06:00 AM',
      endTime: '08:00 AM',
      location: 'College Main Parade Ground',
      instructor: officer2._id,
      assignedCadets: [cadet1._id, cadet2._id],
      status: TRAINING_STATUS.SCHEDULED,
      remarks: 'Preparation for upcoming annual inspection'
    });

    console.log('[Seed] Inserting NCC Camps...');
    const camp1 = await Camp.create({
      name: 'Combined Annual Training Camp (CATC-XIV)',
      campType: 'CATC',
      description: '10-day mandatory residential training camp focusing on obstacle courses, firing, and cultural cohesion.',
      location: 'Toranagallu Training Complex, Bellary',
      startDate: new Date(Date.now() + 86400000 * 15),
      endDate: new Date(Date.now() + 86400000 * 25),
      officerInCharge: officer1._id,
      participatingCadets: [cadet1._id, cadet2._id, cadet3._id],
      status: CAMP_STATUS.UPCOMING,
      remarks: 'Medical fitness certificates mandatory before boarding bus'
    });

    console.log('[Seed] Inserting Attendance Records...');
    const date1 = new Date();
    date1.setUTCHours(0, 0, 0, 0);
    date1.setDate(date1.getDate() - 3);

    const date2 = new Date();
    date2.setUTCHours(0, 0, 0, 0);
    date2.setDate(date2.getDate() - 1);

    await Attendance.insertMany([
      {
        cadet: cadet1._id,
        date: date1,
        sessionName: 'Morning Physical Training & Drill',
        status: ATTENDANCE_STATUS.PRESENT,
        remarks: 'Punctual and active participation',
        markedBy: officer1._id
      },
      {
        cadet: cadet2._id,
        date: date1,
        sessionName: 'Morning Physical Training & Drill',
        status: ATTENDANCE_STATUS.PRESENT,
        remarks: 'Good posture',
        markedBy: officer1._id
      },
      {
        cadet: cadet3._id,
        date: date1,
        sessionName: 'Morning Physical Training & Drill',
        status: ATTENDANCE_STATUS.ABSENT,
        remarks: 'Uninformed absence',
        markedBy: officer1._id
      },
      {
        cadet: cadet1._id,
        date: date2,
        sessionName: 'Map Reading & Navigation',
        status: ATTENDANCE_STATUS.PRESENT,
        remarks: 'Correctly located grid coordinates',
        markedBy: officer2._id
      },
      {
        cadet: cadet2._id,
        date: date2,
        sessionName: 'Map Reading & Navigation',
        status: ATTENDANCE_STATUS.PRESENT,
        remarks: 'Completed route card',
        markedBy: officer2._id
      },
      {
        cadet: cadet3._id,
        date: date2,
        sessionName: 'Map Reading & Navigation',
        status: ATTENDANCE_STATUS.LEAVE,
        remarks: 'Authorized medical leave submitted',
        markedBy: officer2._id
      }
    ]);

    console.log('[Seed] Inserting Certificates...');
    await Certificate.create({
      name: 'NCC "B" Certificate',
      certificateType: 'B Certificate',
      certificateNumber: 'KA/2025/B/98231',
      issuingOrg: 'NCC Directorate Karnataka & Goa',
      issueDate: new Date('2025-06-10'),
      document: {
        filename: 'cert_sample_b.pdf',
        path: 'uploads/certificates/cert_sample_b.pdf',
        originalName: 'Rahul_Nair_B_Certificate.pdf',
        mimeType: 'application/pdf',
        size: 245120
      },
      description: 'Passed with Grade "A" in Drill, Weapon Training, and National Integration.',
      cadet: cadet1._id,
      uploadedBy: officer1._id
    });

    console.log('[Seed] Inserting Achievements...');
    await Achievement.create({
      title: 'Gold Medal - Inter-Collegiate Rifle Shooting Championship',
      category: 'Shooting',
      date: new Date('2025-09-20'),
      eventName: 'Karnataka Inter-Battalion Shooting Meet 2025',
      position: '1st Place (Gold Medal)',
      description: 'Scored 94/100 in 25m prone position with 0.22 Rifle.',
      cadet: cadet1._id,
      addedBy: officer1._id
    });

    await Achievement.create({
      title: 'Best Cadet Award - Combined Annual Training Camp',
      category: 'Best Cadet',
      date: new Date('2025-10-12'),
      eventName: 'CATC-XI Shimoga',
      position: 'Best Senior Wing Cadet',
      description: 'Awarded for highest aggregate marks in turn-out, drill, and theoretical subjects.',
      cadet: cadet2._id,
      addedBy: officer2._id
    });

    console.log('[Seed] Inserting Performance Evaluations...');
    await Performance.create({
      cadet: cadet1._id,
      assessmentPeriod: 'Annual Assessment 2025-26',
      assessmentDate: new Date('2026-02-15'),
      paradePerformance: { rating: 'Outstanding', remarks: 'Exceptional command voice and turnout' },
      discipline: { rating: 'Outstanding', remarks: 'Always adheres strictly to code of conduct' },
      trainingPerformance: { rating: 'Excellent', remarks: 'Quick grasp of tactical manoeuvres' },
      participation: { rating: 'Outstanding', remarks: '100% participation in social service and blood donation' },
      leadership: { rating: 'Excellent', remarks: 'Skillfully coordinates squad tasks' },
      physicalTraining: { rating: 'Excellent', remarks: 'High stamina and agility' },
      overallRemarks: 'Recommended for Senior Under Officer (SUO) board examination.',
      assessedBy: officer1._id
    });

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Sample Credentials:');
    console.log('  - Admin   : admin@ncc.gov.in / Password@123');
    console.log('  - Officer : officer.sharma@ncc.gov.in / Password@123');
    console.log('  - Officer : officer.verma@ncc.gov.in / Password@123');
    console.log('  - Cadet   : cadet.rahul@ncc.gov.in / Password@123');
    console.log('  - Cadet   : cadet.ananya@ncc.gov.in / Password@123');
    console.log('  - Cadet   : cadet.amit@ncc.gov.in / Password@123');
    console.log('====================================================');
    return true;
  } catch (error) {
    console.error('[Seed Error]', error);
    throw error;
  }
};

const runStandaloneSeed = async () => {
  const uri = process.argv[2] || process.env.MONGO_URI || 'mongodb://localhost:27017/ncc_cadet_db';
  let memoryServer = null;

  try {
    console.log('[Seed] Connecting to MongoDB at', uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  } catch (connErr) {
    console.warn(`[Seed] Could not connect to MongoDB (${connErr.message}).`);
    console.log('[Seed] Spinning up in-memory MongoDB instance for seeding...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
  }

  try {
    await seedDatabase();
  } finally {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
  }
  process.exit(0);
};

if (require.main === module) {
  runStandaloneSeed().catch((err) => {
    console.error('[Seed Fatal Error]', err);
    process.exit(1);
  });
}

module.exports = {
  seedDatabase,
  runStandaloneSeed
};
