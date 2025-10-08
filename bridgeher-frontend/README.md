# BridgeHer Backend

## Description
The **BridgeHer Backend** powers the **BridgeHer Platform** — an inclusive digital learning and mentorship system that empowers women through **financial literacy, entrepreneurship, and digital skills education**.  
It provides a secure RESTful API built with **Node.js**, **Express**, and **PostgreSQL**, supporting authentication, user profiles, course management, and progress tracking.  

This backend integrates with the [BridgeHer Frontend](https://github.com/abukmayen/bridgeher-frontend) built with **React + TypeScript**, ensuring a seamless learning experience.

---

## GitHub Repository
[BridgeHer Backend on GitHub](https://github.com/abukmayen/bridgeher-backend)

---

## Environment Setup

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14 or later)
- **npm** (v9+) 
- **pgAdmin** (for database management)
- **VS Code** or any preferred code editor

---

### Installation Steps
1. **Clone the repository**
   ```
bash
   git clone https://github.com/abukmayen/bridgeher-backend.git

   cd bridgeher-backend

```
### Install dependencies
```
bash
npm install

### Create a .env file in the root of the backend folder:
```bash

PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bridgeher_db
JWT_SECRET=your_jwt_secret_key
```
### Ensure PostgreSQL is running, then create the database:
```
CREATE DATABASE bridgeher_db;
```
### Run the development server
```bash
npm run dev
```
### The backend will be live at:
````
http://localhost:5000
````
### Folder structure
```bash

bridgeher-backend/
├── package.json
├── .env
├── server.js
├── /config
│   └── db.js
├── /models
│   └── User.js
├── /routes
│   ├── authRoutes.js
│   └── userRoutes.js
├── /controllers
│   ├── authController.js
│   └── userController.js
└── /middleware
    └── authMiddleware.js

 Designs & Mockups

### View BridgeHer UI Designs on Figma Screenshots
```
Login Page  Register page Home page  Courses page

Link to the Figma: https://github.com/AbukDuot/Initial-software_BridgeHer/blob/bridgeher-frontend/src/assets/images/Figma design.png


```
(Add your actual screenshots inside /screenshots folder and update the image links.)
```
### Deployment Plan
### Deployment Stack

Backend: Node.js + Express

Database: PostgreSQL (Hosted on Render or Supabase)

Hosting Platform: Render / Railway / Vercel

Environment Variables: Managed via platform dashboard
```

### Deployment Steps

Push code to GitHub.
Create a Render or Railway web service.
Connect to the GitHub repository.

### Add environment variables:
```bash
PORT=5000

DATABASE_URL=...

JWT_SECRET=...

Deploy and test via the hosted URL.

```
### Authentication (Register/Login)

User roles (Learner/Mentor)
Dashboard features
Quiz and course functionality
Database integration and API testing (REST Client / Postman)

### Watch the Demo Video

### Code Files Overview
## **Folder	Description**
/config	Database configuration and connection setup
/models	PostgreSQL models (e.g., User, Course)
/controllers	Core business logic for API endpoints
/routes	Route definitions for user and authentication
/middleware	JWT validation and authentication handling
/screenshots	Screenshots and mockups for documentation

### REST API Endpoints

Method	Endpoint	Description

POST	/api/auth/register	Register a new user

POST	/api/auth/login	Authenticate user and return token

 ### Developer Notes

Ensure your .env file is excluded from GitHub commits.
Use bcryptjs for password hashing and jsonwebtoken for secure user sessions.
Always restart the server after updating environment variables.

### Author

Abuk Mayen Duot Lual

Software Engineer & Founder — BridgeHer Initiative

🌐 LinkedIn

 |✉️ abukmayen@gmail.com
 
 | 📞 +250789101234

 ### 📄 License
This project is licensed under the MIT License — free for modification and distribution with attribution.
