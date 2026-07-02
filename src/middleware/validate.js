const AppError = require('../utils/AppError');

const validateBody = (schema) => (req, res, next) => {
  console.log(`[validateBody] ${req.method} ${req.originalUrl} — raw body:`, req.body);
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    console.log(`[validateBody] validation failed:`, error.details.map((d) => d.message));
    return next(new AppError(error.details.map((d) => d.message).join('; '), 400));
  }
  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(new AppError(error.details.map((d) => d.message).join('; '), 400));
  }
  req.query = value;
  next();
};

module.exports = { validateBody, validateQuery };
