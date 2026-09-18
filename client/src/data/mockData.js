// ─── CADETS ───────────────────────────────────────────────────────────────────
export const cadets = [
  { id:'c1', regNo:'DL-ARY-0001', name:'Arjun Sharma', gender:'Male', dob:'2005-03-15', phone:'+91-9876500001', email:'arjun.sharma@example.com', college:'Delhi Public School', unit:'1 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2023-07-01', rank:'Lance Corporal', batch:'2023-2026', status:'Active' },
  { id:'c2', regNo:'DL-ARY-0002', name:'Priya Verma', gender:'Female', dob:'2005-06-22', phone:'+91-9876500002', email:'priya.verma@example.com', college:'Modern School', unit:'1 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2023-07-01', rank:'Corporal', batch:'2023-2026', status:'Active' },
  { id:'c3', regNo:'DL-ARY-0003', name:'Rahul Nair', gender:'Male', dob:'2004-11-10', phone:'+91-9876500003', email:'rahul.nair@example.com', college:'Kendriya Vidyalaya', unit:'1 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2022-07-01', rank:'Sergeant', batch:'2022-2025', status:'Active' },
  { id:'c4', regNo:'DL-ARY-0004', name:'Anjali Gupta', gender:'Female', dob:'2005-09-05', phone:'+91-9876500004', email:'anjali.gupta@example.com', college:'DPS RK Puram', unit:'1 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2023-07-01', rank:'Cadet', batch:'2023-2026', status:'Active' },
  { id:'c5', regNo:'DL-ARY-0005', name:'Vikram Singh', gender:'Male', dob:'2004-01-20', phone:'+91-9876500005', email:'vikram.singh@example.com', college:'St. Columba\'s School', unit:'2 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2022-07-01', rank:'Corporal', batch:'2022-2025', status:'Inactive' },
  { id:'c6', regNo:'DL-NAV-0001', name:'Sneha Pillai', gender:'Female', dob:'2005-04-14', phone:'+91-9876500006', email:'sneha.pillai@example.com', college:'Navy Children School', unit:'1 Delhi Naval NCC', wing:'Navy', enrollmentDate:'2023-07-01', rank:'Cadet', batch:'2023-2026', status:'Active' },
  { id:'c7', regNo:'DL-ARY-0006', name:'Karan Mehta', gender:'Male', dob:'2003-08-30', phone:'+91-9876500007', email:'karan.mehta@example.com', college:'Hindu College', unit:'1 Delhi NCC Battalion', wing:'Army', enrollmentDate:'2021-07-01', rank:'Junior Under Officer', batch:'2021-2024', status:'Active' },
];

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceSessions = [
  {
    id:'att1', date:'2026-09-15', activity:'Parade Practice', unit:'1 Delhi NCC Battalion',
    records: [
      { cadetId:'c1', status:'Present' }, { cadetId:'c2', status:'Present' },
      { cadetId:'c3', status:'Absent' }, { cadetId:'c4', status:'Present' },
      { cadetId:'c6', status:'Leave' }, { cadetId:'c7', status:'Present' },
    ],
    finalized: true,
  },
  {
    id:'att2', date:'2026-09-12', activity:'Drill Training', unit:'1 Delhi NCC Battalion',
    records: [
      { cadetId:'c1', status:'Present' }, { cadetId:'c2', status:'Leave' },
      { cadetId:'c3', status:'Present' }, { cadetId:'c4', status:'Absent' },
      { cadetId:'c7', status:'Present' },
    ],
    finalized: true,
  },
  {
    id:'att3', date:'2026-09-08', activity:'Map Reading', unit:'2 Delhi NCC Battalion',
    records: [
      { cadetId:'c5', status:'Present' },
    ],
    finalized: false,
  },
];

