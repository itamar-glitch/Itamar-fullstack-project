const bcrypt = require('bcrypt');
const { getPoolWithoutDb } = require('./config/db');

const initDatabase = async () => {
  const pool = getPoolWithoutDb();
  const connection = await pool.getConnection();

  try {
    console.log('Connected to TiDB');

    const [databases] = await connection.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'sre_test'"
    );

    if (databases.length === 0) {
      console.log('Database does not exist, initializing...');
      
      await connection.query('CREATE DATABASE IF NOT EXISTS sre_test');
      await connection.query('USE sre_test');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      const adminHash = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        ['admin', 'admin@example.com', adminHash]
      );
      
      console.log('Database initialized successfully with default admin user');
    } else {
      console.log('Database already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

module.exports = { initDatabase };

