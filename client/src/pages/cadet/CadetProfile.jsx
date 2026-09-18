import { useState } from 'react';
import {
  User, Phone, Mail, Building, Calendar, Hash,
  Shield, Star, Edit2, Check, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function CadetProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ phone: user?.phone || '', email: user?.email || '' });

  const handleSave = () => {
    toast.success('Profile updated successfully.');
    setEditing(false);
  };

  const info = [
    { icon: User,      label: 'Full Name',        value: user?.name },
    { icon: Hash,      label: 'Regimental No.',   value: user?.regNo,          mono: true },
    { icon: Shield,    label: 'Current Rank',      value: user?.rank },
    { icon: Star,      label: 'Wing',              value: user?.wing },
    { icon: Building,  label: 'NCC Unit',          value: user?.unit },
    { icon: Building,  label: 'College / School',  value: user?.college },
    { icon: Calendar,  label: 'Enrollment Date',   value: user?.enrollmentDate },
    { icon: Calendar,  label: 'Batch',             value: user?.batch },
  ];

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your NCC identity and personal details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-outline btn-sm">
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-outline-navy btn-sm">
              <X size={15}/> Cancel
            </button>
            <button onClick={handleSave} className="btn-primary btn-sm">
              <Check size={15}/> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="md:col-span-1">
          <div className="card text-center">
            <div className="w-24 h-24 rounded-3xl bg-navy-500 flex items-center justify-center text-white text-4xl font-black mx-auto mb-4">
              {user?.name?.charAt(0)}
            </div>
            <h2 className="font-bold text-navy-500 text-xl mb-1">{user?.name}</h2>
            <p className="text-sky font-mono text-sm mb-1">{user?.regNo}</p>
            <p className="text-gray-500 text-sm">{user?.rank}</p>
            <div className="divider" />
            <div className="flex justify-around text-center">
              <div>
                <p className="text-xl font-black text-primary">A</p>
                <p className="text-xs text-gray-400">Certificate</p>
              </div>
              <div>
                <p className="text-xl font-black text-navy-500">{user?.wing}</p>
                <p className="text-xs text-gray-400">Wing</p>
              </div>
              <div>
                <p className="text-xl font-black text-sky">Active</p>
                <p className="text-xs text-gray-400">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="section-title">Personal Information</h3>
            <div className="space-y-0">
              {info.map(row => (
                <div key={row.label} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <row.icon size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400 w-36 flex-shrink-0">{row.label}</span>
                  <span className={`text-sm text-navy-500 font-medium ${row.mono ? 'font-mono' : ''}`}>
                    {row.value || '—'}
                  </span>
                </div>
              ))}

              {/* Editable fields */}
              <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-36 flex-shrink-0">Phone</span>
                {editing ? (
                  <input
                    className="input text-sm py-1 flex-1"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                ) : (
                  <span className="text-sm text-navy-500 font-medium">{form.phone || '—'}</span>
                )}
              </div>

              <div className="flex items-center gap-3 py-3">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-36 flex-shrink-0">Email</span>
                {editing ? (
                  <input
                    type="email"
                    className="input text-sm py-1 flex-1"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email address"
                  />
                ) : (
                  <span className="text-sm text-navy-500 font-medium">{form.email || '—'}</span>
                )}
              </div>
            </div>
          </div>

          {editing && (
            <div className="card border border-yellow-200 bg-yellow-50">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Only personal contact details (phone, email) can be updated. 
                For changes to rank, unit, or regimental number, contact your NCC Officer.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