// ─── CAMPS ────────────────────────────────────────────────────────────────────
export const camps = [
  { id:'camp1', name:'Annual Training Camp 2026', type:'Annual Training Camp', startDate:'2026-10-05', endDate:'2026-10-15', location:'Ranikhet, Uttarakhand', description:'10-day intensive annual training camp covering field craft, map reading, obstacle course and leadership activities.', eligibility:'All active cadets with minimum 75% attendance', capacity:50, registered:32, status:'Upcoming', instructions:'Bring personal kit, uniform, and medical certificate.' },
  { id:'camp2', name:'Republic Day Camp Selection', type:'Republic Day Camp', startDate:'2026-11-01', endDate:'2026-11-10', location:'Delhi Cantonment', description:'Selection trials for Republic Day Camp 2027.', eligibility:'A/B certificate holders, minimum Corporal rank', capacity:20, registered:15, status:'Upcoming', instructions:'Parade uniform mandatory. Height and fitness check on day 1.' },
  { id:'camp3', name:'Trekking Camp — Himalaya', type:'Adventure Camp', startDate:'2026-08-10', endDate:'2026-08-20', location:'Manali, Himachal Pradesh', description:'10-day trekking and mountaineering camp.', eligibility:'Senior cadets only', capacity:30, registered:30, status:'Completed', instructions:'Physical fitness certificate required.' },
  { id:'camp4', name:'NIC Naval Wing Camp', type:'Integration Camp', startDate:'2026-12-01', endDate:'2026-12-07', location:'INS Chilika, Odisha', description:'Naval integration camp with sailing, swimming and seamanship.', eligibility:'Naval wing cadets', capacity:25, registered:10, status:'Upcoming', instructions:'Non-swimmers must disclose upfront.' },
];

export const campParticipants = [
  { campId:'camp3', cadetId:'c1', registrationDate:'2026-07-20', status:'Completed', performance:'Excellent', remarks:'Best performer in trekking.' },
  { campId:'camp3', cadetId:'c3', registrationDate:'2026-07-21', status:'Completed', performance:'Good', remarks:'Active participation.' },
  { campId:'camp3', cadetId:'c7', registrationDate:'2026-07-22', status:'Completed', performance:'Outstanding', remarks:'Camp Commander nominee.' },
  { campId:'camp1', cadetId:'c1', registrationDate:'2026-09-10', status:'Registered', performance:null, remarks:null },
  { campId:'camp1', cadetId:'c2', registrationDate:'2026-09-11', status:'Registered', performance:null, remarks:null },
  { campId:'camp2', cadetId:'c7', registrationDate:'2026-09-14', status:'Registered', performance:null, remarks:null },
];

// ─── TRAINING ─────────────────────────────────────────────────────────────────
export const trainingSessions = [
  { id:'tr1', title:'Weapon Training — .303 Rifle', date:'2026-09-10', instructor:'Lt. Col. Rajesh Kumar', unit:'1 Delhi NCC Battalion', topics:['Rifle anatomy','Loading & unloading','Firing position','Safety protocols'], duration:'4 hours', status:'Completed' },
  { id:'tr2', title:'Map Reading & Navigation', date:'2026-09-17', instructor:'Maj. Priya Singh', unit:'1 Delhi NCC Battalion', topics:['Topographic maps','Grid references','Compass use','Route planning'], duration:'3 hours', status:'Upcoming' },
  { id:'tr3', title:'First Aid & Field Medicine', date:'2026-09-24', instructor:'Lt. Col. Rajesh Kumar', unit:'1 Delhi NCC Battalion', topics:['Bandaging','CPR basics','Fracture handling','Evacuation'], duration:'3 hours', status:'Upcoming' },
  { id:'tr4', title:'Drill & Parade Practice', date:'2026-08-20', instructor:'Maj. Priya Singh', unit:'2 Delhi NCC Battalion', topics:['Slow march','Quick march','Saluting','Eyes right'], duration:'2 hours', status:'Completed' },
];

export const trainingRecords = [
  { trainingId:'tr1', cadetId:'c1', attendance:'Present', marks:85, grade:'A', remarks:'Excellent handling technique.' },
  { trainingId:'tr1', cadetId:'c2', attendance:'Present', marks:78, grade:'B+', remarks:'Good understanding.' },
  { trainingId:'tr1', cadetId:'c3', attendance:'Absent', marks:null, grade:null, remarks:'Medical leave.' },
  { trainingId:'tr1', cadetId:'c7', attendance:'Present', marks:92, grade:'A+', remarks:'Top performer.' },
  { trainingId:'tr4', cadetId:'c5', attendance:'Present', marks:80, grade:'A', remarks:'Smart drill execution.' },
];

