/**
 * Application Constants
 */

const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  CADET: 'cadet'
};

const CADET_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PASSED_OUT: 'Passed Out',
  SUSPENDED: 'Suspended'
};

const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave'
};

const TRAINING_TYPES = [
  'Weapon Training',
  'Drill',
  'Map Reading',
  'Field Craft',
  'Obstacle Course',
  'Theory',
  'Social Service',
  'Other'
];

const TRAINING_STATUS = {
  SCHEDULED: 'Scheduled',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const CAMP_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const CERTIFICATE_TYPES = [
  'A Certificate',
  'B Certificate',
  'C Certificate',
  'Camp Participation',
  'Merit',
  'Special'
];

const ACHIEVEMENT_CATEGORIES = [
  'Drill',
  'Shooting',
  'Sports',
  'Cultural',
  'Academic',
  'Best Cadet',
  'Other'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

module.exports = {
  ROLES,
  CADET_STATUS,
  ATTENDANCE_STATUS,
  TRAINING_TYPES,
  TRAINING_STATUS,
  CAMP_STATUS,
  CERTIFICATE_TYPES,
  ACHIEVEMENT_CATEGORIES,
  BLOOD_GROUPS,
  GENDERS
};
