# Smart NCC Cadet Management System — Backend API

A secure, scalable, and production-ready **Node.js / Express / MongoDB** backend for the **Smart NCC Cadet Management System**. This platform digitizes and centralizes the administration of National Cadet Corps (NCC) cadets, officers, attendance, training programs, camps, ranks, certificates, achievements, and official performance evaluations.

---

## 🚀 Key Features & Highlights

- **Role-Based Access Control (RBAC):** Strict authorization separation across **Admin**, **NCC Officer**, and **Cadet**.
- **Cadet Dossier Management:** Complete records including Cadet ID, battalion, unit, rank, blood group, emergency contacts, profile photos, and status lifecycle.
- **Attendance & Duplicate Prevention:** Daily/session attendance with compound unique indexing (`{ cadet, date, sessionName }`) to prevent duplicate entries, plus automated percentage calculations.
- **Promotion & Rank History:** Hierarchical rank definitions with full audit trails (`RankHistory`) recording every promotion, reason, and approving officer.
- **Training & Camps:** Lifecycle management for drills, weapon training, obstacle courses, CATC, RDC, and TSC camps with participant assignment rosters.
- **Certificates & Achievements:** Upload and verify official 'A', 'B', 'C' certificates and competitive honors with secure file downloads and MIME validation.
- **Performance Appraisals:** Official qualitative grading (Parade, Discipline, Leadership, Physical Training, Overall Remarks) without arbitrary auto-generated scores.
- **Dedicated Dashboards:** Real-time summary views for Officers (unit-wide metrics, upcoming schedules) and Cadets (personal profile, attendance rate, enrolled events).
- **Hardened Security:** `helmet`, `cors`, `express-rate-limit`, `bcryptjs` password hashing, signed JWT tokens, and strict `express-validator` schemas.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime (v18+) |
| **Express.js** | RESTful HTTP Web Framework |
| **MongoDB & Mongoose** | NoSQL Document Database & ODM |
| **Firebase Admin SDK** | Firebase Auth (ID tokens), Cloud Storage, and FCM push notifications |
| **JWT (jsonwebtoken)** | Stateless Bearer token authentication |
| **bcryptjs** | Salted cryptographic password hashing |
| **Multer** | Secure multipart file uploads with size and MIME filters |
| **Express Validator** | Declarative request payload validation |
| **Helmet & CORS** | HTTP security headers and Cross-Origin control |
| **Jest & Supertest** | Automated integration and unit testing |
| **mongodb-memory-server** | Zero-config in-memory database for testing |

---

## 📂 Project Structure

