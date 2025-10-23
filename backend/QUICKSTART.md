# Quick Start Guide - BridgeHer Backend

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Database
```bash
# Start PostgreSQL (if not running)
# Windows: Start from Services or pgAdmin
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE bridgeherdb;"

# Run schema
psql -U postgres -d bridgeherdb -f schema.sql
```

### Step 3: Configure Environment
Your `.env` file is already configured:
```
PORT=5000
DATABASE_URL=postgresql://postgres:Harobed2023@localhost:5432/bridgeherdb
JWT_SECRET=supersecretkey
```

** IMPORTANT**: Change `Harobed2023` to your actual PostgreSQL password!

### Step 4: Start Server
```bash
npm run dev
```

Server running at: http://localhost:5000

## Test the API

### 1. Health Check
```bash
curl http://localhost:5000
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Abuk\",\"email\":\"abuk@test.com\",\"password\":\"123456\",\"role\":\"Learner\"}"
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"abuk@test.com\",\"password\":\"123456\"}"
```

## Common Issues

### "Database connection error"
- Check PostgreSQL is running
- Verify password in `.env` matches your PostgreSQL password
- Test connection: `psql -U postgres -d bridgeherdb`

### "Port 5000 already in use"
- Change PORT in `.env` to 5001 or another available port
- Or kill the process using port 5000

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Next Steps
1. Backend running locally
2. Connect frontend to backend (update API URLs)
3.  Deploy to Render (see README.md)

## API Documentation
See `README.md` for complete API endpoint documentation.
