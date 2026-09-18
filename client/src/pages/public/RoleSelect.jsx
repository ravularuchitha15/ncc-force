import { Link } from 'react-router-dom';
import { Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import NCCSymbol from '../../components/shared/NCCSymbol';

export default function RoleSelect() {
  return (
    <div className="min-h-screen hero-gradient flex flex-col relative overflow-hidden">
      {/* NCC watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] text-white opacity-[0.04] pointer-events-none select-none">
        <NCCSymbol className="w-full h-full" />
      </div>

      {/* Top nav */}
      <nav className="relative px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-bold tracking-tight">NCC FORCE</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Choose Your Role
          </h1>
          <p className="text-gray-300 text-lg">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in">
          {/* Cadet Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center mb-5 group-hover:bg-sky transition-colors duration-300">
              <span className="text-4xl">🎖</span>
            </div>
            <h2 className="text-2xl font-black text-navy-500 mb-2">Cadet</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Access your NCC profile, attendance, training, camps, certificates, leave and achievements.
            </p>

            <ul className="text-left w-full space-y-2 mb-7 text-sm text-gray-600">
              {[
                'View personal NCC profile',
                'Track attendance & training',
                'Apply for leave',
                'View camps & certificates',
                'Check achievements',
              ].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/login/cadet"
              className="btn-sky w-full justify-center"
            >
              Login as Cadet <ChevronRight size={16} />
            </Link>
          </div>

          {/* Officer Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
              <span className="text-4xl">🪖</span>
            </div>
            <h2 className="text-2xl font-black text-navy-500 mb-2">NCC Officer</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Manage cadets, attendance, camps, training, certificates, leave requests and reports.
            </p>

            <ul className="text-left w-full space-y-2 mb-7 text-sm text-gray-600">
              {[
                'Full cadet management',
                'Attendance control',
                'Camp & training administration',
                'Certificate & rank management',
                'Reports & announcements',
              ].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/login/officer"
              className="btn-primary w-full justify-center"
            >
              Login as Officer <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-gray-500 text-sm mt-10 text-center">
          Unauthorized access is strictly prohibited and monitored.
        </p>
      </div>
    </div>
  );
}
