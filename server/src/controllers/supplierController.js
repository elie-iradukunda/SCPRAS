import { Supplier } from '../models/index.js';

const supplierFields = ['supplierName', 'phone', 'email', 'address', 'supplierType', 'tinNumber', 'status'];

function payload(body) {
  return Object.fromEntries(supplierFields.filter((field) => Object.prototype.hasOwnProperty.call(body, field)).map((field) => [field, body[field]]));
}

export async function listSuppliers(req, res, next) {
  try {
    const suppliers = await Supplier.findAll({ order: [['supplierName', 'ASC']] });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
}

export async function createSupplier(req, res, next) {
  try {
    if (!req.body.supplierName) {
      return res.status(400).json({ message: 'supplierName is required.' });
    }
    const supplier = await Supplier.create(payload(req.body));
    return res.status(201).json(supplier);
  } catch (error) {
    return next(error);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    Object.assign(supplier, payload(req.body));
    await supplier.save();
    return res.json(supplier);
  } catch (error) {
    return next(error);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const deleted = await Supplier.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    return res.json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
