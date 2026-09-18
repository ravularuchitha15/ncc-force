import { Link } from 'react-router-dom';
import {
  Shield, ClipboardCheck, Tent, Dumbbell, Award,
  TrendingUp, CalendarDays, FileText, Trophy, Bell,
  ChevronRight, Star, Users, BarChart2,
} from 'lucide-react';
import NCCSymbol from '../../components/shared/NCCSymbol';

const features = [
  { icon: Users, title: 'Cadet Management', desc: 'Complete 360° cadet profiles — personal info, NCC records, performance, history.' },
  { icon: ClipboardCheck, title: 'Attendance', desc: 'Mark, track and manage parade and training attendance with QR support.' },
  { icon: Tent, title: 'Camp Management', desc: 'Create camps, manage registrations, track participation and performance.' },
  { icon: Dumbbell, title: 'Training', desc: 'Schedule sessions, track topics, record assessments and completion.' },
  { icon: TrendingUp, title: 'Ranks & Promotions', desc: 'Maintain complete promotion history and rank progression for every cadet.' },
  { icon: Award, title: 'Certificates', desc: 'Manage A, B, C certificate eligibility, exams, results and verification.' },
  { icon: FileText, title: 'Leave Applications', desc: 'Digital leave requests with officer approval workflow and status tracking.' },
  { icon: CalendarDays, title: 'NCC Calendar', desc: 'Centralized calendar for parades, camps, exams, competitions and ceremonies.' },
  { icon: Trophy, title: 'Achievements', desc: 'Record awards, medals, competition results and special recognitions.' },
  { icon: Bell, title: 'Notifications', desc: 'Real-time in-app alerts for cadets and officers on all important updates.' },
  { icon: BarChart2, title: 'Reports', desc: 'Generate attendance, camp, training and performance reports with export.' },
  { icon: Star, title: 'Announcements', desc: 'Publish targeted announcements to all cadets, units or specific batches.' },
];

const stats = [
  { value: '500+', label: 'Cadets Managed' },
  { value: '12', label: 'Core Modules' },
  { value: '3', label: 'Certificate Tracks' },
  { value: '100%', label: 'Role-Based Access' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-black text-navy-500 text-lg tracking-tight">NCC FORCE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/role-select"
              className="text-sm font-semibold text-navy-500 hover:text-primary transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link to="/role-select" className="btn-primary btn-sm">
              Get Started <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative hero-gradient overflow-hidden">
        {/* NCC watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] text-white opacity-[0.04] pointer-events-none select-none">
          <NCCSymbol className="w-full h-full" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-sky-300 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
              <Star size={12} className="text-yellow-400" />
              Official NCC Management Platform
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-3">
              NCC <span className="text-primary-400">FORCE</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-sky-200 mb-6 tracking-wide">
              Smart NCC Cadet Management System
            </p>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
              Empowering NCC officers and cadets with one centralized platform to manage attendance, training,
              camps, certificates, ranks, leave and achievements.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/role-select" className="btn-primary btn-lg shadow-lg shadow-primary/30">
                Get Started <ChevronRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-lg border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 10 0 30L0 60Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">{s.value}</div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">
              Everything in One Place
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-navy-500 mb-4">
              Built for NCC Operations
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Every module you need to run a professional NCC unit — from attendance to camp management to certificate tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card-hover group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-navy-50 group-hover:bg-primary flex items-center justify-center mb-4 transition-colors duration-200">
                  <f.icon size={20} className="text-navy-400 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-bold text-navy-500 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE PREVIEW ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-navy-500 mb-4">
              Two Dedicated Experiences
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Purpose-built dashboards for NCC Officers and Cadets with role-specific tools and permissions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Officer card */}
            <div className="card-hover border-t-4 border-t-primary text-center group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary transition-colors duration-200">
                <span className="text-3xl group-hover:text-white transition-colors duration-200">🪖</span>
              </div>
              <h3 className="text-xl font-bold text-navy-500 mb-2">NCC Officer</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Manage cadets, attendance, camps, training, certificates, leave requests and generate reports.
              </p>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                {['Full cadet management','Attendance control','Camp & training admin','Reports & analytics'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/login/officer" className="btn-primary w-full justify-center">
                Login as Officer
              </Link>
            </div>

            {/* Cadet card */}
            <div className="card-hover border-t-4 border-t-sky text-center group">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-sky transition-colors duration-200">
                <span className="text-3xl">🎖</span>
              </div>
              <h3 className="text-xl font-bold text-navy-500 mb-2">Cadet</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Access your NCC profile, attendance, training, camps, certificates, leave and achievements.
              </p>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                {['Personal NCC dashboard','Attendance & training view','Leave application','Certificates & achievements'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/login/cadet" className="btn-sky w-full justify-center">
                Login as Cadet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="hero-gradient py-16 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 text-white opacity-[0.04] pointer-events-none">
          <NCCSymbol className="w-full h-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to modernize your NCC unit?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join the digital transformation of NCC management.
          </p>
          <Link to="/role-select" className="btn-primary btn-lg shadow-lg shadow-primary/30">
            Get Started Now <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-navy-500 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">NCC FORCE</span>
          </div>
          <p className="text-xs text-center">
            © 2026 NCC FORCE — Smart NCC Cadet Management System. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
}
