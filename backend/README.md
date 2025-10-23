# BridgeHer Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bridgeherdb
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Setup PostgreSQL Database

#### Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Or use Docker: `docker run --name bridgeher-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

#### Create Database
```bash
psql -U postgres
CREATE DATABASE bridgeherdb;
\c bridgeherdb
\i schema.sql
```

Or using command line:
```bash
psql -U postgres -c "CREATE DATABASE bridgeherdb;"
psql -U postgres -d bridgeherdb -f schema.sql
```

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run at: `http://localhost:5000`

### 5. Test the API
```bash
curl http://localhost:5000
# Response: "BridgeHer Backend API is running"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course (protected)

### Mentorship
- `GET /api/mentors` - Get all mentors
- `POST /api/mentorship/request` - Request mentorship (protected)
- `GET /api/mentorship/requests` - Get user's requests (protected)

### Community
- `GET /api/community/posts` - Get all posts
- `POST /api/community/posts` - Create post (protected)

### Dashboards
- `GET /api/dashboards/learner` - Get learner dashboard data (protected)
- `GET /api/dashboards/mentor` - Get mentor dashboard data (protected)

## Deployment to Render

### 1. Push to GitHub
```bash
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

### 2. Create PostgreSQL Database on Render
1. Go to https://render.com
2. Click "New +" → "PostgreSQL"
3. Name: `bridgeher-db`
4. Copy the **Internal Database URL**

### 3. Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `bridgeher-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL`: [paste Internal Database URL]
     - `JWT_SECRET`: [generate random string]
     - `PORT`: `5000`

### 4. Run Database Schema
After deployment, go to your PostgreSQL database on Render:
1. Click "Connect" → "External Connection"
2. Use the PSQL command provided
3. Run: `\i schema.sql` or copy-paste the schema

### 5. Update Frontend
Update frontend API URL to: `https://bridgeher-backend.onrender.com`

## Testing
```bash
npm test
```

## Project Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Auth & validation
├── models/          # Database models
├── routes/          # API routes
├── data/            # JSON data files
├── uploads/         # File uploads
├── tests/           # Test files
├── server.js        # Entry point
├── schema.sql       # Database schema
└── .env             # Environment variables
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check firewall settings

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### CORS Issues
- Ensure frontend URL is allowed in CORS configuration
- Check `cors()` middleware in `server.js`