// ─── RANKS ────────────────────────────────────────────────────────────────────
export const rankHierarchy = ['Cadet','Lance Corporal','Corporal','Sergeant','Company Sergeant Major','Junior Under Officer','Senior Under Officer','Under Officer'];

export const promotions = [
  { id:'pr1', cadetId:'c1', fromRank:'Cadet', toRank:'Lance Corporal', date:'2024-01-15', remarks:'Excellent performance in ATC 2023.', officerId:'o1' },
  { id:'pr2', cadetId:'c2', fromRank:'Cadet', toRank:'Lance Corporal', date:'2024-01-15', remarks:'Good attendance and drill.', officerId:'o1' },
  { id:'pr3', cadetId:'c2', fromRank:'Lance Corporal', toRank:'Corporal', date:'2025-03-20', remarks:'Leadership in parade.', officerId:'o1' },
  { id:'pr4', cadetId:'c3', fromRank:'Lance Corporal', toRank:'Corporal', date:'2024-06-10', remarks:'Outstanding in weapon training.', officerId:'o2' },
  { id:'pr5', cadetId:'c3', fromRank:'Corporal', toRank:'Sergeant', date:'2025-08-01', remarks:'Best cadet in batch.', officerId:'o1' },
  { id:'pr6', cadetId:'c7', fromRank:'Sergeant', toRank:'Junior Under Officer', date:'2024-11-26', remarks:'NCC Day award winner.', officerId:'o1' },
];

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
export const certificates = [
  { id:'cert1', cadetId:'c7', type:'C Certificate', examDate:'2024-11-15', resultDate:'2025-01-10', result:'Pass', grade:'A', certNumber:'NCC/C/DL/2024/0042', issueDate:'2025-02-01', verified:true, remarks:'Cleared written, practical and drill.' },
  { id:'cert2', cadetId:'c3', type:'B Certificate', examDate:'2024-05-20', resultDate:'2024-07-15', result:'Pass', grade:'B+', certNumber:'NCC/B/DL/2024/0118', issueDate:'2024-08-10', verified:true, remarks:'Good performance.' },
  { id:'cert3', cadetId:'c2', type:'A Certificate', examDate:'2024-02-10', resultDate:'2024-04-05', result:'Pass', grade:'A', certNumber:'NCC/A/DL/2024/0221', issueDate:'2024-05-01', verified:true, remarks:'Passed with distinction.' },
  { id:'cert4', cadetId:'c1', type:'A Certificate', examDate:'2024-02-10', resultDate:'2024-04-05', result:'Pass', grade:'B', certNumber:'NCC/A/DL/2024/0222', issueDate:'2024-05-01', verified:true, remarks:'Satisfactory performance.' },
  { id:'cert5', cadetId:'c4', type:'A Certificate', examDate:'2026-10-20', resultDate:null, result:'Pending', grade:null, certNumber:null, issueDate:null, verified:false, remarks:'Registered for upcoming exam.' },
];

