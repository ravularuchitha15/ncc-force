import { useState } from 'react';
import { Settings, Bell, Lock, Eye, EyeOff, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage({ role }) {
  const { user } = useAuth();
  const [notifPrefs, setNotif] = useState({ leaveUpdates:true, trainingReminders:true, campAlerts:true, rankUpdates:true, announcements:true });
  const [showPwd, setShowPwd] = useState({ current:false, new:false, confirm:false });
  const [pwdForm, setPwd]     = useState({ current:'', new:'', confirm:'' });

  const toggleNotif = (k) => setNotif(p=>({...p,[k]:!p[k]}));

  const handleChangePwd = () => {
    if (!pwdForm.current) { toast.error('Enter current password.'); return; }
    if (pwdForm.new.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (pwdForm.new !== pwdForm.confirm) { toast.error('Passwords do not match.'); return; }
    toast.success('Password changed successfully.');
    setPwd({ current:'', new:'', confirm:'' });
  };

  return (
    <DashboardLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your preferences and security</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {/* Notification preferences */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-primary"/>
            <h3 className="font-bold text-navy-500">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            {[
              { key:'leaveUpdates',       label:'Leave Updates',       desc:'Get notified when leave is approved/rejected' },
              { key:'trainingReminders',  label:'Training Reminders',  desc:'Reminders for upcoming training sessions' },
              { key:'campAlerts',         label:'Camp Alerts',         desc:'Notifications about camp registration and updates' },
              { key:'rankUpdates',        label:'Rank Updates',        desc:'Notifications when rank changes occur' },
              { key:'announcements',      label:'Announcements',       desc:'General announcements from officers' },
            ].map(item=>(
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-navy-500">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={()=>toggleNotif(item.key)}
                  className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${notifPrefs[item.key]?'bg-primary':'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${notifPrefs[item.key]?'left-5':'left-0.5'}`}/>
                </button>
              </div>
            ))}
          </div>
          <button onClick={()=>toast.success('Preferences saved.')} className="btn-primary btn-sm mt-5">
            <Check size={15}/> Save Preferences
          </button>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-primary"/>
            <h3 className="font-bold text-navy-500">Change Password</h3>
          </div>
          <div className="space-y-4">
            {[
              { key:'current', label:'Current Password' },
              { key:'new',     label:'New Password' },
              { key:'confirm', label:'Confirm New Password' },
            ].map(f=>(
              <div key={f.key} className="form-group">
                <label className="label">{f.label}</label>
                <div className="relative">
                  <input
                    type={showPwd[f.key]?'text':'password'}
                    className="input pr-10"
                    value={pwdForm[f.key]}
                    onChange={e=>setPwd(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.label}
                  />
                  <button type="button" onClick={()=>setShowPwd(p=>({...p,[f.key]:!p[f.key]}))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd[f.key]?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePwd} className="btn-primary btn-sm w-full justify-center">
              <Lock size={15}/> Update Password
            </button>
          </div>
        </div>

        {/* Account info */}
        <div className="card md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-primary"/>
            <h3 className="font-bold text-navy-500">Account Information</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Name</p>
              <p className="text-sm font-semibold text-navy-500">{user?.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Role</p>
              <p className="text-sm font-semibold text-navy-500 capitalize">{user?.role}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">{role==='cadet'?'Reg. Number':'Email'}</p>
              <p className="text-sm font-semibold text-navy-500 font-mono">{role==='cadet'?user?.regNo:user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
