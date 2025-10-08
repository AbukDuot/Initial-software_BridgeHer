## BridgeHer – Learning & Mentorship Platform
   Overview

BridgeHer is a bilingual (English–Arabic) online learning and mentorship platform designed to empower women through digital education, financial literacy, and entrepreneurship training.

The platform provides a seamless user experience through a React + TypeScript frontend and a secure Node.js + Express + PostgreSQL backend, with multilingual and responsive design support.

## Project Goals

## BridgeHer aims to:

Empower women with accessible digital education.

Connect mentors and learners in a supportive environment.

Provide localized, bilingual access (English & Arabic).

Offer scalable, secure, and user-friendly online learning tools.


## Tech Stack

Layer	Technology

Frontend	React, TypeScript, CSS, Context API

Backend	Node.js, Express.js

Database	PostgreSQL

Auth	JWT + bcryptjs

Deployment	Netlify (Frontend) + Render (Backend)

Design	Figma + CSS Flexbox + Media Queries

## Environment Setup
1.  Clone the Repository
git clone https://github.com/abukmayen/bridgeher-project.git
``` bash
cd bridgeher-project

Backend Setup
cd backend
npm install


Create a .env file:

PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bridgeher_db
JWT_SECRET=your_jwt_secret_key


Create the database:

CREATE DATABASE bridgeher_db;


Run the backend:

npm run dev


This  backend runs at: http://localhost:5000

Frontend Setup
cd frontend
npm install
npm start


 Frontend runs at: http://localhost:5173

Project Folder Structure
BridgeHer_Project/
│
├── README.md
├── /frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── context/
│   │   └── App.tsx
│   └── package.json
│
├── /backend
│   ├── server.js
│   ├── /config/db.js
│   ├── /routes/authRoutes.js
│   ├── /controllers/
│   ├── /middleware/
│   └── package.json


```

##  Authentication (Register & Login)

Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate user and return JWT

Example: Register
```bash
{
  "name": "Abuk",
  "email": "abuk@example.com",
  "password": "123456",
  "role": "Learner"
}

```

Example: Login
```bash

{
  "email": "abuk@example.com",
  "password": "123456"
}

 Database Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

## User Interface Design

 Design Process

BridgeHer’s UI focuses on simplicity, inclusivity, and accessibility for both English and Arabic users.

## Design considerations:

Clean, readable typography (Poppins / Open Sans)

Purple and gold theme for empowerment and optimism

Responsive, mobile-first layouts

RTL (Right-to-Left) support for Arabic

## Style Guide
Element	Description
Primary Color	#6A1B9A (Purple of Empowerment)
Accent Color	#FFD700 (Gold for Highlights)
Typography	Poppins / Open Sans
Buttons	Rounded corners, gold hover state
Layout	Flexbox-based responsive grid
Direction	LTR / RTL toggle based on language

## Figma Mockups & Screenshots

Here are the design visuals used for BridgeHer’s interface:

Page	Preview
Login Page	

Register Page	

Home Page	

Courses Page	
```

https://github.com/AbukDuot/Initial-software_BridgeHer/blob/22f9139097199ef39c69c5157087670cd3654d44/bridgeher-frontend/src/assets/images/Figma%20design.png

```

##  Deployment Plan

Component	Platform

Frontend	Netlify / Vercel

Backend	Render / Railway

Database	PostgreSQL (Render or Supabase)

Environment Variables	Managed securely in hosting dashboard

## Deployment Steps

Push both frontend and backend repos to GitHub.

On Render, deploy backend (Node.js + PostgreSQL).

On Netlify, deploy frontend.

Set environment variables in both dashboards.

Test live API connection between frontend and backend.

##  Video Demo

BridgeHer Demo Video (5–10 minutes)

Covers:

Project setup and environment configuration

Navigation and layout (Navbar + language toggle)

Registration and login functionality

Backend connection and database interaction

Responsive design demonstration

🔗 [https://drive.google.com/file/d/1yu4ZRXURmIa3C2YUEhpuP0iDkg7J9SiY/view?usp=sharing]

 Developer Notes

Keep .env secure (don’t commit it).

Use Postman for API testing.

Restart the server after modifying environment variables.

Maintain consistent folder naming conventions.

```

## Author

Abuk Mayen Duot
Software Engineer & Founder – BridgeHer Initiative
abukmayen@gmail.com

+250 789 101 234
LinkedIn Profile

## License

Licensed under the MIT License — free for use, modification, and distribution with proper attribution.