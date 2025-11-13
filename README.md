# SRE Full-Stack Project - Technical Test

> Complete full-stack application with authentication, TiDB database, Change Data Capture (CDC), Kafka, and real-time monitoring dashboard

---

## 🚀 Quick Start Deployment

### System Requirements

- **OS**: Ubuntu 24.04 (tested) or any Linux distribution
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Disk Space**: Minimum 50GB free
- **Network**: HTTP port 80 must be accessible

### Step 1: Deploy on Ubuntu Server

```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/itamar-glitch/Itamar-fullstack-project/main/deploy.sh
chmod +x deploy.sh

# Run automated deployment (installs Docker if needed)
./deploy.sh
```

**The script will:**
1. Check and install Docker, Docker Compose, and Git (if missing)
2. Clone the repository
3. Build all Docker containers
4. Start all services (TiDB, Kafka, Bacckend, Frontend, CDC)
5. Initialize database with default admin user
6. Display access URLs

**Wait ~60 seconds** for all services to initialize.

### Step 2: Access the Application

Replace `YOUR_SERVER_IP` with your machine's IP address (or use `localhost` if testing locally):

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main App** | `http://YOUR_SERVER_IP/` | admin / admin123 |
| **Monitoring Dashboard** | `http://YOUR_SERVER_IP/monitoring/` | admin / admin123 |
| **API Health Check** | `http://YOUR_SERVER_IP/api/health` | - |

**Examples:**
- Local: `http://localhost/`
- Server IP: `http://192.168.1.100/`
- AWS/Cloud: `http://51.16.152.27/`

> **Note**: Only port 80 needs to be accessible. All other services run on internal Docker network.

### Step 3: Verify CDC is Working(optinal)

```bash
# Create the CDC changefeed (if not auto-created)
curl -X POST http://localhost:8300/api/v1/changefeeds \
  -H "Content-Type: application/json" \
  -d '{
    "changefeed_id": "sre-db-cdc",
    "sink_uri": "kafka://kafka-broker:29092/sre-db-changes?protocol=canal-json&kafka-version=2.6.0&max-message-bytes=67108864",
    "config": {"force-replicate": true},
    "rules": ["sre_db.*"]
  }'

# Verify changefeed is running
curl http://localhost:8300/api/v1/changefeeds
# Should show: "state": "normal"

# Generate database activity
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check CDC events in monitoring dashboard
# Open: http://YOUR_SERVER_IP/monitoring/
```


## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       └────────────> Nginx :80 (Port 80 - Public)
                           │
                           ├──> Static Files (HTML/CSS/JS)
                           │
                           └──> Proxy /api/* → Express API :3000 (Internal)
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
                                         (Logs + Dashboard)
```

**Key Points:**
- **Single Entry Point**: Port 80 (Nginx)
- **Reverse Proxy**: Nginx forwards `/api/*` to internal API
- **Internal Network**: Bacckend , TiDB, Kafka run on Docker network (not exposed)
- **CDC Pipeline**: TiDB → TiCDC → Kafka → Consumer → Dashboard

---

## 📁 Project Structure

```
.
├── api/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── server.js      # Main API server
│   │   ├── routes/        # API routes (auth, user, monitoring)
│   │   ├── middleware/    # Logging, metrics, auth
│   │   └── config/        # DB, logger configuration
│   ├── Dockerfile
│   └── package.json
│
├── client/                # Frontend (HTML/CSS/JS)
│   ├── public/
│   │   ├── index.html    # Main app
│   │   ├── app.js        # Frontend logic
│   │   └── monitoring/   # Monitoring dashboard
│   ├── nginx.conf        # Nginx config (reverse proxy)
│   └── Dockerfile
│
├── cdc-consumer/          # Kafka CDC consumer
│   ├── src/consumer.js
│   └── package.json
│
├── db/
│   └── init.sql          # Database schema + default user
│
├── docker-compose.yml    # Orchestration (10 services)
├── init-ticdc.sh        # Auto-create CDC changefeed
├── deploy.sh            # Automated deployment script
└── README.md
└── db-query.s
└── test-api.sh
└── update.sh
```

---

## 📊 How to use

### 1. User Activity Logging (Part 3, Requirement 1)

**View logs:**
```bash
docker-compose logs api | grep "LOGIN_SUCCESS\|LOGOUT\|REGISTER"
```

**Log format (JSON with log4js):**
```json
{
  "timestamp": "2025-11-13T17:18:18.910Z",
  "level": "info",
  "category": "auth",
  "user_id": 1,
  "action": "LOGIN_SUCCESS",
  "ip_address": "172.18.0.5",
  "details": {"username": "admin", "email": "admin@example.com"}
}
```

### 2. Database Change Monitoring (Part 3, Requirement 2)

**View CDC logs:**
```bash
docker-compose logs cdc-consumer
```

**CDC log format:**
```json
{
  "timestamp": "2025-11-13T17:33:54.000Z",
  "level": "info",
  "category": "cdc",
  "database": "sre_db",
  "table": "users",
  "operation": "INSERT",
  "data": {"id": "8", "username": "testuser1", "email": "test1@example.com"},
  "old_data": null
}
```

### 3. Visual Monitoring

Open `http://YOUR_SERVER_IP/monitoring/` and login with admin/admin123 to see:
- Real-time CDC events from Kafka (🟢 INSERT, 🟣 UPDATE, 🔴 DELETE)
- API request statistics
- Success rate charts
- Per-endpoint performance

---

## 🛠️ Utility Scripts

```bash
# Update deployment with latest code
./update.sh

# Execute SQL queries directly
./db-query.sh "SELECT * FROM users;"

# Test all API endpoints
./test-api.sh
```

---


### External access not working?
```bash
# Test locally first
curl http://localhost/
curl http://localhost/api/health

# If local works but external doesn't:
# - Check firewall: Allow port 80 inbound
# - AWS: Add port 80 to Security Group
# - Azure: Open port 80 in Network Security Group
```

### Monitoring dashboard shows no data?
- Wait 60 seconds after startup for full initialization
- Generate activity: Login at `http://YOUR_SERVER_IP/`
- Insert/update data using `./db-query.sh`
- Check logs: `docker-compose logs cdc-consumer`

---

## 🔒 Security Features

- ✅ BCrypt password hashing
- ✅ JWT authentication with secure tokens
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Helmet.js security headers (XSS, CSP)
- ✅ CORS protection (auto-detects proxy)
- ✅ Input validation (express-validator)
- ✅ Reverse proxy isolation (Nginx)
- ✅ Request size limits (10MB max)
- ✅ Graceful shutdown handling

---

## 📈 Performance & Scalability

**Resource Limits:**
- TiDB: 4GB RAM, 2 CPUs
- Bacckend: 512MB RAM, 1 CPU
- Frontend: 256MB RAM, 0.5 CPU
- CDC Consumer: 256MB RAM, 0.5 CPU

**Features:**
- Health checks on all services
- Automatic restart on failure
- Data persistence (Docker volumes)
- Connection pooling
- Distributed TiDB cluster (PD + TiKV)

---

## 🎓 Demo Flow

1. **Show deployment**: `./deploy.sh` completing
2. **Main app**: Login at `http://YOUR_SERVER_IP/`
3. **Monitoring dashboard**: Open `http://YOUR_SERVER_IP/monitoring/`
4. **Generate CDC events**: 
   ```bash
   ./db-query.sh "INSERT INTO sre_db.users (username, email, password_hash) VALUES ('demo', 'demo@test.com', 'hash');"
   ```
5. **Watch real-time**: Events appear in monitoring dashboard
6. **Show user logs**: `docker-compose logs api | grep LOGIN_SUCCESS`
7. **Show CDC logs**: `docker-compose logs cdc-consumer`
8. **Verify CDC status**: `curl http://localhost:8300/api/v1/changefeeds`

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Chart.js |
| **Backend** | Node.js v18+, Express.js, log4js |
| **Database** | TiDB (distributed SQL), PD, TiKV |
| **Message Queue** | Apache Kafka, Zookeeper |
| **CDC** | TiCDC (Canal-JSON format), KafkaJS |
| **Proxy** | Nginx (reverse proxy + static files) |
| **Container** | Docker, Docker Compose |
| **Security** | BCrypt, JWT, Helmet, express-rate-limit |

---


## 👤 Author
**Itamar Azran**  

