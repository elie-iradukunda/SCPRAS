import { forecastWorkforce } from '../services/forecastService.js';

export async function forecast(req, res, next) {
  try {
    return res.json(forecastWorkforce(req.body));
  } catch (error) {
    return next(error);
  }
}
