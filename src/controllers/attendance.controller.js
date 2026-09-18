const Attendance = require('../models/Attendance');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * Helper to normalize date to UTC midnight
 */
const normalizeDate = (inputDate) => {
  const d = new Date(inputDate);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * @desc    Mark single attendance record
 * @route   POST /api/attendance
 * @access  Private (Officer, Admin)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { cadet, date, sessionName, status, remarks } = req.body;

    const cadetExists = await Cadet.findById(cadet);
    if (!cadetExists) {
      return next(ApiError.notFound('Cadet not found'));
    }

    const normalizedDate = normalizeDate(date);

    // Check duplicate explicitly for descriptive error
    const existingRecord = await Attendance.findOne({
      cadet,
      date: normalizedDate,
      sessionName: sessionName.trim()
    });

    if (existingRecord) {
      return next(
        ApiError.conflict(
          `Attendance for cadet '${cadetExists.fullName}' on ${normalizedDate.toISOString().split('T')[0]} for session '${sessionName}' has already been marked`
        )
      );
    }

    const attendance = await Attendance.create({
      cadet,
      date: normalizedDate,
      sessionName: sessionName.trim(),
      status,
      remarks,
      markedBy: req.user._id
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('cadet', 'cadetId fullName unit battalion')
      .populate('markedBy', 'name email role');

    return ApiResponse.created(res, 'Attendance marked successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark bulk attendance (e.g. for a platoon or squad session)
 * @route   POST /api/attendance/bulk
 * @access  Private (Officer, Admin)
 */
const markBulkAttendance = async (req, res, next) => {
  try {
    const { date, sessionName, records } = req.body;
    const normalizedDate = normalizeDate(date);
    const session = sessionName.trim();

    const createdRecords = [];
    const skippedRecords = [];

    for (const item of records) {
      try {
        const existing = await Attendance.findOne({
          cadet: item.cadet,
          date: normalizedDate,
          sessionName: session
        });

        if (existing) {
          skippedRecords.push({ cadet: item.cadet, reason: 'Already marked' });
          continue;
        }

        const doc = await Attendance.create({
          cadet: item.cadet,
          date: normalizedDate,
          sessionName: session,
          status: item.status,
          remarks: item.remarks || '',
          markedBy: req.user._id
        });

        createdRecords.push(doc);
      } catch (err) {
        skippedRecords.push({ cadet: item.cadet, reason: err.message });
      }
    }

    return ApiResponse.created(res, `Bulk attendance recorded: ${createdRecords.length} added, ${skippedRecords.length} skipped`, {
      addedCount: createdRecords.length,
      skippedCount: skippedRecords.length,
      records: createdRecords,
      skipped: skippedRecords
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance records with filtering
 * @route   GET /api/attendance
 * @access  Private (Officer, Admin)
 */
const getAttendance = async (req, res, next) => {
  try {
    const {
      cadet,
      startDate,
      endDate,
      sessionName,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (cadet) query.cadet = cadet;
    if (sessionName) query.sessionName = { $regex: sessionName, $options: 'i' };
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = normalizeDate(startDate);
      if (endDate) {
        const end = normalizeDate(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('cadet', 'cadetId fullName unit battalion currentRank')
      .populate('markedBy', 'name role')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Attendance records retrieved', records, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance for currently logged-in cadet (or specific cadet ID for officers)
 * @route   GET /api/attendance/cadet/:cadetId
 * @access  Private
 */
const getCadetAttendance = async (req, res, next) => {
  try {
    const cadetId = req.params.cadetId || req.params.id;

    // If caller is cadet, ensure they are requesting their own attendance
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile || req.user.cadetProfile._id.toString() !== cadetId) {
        return next(ApiError.forbidden('You can only view your own attendance records'));
      }
    }

    const records = await Attendance.find({ cadet: cadetId })
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    const total = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const leaveCount = records.filter((r) => r.status === 'Leave').length;
    const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

    return ApiResponse.success(res, 'Cadet attendance summary retrieved', {
      statistics: {
        totalSessions: total,
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        attendancePercentage: `${attendanceRate}%`
      },
      records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an attendance entry
 * @route   PUT /api/attendance/:id
 * @access  Private (Officer, Admin)
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return next(ApiError.notFound('Attendance record not found'));
    }

    if (status) record.status = status;
    if (typeof remarks !== 'undefined') record.remarks = remarks;
    record.markedBy = req.user._id;

    await record.save();
    const updated = await Attendance.findById(record._id)
      .populate('cadet', 'cadetId fullName')
      .populate('markedBy', 'name');

    return ApiResponse.success(res, 'Attendance updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an attendance entry
 * @route   DELETE /api/attendance/:id
 * @access  Private (Officer, Admin)
 */
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return next(ApiError.notFound('Attendance record not found'));
    }
    return ApiResponse.success(res, 'Attendance record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  markBulkAttendance,
  getAttendance,
  getCadetAttendance,
  updateAttendance,
  deleteAttendance
};
