# SRE Full-Stack Project

A complete full-stack application demonstrating SRE best practices with authentication, database integration, and comprehensive monitoring capabilities using TiDB Change Data Capture (CDC) and Apache Kafka.

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │ (Nginx + HTML/CSS/JS)
│   (Port 80) │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│     API     │ (Node.js + Express)
│  (Port 3000)│
└──────┬──────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│    TiDB     │─────→│    TiCDC     │
│  (Port 4000)│ CDC  │  (Port 8300) │
└─────────────┘      └──────┬───────┘
                             │
                             ↓
                      ┌──────────────┐
                      │    Kafka     │
                      │  (Port 9092) │
                      └──────┬───────┘
                             │
                             ↓
                      ┌──────────────┐
                      │ CDC Consumer │
                      │   (Logger)   │
                      └──────────────┘
```

## 📋 Features

### Part 1: Development
- **Backend API** (Node.js + Express)
  - RESTful API with JWT authentication
  - User registration and login endpoints
  - Protected routes with token verification
  - Password hashing with bcrypt
  
- **Frontend** (HTML/CSS/JavaScript)
  - Clean, responsive login/register interface
  - Form validation
  - JWT token management
  - Real-time error handling

- **Database** (TiDB)
  - Distributed SQL database
  - Users and tokens tables
  - Automatic initialization on startup
  - Default admin user (username: `admin`, password: `admin123`)

### Part 2: DevOps
- **Containerization**
  - Docker containers for all services
  - Optimized Dockerfiles with multi-stage builds
  - Docker Compose orchestration
  
- **Infrastructure Services**
  - TiDB cluster (PD, TiKV, TiDB)
  - Apache Kafka with Zookeeper
  - TiDB Change Data Capture (TiCDC)
  
- **Automated Initialization**
  - Database schema creation
  - Default user seeding
  - TiCDC changefeed auto-configuration

### Part 3: Monitoring & Logging (SRE)
- **User Activity Logging** (log4js)
  - All user actions logged in JSON format
  - Includes: timestamp, user ID, action, IP address
  - Actions tracked: REGISTER, LOGIN, LOGOUT, LOGIN_FAILED
  
- **Database Change Monitoring**
  - TiCDC captures all database changes (INSERT/UPDATE/DELETE)
  - Changes streamed to Kafka in real-time
  - Canal-JSON format for compatibility
  
- **CDC Consumer Application**
  - Node.js Kafka consumer
  - Processes and logs all database changes
  - Structured JSON logging
  - Automatic reconnection and error handling

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of RAM available
- Ports 80, 3000, 4000, 8300, 9092 available

### Start the Application

```bash
# Clone the repository
git clone https://github.com/itamar-glitch/Itamar-fullstack-project.git
cd Itamar-fullstack-project

# Start all services
sudo docker-compose up -d

# Wait for services to initialize (about 30-60 seconds)
# Check service status
sudo docker-compose ps
```

### Access the Application

- **Web Interface**: http://localhost (or http://YOUR_SERVER_IP)
- **API Health Check**: http://localhost:3000/api/health
- **TiCDC Status**: http://localhost:8300/api/v1/status

### Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📂 Project Structure

```
.
├── api/                      # Backend API service
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js        # Database connection pool
│   │   │   └── logger.js    # Log4js configuration
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js      # Authentication endpoints
│   │   │   └── user.js      # User endpoints
│   │   ├── init-db.js       # Database initialization
│   │   └── server.js        # Express server
│   ├── Dockerfile
│   └── package.json
│
├── client/                   # Frontend service
│   ├── public/
│   │   ├── index.html       # Main HTML page
│   │   ├── style.css        # Styles
│   │   └── app.js           # Client-side JavaScript
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile
│
├── cdc-consumer/             # Kafka CDC consumer service
│   ├── src/
│   │   ├── consumer.js      # Kafka consumer logic
│   │   └── logger.js        # Structured logging
│   ├── Dockerfile
│   └── package.json
│
├── db/
│   └── init.sql             # Database schema
│
├── docker-compose.yml       # Service orchestration
├── init-ticdc.sh            # TiCDC changefeed initialization
└── README.md

```

## 🔧 Configuration

### Environment Variables

#### API Service
- `NODE_ENV`: Environment (production/development)
- `PORT`: API server port (default: 3000)
- `DB_HOST`: TiDB host (default: tidb)
- `DB_PORT`: TiDB port (default: 4000)
- `DB_USER`: Database user (default: root)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (default: sre_test)
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRY`: Token expiration time (default: 24h)

