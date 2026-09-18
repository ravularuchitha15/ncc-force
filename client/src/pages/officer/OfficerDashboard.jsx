import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardCheck, FileText, Tent, CalendarDays,
  Dumbbell, Award, TrendingUp, ChevronRight, Clock,
  CheckCircle, XCircle, AlertCircle, Bell, Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboard.service';
import { StatusBadge } from '../../components/shared/Badge';
import DashboardLayout from '../../components/layout/DashboardLayout';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const colorMap = {
    red:   { bg: 'bg-primary/10', text: 'text-primary', grad: 'card-gradient-red' },
    navy:  { bg: 'bg-navy-100',   text: 'text-navy-500', grad: 'card-gradient-navy' },
    sky:   { bg: 'bg-sky-100',    text: 'text-sky',      grad: 'card-gradient-sky' },
    green: { bg: 'bg-green-100',  text: 'text-green-600', grad: 'card-gradient-green' },
  };
  const c = colorMap[color] || colorMap.navy;

  return (
    <Link to={to} className="card-hover flex items-center gap-4 group">
      <div className={`stat-icon ${c.bg}`}>
        <Icon size={22} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-navy-500 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Today's attendance summary ─────────────────────────────────────────────────
function AttendanceSummary({ recentAttendance = [] }) {
  const latest = recentAttendance[0];
  const present = recentAttendance.filter(r => r.status === 'Present').length;
  const absent  = recentAttendance.filter(r => r.status === 'Absent').length;
  const leave   = recentAttendance.filter(r => r.status === 'Leave').length;
  const total   = recentAttendance.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Recent Attendance</h3>
        <Link to="/officer/attendance" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          View all <ChevronRight size={12} />
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-4">{latest?.sessionName || 'No records yet'} — {latest?.date ? new Date(latest.date).toLocaleDateString('en-IN') : ''}</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <CheckCircle size={18} className="text-green-500 mx-auto mb-1" />
          <p className="text-xl font-black text-green-600">{present}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <XCircle size={18} className="text-red-400 mx-auto mb-1" />
          <p className="text-xl font-black text-red-500">{absent}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <Clock size={18} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-xl font-black text-yellow-600">{leave}</p>
          <p className="text-xs text-gray-500">On Leave</p>
        </div>
      </div>
      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
        {total > 0 && <>
          <div className="bg-green-500 h-full transition-all" style={{ width: `${(present/total)*100}%` }} />
          <div className="bg-yellow-400 h-full transition-all" style={{ width: `${(leave/total)*100}%` }} />
          <div className="bg-red-400 h-full transition-all" style={{ width: `${(absent/total)*100}%` }} />
        </>}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{total} recent records</p>
    </div>
  );
}

// ── Pending actions ────────────────────────────────────────────────────────────
function PendingActions() {
  // No leave backend yet — show placeholder
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Pending Actions</h3>
      </div>
      <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-3 text-sm">
        <CheckCircle size={16} /> All actions cleared
      </div>
    </div>
  );
}

