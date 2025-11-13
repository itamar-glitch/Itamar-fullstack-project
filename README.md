# SRE Full-Stack Project - Technical Test Implementation

> **Complete full-stack application with authentication, database integration, Change Data Capture (CDC), and real-time monitoring**

## 📋 Assignment Overview

This project implements a professional SRE (Site Reliability Engineering) full-stack application as per the technical test requirements, featuring:

- **Backend**: Node.js with Express.js RESTful API
- **Frontend**: HTML/CSS/JavaScript (with modern, responsive UI)
- **Database**: TiDB (distributed SQL database)
- **Message Queue**: Apache Kafka
- **CDC**: TiDB Change Data Capture for real-time database monitoring
- **Containerization**: Docker & Docker Compose
- **Logging**: Structured JSON logging with log4js

---

## 🎯 Assignment Requirements & Implementation

### Part 1: Simple Development ✅

**Requirements:**
- ✅ Node.js backend with RESTful API
- ✅ HTML/CSS/JavaScript frontend
- ✅ TiDB database connection
- ✅ Login screen with authentication
- ✅ JWT token management stored in database
- ✅ Tokens sent as HTTP headers

**Implementation Details:**
- **Backend**: Express.js server on port 3000
- **Frontend**: Nginx-served static HTML with modern, responsive design
- **Authentication**: BCrypt password hashing + JWT tokens
- **Database**: TiDB with users and tokens tables
- **API Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/user/profile`

### Part 2: DevOps Implementation ✅

**Requirements:**
- ✅ Dockerized client and API services
- ✅ TiDB configured in Docker environment
- ✅ Apache Kafka message broker setup
- ✅ Automatic database initialization with default user

**Implementation Details:**
- **Dockerfiles**: Custom images for API (`api/Dockerfile`) and Client (`client/Dockerfile`)
- **Docker Compose**: Full orchestration of 10 services (TiDB cluster, Kafka, API, Client, CDC)
- **Default User**: `admin` / `admin123` (created automatically on startup)
- **Database Init**: `db/init.sql` runs automatically when TiDB starts

### Part 3: Monitoring & Logging (SRE Implementation) ✅

**Requirements:**
- ✅ User activity logging in JSON format (log4js)
- ✅ Database change monitoring via TiCDC
- ✅ TiCDC configured in docker-compose.yml
- ✅ Automatic CDC task creation on startup
- ✅ Kafka consumer to process CDC events
- ✅ Structured logging format

**Implementation Details:**
- **User Logging**: Every login/logout logged with timestamp, user ID, action, IP address
- **CDC Pipeline**: TiDB → TiCDC → Kafka → CDC Consumer → Console Logs
- **Kafka Topic**: `sre-db-changes` (configured automatically)
- **CDC Consumer**: Node.js app consuming and processing database changes
- **Log Format**: JSON structured logs with log4js

---

## ⭐ Bonus: Real-Time Monitoring Dashboard

**Beyond Requirements - Professional Addition:**

I implemented a **professional monitoring dashboard** accessible at `/monitoring/` that provides:

- 🔄 **Real-Time CDC Events** - Live database changes (INSERT/UPDATE/DELETE) streaming from Kafka
- 📊 **API Metrics** - Request counts, success rates, response times, status code distribution
- 📈 **Visual Charts** - Success rate pie chart, status code bar chart
- 📍 **Endpoint Performance** - Per-endpoint statistics and success rates
- 🎨 **Modern UI** - Responsive design, gradient backgrounds, smooth animations
- 🔐 **Admin-Only Access** - Protected by session authentication

**Dashboard Features:**
- Colorful operation badges (🟢 INSERT, 🟣 UPDATE, 🔴 DELETE)
- Auto-refresh every 5 seconds
- Fully responsive (desktop, tablet, mobile)
- Professional glassmorphism design
- Sticky header and smooth animations

---

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Download and run the deployment script
curl -O https://raw.githubusercontent.com/itamar-glitch/Itamar-fullstack-project/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Check for Docker, Docker Compose, and Git
- ✅ Install missing prerequisites automatically
- ✅ Clone the repository
- ✅ Build and start all services
- ✅ Wait for initialization
- ✅ Display access URLs and credentials

### Option 2: Manual Deployment

```bash
# Clone repository
git clone https://github.com/itamar-glitch/Itamar-fullstack-project.git
cd Itamar-fullstack-project

# Start all services
docker-compose up -d

# Wait for initialization (30 seconds)
sleep 30

