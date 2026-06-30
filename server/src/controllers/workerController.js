import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Worker, User, Attendance, ProjectAssignment } from '../models/index.js';
import { createSmartCardPayload } from '../services/cardService.js';

const workerProfileFields = [
  'employeeCode',
  'position',
  'salary',
  'dailyRate',
  'employmentType',
  'skillLevel',
  'productivityScore',
  'smartCardCode',
  'joinDate',
  'dateOfBirth',
  'gender',
  'department',
  'address',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelationship',
  'tradeCertification',
  'safetyInductionDate',
  'medicalClearanceDate',
  'ppeIssued',
  'bankName',
  'bankAccountNumber',
  'notes',
  'status',
];

const numberFields = new Set(['salary', 'dailyRate', 'productivityScore']);

function buildWorkerPayload(body, fallbackEmployeeCode) {
  return workerProfileFields.reduce((payload, field) => {
    if (body[field] === undefined || body[field] === '') return payload;
    payload[field] = numberFields.has(field) ? Number(body[field] || 0) : body[field];
    return payload;
  }, { employeeCode: body.employeeCode || fallbackEmployeeCode });
}

export async function listWorkers(req, res, next) {
  try {
    const workers = await Worker.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phone', 'nationalId'],
        },
      ],
    });
    res.json(workers);
  } catch (error) {
    next(error);
  }
}

export async function getWorker(req, res, next) {
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phone', 'nationalId', 'role'],
        },
        {
          model: Attendance,
          attributes: ['id', 'projectId', 'checkIn', 'checkOut', 'status', 'hoursWorked'],
        },
      ],
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    res.json(worker);
  } catch (error) {
    next(error);
  }
}

export async function createWorker(req, res, next) {
  try {
    const { fullName, email, password, role, phone, nationalId, position } = req.body;
    let { userId } = req.body;

    if (!position) {
      return res.status(400).json({ message: 'position is required.' });
    }

    if (!userId) {
      if (!fullName || !email) {
        return res.status(400).json({ message: 'Provide userId, or fullName and email for the new worker.' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const user = await User.create({
          fullName,
          email,
          password: await bcrypt.hash(password || 'worker123', 10),
          role: role || 'worker',
          phone,
          nationalId,
        });
        userId = user.id;
      }
    }

    const existingWorker = await Worker.findOne({ where: { userId } });

    if (existingWorker) {
      return res.status(400).json({ message: 'User is already a worker.' });
    }

    const fallbackEmployeeCode = `BI-W-${Date.now().toString().slice(-6)}`;
    const worker = await Worker.create({
      userId,
      ...buildWorkerPayload(req.body, fallbackEmployeeCode),
    });

    const createdWorker = await Worker.findByPk(worker.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'email', 'phone', 'nationalId', 'role'] }],
    });

    res.status(201).json(createdWorker);
  } catch (error) {
    next(error);
  }
}

export async function updateWorker(req, res, next) {
  try {
    const worker = await Worker.findByPk(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    Object.assign(worker, buildWorkerPayload(req.body, worker.employeeCode));

    await worker.save();

    const updatedWorker = await Worker.findByPk(worker.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'email', 'phone', 'nationalId', 'role'] }],
    });

    res.json(updatedWorker);
  } catch (error) {
    next(error);
  }
}

export async function deleteWorker(req, res, next) {
  try {
    const worker = await Worker.findByPk(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    await Promise.all([
      Attendance.destroy({ where: { workerId: worker.id } }),
      ProjectAssignment.destroy({ where: { workerId: worker.id } }),
    ]);
    const userId = worker.userId;
    await worker.destroy();
    await User.destroy({ where: { id: userId, role: 'worker' } });

    res.json({ message: 'Worker deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getWorkerAttendance(req, res, next) {
  try {
    const workerId = req.params.id;
    const { projectId, startDate, endDate } = req.query;

    let where = { workerId };

    if (projectId) where.projectId = projectId;

    if (startDate && endDate) {
      where.checkIn = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attendance = await Attendance.findAll({
      where,
      order: [['checkIn', 'DESC']],
    });

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function generateWorkerSmartCard(req, res, next) {
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'email', 'phone', 'nationalId', 'role'] }],
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const card = await createSmartCardPayload(worker);
    worker.smartCardCode = card.code;
    await worker.save();

    return res.json({ worker, card });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkerBySmartCard(req, res, next) {
  try {
    const worker = await Worker.findOne({
      where: { smartCardCode: req.params.code },
      include: [{ model: User, attributes: ['id', 'fullName', 'email', 'phone', 'nationalId', 'role'] }],
    });

    if (!worker) {
      return res.status(404).json({ message: 'Smart card not found.' });
    }

    const attendance = await Attendance.findAll({
      where: { workerId: worker.id },
      order: [['checkIn', 'DESC']],
      limit: 10,
    });
    const totalHoursWorked = attendance.reduce((total, record) => total + Number(record.hoursWorked || 0), 0);
    const card = await createSmartCardPayload(worker, worker.smartCardCode);

    return res.json({
      worker,
      card,
      attendanceSummary: {
        recentRecords: attendance,
        recentRecordsCount: attendance.length,
        totalHoursWorked,
        lastCheckIn: attendance[0]?.checkIn || null,
        lastCheckOut: attendance[0]?.checkOut || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkerStats(req, res, next) {
  try {
    const workerId = req.params.id;

    const worker = await Worker.findByPk(workerId, {
      include: [
        {
          model: Attendance,
        },
      ],
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const totalHoursWorked = worker.Attendances.reduce((total, att) => total + (att.hoursWorked || 0), 0);
    const presentDays = worker.Attendances.filter((att) => att.status === 'present').length;
    const absentDays = worker.Attendances.filter((att) => att.status === 'absent').length;

    res.json({
      workerId: worker.id,
      totalHoursWorked,
      presentDays,
      absentDays,
      productivityScore: worker.productivityScore,
      position: worker.position,
      salary: worker.salary,
    });
  } catch (error) {
    next(error);
  }
}
