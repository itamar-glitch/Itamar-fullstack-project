// API URL - uses relative path so Nginx can proxy to the API
const API_URL = '/api';

let charts = {
    success: null,
    status: null
};

let metricsInterval = null;

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    
    // Setup event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/monitoring/status`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            showDashboard(data.username);
            startMetricsPolling();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_URL}/monitoring/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showDashboard(data.username);
            startMetricsPolling();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

async function handleLogout() {
    stopMetricsPolling();
    
    try {
        await fetch(`${API_URL}/monitoring/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    showLogin();
}

function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
    document.getElementById('login-error').style.display = 'none';
}

function showDashboard(username) {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('username-display').textContent = username;
    
    // Initialize charts if not already done
    if (!charts.success) {
        initCharts();
    }
}

function startMetricsPolling() {
    // Fetch immediately
    fetchMetrics();
    
    // Then poll every 5 seconds
    metricsInterval = setInterval(fetchMetrics, 5000);
}

function stopMetricsPolling() {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
    }
}

async function fetchMetrics() {
    try {
        const response = await fetch(`${API_URL}/monitoring/metrics`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch metrics');
        }
        
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Fetch metrics error:', error);
    }
}

function updateDashboard(data) {
    // Update stat cards
    document.getElementById('total-requests').textContent = data.requests.total;
    document.getElementById('successful-requests').textContent = data.requests.success;
    document.getElementById('error-requests').textContent = data.requests.error;
    document.getElementById('avg-response-time').textContent = Math.round(data.requests.avgResponseTime || 0) + 'ms';
    
    // Calculate success rate
    const successRate = data.requests.total > 0 
        ? Math.round((data.requests.success / data.requests.total) * 100)
        : 0;
    document.getElementById('success-rate').textContent = successRate + '%';
    
    // Update charts
    updateCharts(data);
    
    // Update CDC events table
    updateCDCEventsTable(data.cdcEvents || []);
    
    // Update endpoints table
    updateEndpointsTable(data.requests.byEndpoint || {});
}

function initCharts() {
    // Success Rate Pie Chart
    const successCtx = document.getElementById('successChart').getContext('2d');
    charts.success = new Chart(successCtx, {
        type: 'doughnut',
        data: {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#11998e', '#eb3349'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Status Code Bar Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    charts.status = new Chart(statusCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Requests by Status Code',
                data: [],
                backgroundColor: '#667eea',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateCharts(data) {
    // Update success chart
    charts.success.data.datasets[0].data = [
        data.requests.success,
        data.requests.error
    ];
    charts.success.update();
    
    // Update status chart
    const statusCodes = Object.keys(data.requests.byStatus || {}).sort();
    const statusCounts = statusCodes.map(code => data.requests.byStatus[code]);
    
    charts.status.data.labels = statusCodes;
    charts.status.data.datasets[0].data = statusCounts;
    charts.status.update();
}

function updateCDCEventsTable(events) {
    const tbody = document.querySelector('#cdc-events-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No CDC events yet. Make database changes to see them here!</td></tr>';
        return;
    }
    
    events.forEach(event => {
        const row = document.createElement('tr');
        
        const timestamp = new Date(event.timestamp).toLocaleString();
        const operationClass = 
            event.operation === 'INSERT' ? 'insert' :
            event.operation === 'UPDATE' ? 'update' :
            event.operation === 'DELETE' ? 'delete' : '';
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td>${event.database}</td>
            <td>${event.table}</td>
            <td><span class="operation ${operationClass}">${event.operation}</span></td>
            <td class="changes-cell">${formatChanges(event)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateEndpointsTable(endpoints) {
    const tbody = document.querySelector('#endpoints-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const endpointNames = Object.keys(endpoints);
    if (endpointNames.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No data available</td></tr>';
        return;
    }
    
    endpointNames.forEach(endpoint => {
        const data = endpoints[endpoint];
        const successRate = data.total > 0 
            ? Math.round((data.success / data.total) * 100)
            : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${endpoint}</td>
            <td>${data.total}</td>
            <td>${data.success}</td>
            <td>${data.error}</td>
            <td>${successRate}%</td>
        `;
        
        tbody.appendChild(row);
    });
}

function formatChanges(event) {
    if (event.operation === 'DELETE') {
        return `<code>${JSON.stringify(event.old_data || event.data || {}, null, 2)}</code>`;
    } else if (event.operation === 'INSERT') {
        return `<code>${JSON.stringify(event.data || {}, null, 2)}</code>`;
    } else {
        return `<code>Before: ${JSON.stringify(event.old_data || {})}\nAfter: ${JSON.stringify(event.data || {})}</code>`;
    }
}