```
ncc-backend/
├── .env.example                     # Environment template
├── .env                             # Local environment variables
├── package.json                     # Dependencies & scripts
├── postman_collection.json          # Ready-to-import Postman Collection
├── README.md                        # Documentation
├── server.js                        # App entry point & graceful shutdown
├── src/
│   ├── app.js                       # Express configuration & middlewares
│   ├── config/
│   │   ├── db.js                    # MongoDB connection handler
│   │   └── constants.js             # Roles, status enums, blood groups
│   ├── controllers/                 # MVC Controllers
│   │   ├── achievement.controller.js
│   │   ├── attendance.controller.js
│   │   ├── auth.controller.js
│   │   ├── cadet.controller.js
│   │   ├── camp.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── performance.controller.js
│   │   ├── rank.controller.js
│   │   ├── training.controller.js
│   │   └── user.controller.js
│   ├── middlewares/                 # Security, auth & error handlers
│   │   ├── auth.middleware.js       # JWT extraction & user hydration
│   │   ├── error.middleware.js      # Global error & duplicate key handler
│   │   ├── rateLimiter.middleware.js# General and auth rate limiting
│   │   ├── role.middleware.js       # RBAC authorization
│   │   ├── upload.middleware.js     # Multer file filter & disk storage
│   │   └── validate.middleware.js   # express-validator runner
│   ├── models/                      # Mongoose Schema Definitions
│   │   ├── Achievement.js
│   │   ├── Attendance.js
│   │   ├── Cadet.js
│   │   ├── Camp.js
│   │   ├── Performance.js
│   │   ├── Rank.js
│   │   ├── RankHistory.js
│   │   ├── Training.js
│   │   ├── Unit.js
│   │   └── User.js
│   ├── routes/                      # Express Router Modules
│   │   ├── achievement.routes.js
│   │   ├── attendance.routes.js
│   │   ├── auth.routes.js
│   │   ├── cadet.routes.js
│   │   ├── camp.routes.js
│   │   ├── certificate.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── index.js
│   │   ├── performance.routes.js
│   │   ├── rank.routes.js
│   │   ├── training.routes.js
│   │   └── user.routes.js
│   ├── seeds/
│   │   └── seed.js                  # Database seeder with sample data
│   ├── utils/
│   │   ├── apiError.js              # Operational error class
│   │   ├── apiResponse.js           # Standard JSON response formatter
│   │   └── fileHelper.js            # Safe file unlink and dir setup
│   └── validations/                 # express-validator schemas
├── tests/                           # Automated test suite
│   ├── attendance.test.js
│   ├── auth.test.js
│   ├── cadet.test.js
│   ├── dashboard.test.js
│   └── setup.js
└── uploads/                         # Stored uploads
    ├── achievements/
    ├── certificates/
    └── profiles/
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **MongoDB** (Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the `MONGO_URI` is correctly set.

### 3. Firebase Setup (Optional / Configurable)
The backend seamlessly integrates **Firebase Admin SDK** for Firebase Authentication, Cloud Storage, and Push Notifications (FCM). If unconfigured, the server automatically runs in local fallback mode.

#### Supplying Firebase Credentials (choose one):
1. **Service Account File (Recommended)**:
   - Generate a private key JSON file from the [Firebase Console](https://console.firebase.google.com/) -> *Project Settings* -> *Service Accounts*.
   - Save the file as `serviceAccountKey.json` in the project root (or set `FIREBASE_SERVICE_ACCOUNT_PATH`).
2. **Environment Variables**:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

#### Switching Storage Driver:
Set `STORAGE_DRIVER=firebase` in `.env` to upload cadet photos, certificates, and achievements directly to Google Cloud / Firebase Storage. Set to `local` (default) to keep files stored in the local `uploads/` directory.

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed the Database
Populate initial NCC Ranks, Units, Admin account, sample Officers, Cadets, Attendance, Camps, and Trainings:
```bash
npm run seed
```

#### Pre-seeded Default Accounts:
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ncc.gov.in` | `Password@123` | Full system governance |
| **Officer** | `officer.sharma@ncc.gov.in` | `Password@123` | Major Rajesh Sharma (1 KAR BN) |
| **Officer** | `officer.verma@ncc.gov.in` | `Password@123` | Captain Priya Verma (1 KAR BN) |
| **Cadet** | `cadet.rahul@ncc.gov.in` | `Password@123` | Sergeant Rahul Nair |
| **Cadet** | `cadet.ananya@ncc.gov.in` | `Password@123` | Corporal Ananya Sen |
| **Cadet** | `cadet.amit@ncc.gov.in` | `Password@123` | Cadet Amit Patel |

### 6. Start the Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

Server runs by default at `http://localhost:5000`.

---

## 🧪 Automated Testing

The backend includes comprehensive test coverage using **Jest**, **Supertest**, and an in-memory database (`mongodb-memory-server`), so tests run without touching your external database:

```bash
npm test
```

---

## 📬 Postman API Collection

Import the included `postman_collection.json` file directly into Postman.

- Includes pre-configured environment variables (`{{baseUrl}}` and `{{token}}`).
- Automatically updates `{{token}}` in collection variables when logging in as Admin, Officer, or Cadet.
- Contains ready-to-run requests for all endpoints with sample JSON payloads.

---

## 📡 REST API Reference

All successful responses follow the format:
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... },
  "pagination": { ... } // optional
}
```

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public / Admin | Register user account |
| `POST` | `/api/auth/login` | Public | Login and receive signed JWT |
| `POST` | `/api/auth/firebase-login` | Public | Login with Firebase ID token (Google Sign-In / Mobile) |
| `POST` | `/api/auth/logout` | Private | Logout session |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `POST` | `/api/auth/forgot-password` | Public | Generate password reset token |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password with token |
| `PUT` | `/api/auth/change-password` | Private | Update account password |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | List users with pagination and search |
| `POST` | `/api/users/officer` | Admin | Provision a new NCC Officer account |
| `GET` | `/api/users/:id` | Admin | Get single user details |
| `PUT` | `/api/users/:id/role` | Admin | Update user role |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate account |
| `DELETE` | `/api/users/:id` | Admin | Delete user account |

### Cadet Management (`/api/cadets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cadets` | Officer, Admin | Create cadet profile (supports photo upload) |
| `GET` | `/api/cadets` | Officer, Admin | Search/filter cadets (pagination, unit, rank, status) |
| `GET` | `/api/cadets/:id` | Private | View cadet profile |
| `GET` | `/api/cadets/me/profile` | Cadet | Cadet views own profile |
| `PATCH` | `/api/cadets/me/update` | Cadet | Cadet updates permitted info (phone, address, photo) |
| `PUT` | `/api/cadets/:id` | Officer, Admin | Full update of cadet details |
| `DELETE` | `/api/cadets/:id` | Officer, Admin | Deactivate or delete cadet |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance` | Officer, Admin | Mark single attendance record (duplicate check enforced) |
| `POST` | `/api/attendance/bulk` | Officer, Admin | Mark attendance for entire platoon/batch |
| `GET` | `/api/attendance` | Officer, Admin | Filter attendance by date range, cadet, session, status |
| `GET` | `/api/attendance/cadet/:cadetId` | Private | View cadet attendance summary & attendance % |
| `PUT` | `/api/attendance/:id` | Officer, Admin | Update attendance status/remarks |
| `DELETE` | `/api/attendance/:id` | Officer, Admin | Remove attendance record |

