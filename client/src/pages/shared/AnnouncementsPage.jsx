import { useState } from 'react';
import { Megaphone, Plus, Search, X, Check, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { announcements as initAnn } from '../../data/mockData';
import toast from 'react-hot-toast';

const empty = { title:'', message:'', audience:'All Cadets', priority:'Medium' };

export default function AnnouncementsPage({ role }) {
  const [anns, setAnns]      = useState(initAnn);
  const [search, setSearch]  = useState('');
  const [showForm, setForm]  = useState(false);
  const [formData, setFD]    = useState(empty);
  const [errors, setErrors]  = useState({});
  const [viewAnn, setView]   = useState(null);

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const filtered = anns.filter(a=>{
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q);
  });

  const validate = () => {
    const e = {};
    if (!formData.title.trim())   e.title   = 'Title required.';
    if (!formData.message.trim()) e.message = 'Message required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setAnns(p=>[{
      ...formData,
      id: `an${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Lt. Col. Rajesh Kumar',
      attachment: null,
    },...p]);
    toast.success('Announcement published.');
    setForm(false);
    setFD(empty);
  };

  const priorityBadge = { High:'badge-red', Medium:'badge-sky', Low:'badge-gray' };

  return (
    <DashboardLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">{anns.length} announcement{anns.length!==1?'s':''}</p>
        </div>
        {role==='officer' && (
          <button onClick={()=>{setFD(empty);setErrors({});setForm(true);}} className="btn-primary btn-sm">
            <Plus size={15}/> New Announcement
          </button>
        )}
      </div>

      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search announcements…" className="input pl-9"/>
          {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="card"><EmptyState icon={Megaphone} title="No announcements found"/></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a=>(
            <div key={a.id} className={`card-hover cursor-pointer border-l-4 ${a.priority==='High'?'border-l-primary':a.priority==='Medium'?'border-l-sky':'border-l-gray-300'}`}
              onClick={()=>setView(a)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-navy-500 leading-snug">{a.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${priorityBadge[a.priority]||'badge-gray'}`}>{a.priority}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.message}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{a.date}</span>
                <span>By: {a.author}</span>
                <span className="badge badge-navy">{a.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal isOpen={!!viewAnn} onClose={()=>setView(null)} title={viewAnn?.title||''} size="md">
        {viewAnn && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`badge ${priorityBadge[viewAnn.priority]||'badge-gray'}`}>{viewAnn.priority} Priority</span>
              <span className="badge badge-navy">{viewAnn.audience}</span>
              <span className="text-xs text-gray-400">{viewAnn.date}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">{viewAnn.message}</p>
            <p className="text-xs text-gray-400">Published by: <span className="text-navy-400 font-medium">{viewAnn.author}</span></p>
          </div>
        )}
      </Modal>

      {/* Publish modal */}
      {role==='officer' && (
        <Modal isOpen={showForm} onClose={()=>setForm(false)} title="New Announcement" size="md"
          footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/> Publish</button></>}
        >
          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Title *</label>
              <input className={`input ${errors.title?'input-error':''}`} value={formData.title} onChange={e=>f('title',e.target.value)} placeholder="Announcement title"/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">Audience</label>
                <select className="input" value={formData.audience} onChange={e=>f('audience',e.target.value)}>
                  <option>All Cadets</option><option>1 Delhi NCC Battalion</option><option>2 Delhi NCC Battalion</option><option>Officers</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Priority</label>
                <select className="input" value={formData.priority} onChange={e=>f('priority',e.target.value)}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Message *</label>
              <textarea className={`input ${errors.message?'input-error':''}`} rows={5} value={formData.message} onChange={e=>f('message',e.target.value)} placeholder="Announcement content…"/>
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