// ── Upcoming events ────────────────────────────────────────────────────────────
function UpcomingEvents({ upcomingCamps = [], upcomingTraining = [] }) {
  const typeColors = {
    Training: 'bg-sky-100 text-sky-600',
    Camp: 'bg-green-100 text-green-700',
  };

  const combined = [
    ...upcomingTraining.map(t => ({ id: t._id, title: t.title || t.name, date: t.date, type: 'Training', location: t.location || '' })),
    ...upcomingCamps.map(c => ({ id: c._id, title: c.name, date: c.startDate, type: 'Camp', location: c.location || '' })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Upcoming Events</h3>
        <Link to="/officer/calendar" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          Calendar <ChevronRight size={12} />
        </Link>
      </div>
      {combined.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No upcoming events.</p>
      ) : (
        <div className="space-y-2.5">
          {combined.map(ev => (
            <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center bg-navy-50 rounded-lg px-2.5 py-1.5 min-w-[48px] flex-shrink-0">
                <div className="text-xs font-bold text-navy-500 leading-tight">
                  {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit' })}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  {new Date(ev.date).toLocaleDateString('en-IN', { month: 'short' })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-500 truncate">{ev.title}</p>
                <p className="text-xs text-gray-400">{ev.location}</p>
              </div>
              <span className={`badge text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${typeColors[ev.type] || 'bg-gray-100 text-gray-600'}`}>
                {ev.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recent activity ────────────────────────────────────────────────────────────
function RecentActivity() {
  const activities = [
    { icon: ClipboardCheck, text: 'Attendance updated for Parade Practice', time: 'Today, 08:30', color: 'text-sky' },
    { icon: CheckCircle, text: 'Leave approved for Cadet Arjun Sharma', time: 'Yesterday, 14:15', color: 'text-green-500' },
    { icon: Tent, text: 'Annual Training Camp registration opened', time: '2 days ago', color: 'text-navy-400' },
    { icon: Dumbbell, text: 'Training session: Weapon Training recorded', time: '3 days ago', color: 'text-sky' },
    { icon: Award, text: 'Certificate issued to Cadet Rahul Nair (B Cert)', time: '1 week ago', color: 'text-yellow-500' },
    { icon: TrendingUp, text: 'Rank update: Cadet Priya Verma → Corporal', time: '1 week ago', color: 'text-primary' },
  ];

  return (
    <div className="card">
      <h3 className="section-title">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <a.icon size={13} className={a.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-navy-400 leading-snug">{a.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Latest announcements ───────────────────────────────────────────────────────
function LatestAnnouncements() {
  // No announcements backend yet — using inline static data
  const staticAnnouncements = [
    { id: 1, title: 'Republic Day Parade rehearsals begin next week', priority: 'High', date: 'Sep 2026', audience: 'All Cadets' },
    { id: 2, title: 'B Certificate exam schedule published', priority: 'Normal', date: 'Sep 2026', audience: 'Senior Cadets' },
    { id: 3, title: 'Annual Training Camp registrations open', priority: 'High', date: 'Sep 2026', audience: 'All Wings' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Announcements</h3>
        <Link to="/officer/announcements" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          Manage <ChevronRight size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {staticAnnouncements.map(a => (
          <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.priority === 'High' ? 'bg-primary' : 'bg-sky'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-500 truncate">{a.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.date} · {a.audience}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function OfficerDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getOfficerDashboard();
        if (res.success) setDashData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoadingDash(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeCadets   = dashData?.metrics?.activeCadets ?? 0;
  const pendingLeave   = 0; // No leave model yet
  const upcomingCamps  = dashData?.upcomingCamps?.length ?? 0;
  const upcomingEvents = (dashData?.upcomingCamps?.length ?? 0) + (dashData?.upcomingTraining?.length ?? 0);
  const upcomingTraining = dashData?.upcomingTraining?.length ?? 0;
  const unreadNotifs   = 0; // No notifications endpoint yet

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <DashboardLayout role="officer">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Officer Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} · {today}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/officer/cadets" className="btn-outline btn-sm">
            <Users size={15} /> Manage Cadets
          </Link>
          <Link to="/officer/attendance" className="btn-primary btn-sm">
            <ClipboardCheck size={15} /> Mark Attendance
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}        label="Total Cadets"      value={activeCadets}    sub="Active cadets"        color="navy"  to="/officer/cadets" />
        <StatCard icon={FileText}     label="Pending Leave"     value={pendingLeave}    sub="Awaiting review"      color="red"   to="/officer/leave" />
        <StatCard icon={Tent}         label="Upcoming Camps"    value={upcomingCamps}   sub="Scheduled camps"      color="sky"   to="/officer/camps" />
        <StatCard icon={CalendarDays} label="Events"            value={upcomingEvents}  sub="In calendar"          color="green" to="/officer/calendar" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardCheck} label="Recent Attendance" value={dashData?.recentAttendance?.length ?? 0} sub="Recent records" color="green" to="/officer/attendance" />
        <StatCard icon={Dumbbell}       label="Training Sessions"  value={upcomingTraining} sub="Upcoming"   color="sky"   to="/officer/training" />
        <StatCard icon={Award}          label="Certificates"        value={dashData?.recentCertificates?.length ?? 0} sub="Recent"     color="navy"  to="/officer/certificates" />
        <StatCard icon={Bell}           label="Notifications"       value={unreadNotifs}     sub="Unread"     color="red"   to="/officer/notifications" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceSummary recentAttendance={dashData?.recentAttendance || []} />
          <PendingActions />
          <RecentActivity />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <UpcomingEvents upcomingCamps={dashData?.upcomingCamps || []} upcomingTraining={dashData?.upcomingTraining || []} />
          <LatestAnnouncements />

          {/* Quick links */}
          <div className="card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Cadet',       icon: Users,         to: '/officer/cadets',       color: 'bg-navy-50 text-navy-500' },
                { label: 'Mark Attendance', icon: ClipboardCheck,to: '/officer/attendance',   color: 'bg-sky-50 text-sky' },
                { label: 'New Camp',        icon: Tent,          to: '/officer/camps',         color: 'bg-green-50 text-green-600' },
                { label: 'Announcements',   icon: Megaphone,     to: '/officer/announcements', color: 'bg-primary-50 text-primary' },
                { label: 'Reports',         icon: ClipboardCheck,to: '/officer/reports',       color: 'bg-yellow-50 text-yellow-600' },
                { label: 'Calendar',        icon: CalendarDays,  to: '/officer/calendar',      color: 'bg-purple-50 text-purple-600' },
              ].map(q => (
                <Link
                  key={q.label}
                  to={q.to}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${q.color} hover:opacity-80 transition-opacity text-center`}
                >
                  <q.icon size={18} />
                  <span className="text-xs font-semibold leading-tight">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