// ─── LEAVE ────────────────────────────────────────────────────────────────────
export const leaveRequests = [
  { id:'lv1', cadetId:'c1', type:'Medical Leave', fromDate:'2026-09-12', toDate:'2026-09-13', reason:'High fever and viral infection.', status:'Approved', officerRemarks:'Get well soon. Attendance updated.', appliedDate:'2026-09-11', decidedDate:'2026-09-11' },
  { id:'lv2', cadetId:'c2', type:'Family Function', fromDate:'2026-09-16', toDate:'2026-09-16', reason:'Sister\'s wedding ceremony.', status:'Approved', officerRemarks:'Approved. Submit attendance form on return.', appliedDate:'2026-09-14', decidedDate:'2026-09-15' },
  { id:'lv3', cadetId:'c4', type:'Medical Leave', fromDate:'2026-09-20', toDate:'2026-09-22', reason:'Knee injury from sports practice.', status:'Pending', officerRemarks:null, appliedDate:'2026-09-17', decidedDate:null },
  { id:'lv4', cadetId:'c3', type:'Academic Leave', fromDate:'2026-10-01', toDate:'2026-10-05', reason:'University examinations.', status:'Pending', officerRemarks:null, appliedDate:'2026-09-16', decidedDate:null },
  { id:'lv5', cadetId:'c5', type:'Personal', fromDate:'2026-08-25', toDate:'2026-08-25', reason:'Personal emergency.', status:'Rejected', officerRemarks:'Insufficient notice. Must apply 3 days prior.', appliedDate:'2026-08-24', decidedDate:'2026-08-24' },
];

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const events = [
  { id:'ev1', title:'Parade Practice', type:'Parade', date:'2026-09-20', time:'06:00', endTime:'08:00', location:'Parade Ground', description:'Weekly parade practice for all cadets.', audience:'All', unit:'1 Delhi NCC Battalion' },
  { id:'ev2', title:'Republic Day Preparation Meeting', type:'Meeting', date:'2026-09-22', time:'14:00', endTime:'15:00', location:'NCC Office', description:'Planning for Republic Day Camp selection process.', audience:'Officers', unit:'All' },
  { id:'ev3', title:'Annual Training Camp', type:'Camp', date:'2026-10-05', time:'07:00', endTime:'', location:'Ranikhet', description:'10-day ATC. Report at 07:00.', audience:'All', unit:'1 Delhi NCC Battalion' },
  { id:'ev4', title:'A Certificate Examination', type:'Examination', date:'2026-10-20', time:'09:00', endTime:'13:00', location:'Training Hall', description:'A Certificate exam for eligible cadets.', audience:'All', unit:'All' },
  { id:'ev5', title:'NCC Day Celebration', type:'Ceremony', date:'2026-11-22', time:'08:00', endTime:'12:00', location:'Parade Ground', description:'Annual NCC Day parade and cultural program.', audience:'All', unit:'All' },
  { id:'ev6', title:'Weapon Training Session', type:'Training', date:'2026-09-24', time:'07:00', endTime:'10:00', location:'Firing Range', description:'Practical weapon handling session.', audience:'All', unit:'1 Delhi NCC Battalion' },
  { id:'ev7', title:'Inter-Battalion Drill Competition', type:'Competition', date:'2026-10-15', time:'09:00', endTime:'17:00', location:'Delhi Cantonment', description:'Annual inter-battalion drill competition.', audience:'All', unit:'All' },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export const achievements = [
  { id:'ach1', cadetId:'c7', title:'Best Cadet — NCC Day 2024', category:'Award', date:'2024-11-22', description:'Awarded Best Cadet of the battalion on NCC Day 2024.', awardedBy:'Lt. Col. Rajesh Kumar' },
  { id:'ach2', cadetId:'c7', title:'Republic Day Camp — Participation Certificate', category:'Certificate', date:'2024-01-26', description:'Participated in Republic Day Camp 2024, New Delhi.', awardedBy:'Directorate General NCC' },
  { id:'ach3', cadetId:'c3', title:'Best Shooter — Inter-Platoon Competition', category:'Medal', date:'2025-03-10', description:'Gold medal in 100m shooting at inter-platoon competition.', awardedBy:'Maj. Priya Singh' },
  { id:'ach4', cadetId:'c1', title:'Leadership Excellence Award', category:'Award', date:'2025-07-15', description:'Recognized for leading camp team during ATC 2025.', awardedBy:'Lt. Col. Rajesh Kumar' },
  { id:'ach5', cadetId:'c2', title:'Yoga Day Special Recognition', category:'Certificate', date:'2026-06-21', description:'Represented battalion at International Yoga Day event.', awardedBy:'NCC Directorate Delhi' },
  { id:'ach6', cadetId:'c7', title:'C Certificate — Grade A', category:'Certificate', date:'2025-02-01', description:'Passed C Certificate exam with Grade A.', awardedBy:'NCC Examination Board' },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifications = [
  { id:'n1', userId:'c1', title:'Leave Approved', message:'Your medical leave for Sep 12-13 has been approved.', type:'leave', read:false, date:'2026-09-11' },
  { id:'n2', userId:'c1', title:'Upcoming Training', message:'Map Reading & Navigation session on Sep 17. Please report by 07:00.', type:'training', read:false, date:'2026-09-15' },
  { id:'n3', userId:'c1', title:'Camp Registration Open', message:'Annual Training Camp registration is now open. Apply before Sep 25.', type:'camp', read:true, date:'2026-09-10' },
  { id:'n4', userId:'o1', title:'New Leave Request', message:'Cadet Anjali Gupta has applied for medical leave (Sep 20-22).', type:'leave', read:false, date:'2026-09-17' },
  { id:'n5', userId:'o1', title:'New Leave Request', message:'Cadet Rahul Nair has applied for academic leave (Oct 1-5).', type:'leave', read:false, date:'2026-09-16' },
  { id:'n6', userId:'c2', title:'Leave Approved', message:'Your family function leave for Sep 16 has been approved.', type:'leave', read:true, date:'2026-09-15' },
  { id:'n7', userId:'c3', title:'Rank Update', message:'Congratulations! You have been promoted to Sergeant.', type:'rank', read:false, date:'2025-08-01' },
];

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const announcements = [
  { id:'an1', title:'Annual Training Camp 2026 — Registration Open', message:'Registration for the Annual Training Camp 2026 (Oct 5-15, Ranikhet) is now open. All active cadets with 75%+ attendance are eligible. Submit your form to the unit office or register online by September 25, 2026. Kit list will be shared separately.', date:'2026-09-10', author:'Lt. Col. Rajesh Kumar', audience:'All Cadets', priority:'High', attachment:null },
  { id:'an2', title:'A Certificate Examination Notice', message:'A Certificate Examination will be conducted on October 20, 2026. Eligible cadets (completed 2 years, attended ATC) must register by October 5. Syllabus and previous papers available at the NCC office.', date:'2026-09-08', author:'Maj. Priya Singh', audience:'All Cadets', priority:'High', attachment:null },
  { id:'an3', title:'NCC Day Celebration 2026', message:'NCC Day will be celebrated on November 22, 2026 with a grand parade and cultural program. All cadets must be in full ceremonial uniform. Rehearsals begin November 10. Attendance is compulsory.', date:'2026-09-05', author:'Lt. Col. Rajesh Kumar', audience:'All Cadets', priority:'Medium', attachment:null },
  { id:'an4', title:'Weapon Cleaning Parade', message:'Mandatory weapon cleaning parade scheduled for Saturday, September 20, 2026. All cadets of 1 Delhi NCC Battalion must report to the armoury by 09:00 hours with weapon cleaning kit.', date:'2026-09-16', author:'Lt. Col. Rajesh Kumar', audience:'1 Delhi NCC Battalion', priority:'Medium', attachment:null },
];

// ─── PERFORMANCE ──────────────────────────────────────────────────────────────
export const performanceData = {
  c1: { attendance: 88, trainingScore: 82, campParticipation: 2, achievements: 1, certificateLevel: 'A' },
  c2: { attendance: 92, trainingScore: 78, campParticipation: 1, achievements: 1, certificateLevel: 'A' },
  c3: { attendance: 76, trainingScore: 90, campParticipation: 2, achievements: 1, certificateLevel: 'B' },
  c4: { attendance: 70, trainingScore: 65, campParticipation: 0, achievements: 0, certificateLevel: null },
  c5: { attendance: 55, trainingScore: 72, campParticipation: 1, achievements: 0, certificateLevel: null },
  c6: { attendance: 84, trainingScore: 70, campParticipation: 0, achievements: 0, certificateLevel: null },
  c7: { attendance: 96, trainingScore: 94, campParticipation: 3, achievements: 3, certificateLevel: 'C' },
};
