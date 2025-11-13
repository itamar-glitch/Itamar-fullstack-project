const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { getMetrics, resetMetrics, trackCDCEvent } = require('../monitoring/metrics');
const { broadcastCDCEvent } = require('../monitoring/websocket');

const router = express.Router();

// Session-based authentication middleware
const requireMonitoringAuth = (req, res, next) => {
  if (req.session && req.session.monitoringAuth) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Login endpoint for monitoring dashboard
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Fetch user from database
    const users = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Only allow admin user
    if (user.username !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Set session
    req.session.monitoringAuth = true;
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Monitoring login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  if (req.session && req.session.monitoringAuth) {
    res.json({ 
      authenticated: true,
      username: req.session.username
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Get metrics (protected)
router.get('/metrics', requireMonitoringAuth, (req, res) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Reset metrics (protected)
router.post('/metrics/reset', requireMonitoringAuth, (req, res) => {
  try {
    resetMetrics();
    res.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    console.error('Reset metrics error:', error);
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

// CDC event webhook (called by CDC consumer)
router.post('/cdc-event', (req, res) => {
  try {
    const event = req.body;
    if (event && event.database && event.table && event.operation) {
      trackCDCEvent(event);
      // Broadcast to WebSocket clients in real-time
      broadcastCDCEvent(event);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid CDC event format' });
    }
  } catch (error) {
    console.error('CDC event error:', error);
    res.status(500).json({ error: 'Failed to track CDC event' });
  }
});

module.exports = router;

