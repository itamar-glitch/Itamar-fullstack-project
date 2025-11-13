const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%m'
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    cdc: { appenders: ['console'], level: 'info' }
  }
});

const logger = log4js.getLogger();
const cdcLogger = log4js.getLogger('cdc');

const logCDCEvent = (event) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'cdc',
    database: event.database,
    table: event.table,
    operation: event.operation,
    data: event.data,
    old_data: event.old_data || null
  };
  cdcLogger.info(JSON.stringify(logEntry));
};

module.exports = {
  logger,
  logCDCEvent
};

