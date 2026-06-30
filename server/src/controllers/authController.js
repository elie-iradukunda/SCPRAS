import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Worker } from '../models/index.js';
import { env } from '../config/env.js';
import { ALL_ROLES } from '../config/roles.js';
import { findDemoUserByCredentials, getDemoUserById } from '../data/demoStore.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
};

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user && env.demoMode) {
      const demoUser = findDemoUserByCredentials(email, password);
      if (demoUser) {
        return res.json({
          token: jwt.sign({ id: demoUser.id, email: demoUser.email, role: demoUser.role, demo: true }, env.jwtSecret, { expiresIn: env.jwtExpiresIn }),
          user: demoUser,
        });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const userWithWorkerInfo = await User.findByPk(user.id, {
      include: [{ model: Worker, as: 'Worker' }],
    });

    res.json({
      token,
      user: {
        id: userWithWorkerInfo.id,
        fullName: userWithWorkerInfo.fullName,
        email: userWithWorkerInfo.email,
        role: userWithWorkerInfo.role,
        phone: userWithWorkerInfo.phone,
        nationalId: userWithWorkerInfo.nationalId,
        Worker: userWithWorkerInfo.Worker,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, role, phone, nationalId } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'fullName, email, password, and role are required.' });
    }

    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Select one of the six approved SCPRAS roles.' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone,
      nationalId,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    if (req.user.demo) {
      const demoUser = getDemoUserById(req.user.id);
      return demoUser ? res.json(demoUser) : res.status(404).json({ message: 'User not found.' });
    }
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Worker, as: 'Worker' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      nationalId: user.nationalId,
      status: user.status,
      Worker: user.Worker,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { fullName, phone, nationalId } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (nationalId) user.nationalId = nationalId;

    await user.save();

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      nationalId: user.nationalId,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is invalid.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
}
