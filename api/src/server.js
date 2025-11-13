const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('./config/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { pool } = require('./config/db');
const { initDatabase } = require('./init-db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Add security headers
app.use(helmet());

// Security: Configure CORS properly
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Security: Limit request body size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error with stack trace for debugging
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong'
    });
  } else {
    res.status(err.status || 500).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
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