### Training Management (`/api/training`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/training` | Officer, Admin | Create training program |
| `GET` | `/api/training` | Private | List training sessions |
| `GET` | `/api/training/:id` | Private | Get training session details |
| `GET` | `/api/training/my-trainings` | Cadet | Cadet views assigned trainings |
| `PUT` | `/api/training/:id` | Officer, Admin | Update training session |
| `POST` | `/api/training/:id/assign` | Officer, Admin | Assign cadets to training |
| `DELETE` | `/api/training/:id/cadets/:cadetId` | Officer, Admin | Remove cadet from session |
| `DELETE` | `/api/training/:id` | Officer, Admin | Delete training session |

### Camp Management (`/api/camps`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/camps` | Officer, Admin | Create NCC camp |
| `GET` | `/api/camps` | Private | List camps (filter by type, status, dates) |
| `GET` | `/api/camps/:id` | Private | Get camp details |
| `GET` | `/api/camps/my-camps` | Cadet | Cadet views enrolled camps |
| `PUT` | `/api/camps/:id` | Officer, Admin | Update camp details |
| `POST` | `/api/camps/:id/register-cadets` | Officer, Admin | Register cadets for camp |
| `DELETE` | `/api/camps/:id/cadets/:cadetId` | Officer, Admin | Remove cadet from camp roster |
| `DELETE` | `/api/camps/:id` | Officer, Admin | Delete camp |

### Rank Management (`/api/ranks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ranks` | Private | List NCC rank hierarchy |
| `POST` | `/api/ranks` | Officer, Admin | Create rank definition |
| `POST` | `/api/ranks/promote/:cadetId` | Officer, Admin | Promote cadet & create RankHistory audit |
| `GET` | `/api/ranks/history/:cadetId` | Private | View cadet promotion audit trail |

### Certificate Management (`/api/certificates`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/certificates` | Officer, Admin | Issue and upload certificate (PDF, JPG, PNG) |
| `GET` | `/api/certificates` | Private | List certificates (cadets view only own) |
| `GET` | `/api/certificates/:id` | Private | Get certificate details |
| `GET` | `/api/certificates/:id/download` | Private | Secure authorized document download |
| `PUT` | `/api/certificates/:id` | Officer, Admin | Update certificate metadata |
| `DELETE` | `/api/certificates/:id` | Officer, Admin | Delete certificate and document |

### Achievements (`/api/achievements`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/achievements` | Officer, Admin | Record cadet achievement or medal |
| `GET` | `/api/achievements` | Private | List achievements |
| `GET` | `/api/achievements/:id` | Private | Get achievement details |
| `PUT` | `/api/achievements/:id` | Officer, Admin | Update achievement |
| `DELETE` | `/api/achievements/:id` | Officer, Admin | Delete achievement |

### Performance Appraisals (`/api/performance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/performance` | Officer, Admin | Record official performance review |
| `GET` | `/api/performance` | Private | List performance records (cadets view only own) |
| `GET` | `/api/performance/:id` | Private | Get review details |
| `PUT` | `/api/performance/:id` | Officer, Admin | Update review |
| `DELETE` | `/api/performance/:id` | Officer, Admin | Delete review |

### Dashboards (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/officer` | Officer, Admin | Contingent metrics, active counts, upcoming events |
| `GET` | `/api/dashboard/cadet` | Cadet | Personal dossier, rank, attendance %, upcoming events |

---

## 🔒 Security Best Practices Implemented

1. **Password Protection:** Salting and hashing via `bcryptjs` with 10 salt rounds; passwords excluded from query results by default (`select: false`).
2. **Access Control:** Curried `authorize('role')` middleware guarantees that cadets cannot manipulate ranks, attendance, appraisals, or certificates.
3. **Strict Validation:** Input sanitation, email normalization, enum restrictions, and ISO8601 date parsing via `express-validator`.
4. **File Safety:** Restricted file extensions (JPEG, PNG, WEBP, PDF), 5MB size ceiling, filename sanitization with timestamp entropy, and non-public direct streaming for documents.
5. **DDoS & Brute Force Prevention:** IP rate limiting via `express-rate-limit` with stricter windows for authentication endpoints.
