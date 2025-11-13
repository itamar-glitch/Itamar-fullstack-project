# SRE Technical Test Project

This repository contains the implementation for the SRE technical test.

## Infrastructure Components

The project uses Docker Compose to orchestrate the following services:

- **Kafka & Zookeeper**: Message streaming infrastructure
- **TiDB Cluster**: Distributed SQL database (PD, TiKV, TiDB)
- **TiCDC**: Change Data Capture for Kafka integration

## Getting Started

```bash
docker-compose up -d
```

## Project Structure

```
.
├── docker-compose.yml    # Infrastructure orchestration
├── backup/               # Backup files (excluded from git)
└── README.md            # This file
```

