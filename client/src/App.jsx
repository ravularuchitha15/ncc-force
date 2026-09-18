import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import toast from 'react-hot-toast';

// Public pages
import LandingPage    from './pages/public/LandingPage';
import RoleSelect     from './pages/public/RoleSelect';
import CadetLogin     from './pages/public/CadetLogin';
import OfficerLogin   from './pages/public/OfficerLogin';

// Officer pages
import OfficerDashboard      from './pages/officer/OfficerDashboard';
import CadetManagement       from './pages/officer/CadetManagement';
import CadetProfile360       from './pages/officer/CadetProfile360';
import AttendanceManagement  from './pages/officer/AttendanceManagement';
import CampManagement        from './pages/officer/CampManagement';
import TrainingManagement    from './pages/officer/TrainingManagement';
import RankManagement        from './pages/officer/RankManagement';
import CertificateManagement from './pages/officer/CertificateManagement';
import LeaveManagement       from './pages/officer/LeaveManagement';
import Reports               from './pages/officer/Reports';

// Cadet pages
import CadetDashboard    from './pages/cadet/CadetDashboard';
import CadetProfile      from './pages/cadet/CadetProfile';
import CadetAttendance   from './pages/cadet/CadetAttendance';
import CadetCamps        from './pages/cadet/CadetCamps';
import CadetTraining     from './pages/cadet/CadetTraining';
import CadetRank         from './pages/cadet/CadetRank';
import CadetCertificates from './pages/cadet/CadetCertificates';
import CadetLeave        from './pages/cadet/CadetLeave';

// Shared pages
import CalendarPage      from './pages/shared/CalendarPage';
import AchievementsPage  from './pages/shared/AchievementsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import SettingsPage      from './pages/shared/SettingsPage';

// ── Protected route guards ─────────────────────────────────────────────────────
function RequireOfficer({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)                return <Navigate to="/login/officer" replace />;
  if (user.role !== 'officer') return <Navigate to="/cadet/dashboard" replace />;
  return children;
}

