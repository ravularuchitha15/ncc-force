import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck, Tent, Dumbbell, Award, FileText,
  Trophy, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboard.service';
import { StatusBadge } from '../../components/shared/Badge';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { events } from '../../data/mockData';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const colorMap = {
    red:   'bg-primary/10 text-primary',
    navy:  'bg-navy-100 text-navy-500',
    sky:   'bg-sky-100 text-sky',
    green: 'bg-green-100 text-green-600',
    yellow:'bg-yellow-100 text-yellow-600',
  };
  return (
    <Link to={to} className="card-hover flex items-center gap-4 group">
      <div className={`stat-icon ${colorMap[color] || colorMap.navy}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-navy-500">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary flex-shrink-0" />
    </Link>
  );
}

// ── Profile card ───────────────────────────────────────────────────────────────
function ProfileCard({ cadet }) {
  const wingColors = { Army: 'bg-green-100 text-green-700', Navy: 'bg-blue-100 text-blue-700', Air: 'bg-sky-100 text-sky-600' };

  return (
    <div className="card bg-gradient-to-br from-navy-500 to-navy-600 text-white">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black flex-shrink-0">
          {cadet.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg leading-tight truncate">{cadet.name}</h2>
          <p className="text-sky-200 text-sm font-mono">{cadet.regNo}</p>
          <p className="text-white/80 text-sm mt-0.5">{cadet.rank}</p>
        </div>
        <Link to="/cadet/profile" className="text-white/70 hover:text-white transition-colors">
          <ChevronRight size={18} />
        </Link>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-white/60 text-xs">Unit</p>
          <p className="text-white text-xs font-semibold mt-0.5 leading-tight truncate">{cadet.unit.split(' ').slice(0,3).join(' ')}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs">Wing</p>
          <p className="text-white text-xs font-semibold mt-0.5">{cadet.wing}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs">Batch</p>
          <p className="text-white text-xs font-semibold mt-0.5">{cadet.batch}</p>
        </div>
      </div>
    </div>
  );
}

// ── Attendance summary ─────────────────────────────────────────────────────────
function AttendanceSummary({ attendanceData }) {
  const present = attendanceData?.presentSessions || 0;
  const total   = attendanceData?.totalSessions || 0;
  const absent  = total - present;
  const leave   = 0;
  const pct     = parseInt(attendanceData?.attendancePercentage) || 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">My Attendance</h3>
        <Link to="/cadet/attendance" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          Details <ChevronRight size={12} />
        </Link>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={pct>=75?'#10b981':'#C41E3A'} strokeWidth="3"
              strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-black ${pct>=75?'text-green-600':'text-primary'}`}>{pct}%</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-500"><CheckCircle size={13} className="text-green-500" />Present</span>
            <span className="font-bold text-navy-500">{present}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-500"><XCircle size={13} className="text-red-400" />Absent</span>
            <span className="font-bold text-navy-500">{absent}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-500"><Clock size={13} className="text-yellow-500" />Leave</span>
            <span className="font-bold text-navy-500">{leave}</span>
          </div>
        </div>
      </div>
      {pct < 75 && (
        <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle size={13} /> Attendance below 75% — please improve attendance.
        </div>
      )}
    </div>
  );
}

