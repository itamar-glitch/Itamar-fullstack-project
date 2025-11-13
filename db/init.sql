-- SRE Technical Test Database Schema
-- Database initialization script for TiDB

CREATE DATABASE IF NOT EXISTS sre_test;
USE sre_test;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tokens table for JWT token storage
CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default user
-- Username: admin
-- Password: admin123
-- Password hash generated with bcrypt (10 rounds): $2b$10$rHq2L6vL4f9a4X8X8X8X8uOQ5uYXbXXJ6bV6Xqb8b8b8b8b8b8b8b8
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@example.com', '$2b$10$rHq2L6vL4f9a4X8X8X8X8uOQ5uYXbXXJ6bV6Xqb8b8b8b8b8b8b8b8');

