const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%m'
      }
    },
    jsonConsole: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%m'
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    auth: { appenders: ['jsonConsole'], level: 'info' },
    database: { appenders: ['jsonConsole'], level: 'info' }
  }
});

const logger = log4js.getLogger();
const authLogger = log4js.getLogger('auth');
const dbLogger = log4js.getLogger('database');

const logAuth = (userId, action, ipAddress, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    user_id: userId,
    action,
    ip_address: ipAddress,
    details
  };
  authLogger.info(JSON.stringify(logEntry));
};

const logDatabase = (operation, table, data, before = null, after = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'database',
    operation,
    table,
    data,
    before,
    after
  };
  dbLogger.info(JSON.stringify(logEntry));
};

module.exports = {
  logger,
  logAuth,
  logDatabase
};

