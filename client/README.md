# NCC FORCE — Smart NCC Cadet Management System

A modern, professional, responsive **React** frontend for managing NCC cadets, officers, attendance, camps, certificates, ranks, training, calendar events, leave applications, achievements and performance.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Demo Credentials

### Officer Login (`/login/officer`)
| Field    | Value                          |
|----------|-------------------------------|
| Email    | `rajesh.kumar@ncc.gov.in`     |
| Password | `officer123`                  |

### Cadet Login (`/login/cadet`)
| Field              | Value           |
|--------------------|-----------------|
| Regimental Number  | `DL-ARY-0001`   |
| Password           | `cadet123`      |

Other cadet accounts: `DL-ARY-0002`, `DL-ARY-0003` (same password).

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Auth state, mock login logic
├── data/
│   └── mockData.js              # All mock data (cadets, camps, etc.)
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.jsx  # Wraps sidebar + topbar + content
│   │   ├── Sidebar.jsx          # Role-aware collapsible sidebar
│   │   └── TopBar.jsx           # Header with notifications + user menu
│   └── shared/
│       ├── Modal.jsx            # Reusable modal dialog
│       ├── Badge.jsx            # Status badges
│       ├── EmptyState.jsx       # Empty state component
│       ├── ConfirmDialog.jsx    # Delete/confirm dialog
│       └── NCCSymbol.jsx        # NCC SVG watermark
├── pages/
│   ├── public/                  # Landing, Role Select, Login pages
│   ├── officer/                 # All officer-specific pages
│   ├── cadet/                   # All cadet-specific pages
│   └── shared/                  # Calendar, Achievements, Notifications,
│                                #   Announcements, Settings
└── App.jsx                      # React Router + protected routes
```

---

## ✅ Modules

| Module                  | Officer | Cadet |
|-------------------------|---------|-------|
| Dashboard               | ✓       | ✓     |
| Cadet Management        | ✓       | —     |
| Cadet 360° Profile      | ✓       | ✓     |
| Attendance              | ✓ mark  | ✓ view|
| Camp Management         | ✓       | ✓ view|
| Training Management     | ✓       | ✓ view|
| Ranks & Promotions      | ✓       | ✓ view|
| Certificate Management  | ✓       | ✓ view|
| Leave Applications      | ✓ review| ✓ apply|
| NCC Calendar            | ✓ create| ✓ view|
| Achievements            | ✓ record| ✓ view|
| Notifications           | ✓       | ✓     |
| Announcements           | ✓ publish| ✓ view|
| Reports (8 types)       | ✓       | —     |
| Settings                | ✓       | ✓     |

---

## 🎨 Design System

| Token         | Color      | Usage                              |
|---------------|------------|------------------------------------|
| `primary`     | `#C41E3A`  | Buttons, active states, highlights |
| `navy`        | `#1B2A4A`  | Headings, sidebar, primary text    |
| `sky`         | `#4A90D9`  | Secondary accents, icons, cards    |
| White/Gray    | `#F9FAFB`  | Backgrounds, cards                 |

---

## 🛠 Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS 3** — custom design system
- **React Router v6** — client-side routing + protected routes
- **lucide-react** — icons
- **react-hot-toast** — notifications
- **clsx** — conditional classes

---

## 🔒 Role-Based Access

- **Officers** cannot access cadet routes and vice versa
- Redirects applied on all protected routes
- Session persisted in `localStorage`
