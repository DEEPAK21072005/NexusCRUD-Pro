import { ValidationError } from '../utils/appError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.validated = parsed;

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    if (parsed.params !== undefined) {
      try {
        Object.assign(req.params, parsed.params);
      } catch (_) {}
    }

    return next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Request validation failed', formattedErrors));
    }
    return next(err);
  }
};
