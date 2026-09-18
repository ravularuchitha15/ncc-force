import { useState } from 'react';
import { Search, FileText, Check, X, Eye, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import { leaveRequests as initRequests, cadets } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function LeaveManagement() {
  const [requests, setReqs] = useState(initRequests);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewReq, setView]  = useState(null);
  const [remarks, setRemarks] = useState('');

  const filtered = requests.filter(r => {
    const cadet = cadets.find(c=>c.id===r.cadetId);
    const q = search.toLowerCase();
    const matchQ = !q || cadet?.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    const matchF = filter==='All' || r.status===filter;
    return matchQ && matchF;
  });

  const handleDecision = (id, status) => {
    setReqs(p=>p.map(r=>r.id===id?{...r,status,officerRemarks:remarks,decidedDate:new Date().toISOString().split('T')[0]}:r));
    toast.success(`Leave request ${status.toLowerCase()}.`);
    setView(null); setRemarks('');
  };

  const pending   = requests.filter(r=>r.status==='Pending').length;
  const approved  = requests.filter(r=>r.status==='Approved').length;
  const rejected  = requests.filter(r=>r.status==='Rejected').length;

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="page-subtitle">{requests.length} total requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Pending',  value:pending,  color:'text-yellow-600 bg-yellow-50',  filter:'Pending' },
          { label:'Approved', value:approved, color:'text-green-600 bg-green-50',    filter:'Approved' },
          { label:'Rejected', value:rejected, color:'text-red-500 bg-red-50',        filter:'Rejected' },
        ].map(s=>(
          <button key={s.label} onClick={()=>setFilter(f=>f===s.filter?'All':s.filter)}
            className={`card text-center transition-all ${filter===s.filter?'ring-2 ring-primary':''}`}>
            <p className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="card mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by cadet name or leave type…" className="input pl-9"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="input w-auto">
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filtered.length===0 ? (
        <div className="card"><EmptyState icon={FileText} title="No leave requests found"/></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Cadet</th><th>Leave Type</th><th>From</th><th>To</th><th>Applied</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r=>{
                const cadet = cadets.find(c=>c.id===r.cadetId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-500 flex-shrink-0">{cadet?.name?.charAt(0)}</div>
                        <span className="font-semibold text-navy-500">{cadet?.name}</span>
                      </div>
                    </td>
                    <td>{r.type}</td>
                    <td>{r.fromDate}</td>
                    <td>{r.toDate}</td>
                    <td className="text-gray-400 text-xs">{r.appliedDate}</td>
                    <td className="max-w-[140px] truncate text-xs text-gray-400">{r.reason}</td>
                    <td><StatusBadge status={r.status}/></td>
                    <td>
                      <button onClick={()=>{setView(r);setRemarks(r.officerRemarks||'');}} className="p-1.5 rounded hover:bg-sky-50 text-sky">
                        <Eye size={15}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View + decision modal */}
      <Modal isOpen={!!viewReq} onClose={()=>setView(null)} title="Leave Request Details" size="md">
        {viewReq && (() => {
          const cadet = cadets.find(c=>c.id===viewReq.cadetId);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center font-bold text-navy-600 text-sm">{cadet?.name?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-navy-500">{cadet?.name}</p>
                  <p className="text-xs font-mono text-gray-400">{cadet?.regNo}</p>
                </div>
                <div className="ml-auto"><StatusBadge status={viewReq.status}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Leave Type', value:viewReq.type },
                  { label:'Applied On', value:viewReq.appliedDate },
                  { label:'From Date',  value:viewReq.fromDate },
                  { label:'To Date',    value:viewReq.toDate },
                ].map(r=>(
                  <div key={r.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                    <p className="text-sm font-semibold text-navy-500">{r.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="label">Reason</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewReq.reason}</p>
              </div>
              {viewReq.status === 'Pending' && (
                <div>
                  <label className="label">Officer Remarks</label>
                  <textarea
                    className="input" rows={3}
                    value={remarks} onChange={e=>setRemarks(e.target.value)}
                    placeholder="Add remarks (optional)…"
                  />
                  <div className="flex gap-3 mt-3">
                    <button onClick={()=>handleDecision(viewReq.id,'Approved')} className="btn-success flex-1 justify-center">
                      <Check size={15}/> Approve
                    </button>
                    <button onClick={()=>handleDecision(viewReq.id,'Rejected')} className="btn-danger flex-1 justify-center">
                      <X size={15}/> Reject
                    </button>
                  </div>
                </div>
              )}
              {viewReq.status !== 'Pending' && viewReq.officerRemarks && (
                <div>
                  <p className="label">Officer Remarks</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewReq.officerRemarks}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </DashboardLayout>
  );
}