# Check status
docker-compose ps
```

---

## 🌐 Access the Application

### Frontend
- **URL**: http://localhost
- **Credentials**: 
  - Username: `admin`
  - Password: `admin123`

### Monitoring Dashboard (Bonus Feature)
- **URL**: http://localhost/monitoring/
- **Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **Features**: Real-time CDC events, API metrics, visual charts

### API Endpoints
- **Health Check**: http://localhost:3000/api/health
- **Database Health**: http://localhost:3000/api/health (includes DB status)
- **Login**: `POST http://localhost:3000/api/auth/login`
- **Register**: `POST http://localhost:3000/api/auth/register`
- **User Profile**: `GET http://localhost:3000/api/user/profile` (requires JWT token)

### TiCDC Status
- **URL**: http://localhost:8300/api/v1/status
- **Changefeeds**: http://localhost:8300/api/v1/changefeeds

---

## 📊 Where to Find Required Features

### 1. User Activity Logging (Part 3, Requirement 1)

**Location**: API container logs

```bash
# View all user activity logs
docker-compose logs api | grep "LOGIN_SUCCESS\|LOGOUT\|REGISTER"

# Follow user activity in real-time
docker-compose logs -f api | grep "LOGIN_SUCCESS"
```

**Log Format** (JSON with log4js):
```json
{
  "timestamp": "2025-11-13T17:18:18.910Z",
  "level": "info",
  "category": "auth",
  "user_id": 1,
  "action": "LOGIN_SUCCESS",
  "ip_address": "172.18.0.5",
  "details": {
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### 2. Database Change Monitoring (Part 3, Requirement 2)

**Location**: CDC Consumer logs

```bash
# View database change logs
docker-compose logs cdc-consumer

# Follow CDC events in real-time
docker-compose logs -f cdc-consumer
```

**Log Format** (JSON structured):
```json
{
  "timestamp": "2025-11-13T17:33:54.000Z",
  "level": "info",
  "category": "cdc",
  "database": "sre_test",
  "table": "users",
  "operation": "INSERT",
  "data": {
    "id": "8",
    "username": "testuser1",
    "email": "test1@example.com"
  },
  "old_data": null
}
```

### 3. TiCDC Configuration (Part 3, Requirement 2)

**Location**: `docker-compose.yml`

- **TiCDC Service**: Lines 60-72 (ticdc container)
- **CDC Init Service**: Lines 74-87 (ticdc-init - auto-creates changefeed)
- **Configuration**: `init-ticdc.sh` script

**Verify CDC is Running**:
```bash
# Check TiCDC status
curl http://localhost:8300/api/v1/status

# Check changefeed
curl http://localhost:8300/api/v1/changefeeds
```

### 4. Kafka Integration (Part 3, Requirement 3)

**Location**: `cdc-consumer/` directory

**View Kafka Messages**:
```bash
# View CDC consumer processing Kafka messages
docker-compose logs -f cdc-consumer
```

### 5. Visual Monitoring (Bonus Feature)

**Location**: http://localhost/monitoring/

- Real-time database changes (CDC via Kafka)
- API request statistics
- Success rate charts
- Endpoint performance metrics

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─────────────────> Client (Nginx) :80
       │                      │
       └─────────────────> API (Express) :3000
                               │
                               ├──> TiDB :4000
                               │      │
                               │      └──> TiCDC :8300
                               │             │
                               │             └──> Kafka :9092
                               │                    │
                               └──────────<─────────┘
                                          │
                                    CDC Consumer
                                       (Logs)
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **client** | 80 | Nginx serving frontend |
| **api** | 3000 | Node.js Express API |
| **tidb** | 4000 | TiDB SQL layer |
| **pd** | 2379 | Placement Driver |
| **tikv** | - | Key-Value storage |
| **ticdc** | 8300 | Change Data Capture |
| **kafka** | 9092 | Message broker |
| **zookeeper** | 2181 | Kafka coordinator |
| **cdc-consumer** | - | Kafka consumer for CDC events |
| **ticdc-init** | - | One-time CDC setup |

---

## 📁 Project Structure

```
.
├── api/                          # Backend API
│   ├── src/
│   │   ├── server.js             # Main Express server
│   │   ├── config/
│   │   │   ├── db.js             # TiDB connection
│   │   │   └── logger.js         # log4js configuration
│   │   ├── routes/
│   │   │   ├── auth.js           # Authentication endpoints
│   │   │   ├── user.js           # User endpoints
│   │   │   └── monitoring.js     # Monitoring dashboard API
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT validation
│   │   │   └── metricsMiddleware.js  # API metrics tracking
│   │   ├── monitoring/
│   │   │   ├── metrics.js        # In-memory metrics storage
│   │   │   └── websocket.js      # WebSocket server (unused)
│   │   └── init-db.js            # Database initialization
│   ├── Dockerfile                # API Docker image
│   └── package.json              # Node.js dependencies
│
├── client/                       # Frontend
│   ├── public/
│   │   ├── index.html            # Main login page
│   │   ├── app.js                # Login logic
│   │   ├── styles.css            # Main styles
│   │   └── monitoring/           # Monitoring dashboard
│   │       ├── index.html        # Dashboard HTML
│   │       ├── dashboard.js      # Dashboard logic
│   │       └── dashboard.css     # Dashboard styles
│   ├── nginx.conf                # Nginx configuration
│   └── Dockerfile                # Client Docker image
│
├── cdc-consumer/                 # Kafka CDC Consumer
│   ├── src/
│   │   ├── consumer.js           # Main Kafka consumer
│   │   └── logger.js             # Structured logging
│   ├── Dockerfile                # Consumer Docker image
│   └── package.json              # Node.js dependencies
│
├── db/
│   └── init.sql                  # Database schema + default user
│
├── docker-compose.yml            # Complete stack orchestration
├── init-ticdc.sh                 # TiCDC changefeed setup
├── deploy.sh                     # Automated deployment script
├── update.sh                     # Update existing deployment
├── db-query.sh                   # Utility to query TiDB
└── README.md                     # This file
```

---

## 🧪 Testing the Application

### Test User Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use the returned token
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Database CDC

```bash
# Insert a user (will trigger CDC)
./db-query.sh "INSERT INTO users (username, email, password_hash) VALUES ('cdc_test', 'cdc@test.com', 'hash');"

