import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardCheck, Tent, Dumbbell,
  TrendingUp, Award, FileText, CalendarDays, Trophy,
  Megaphone, BarChart2, Bell, UserCircle, Settings,
  LogOut, ChevronLeft, ChevronRight, Shield, Menu, X,
  Bookmark, ClipboardList,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const officerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/officer/dashboard' },
  { label: 'Cadets', icon: Users, path: '/officer/cadets' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/officer/attendance' },
  { label: 'Camps', icon: Tent, path: '/officer/camps' },
  { label: 'Training', icon: Dumbbell, path: '/officer/training' },
  { label: 'Ranks & Promotions', icon: TrendingUp, path: '/officer/ranks' },
  { label: 'Certificates', icon: Award, path: '/officer/certificates' },
  { label: 'Leave Requests', icon: FileText, path: '/officer/leave' },
  { label: 'Calendar', icon: CalendarDays, path: '/officer/calendar' },
  { label: 'Achievements', icon: Trophy, path: '/officer/achievements' },
  { label: 'Announcements', icon: Megaphone, path: '/officer/announcements' },
  { label: 'Reports', icon: BarChart2, path: '/officer/reports' },
  { label: 'Notifications', icon: Bell, path: '/officer/notifications' },
];

const officerBottom = [
  { label: 'Profile', icon: UserCircle, path: '/officer/profile' },
  { label: 'Settings', icon: Settings, path: '/officer/settings' },
];

const cadetNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/cadet/dashboard' },
  { label: 'My Profile', icon: UserCircle, path: '/cadet/profile' },
  { label: 'My Attendance', icon: ClipboardCheck, path: '/cadet/attendance' },
  { label: 'My Training', icon: Dumbbell, path: '/cadet/training' },
  { label: 'My Camps', icon: Tent, path: '/cadet/camps' },
  { label: 'My Certificates', icon: Award, path: '/cadet/certificates' },
  { label: 'My Rank', icon: TrendingUp, path: '/cadet/rank' },
  { label: 'My Leave', icon: FileText, path: '/cadet/leave' },
  { label: 'Calendar', icon: CalendarDays, path: '/cadet/calendar' },
  { label: 'Achievements', icon: Trophy, path: '/cadet/achievements' },
  { label: 'Announcements', icon: Megaphone, path: '/cadet/announcements' },
  { label: 'Notifications', icon: Bell, path: '/cadet/notifications' },
];

const cadetBottom = [
  { label: 'Settings', icon: Settings, path: '/cadet/settings' },
];

export default function Sidebar({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = role === 'officer' ? officerNav : cadetNav;
  const bottomItems = role === 'officer' ? officerBottom : cadetBottom;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy-500 text-white custom-scroll overflow-y-auto">
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-navy-400', collapsed && 'justify-center px-3')}>
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-base leading-tight">NCC FORCE</div>
            <div className="text-navy-200 text-xs">Management System</div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 bg-navy-400 rounded-lg">
          <div className="text-xs text-navy-200 font-medium uppercase tracking-wider mb-0.5">
            {role === 'officer' ? 'NCC Officer' : 'Cadet'}
          </div>
          <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
          {role === 'cadet' && <div className="text-sky-300 text-xs truncate">{user?.regNo}</div>}
          {role === 'officer' && <div className="text-sky-300 text-xs truncate">{user?.rank}</div>}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', collapsed && 'justify-center px-2')
            }
            title={collapsed ? item.label : ''}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom items + logout */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-navy-400 pt-3">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', collapsed && 'justify-center px-2')
            }
            title={collapsed ? item.label : ''}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className={clsx('nav-item nav-item-inactive w-full text-left hover:bg-red-600/20 hover:text-red-300', collapsed && 'justify-center px-2')}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-navy-500 text-white rounded-lg flex items-center justify-center shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 z-50 lg:hidden transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} className="text-navy-400" /> : <ChevronLeft size={12} className="text-navy-400" />}
        </button>
      </aside>
    </>
  );
}
