const express = require('express');
const cors = require('cors');
const { logger } = require('./config/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { pool } = require('./config/db');
const { initDatabase } = require('./init-db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip || req.connection.remoteAddress}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  try {
    await initDatabase();
    logger.info('Database initialization completed');

    await pool.query('SELECT 1');
    logger.info('Database connection established');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    logger.info('Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
  }
};

startServer();