# Update a user (will trigger CDC)
./db-query.sh "UPDATE users SET email = 'updated@test.com' WHERE username = 'cdc_test';"

# Delete a user (will trigger CDC)
./db-query.sh "DELETE FROM users WHERE username = 'cdc_test';"

# View CDC logs
docker-compose logs cdc-consumer --tail 50
```

### Test Monitoring Dashboard

1. Open http://localhost/monitoring/
2. Login with `admin` / `admin123`
3. Watch real-time CDC events appear
4. Generate database changes and see them instantly
5. Monitor API metrics and charts

---

## 📝 Technology Stack Details

### Backend
- **Node.js** v18+ with Express.js
- **log4js** for structured JSON logging
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT authentication
- **mysql2** for TiDB connection
- **cors** for CORS handling
- **helmet** for security headers
- **express-rate-limit** for rate limiting
- **express-validator** for input validation

### Frontend
- **HTML5** / **CSS3** / **JavaScript (ES6+)**
- **Chart.js** for data visualization
- **Modern responsive design** with CSS Grid & Flexbox
- **Gradient backgrounds** and smooth animations

### Database
- **TiDB** (distributed SQL database)
- **PD** (Placement Driver for cluster management)
- **TiKV** (distributed key-value storage)

### Message Queue
- **Apache Kafka** for message brokering
- **Zookeeper** for Kafka coordination

### CDC & Monitoring
- **TiCDC** (TiDB Change Data Capture)
- **Canal-JSON format** for CDC messages
- **KafkaJS** for Node.js Kafka client

---

## 🔧 Configuration

### Environment Variables

API service (defined in `docker-compose.yml`):
- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST=tidb`
- `DB_PORT=4000`
- `DB_NAME=sre_test`
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRY=24h`
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_WINDOW=15` (minutes)
- `RATE_LIMIT_MAX=100` (requests per window)

CDC Consumer:
- `KAFKA_BROKER=kafka:9092`
- `KAFKA_TOPIC=sre-db-changes`

---

## 🔒 Security Features

- ✅ **Password Hashing**: BCrypt with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **Security Headers**: Helmet.js (XSS, CSP, etc.)
- ✅ **Input Validation**: Express-validator
- ✅ **CORS Protection**: Configured allowed origins
- ✅ **Session Security**: HttpOnly cookies for dashboard
- ✅ **Request Size Limits**: 10MB max body size
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Graceful Shutdown**: Proper cleanup on termination

---

## 📊 Monitoring & Observability

### Logs

**User Activity Logs**:
```bash
docker-compose logs api | grep LOGIN_SUCCESS
```

**Database Change Logs**:
```bash
docker-compose logs cdc-consumer
```

**All Service Logs**:
```bash
docker-compose logs -f
```

### Health Checks

All services include health checks:
- API: `GET /health` and `GET /api/health`
- TiDB: TCP check on port 4000
- Kafka: Topic creation validation
- CDC: Changefeed status check

### Metrics (Bonus Dashboard)

- Total API requests
- Success/Error rates
- Average response time
- Per-endpoint statistics
- Real-time CDC events
- Status code distribution

---

