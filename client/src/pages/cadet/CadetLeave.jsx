import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/Badge';
import { leaveRequests as initRequests } from '../../data/mockData';
import { Plus, FileText, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['Medical Leave','Family Function','Academic Leave','Personal','Emergency','Sports/Event'];
const empty = { type:LEAVE_TYPES[0], fromDate:'', toDate:'', reason:'' };

export default function CadetLeave() {
  const { user } = useAuth();
  const [requests, setReqs] = useState(initRequests);
  const [showForm, setForm] = useState(false);
  const [formData, setFD]  = useState(empty);
  const [errors, setErrors] = useState({});

  const myReqs = requests.filter(r=>r.cadetId===user?.id).sort((a,b)=>b.appliedDate.localeCompare(a.appliedDate));
  const pending  = myReqs.filter(r=>r.status==='Pending').length;
  const approved = myReqs.filter(r=>r.status==='Approved').length;

  const f = (k,v) => { setFD(p=>({...p,[k]:v})); if (errors[k]) setErrors(p=>({...p,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!formData.fromDate) e.fromDate = 'From date required.';
    if (!formData.toDate)   e.toDate   = 'To date required.';
    if (!formData.reason.trim()) e.reason = 'Please provide a reason.';
    if (formData.fromDate && formData.toDate && formData.toDate < formData.fromDate)
      e.toDate = 'To date must be after from date.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newReq = {
      ...formData,
      id: `lv${Date.now()}`,
      cadetId: user?.id,
      status: 'Pending',
      officerRemarks: null,
      appliedDate: new Date().toISOString().split('T')[0],
      decidedDate: null,
    };
    setReqs(p=>[newReq,...p]);
    toast.success('Leave application submitted successfully.');
    setForm(false);
    setFD(empty);
  };

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leave</h1>
          <p className="page-subtitle">Leave applications and status</p>
        </div>
        <button onClick={()=>{setFD(empty);setErrors({});setForm(true);}} className="btn-primary btn-sm">
          <Plus size={15}/> Apply for Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Total',    value:myReqs.length,   color:'text-navy-500' },
          { label:'Pending',  value:pending,          color:'text-yellow-600' },
          { label:'Approved', value:approved,         color:'text-green-600' },
        ].map(s=>(
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {myReqs.length===0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 text-gray-200"/>
          <p>No leave applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myReqs.map(r=>(
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-navy-500">{r.type}</span>
                    <StatusBadge status={r.status}/>
                  </div>
                  <p className="text-sm text-gray-500">{r.fromDate} → {r.toDate}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.reason}</p>
                  {r.officerRemarks && (
                    <div className="mt-2 flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
                      <AlertCircle size={12} className="text-sky mt-0.5 flex-shrink-0"/>
                      <span><span className="font-semibold">Officer: </span>{r.officerRemarks}</span>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  <p>Applied: {r.appliedDate}</p>
                  {r.decidedDate && <p>Decided: {r.decidedDate}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply modal */}
      <Modal isOpen={showForm} onClose={()=>setForm(false)} title="Apply for Leave" size="sm"
        footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSubmit} className="btn-primary btn-sm"><Check size={15}/> Submit</button></>}
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Leave Type</label>
            <select className="input" value={formData.type} onChange={e=>f('type',e.target.value)}>
              {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">From Date *</label>
              <input type="date" className={`input ${errors.fromDate?'input-error':''}`} value={formData.fromDate} onChange={e=>f('fromDate',e.target.value)}/>
              {errors.fromDate && <p className="text-xs text-red-500 mt-1">{errors.fromDate}</p>}
            </div>
            <div className="form-group">
              <label className="label">To Date *</label>
              <input type="date" className={`input ${errors.toDate?'input-error':''}`} value={formData.toDate} onChange={e=>f('toDate',e.target.value)}/>
              {errors.toDate && <p className="text-xs text-red-500 mt-1">{errors.toDate}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Reason *</label>
            <textarea className={`input ${errors.reason?'input-error':''}`} rows={4} value={formData.reason} onChange={e=>f('reason',e.target.value)} placeholder="Explain the reason for leave…"/>
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
          </div>
          <p className="text-xs text-gray-400">Your application will be reviewed by your NCC Officer.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
