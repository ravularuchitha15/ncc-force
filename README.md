# Smart NCC Cadet Management System — NCC Force

[![Live on Firebase](https://img.shields.io/badge/Live%20Demo-Firebase%20Hosting-blue?logo=firebase)](https://ncc-force-7acd3.web.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/ravularuchitha15/ncc-force)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green?logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

An enterprise-grade, full-stack monorepo system for the **National Cadet Corps (NCC)**. Digitizes and centralizes cadet dossiers, officer command dashboards, automated attendance, camp management, training modules, hierarchical promotions, accredited certificates, and official qualitative performance appraisals.

---

## 🌐 Live Deployments & Repository Links

- **Live Web Application**: [https://ncc-force-7acd3.web.app](https://ncc-force-7acd3.web.app)
- **Secondary Domain**: [https://ncc-force-7acd3.firebaseapp.com](https://ncc-force-7acd3.firebaseapp.com)
- **GitHub Repository**: [https://github.com/ravularuchitha15/ncc-force](https://github.com/ravularuchitha15/ncc-force)
- **Firebase Project Console**: [NCC Force (ncc-force-7acd3)](https://console.firebase.google.com/project/ncc-force-7acd3/overview)

---

## 🚀 Key Features

### Officer Command Center
- **360° Cadet Dossiers**: Complete records with regimental numbers, wing, rank, battalion, institution, blood group, emergency contacts, and status tracking.
- **Platoon & Session Attendance**: Fast bulk attendance marking with duplicate-entry prevention and automated percentage metrics.
- **Camp Administration**: Manage ATC, RDC, CATC, and Trekking camps with participant rosters and performance logs.
- **Training Programs**: Schedule sessions, weapon training, drill lessons, and assign cadet platoons.
- **Rank Promotion Audit Trail**: Strict multi-level rank promotion system with permanent `RankHistory` logging.
- **Certificate Verification**: Upload, issue, and securely stream official 'A', 'B', and 'C' certificates.
- **Operational Reports**: Exportable reports for attendance, camps, training, and achievements.

### Cadet Portal
- **Personal Dashboard**: Real-time attendance rate, upcoming sessions, camp registrations, and current rank badge.
- **Self-Service Actions**: View attendance logs, enroll in upcoming camps, track training scores, and download certificates.
- **Leave Application & Tracking**: Submit leave requests with reasons and track officer approvals in real time.

### Security & Architecture
- **Dual Authentication**: Native signed JWT sessions + Firebase Authentication (Google Sign-In).
- **Hardened Security**: Helmet HTTP headers, CORS origin control, Express Rate Limiting, and Bcrypt password hashing.
- **Unified Monorepo**: Single-port production serving (Express serves Vite React build with SPA client-side fallback).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6, React Hot Toast |
| **Backend** | Node.js (v18+), Express 5, Mongoose 9, JWT, Multer, Express Validator |
| **Database** | MongoDB (with automatic zero-config in-memory fallback for local dev) |
| **Cloud & Auth** | Firebase Admin SDK, Firebase Web SDK (Auth, Hosting, Analytics, FCM) |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## 📂 Project Structure

```
ncc-backend/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Shared UI, layouts, modals, badges
│   │   ├── config/firebase.js       # Client Firebase Web SDK configuration
│   │   ├── context/AuthContext.jsx  # Authentication state & Google sign-in
│   │   ├── pages/
│   │   │   ├── officer/             # Officer command pages (10 modules)
│   │   │   ├── cadet/               # Cadet self-service pages (7 modules)
│   │   │   ├── public/              # Landing page, role select, login views
│   │   │   └── shared/              # Achievements, Calendar, Settings
│   │   └── services/                # Axios API clients for all backend endpoints
│   ├── dist/                        # Production frontend build
│   ├── vite.config.js               # Dev server & reverse proxy configuration
│   └── package.json
├── src/                             # Express REST API Backend
│   ├── config/                      # MongoDB, Firebase Admin, and constants
│   ├── controllers/                 # Business logic controllers
│   ├── middlewares/                 # Auth, RBAC, Rate Limiting, File Uploads
│   ├── models/                      # Mongoose data schemas
│   ├── routes/                      # Modular API routes
│   ├── seeds/seed.js                # Database seeder with sample accounts
│   └── utils/                       # ApiError, ApiResponse, file helpers
├── tests/                           # Jest API integration tests
├── firebase.json                    # Firebase Hosting configuration
├── .firebaserc                      # Firebase project association
├── server.js                        # HTTP server entry point & graceful shutdown
└── package.json                     # Monorepo orchestration scripts
```

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ravularuchitha15/ncc-force.git
cd ncc-force
```

### 2. Install Dependencies
```bash
npm run build
```
*(Installs both root and client dependencies and compiles the frontend bundle.)*

### 3. Run Locally

#### Option A: Unified Full-Stack Server (Recommended)
Runs both frontend and backend on a single port (`http://localhost:5000`):
```bash
npm start
```

#### Option B: Development Mode (with Hot Reloading)
Runs nodemon for backend and Vite dev server concurrently:
```bash
npm run dev:full
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Officer** | `officer.sharma@ncc.gov.in` | `Password@123` | Major Rajesh Sharma (1 KAR BN) |
| **Officer** | `officer.verma@ncc.gov.in` | `Password@123` | Captain Priya Verma (1 KAR BN) |
| **Cadet** | `cadet.rahul@ncc.gov.in` | `Password@123` | Sergeant Rahul Nair |
| **Cadet** | `cadet.ananya@ncc.gov.in` | `Password@123` | Corporal Ananya Sen |
| **Cadet** | `cadet.amit@ncc.gov.in` | `Password@123` | Cadet Amit Patel |
| **Admin** | `admin@ncc.gov.in` | `Password@123` | Full system administrator |

---

## 🧪 Automated Testing

Run the automated backend test suite (uses embedded in-memory MongoDB):
```bash
npm test
```
- **Test Suites**: 5 passed, 5 total
- **Tests**: 25 passed, 25 total

---

## ☁️ Deployment

### Deploy Frontend to Firebase Hosting
```bash
npm run deploy:firebase
```

### Build Frontend
```bash
npm run client:build
```

---

## 📄 License
This project is licensed under the ISC License.
