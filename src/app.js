const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const env = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/appointments', appointmentRoutes);

app.use((req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404)));

app.use(errorHandler);

module.exports = app;