function RequireCadet({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)              return <Navigate to="/login/cadet" replace />;
  if (user.role !== 'cadet') return <Navigate to="/officer/dashboard" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user?.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
  if (user?.role === 'cadet')   return <Navigate to="/cadet/dashboard" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-semibold text-sm">Loading NCC FORCE…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/role-select" element={
        <RedirectIfAuthed><RoleSelect /></RedirectIfAuthed>
      } />
      <Route path="/login/cadet" element={
        <RedirectIfAuthed><CadetLogin /></RedirectIfAuthed>
      } />
      <Route path="/login/officer" element={
        <RedirectIfAuthed><OfficerLogin /></RedirectIfAuthed>
      } />

      {/* ── Officer routes ───────────────────────────────────────────────────── */}
      <Route path="/officer/dashboard"    element={<RequireOfficer><OfficerDashboard /></RequireOfficer>} />
      <Route path="/officer/cadets"       element={<RequireOfficer><CadetManagement /></RequireOfficer>} />
      <Route path="/officer/cadets/:id"   element={<RequireOfficer><CadetProfile360 /></RequireOfficer>} />
      <Route path="/officer/attendance"   element={<RequireOfficer><AttendanceManagement /></RequireOfficer>} />
      <Route path="/officer/camps"        element={<RequireOfficer><CampManagement /></RequireOfficer>} />
      <Route path="/officer/training"     element={<RequireOfficer><TrainingManagement /></RequireOfficer>} />
      <Route path="/officer/ranks"        element={<RequireOfficer><RankManagement /></RequireOfficer>} />
      <Route path="/officer/certificates" element={<RequireOfficer><CertificateManagement /></RequireOfficer>} />
      <Route path="/officer/leave"        element={<RequireOfficer><LeaveManagement /></RequireOfficer>} />
      <Route path="/officer/calendar"     element={<RequireOfficer><CalendarPage role="officer" /></RequireOfficer>} />
      <Route path="/officer/achievements" element={<RequireOfficer><AchievementsPage role="officer" /></RequireOfficer>} />
      <Route path="/officer/announcements"element={<RequireOfficer><AnnouncementsPage role="officer" /></RequireOfficer>} />
      <Route path="/officer/reports"      element={<RequireOfficer><Reports /></RequireOfficer>} />
      <Route path="/officer/notifications"element={<RequireOfficer><NotificationsPage role="officer" /></RequireOfficer>} />
      <Route path="/officer/profile"      element={<RequireOfficer><OfficerProfilePage /></RequireOfficer>} />
      <Route path="/officer/settings"     element={<RequireOfficer><SettingsPage role="officer" /></RequireOfficer>} />

      {/* ── Cadet routes ─────────────────────────────────────────────────────── */}
      <Route path="/cadet/dashboard"     element={<RequireCadet><CadetDashboard /></RequireCadet>} />
      <Route path="/cadet/profile"       element={<RequireCadet><CadetProfile /></RequireCadet>} />
      <Route path="/cadet/attendance"    element={<RequireCadet><CadetAttendance /></RequireCadet>} />
      <Route path="/cadet/training"      element={<RequireCadet><CadetTraining /></RequireCadet>} />
      <Route path="/cadet/camps"         element={<RequireCadet><CadetCamps /></RequireCadet>} />
      <Route path="/cadet/certificates"  element={<RequireCadet><CadetCertificates /></RequireCadet>} />
      <Route path="/cadet/rank"          element={<RequireCadet><CadetRank /></RequireCadet>} />
      <Route path="/cadet/leave"         element={<RequireCadet><CadetLeave /></RequireCadet>} />
      <Route path="/cadet/calendar"      element={<RequireCadet><CalendarPage role="cadet" /></RequireCadet>} />
      <Route path="/cadet/achievements"  element={<RequireCadet><AchievementsPage role="cadet" /></RequireCadet>} />
      <Route path="/cadet/announcements" element={<RequireCadet><AnnouncementsPage role="cadet" /></RequireCadet>} />
      <Route path="/cadet/notifications" element={<RequireCadet><NotificationsPage role="cadet" /></RequireCadet>} />
      <Route path="/cadet/settings"      element={<RequireCadet><SettingsPage role="cadet" /></RequireCadet>} />

      {/* ── Fallback ─────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ── Officer Profile page ──────────────────────────────────────────────────────
function OfficerProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ phone: user?.phone || '' });

  const handleSave = () => { toast.success('Profile updated.'); setEditing(false); };

  const rows = [
    { label: 'Full Name', value: user?.name },
    { label: 'Email',     value: user?.email },
    { label: 'Rank',      value: user?.rank },
    { label: 'Unit',      value: user?.unit },
    { label: 'Wing',      value: user?.wing },
  ];

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Officer account details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-outline btn-sm">
            <Edit2 size={15} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-outline-navy btn-sm"><X size={15} /> Cancel</button>
            <button onClick={handleSave} className="btn-primary btn-sm"><Check size={15} /> Save</button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">
            {user?.name?.charAt(0)}
          </div>
          <h2 className="font-bold text-navy-500 text-xl mb-1">{user?.name}</h2>
          <p className="text-primary text-sm font-semibold mb-1">{user?.rank}</p>
          <p className="text-gray-400 text-sm">{user?.unit}</p>
          <div className="divider" />
          <div className="flex justify-around text-center">
            <div><p className="text-xl font-black text-navy-500">NCC</p><p className="text-xs text-gray-400">Force</p></div>
            <div><p className="text-xl font-black text-primary">{user?.wing}</p><p className="text-xs text-gray-400">Wing</p></div>
          </div>
        </div>

        <div className="md:col-span-2 card">
          <h3 className="section-title">Officer Information</h3>
          {rows.map(r => (
            <div key={r.label} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 w-28 flex-shrink-0">{r.label}</span>
              <span className="text-sm text-navy-500 font-medium">{r.value || '—'}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 py-3">
            <span className="text-xs text-gray-400 w-28 flex-shrink-0">Phone</span>
            {editing ? (
              <input className="input text-sm py-1 flex-1" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            ) : (
              <span className="text-sm text-navy-500 font-medium">{form.phone || '—'}</span>
            )}
          </div>
          {editing && (
            <p className="text-xs text-gray-400 mt-3">
              Contact your NCC administrator to update official records.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── 404 page ──────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="text-center text-white">
        <p className="text-8xl font-black text-primary-400 mb-4">404</p>
        <h1 className="text-3xl font-black mb-3">Page Not Found</h1>
        <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary btn-lg">Go to Home</a>
      </div>
    </div>
  );
}
