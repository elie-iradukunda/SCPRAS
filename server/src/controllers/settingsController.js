import bcrypt from 'bcryptjs';
import { Device, User } from '../models/index.js';
import { ALL_ROLES } from '../config/roles.js';

export async function getSettings(req, res, next) {
  try {
    const [users, devices] = await Promise.all([
      User.findAll({ attributes: ['id', 'fullName', 'email', 'role', 'status', 'phone'] }),
      Device.findAll({ order: [['createdAt', 'DESC']] }),
    ]);

    const roleCounts = users.reduce((counts, user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
      return counts;
    }, {});

    res.json({
      roles: roleCounts,
      users,
      devices,
      security: {
        auth: 'JWT enabled',
        passwordHashing: 'bcrypt enabled',
        demoMode: process.env.DEMO_MODE !== 'false',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createDevice(req, res, next) {
  try {
    const { name, type, location, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Device name is required.' });
    }

    const device = await Device.create({
      name,
      type: type || 'qr',
      location,
      status: status || 'online',
      lastSeen: new Date(),
    });

    return res.status(201).json(device);
  } catch (error) {
    return next(error);
  }
}

export async function updateDevice(req, res, next) {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found.' });
    }

    const { name, type, location, status } = req.body;
    if (name) device.name = name;
    if (type) device.type = type;
    if (location !== undefined) device.location = location;
    if (status) device.status = status;
    device.lastSeen = new Date();

    await device.save();
    return res.json(device);
  } catch (error) {
    return next(error);
  }
}

export async function deleteDevice(req, res, next) {
  try {
    const deleted = await Device.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Device not found.' });
    }

    return res.json({ message: 'Device deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role, phone } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Full name, email, password, and role are required.' });
    }
    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Select one of the six approved SCPRAS roles.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'A user with this email already exists.' });
    const user = await User.create({
      fullName,
      email: String(email).trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
      phone: phone || '',
      status: 'active',
    });
    return res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone, status: user.status });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { fullName, email, password, role, phone, status } = req.body;
    if (role && !ALL_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Select one of the six approved SCPRAS roles.' });
    }
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ message: 'A user with this email already exists.' });
      user.email = String(email).trim().toLowerCase();
    }
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status && ['active', 'inactive'].includes(status)) user.status = status;
    if (password) {
      if (String(password).length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone, status: user.status });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    }
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    return res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