#### CDC Consumer
- `KAFKA_BROKER`: Kafka broker address
- `KAFKA_TOPIC`: Topic to consume from (default: sre-db-changes)

## 📊 Monitoring & Logs

### View API Logs
```bash
# All logs
sudo docker logs sre-api

# Only JSON structured logs
sudo docker logs sre-api 2>&1 | grep '^{'

# Last 10 user actions
sudo docker logs sre-api 2>&1 | grep '^{' | tail -10
```

### View CDC Consumer Logs
```bash
# All logs
sudo docker logs sre-cdc-consumer

# Only CDC events (database changes)
sudo docker logs sre-cdc-consumer 2>&1 | grep '"category":"cdc"'
```

### Log Formats

**User Action Log Example:**
```json
{
  "timestamp": "2025-11-13T16:18:54.058Z",
  "level": "info",
  "category": "auth",
  "user_id": 2,
  "action": "LOGIN_SUCCESS",
  "ip_address": "172.18.0.1",
  "details": {
    "username": "testuser2",
    "email": "test2@example.com"
  }
}
```

**CDC Event Log Example:**
```json
{
  "timestamp": "2025-11-13T16:18:54.838Z",
  "level": "info",
  "category": "cdc",
  "database": "sre_test",
  "table": "tokens",
  "operation": "INSERT",
  "data": {
    "id": "2",
    "user_id": "2",
    "token": "eyJhbG...",
    "expires_at": "2025-11-14 16:18:54",
    "created_at": "2025-11-13 16:18:54"
  },
  "old_data": null
}
```

## 🧪 Testing

### API Endpoints

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Access protected route:**
```bash
TOKEN="your_jwt_token_here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/profile
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 TiCDC Management

### Check Changefeed Status
```bash
curl -s http://localhost:8300/api/v1/changefeeds
```

### View Changefeed Details
```bash
curl -s http://localhost:8300/api/v1/changefeeds/sre-db-cdc
```

### Manually Create Changefeed
The changefeed is automatically created on startup, but you can manually create it:
```bash
curl -X POST http://localhost:8300/api/v1/changefeeds \
  -H "Content-Type: application/json" \
  -d '{
    "changefeed_id": "sre-db-cdc",
    "sink_uri": "kafka://kafka-broker:29092/sre-db-changes?protocol=canal-json",
    "config": {"force-replicate": true},
    "rules": ["sre_test.*"]
  }'
```

## 🛠️ Troubleshooting

### Services not starting
```bash
# Check all service logs
sudo docker-compose logs

# Check specific service
sudo docker-compose logs api
sudo docker-compose logs tidb
sudo docker-compose logs ticdc
```

### Database connection issues
```bash
# Verify TiDB is running
sudo docker exec tidb mysql -h 127.0.0.1 -P 4000 -u root -e "SHOW DATABASES;"

# Check database initialization
sudo docker logs sre-api | grep -i "database"
```

### TiCDC not capturing changes
```bash
# Check TiCDC status
curl http://localhost:8300/api/v1/status

# Verify changefeed
curl http://localhost:8300/api/v1/changefeeds

# Check TiCDC logs
sudo docker logs ticdc
```

### Kafka issues
```bash
# List Kafka topics
sudo docker exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Check messages in topic
sudo docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic sre-db-changes \
  --from-beginning \
  --max-messages 5
```

## 🔄 Stopping the Application

```bash
# Stop all services
sudo docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
sudo docker-compose down -v
```

## 🏗️ Development

### Git Workflow

The project uses feature branches for organized development:

- `main`: Production-ready code
- `part-1-development`: Basic application development
- `part-3-monitoring`: Monitoring and CDC implementation

### Making Changes

```bash
# Create a new branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature
```

## 📝 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js 18, Express.js
- **Database**: TiDB (MySQL-compatible distributed SQL)
- **Message Queue**: Apache Kafka 2.6.0
- **CDC**: TiDB CDC (TiCDC)
- **Logging**: log4js
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (Alpine)

## 📄 License

This project is created as a technical test for an SRE position.

## 👤 Author

Itamar Azran

---

**Note**: This is a demonstration project for technical assessment. In production, ensure you:
- Change default credentials
- Use proper secrets management
- Implement rate limiting
- Add HTTPS/TLS
- Set up proper monitoring and alerting
- Implement backup and disaster recovery
- Follow security best practices
