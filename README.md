## BridgeHer – Learning & Mentorship Platform
   Overview

BridgeHer is a multilingual (English–Arabic) online learning and mentorship platform designed to empower women through digital education, financial literacy, and entrepreneurship training.

The platform provides a seamless user experience through a React + TypeScript frontend and a secure Node.js + Express + PostgreSQL backend, with multilingual and responsive design support.

## Project Goals

## BridgeHer aims to:

Empower women with accessible digital education.

Connect mentors and learners in a supportive environment.

Provide localized, multilingual access (English & Arabic).

Offer scalable, secure, and user-friendly online learning tools.


Link to the repo: [https://github.com/AbukDuot/Initial-software_BridgeHer]

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


## BridgeHer Design & Style Guide

## Overview
The **BridgeHer Style Guide** defines the visual language and design consistency of the BridgeHer Learning & Mentorship Platform.  
It ensures every page — from login to dashboard — looks cohesive, accessible, and empowering.

BridgeHer follows a **purple and gold** color identity, reflecting creativity, confidence, and empowerment.

---

## Design Principles

| Principle | Description |
|------------|--------------|
| **Empowerment** | Purple tones inspire confidence and transformation. |
| **Inclusivity** | Supports both English and Arabic users (RTL layout). |
| **Clarity** | Clean, minimal layouts for intuitive navigation. |
| **Responsiveness** | Optimized for mobile, tablet, and desktop. |
| **Consistency** | All UI components share spacing, typography, and visual rhythm. |

---

## Color Palette

| Color Role | HEX | Usage |
|-------------|------|--------|
| **Primary (Purple)** | `#6A1B9A` | Navbar, buttons, main highlights |
| **Accent (Gold)** | `#FFD700` | Hover states, icons, and highlights |
| **Background (Light)** | `#FFFFFF` | Page backgrounds and cards |
| **Text (Primary)** | `#333333` | Standard text color |
| **Text (Secondary)** | `#555555` | Subheadings and hints |
| **Error (Red)** | `#E53935` | Form validation errors |


🟣 *Purple (Primary)* symbolizes empowerment and unity.  
🟡 *Gold (Accent)* conveys optimism and growth.

---

## Typography

| Element | Font Family | Size | Weight | Color |
|----------|--------------|------|--------|--------|
| **Headings (H1–H3)** | Poppins, sans-serif | 24–32px | 600–700 | #333333 |
| **Body Text** | Open Sans, sans-serif | 16px | 400 | #333333 |
| **Buttons & Inputs** | Poppins | 14–16px | 500 | #FFFFFF (on purple) |
| **Arabic Font** | Cairo or Amiri, sans-serif | Matches English sizes | Auto-adjusts for RTL |

 *Font usage is consistent across login, registration, and navbar.*

---

##  Layout & Spacing

###  Page Layout
- **Navbar:** Fixed at top, purple background, white text  
- **Forms:** Centered on screen with a card-style layout  
- **Buttons:** Rounded corners, gold hover state  
- **Cards:** White background, soft shadows, and padding for visual balance  

### Spacing Tokens

| Variable | Value | Description |
|-----------|--------|-------------|
| `--space-xs` | 4px | Very small margin/padding |
| `--space-sm` | 8px | Small spacing between inputs |
| `--space-md` | 16px | Section spacing |
| `--space-lg` | 24px | Space between major components |
| `--space-xl` | 40px | Page padding |

---

## Responsiveness & RTL Support
BridgeHer is fully responsive and supports **Right-to-Left (RTL)** layout for Arabic.

| Device | Layout Behavior |
|---------|------------------|
| **Mobile (<768px)** | Navbar collapses into a hamburger menu |
| **Tablet (768–1024px)** | Flexible grid with moderate padding |
| **Desktop (>1024px)** | Full layout with side padding |
| **RTL (Arabic)** | Text and navigation automatically flip direction |

---

## UI Components

### Buttons
| Type | Background | Text | Border Radius | Hover Effect |
|------|-------------|------|----------------|---------------|
| **Primary** | #6A1B9A | White | 5px | Gold background (#FFD700), purple text |
| **Secondary** | Transparent | #6A1B9A | 5px | Purple border highlight |
| **Disabled** | #CCC | #666 | 5px | None |

**Example CSS**
```css
.primary-btn {
  background: #6A1B9A;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.primary-btn:hover {
  background: #FFD700;
  color: #6A1B9A;
}
 Input Fields
Element	Property
Background	#F2F2F2
Border Radius	5px
Padding	10px
Focus Border	2px solid #6A1B9A
Error Text	#E53935

 Navbar
Property	Value
Background Color	#6A1B9A
Text Color	#FFFFFF
Hover State	Gold (#FFD700)
RTL Mode	Links align right
Responsive Behavior	Hamburger icon toggle

 Cards
Property	Value
Background	#FFFFFF
Border Radius	8px
Box Shadow	0px 2px 6px rgba(0, 0, 0, 0.1)
Padding	16px
Hover Effect	Slight shadow increase

````
## Accessibility Guidelines
Ensure contrast ratio meets WCAG AA (Purple text on white background is compliant).

Add aria-labels for icons and navigation elements.

All images must include descriptive alt text.

Font size is scalable via browser settings.

Keyboard navigable (Tab, Enter, and Escape keys supported).

```
 CSS Variables Reference
css
Copy code
:root {
  --primary-color: #6A1B9A;
  --accent-color: #FFD700;
  --background-color: #FFFFFF;
  --text-color: #333333;
  --error-color: #E53935;
  --success-color: #2E7D32;
  --radius: 5px;
  --transition: all 0.3s ease;
  --font-primary: "Poppins", sans-serif;
  --font-secondary: "Open Sans", sans-serif;
}

```
## Figma Mockups & Screenshots

Here are the design visuals used for BridgeHer’s interface:

Page	Preview
Login Page	

Register Page	

Home Page	

Courses Page	

[https://github.com/AbukDuot/Initial-software_BridgeHer/blob/22f9139097199ef39c69c5157087670cd3654d44/bridgeher-frontend/src/assets/images/Figma%20design.png]


## Deployment Plan

Component	Platform

Frontend	Netlify / Vercel

Backend	Render / Railway

Database	PostgreSQL (Render or Supabase)

Environment Variables	Managed securely in the hosting dashboard

## Deployment Steps

Push both frontend and backend repos to GitHub.

On Render, deploy backend (Node.js + PostgreSQL).

On Netlify, deploy the frontend.

Set environment variables in both dashboards.

Test live API connection between frontend and backend.

##  Video Demo

BridgeHer Demo Video

Covers:

Project setup and environment configuration

Navigation and layout (Navbar + language toggle)

Registration and login functionality

Backend connection and database interaction

My video:
🔗 [https://drive.google.com/drive/folders/1uLfcK2XwXCyx_L-lWqW9h_40qczWKnLC?usp=sharing]

 Developer Notes

Keep .env secure (don’t commit it).

Use Postman for API testing.

Restart the server after modifying environment variables.

Maintain consistent folder naming conventions.


## Author

Abuk Mayen Duot
Software Engineer & Founder – BridgeHer Initiative
abukmayen@gmail.com

+250 789 101 234
LinkedIn Profile

## License

Licensed under the MIT License — free for use, modification, and distribution with proper attribution.
