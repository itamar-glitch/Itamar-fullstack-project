const mysql = require('mysql2/promise');

const getDbConfig = (includeDatabase = true) => {
  const config = {
    host: process.env.DB_HOST || 'tidb',
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };
  
  if (includeDatabase) {
    config.database = process.env.DB_NAME || 'sre_test';
  }
  
  return config;
};

let pool = null;

const initPool = () => {
  if (!pool) {
    pool = mysql.createPool(getDbConfig(true));
  }
  return pool;
};

const getPoolWithoutDb = () => {
  return mysql.createPool(getDbConfig(false));
};

const query = async (sql, params) => {
  try {
    const activePool = initPool();
    const [results] = await activePool.execute(sql, params);
    return results;
  } catch (error) {
    throw error;
  }
};

const getConnection = async () => {
  const activePool = initPool();
  return await activePool.getConnection();
};

module.exports = {
  get pool() {
    return initPool();
  },
  query,
  getConnection,
  getPoolWithoutDb
};

