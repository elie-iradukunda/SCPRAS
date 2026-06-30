import { Project, WorkActivity } from '../models/index.js';

const fields = [
  'projectId',
  'activityCode',
  'activityName',
  'description',
  'constraints',
  'phase',
  'plannedStartDate',
  'plannedEndDate',
  'actualStartDate',
  'actualEndDate',
  'reportDate',
  'plannedProgress',
  'actualProgress',
  'status',
  'responsiblePerson',
];

const numberFields = ['plannedProgress', 'actualProgress'];

function payload(body) {
  const data = {};
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field] || null;
  });
  numberFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) data[field] = Number(data[field] || 0);
  });
  if (Object.prototype.hasOwnProperty.call(data, 'projectId')) data.projectId = Number(data.projectId);
  return data;
}

export async function listActivities(req, res, next) {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    const activities = await WorkActivity.findAll({
      where,
      order: [['reportDate', 'DESC'], ['createdAt', 'DESC'], ['id', 'DESC']],
      include: [{ model: Project, attributes: ['projectName'] }],
    });
    res.json(activities);
  } catch (error) {
    next(error);
  }
}

export async function createActivity(req, res, next) {
  try {
    if (!req.body.projectId || !req.body.activityName) {
      return res.status(400).json({ message: 'projectId and activityName are required.' });
    }
    const activity = await WorkActivity.create(payload(req.body));
    return res.status(201).json(activity);
  } catch (error) {
    return next(error);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const activity = await WorkActivity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }
    Object.assign(activity, payload(req.body));
    await activity.save();
    return res.json(activity);
  } catch (error) {
    return next(error);
  }
}

export async function deleteActivity(req, res, next) {
  try {
    const deleted = await WorkActivity.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found.' });
    }
    return res.json({ message: 'Activity deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
