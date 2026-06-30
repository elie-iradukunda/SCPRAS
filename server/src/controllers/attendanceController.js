import { Op } from 'sequelize';
import { Attendance, Worker, User, Project } from '../models/index.js';

export async function listAttendance(req, res, next) {
  try {
    const { projectId, workerId, startDate, endDate } = req.query;

    let where = {};

    if (projectId) where.projectId = projectId;
    if (workerId) where.workerId = workerId;

    if (startDate && endDate) {
      where.checkIn = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attendance = await Attendance.findAll({
      where,
      order: [['checkIn', 'DESC']],
      include: [
        {
          model: Worker,
          include: [{ model: User, attributes: ['fullName', 'email'] }],
        },
        {
          model: Project,
          attributes: ['projectName', 'location'],
        },
      ],
    });

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function getAttendance(req, res, next) {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        {
          model: Worker,
          include: [{ model: User }],
        },
        {
          model: Project,
        },
      ],
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function checkIn(req, res, next) {
  try {
    const { workerId, projectId, location } = req.body;

    if (!workerId || !projectId) {
      return res.status(400).json({ message: 'workerId and projectId are required.' });
    }

    // Check if worker already checked in today for this project
    const today = new Date().toISOString().split('T')[0];
    const existingCheckIn = await Attendance.findOne({
      where: {
        workerId,
        projectId,
        checkIn: {
          [Op.gte]: new Date(`${today}T00:00:00`),
          [Op.lte]: new Date(`${today}T23:59:59`),
        },
      },
    });

    if (existingCheckIn && !existingCheckIn.checkOut) {
      return res.status(400).json({ message: 'Worker already checked in for this project today.' });
    }

    const attendance = await Attendance.create({
      workerId,
      projectId,
      checkIn: new Date(),
      status: 'present',
      location,
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function checkOut(req, res, next) {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'attendanceId is required.' });
    }

    const attendance = await Attendance.findByPk(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Worker already checked out.' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn);
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    const { status, hoursWorked, notes } = req.body;

    if (status) attendance.status = status;
    if (hoursWorked !== undefined) attendance.hoursWorked = hoursWorked;
    if (notes) attendance.notes = notes;

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function deleteAttendance(req, res, next) {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    await attendance.destroy();

    res.json({ message: 'Attendance record deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getAttendanceReport(req, res, next) {
  try {
    const { projectId, startDate, endDate } = req.query;

    let where = {};

    if (projectId) where.projectId = projectId;

    if (startDate && endDate) {
      where.checkIn = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [
        {
          model: Worker,
          include: [{ model: User, attributes: ['fullName'] }],
        },
      ],
    });

    const report = {
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      on_leave: attendance.filter((a) => a.status === 'on_leave').length,
      half_day: attendance.filter((a) => a.status === 'half_day').length,
      totalHoursWorked: attendance.reduce((total, a) => total + (a.hoursWorked || 0), 0),
      details: attendance,
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}