// ── My camps ───────────────────────────────────────────────────────────────────
function MyCamps({ camps = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">My Camps</h3>
        <Link to="/cadet/camps" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          All Camps <ChevronRight size={12} />
        </Link>
      </div>
      {camps.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No camp participation yet.</p>
      ) : (
        <div className="space-y-2.5">
          {camps.map(c => (
            <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Tent size={15} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-500 truncate">{c.name}</p>
                <p className="text-xs text-gray-400">{c.location}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── My training ────────────────────────────────────────────────────────────────
function MyTraining({ trainings = [] }) {
  const upcoming = trainings.slice(0, 3);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Upcoming Training</h3>
        <Link to="/cadet/training" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          All <ChevronRight size={12} />
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No upcoming training sessions.</p>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map(t => (
            <div key={t._id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={16} className="text-sky" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-500 truncate">{t.title || t.name}</p>
                <p className="text-xs text-gray-400">{t.date?.split('T')[0]} · {t.duration}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── My leave ───────────────────────────────────────────────────────────────────
function MyLeave() {
  // No leave backend — show placeholder
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">My Leave</h3>
        <Link to="/cadet/leave" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          All Requests <ChevronRight size={12} />
        </Link>
      </div>
      <p className="text-sm text-gray-400 text-center py-4">No leave requests.</p>
      <Link to="/cadet/leave" className="btn-outline btn-sm mt-3 w-full justify-center">
        <FileText size={14} /> Apply for Leave
      </Link>
    </div>
  );
}

// ── My achievements ────────────────────────────────────────────────────────────
function MyAchievements({ achievements = [] }) {
  const myAch = achievements.slice(0, 3);
  const catIcons = { Award: '🏆', Certificate: '📜', Medal: '🥇' };
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Achievements</h3>
        <Link to="/cadet/achievements" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          All <ChevronRight size={12} />
        </Link>
      </div>
      {myAch.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No achievements recorded yet.</p>
      ) : (
        <div className="space-y-2.5">
          {myAch.map(a => (
            <div key={a._id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <span className="text-xl flex-shrink-0">{catIcons[a.category] || '🏅'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-500 leading-snug">{a.title}</p>
                <p className="text-xs text-gray-400">{a.date?.split('T')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upcoming events ────────────────────────────────────────────────────────────
function UpcomingEvents() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Upcoming Events</h3>
        <Link to="/cadet/calendar" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          Calendar <ChevronRight size={12} />
        </Link>
      </div>
      <div className="space-y-2.5">
        {events.slice(0, 4).map(ev => (
          <div key={ev.id} className="flex items-center gap-3">
            <div className="text-center bg-navy-50 rounded-lg px-2 py-1.5 min-w-[44px] flex-shrink-0">
              <div className="text-xs font-black text-navy-500 leading-tight">
                {new Date(ev.date).getDate()}
              </div>
              <div className="text-xs text-gray-400 uppercase">
                {new Date(ev.date).toLocaleDateString('en-IN', { month: 'short' })}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-500 truncate">{ev.title}</p>
              <p className="text-xs text-gray-400">{ev.time} · {ev.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function CadetDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getCadetDashboard();
        if (res.success) setDashData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoadingDash(false);
      }
    };
    fetchDashboard();
  }, []);

  const cadetData = {
    id: user?._id,
    name: dashData?.profile?.fullName || user?.name || '',
    regNo: dashData?.profile?.cadetId || '',
    unit: dashData?.profile?.unit || '',
    wing: dashData?.profile?.battalion || '',
    rank: dashData?.profile?.currentRank?.name || '',
    batch: dashData?.profile?.yearSemester || '',
    college: dashData?.profile?.institution || '',
  };

  const perf = {
    attendance: parseFloat(dashData?.attendanceSummary?.attendancePercentage) || 0,
  };
  const myCerts = dashData?.certificates || [];
  const myAch = dashData?.achievements || [];
  const myRank = [];
  const myLeave = [];
  const unread = 0;

  return (
    <DashboardLayout role="cadet">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} · {user?.regNo}</p>
        </div>
        <Link to="/cadet/leave" className="btn-primary btn-sm">
          <FileText size={15} /> Apply for Leave
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardCheck} label="Attendance"  value={`${perf.attendance || 0}%`} sub="Overall"        color="sky"   to="/cadet/attendance" />
        <StatCard icon={Tent}           label="Camps"       value={dashData?.campsParticipated ?? 0} sub="Participated" color="green" to="/cadet/camps" />
        <StatCard icon={Award}          label="Certificates" value={myCerts?.length ?? 0} sub="Passed" color="navy" to="/cadet/certificates" />
        <StatCard icon={Trophy}         label="Achievements" value={myAch.length} sub="Recorded" color="yellow" to="/cadet/achievements" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard cadet={cadetData} />

          <div className="grid sm:grid-cols-2 gap-6">
            <AttendanceSummary attendanceData={dashData?.attendanceSummary} />
            <MyLeave />
          </div>

          <MyTraining trainings={dashData?.upcomingTraining || []} />
          <MyCamps camps={dashData?.participatedCamps || []} />
        </div>

        {/* Right col */}
        <div className="space-y-6">
          <MyAchievements achievements={dashData?.achievements || []} />
          <UpcomingEvents />

          {/* Certificate status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">Certificates</h3>
              <Link to="/cadet/certificates" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                All <ChevronRight size={12} />
              </Link>
            </div>
            {myCerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No certificate records.</p>
            ) : (
              <div className="space-y-2">
                {myCerts.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-navy-500">{c.type}</p>
                      <p className="text-xs text-gray-400">{c.issueDate || 'Pending'}</p>
                    </div>
                    <StatusBadge status={c.result} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'My Profile',    icon: '👤', to: '/cadet/profile' },
                { label: 'Leave Apply',   icon: '📋', to: '/cadet/leave' },
                { label: 'My Training',   icon: '💪', to: '/cadet/training' },
                { label: 'Calendar',      icon: '📅', to: '/cadet/calendar' },
                { label: 'Achievements',  icon: '🏆', to: '/cadet/achievements' },
                { label: 'Certificates',  icon: '📜', to: '/cadet/certificates' },
              ].map(q => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-navy-50 transition-colors text-center"
                >
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-xs font-semibold text-navy-400 leading-tight">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
