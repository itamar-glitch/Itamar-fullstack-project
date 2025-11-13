const { trackRequest } = require('../monitoring/metrics');
const { broadcastAPIRequest } = require('../monitoring/websocket');

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Capture original res.end
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    const endpoint = `${req.method} ${req.path}`;
    const statusCode = res.statusCode;
    
    // Track in metrics
    trackRequest(req, res, responseTime);
    
    // Broadcast to WebSocket clients (excluding monitoring endpoints to avoid recursion)
    if (!req.path.startsWith('/api/monitoring') && !req.path.startsWith('/ws/')) {
      broadcastAPIRequest(endpoint, statusCode, responseTime);
    }
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
};

module.exports = metricsMiddleware;