## 🛠️ Utility Scripts

### `deploy.sh`
Automated deployment with prerequisite checking and installation.

```bash
./deploy.sh
```

### `update.sh`
Update existing deployment with latest code.

```bash
./update.sh
```

### `db-query.sh`
Execute SQL queries directly on TiDB.

```bash
./db-query.sh "SELECT * FROM users;"
```

### `test-api.sh`
Test all API endpoints.

```bash
./test-api.sh
```

---

## 🐛 Troubleshooting

### Services not starting?

```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart api

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database connection issues?

```bash
# Check TiDB is running
docker-compose ps tidb

# Check TiDB logs
docker-compose logs tidb

# Test connection
./db-query.sh "SELECT 1;"
```

### CDC not capturing changes?

```bash
# Check TiCDC status
curl http://localhost:8300/api/v1/status

# Check changefeed
curl http://localhost:8300/api/v1/changefeeds

# View CDC logs
docker-compose logs ticdc
```

### Monitoring dashboard not loading?

```bash
# Clear browser cache (Ctrl+Shift+R)
# Or use incognito mode

# Check client container
docker-compose logs client

# Rebuild client
docker-compose build client
docker-compose up -d client
```

---

## 📈 Performance & Scalability

### Current Configuration
- **TiDB**: 4GB RAM, 2 CPUs
- **TiKV**: 4GB RAM, 2 CPUs
- **API**: 512MB RAM, 1 CPU
- **Client**: 256MB RAM, 0.5 CPU
- **CDC Consumer**: 256MB RAM, 0.5 CPU

### Data Persistence
- TiDB data: Docker volume `pd-data` and `tikv-data`
- Database survives container restarts

### Health & Reliability
- All services have health checks
- Automatic restart on failure
- Graceful shutdown handling
- Connection pooling for database

---

## 👨‍💻 Development

### Local Development

```bash
# Start only database and Kafka
docker-compose up -d tidb kafka

# Run API locally
cd api
npm install
npm run dev

# Run frontend locally (with live server)
cd client/public
python3 -m http.server 8080
```

### Testing Changes

```bash
# Rebuild specific service
docker-compose build api
docker-compose up -d api

# View logs
docker-compose logs -f api
```

---

## 📚 Additional Resources

### Documentation
- [TiDB Documentation](https://docs.pingcap.com/)
- [TiCDC Overview](https://docs.pingcap.com/tidb/stable/ticdc-overview)
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [Express.js Guide](https://expressjs.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Assignment Fulfillment

This project **fully implements** all requirements from the technical test:
- ✅ Part 1: Complete full-stack with authentication
- ✅ Part 2: Full Docker/DevOps implementation
- ✅ Part 3: SRE logging, CDC, and Kafka integration
- ⭐ Bonus: Professional monitoring dashboard

---

## 🎓 Interview Preparation

### Key Points to Explain

1. **Architecture**: Microservices with Docker Compose orchestration
2. **Database**: TiDB distributed SQL with PD and TiKV
3. **CDC Pipeline**: TiDB → TiCDC → Kafka → Consumer → Logs/Dashboard
4. **Authentication**: JWT tokens with BCrypt hashing
5. **Logging**: Structured JSON logs with log4js
6. **Security**: Multiple layers (rate limiting, validation, headers, CORS)
7. **Monitoring**: Real-time dashboard with metrics and CDC events
8. **DevOps**: Single-command deployment with automatic initialization

### Demo Flow

1. Show `./deploy.sh` running
2. Access http://localhost and login
3. Show http://localhost/monitoring/ dashboard
4. Execute `./db-query.sh` to INSERT/UPDATE/DELETE
5. Watch real-time CDC events in dashboard
6. Show logs: `docker-compose logs api | grep LOGIN_SUCCESS`
7. Show CDC logs: `docker-compose logs cdc-consumer`

---

## ✨ Project Highlights

- 🎯 **100% Assignment Compliance**: All requirements fully implemented
- 🚀 **Production-Ready**: Security, monitoring, error handling
- 📊 **Bonus Dashboard**: Professional real-time monitoring UI
- 🐳 **Single Command Deploy**: Automated setup with `./deploy.sh`
- 📝 **Comprehensive Logging**: Structured JSON logs throughout
- 🔒 **Enterprise Security**: Multiple security layers implemented
- 📈 **Scalable Architecture**: Microservices with distributed database
- 🎨 **Modern UI**: Responsive, animated, professional design

---

## 👤 Author

**Itamar Azran**
- GitHub: [@itamar-glitch](https://github.com/itamar-glitch)

---

## 📄 License

This project is created for a technical assessment.

---

**Ready for the interview! 🚀**
