const WebSocket = require('ws');
const { logger } = require('../config/logger');

let wss = null;
const clients = new Set();

/**
 * Initialize WebSocket server
 */
function initWebSocketServer(server) {
  wss = new WebSocket.Server({ 
    server,
    path: '/ws/monitoring'
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    logger.info(`WebSocket client connected from ${clientIp}`);
    
    clients.add(ws);

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established',
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      logger.info(`WebSocket client disconnected from ${clientIp}`);
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error: ${error.message}`);
      clients.delete(ws);
    });
  });

  logger.info('WebSocket server initialized on /ws/monitoring');
}

/**
 * Broadcast message to all connected clients
 */
function broadcast(message) {
  if (!wss) {
    return;
  }

  const payload = JSON.stringify(message);
  let sent = 0;
  let failed = 0;

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        sent++;
      } catch (error) {
        logger.error(`Failed to send to client: ${error.message}`);
        failed++;
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });

  if (sent > 0 || failed > 0) {
    logger.debug(`Broadcast: ${sent} sent, ${failed} failed, ${clients.size} active`);
  }
}

/**
 * Send CDC event to all monitoring clients
 */
function broadcastCDCEvent(event) {
  broadcast({
    type: 'cdc_event',
    data: event,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send metrics update to all monitoring clients
 */
function broadcastMetricsUpdate(metrics) {
  broadcast({
    type: 'metrics_update',
    data: metrics,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send API request event to all monitoring clients
 */
function broadcastAPIRequest(endpoint, statusCode, responseTime) {
  broadcast({
    type: 'api_request',
    data: {
      endpoint,
      statusCode,
      responseTime
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Get number of connected clients
 */
function getConnectedClients() {
  return clients.size;
}

module.exports = {
  initWebSocketServer,
  broadcast,
  broadcastCDCEvent,
  broadcastMetricsUpdate,
  broadcastAPIRequest,
  getConnectedClients
};

