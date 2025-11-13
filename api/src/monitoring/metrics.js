// In-memory metrics storage
const metrics = {
  requests: {
    total: 0,
    success: 0, // 2xx status codes
    error: 0,   // 4xx, 5xx status codes
    byEndpoint: {},
    byStatus: {},
    responseTimes: []
  },
  cdcEvents: []
};

// Store last 100 CDC events
const MAX_CDC_EVENTS = 100;

// Store last 1000 response times
const MAX_RESPONSE_TIMES = 1000;

const trackRequest = (req, res, responseTime) => {
  metrics.requests.total++;
  
  const endpoint = `${req.method} ${req.path}`;
  const status = res.statusCode;
  
  // Track by endpoint
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = { total: 0, success: 0, error: 0 };
  }
  metrics.requests.byEndpoint[endpoint].total++;
  
  // Track by status code
  if (!metrics.requests.byStatus[status]) {
    metrics.requests.byStatus[status] = 0;
  }
  metrics.requests.byStatus[status]++;
  
  // Track success vs error
  if (status >= 200 && status < 300) {
    metrics.requests.success++;
    metrics.requests.byEndpoint[endpoint].success++;
  } else if (status >= 400) {
    metrics.requests.error++;
    metrics.requests.byEndpoint[endpoint].error++;
  }
  
  // Track response time
  metrics.requests.responseTimes.push({
    timestamp: Date.now(),
    endpoint,
    time: responseTime,
    status
  });
  
  // Keep only last N response times
  if (metrics.requests.responseTimes.length > MAX_RESPONSE_TIMES) {
    metrics.requests.responseTimes = metrics.requests.responseTimes.slice(-MAX_RESPONSE_TIMES);
  }
};

const trackCDCEvent = (event) => {
  metrics.cdcEvents.unshift({
    timestamp: new Date().toISOString(),
    ...event
  });
  
  // Keep only last N events
  if (metrics.cdcEvents.length > MAX_CDC_EVENTS) {
    metrics.cdcEvents = metrics.cdcEvents.slice(0, MAX_CDC_EVENTS);
  }
};

const getMetrics = () => {
  // Calculate average response time
  const avgResponseTime = metrics.requests.responseTimes.length > 0
    ? metrics.requests.responseTimes.reduce((sum, rt) => sum + rt.time, 0) / metrics.requests.responseTimes.length
    : 0;
  
  return {
    requests: {
      ...metrics.requests,
      avgResponseTime: Math.round(avgResponseTime),
      successRate: metrics.requests.total > 0 
        ? Math.round((metrics.requests.success / metrics.requests.total) * 100) 
        : 0
    },
    cdcEvents: metrics.cdcEvents.slice(0, 20) // Return last 20 events
  };
};

const resetMetrics = () => {
  metrics.requests.total = 0;
  metrics.requests.success = 0;
  metrics.requests.error = 0;
  metrics.requests.byEndpoint = {};
  metrics.requests.byStatus = {};
  metrics.requests.responseTimes = [];
  metrics.cdcEvents = [];
};

module.exports = {
  trackRequest,
  trackCDCEvent,
  getMetrics,
  resetMetrics,
  metrics
};

