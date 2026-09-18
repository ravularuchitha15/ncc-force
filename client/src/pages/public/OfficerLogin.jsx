import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NCCSymbol from '../../components/shared/NCCSymbol';
import toast from 'react-hot-toast';

export default function OfficerLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginOfficer, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleAutoFill = (e) => {
    if (e) e.preventDefault();
    setForm({ email: 'officer.sharma@ncc.gov.in', password: 'Password@123' });
    setError('');
  };

  const handleQuickDemoLogin = async (e) => {
    if (e) e.preventDefault();
    const demoEmail = 'officer.sharma@ncc.gov.in';
    const demoPassword = 'Password@123';
    setForm({ email: demoEmail, password: demoPassword });
    setError('');
    setLoading(true);
    const result = await loginOfficer(demoEmail, demoPassword);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back, Major Sharma!');
      navigate('/officer/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      toast.success('Signed in with Google successfully!');
      navigate(result.user?.role === 'officer' ? '/officer/dashboard' : '/cadet/dashboard');
    } else {
      setError(result.error || 'Google sign-in failed');
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    if (!form.password) { setError('Please enter your password.'); return; }

    setLoading(true);
    const result = await loginOfficer(form.email.trim(), form.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome, Officer!');
      navigate('/officer/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] hero-gradient p-12 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 text-white opacity-[0.05] pointer-events-none">
          <NCCSymbol className="w-full h-full" />
        </div>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-black text-lg">NCC FORCE</div>
            <div className="text-navy-200 text-xs">Smart Cadet Management</div>
          </div>
        </Link>

        <div>
          <div className="text-5xl mb-6">🎖️</div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Officer<br />Command Center
          </h2>
          <p className="text-gray-300 leading-relaxed text-base mb-8">
            Log in to your officer dashboard to manage cadets, attendance, camps, training, leave requests and reports.
          </p>
          <div className="space-y-3">
            {['Manage all cadet records', 'Control attendance sessions', 'Administer camps & training', 'Process leave requests', 'Generate operational reports'].map(item => (
              <div key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-500 text-xs">© 2026 NCC FORCE. All rights reserved.</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md mb-6 lg:hidden">
          <Link to="/role-select" className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-500">
            <ChevronLeft size={16} /> Back
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <span className="font-black text-navy-500 text-xl">NCC FORCE</span>
        </div>

        <div className="w-full max-w-md">
          <div className="card animate-fade-in">
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎖️</span>
              </div>
              <h1 className="text-2xl font-black text-navy-500 mb-1">Officer Login</h1>
              <p className="text-sm text-gray-500">Sign in with your registered email</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 animate-fade-in">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="form-group">
                <label htmlFor="email" className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    className="input pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input pl-9 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary font-medium hover:text-primary-600 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            <div className="my-5 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Sign-in via Firebase */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
            </button>

            {/* Demo credentials */}
            <div className="mt-5 p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-primary-700">Demo Officer Account</p>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-xs font-medium text-primary-600 hover:text-primary-800 underline transition-colors"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-xs text-gray-600 space-y-1 mb-3">
                <p>Email: <span className="font-mono font-semibold text-gray-800">officer.sharma@ncc.gov.in</span></p>
                <p>Password: <span className="font-mono font-semibold text-gray-800">Password@123</span></p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-1.5 px-3 bg-primary hover:bg-primary-600 text-white rounded text-xs font-semibold shadow transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span> One-Click Demo Login
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Are you a Cadet?{' '}
            <Link to="/login/cadet" className="text-sky font-semibold hover:text-sky-500 transition-colors">
              Login as Cadet
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
