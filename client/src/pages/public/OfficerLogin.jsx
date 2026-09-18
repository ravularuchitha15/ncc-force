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
  const { loginOfficer } = useAuth();
  const navigate = useNavigate();

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

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <p className="text-xs font-semibold text-primary mb-2">Demo Credentials</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Email: <span className="font-mono font-semibold">officer.sharma@ncc.gov.in</span></p>
                <p>Password: <span className="font-mono font-semibold">Password@123</span></p>
              </div>
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
