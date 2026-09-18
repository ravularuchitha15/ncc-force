import { useState, useEffect } from 'react';
import {
  Plus, Search, Eye, Edit2, Trash2, Dumbbell,
  Calendar, Clock, X, Check, BookOpen,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import trainingService from '../../services/training.service';
import toast from 'react-hot-toast';

const emptySession = { title:'', date:'', instructor:'', unit:'', topics:[], duration:'', status:'Upcoming' };

export default function TrainingManagement() {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showForm, setForm]       = useState(false);
  const [editTgt, setEdit]        = useState(null);
  const [formData, setFD]         = useState(emptySession);
  const [errors, setErrors]       = useState({});
  const [deleteTgt, setDelete]    = useState(null);
  const [viewSession, setView]    = useState(null);
  const [topicInput, setTopic]    = useState('');

  const fetchTrainings = async () => {
    try {
      const res = await trainingService.getTrainings();
      if (res.success) {
        setSessions((res.data || []).map(t => ({
          id: t._id,
          title: t.title || t.name || '',
          date: t.date?.split('T')[0] || '',
          instructor: t.instructor?.name || t.instructor || '',
          unit: t.unit || '',
          topics: t.topics || [],
          duration: t.duration || '',
          status: t.status || 'Upcoming',
          assignedCadets: t.assignedCadets || [],
        })));
      }
    } catch (err) {
      toast.error('Failed to load training sessions.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTrainings(); }, []);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) || s.instructor.toLowerCase().includes(q);
  });

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const addTopic = () => {
    if (topicInput.trim()) { f('topics', [...formData.topics, topicInput.trim()]); setTopic(''); }
  };
  const removeTopic = (i) => f('topics', formData.topics.filter((_,idx)=>idx!==i));

  const validate = () => {
    const e = {};
    if (!formData.title.trim())      e.title = 'Title required.';
    if (!formData.date)              e.date = 'Date required.';
    if (!formData.instructor.trim()) e.instructor = 'Instructor required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editTgt) {
        await trainingService.updateTraining(editTgt.id, formData);
        toast.success('Training session updated.');
      } else {
        await trainingService.createTraining(formData);
        toast.success('Training session created.');
      }
      setForm(false);
      fetchTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save training.');
    }
  };

  const openAdd  = () => { setFD(emptySession); setEdit(null); setErrors({}); setTopic(''); setForm(true); };
  const openEdit = (s) => { setFD({...s, topics:[...(s.topics||[])]}); setEdit(s); setErrors({}); setTopic(''); setForm(true); };

  const sessionRecords = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.assignedCadets || [];
  };

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Management</h1>
          <p className="page-subtitle">{sessions.length} sessions total</p>
        </div>
        <button onClick={openAdd} className="btn-primary btn-sm"><Plus size={15}/> New Session</button>
      </div>

      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search training sessions…" className="input pl-9"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Dumbbell} title="No training sessions found"/></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(s => {
            const recs = sessionRecords(s.id);
            return (
              <div key={s.id} className="card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-sky"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy-500 leading-snug">{s.title}</h3>
                      <StatusBadge status={s.status}/>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.instructor}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1.5"><Calendar size={13}/>{s.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13}/>{s.duration}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={13}/>{s.topics.length} topics</span>
                </div>
                {s.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.topics.slice(0,3).map((t,i)=>(
                      <span key={i} className="badge badge-sky text-xs">{t}</span>
                    ))}
                    {s.topics.length>3 && <span className="badge badge-gray text-xs">+{s.topics.length-3}</span>}
                  </div>
                )}
                <div className="text-xs text-gray-400 mb-3">{recs.length} attendance records</div>
                <div className="flex gap-1.5">
                  <button onClick={()=>setView(s)} className="btn-ghost btn-sm flex-1 justify-center"><Eye size={14}/> View</button>
                  <button onClick={()=>openEdit(s)} className="btn-ghost btn-sm flex-1 justify-center"><Edit2 size={14}/> Edit</button>
                  <button onClick={()=>setDelete(s)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={()=>setForm(false)} title={editTgt?`Edit — ${editTgt.title}`:'New Training Session'} size="lg"
        footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/>{editTgt?'Update':'Create'}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 form-group">
            <label className="label">Title *</label>
            <input className={`input ${errors.title?'input-error':''}`} value={formData.title} onChange={e=>f('title',e.target.value)} placeholder="Training session title"/>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label className="label">Date *</label>
            <input type="date" className={`input ${errors.date?'input-error':''}`} value={formData.date} onChange={e=>f('date',e.target.value)}/>
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div className="form-group">
            <label className="label">Duration</label>
            <input className="input" value={formData.duration} onChange={e=>f('duration',e.target.value)} placeholder="e.g. 3 hours"/>
          </div>
          <div className="form-group">
            <label className="label">Instructor *</label>
            <input className={`input ${errors.instructor?'input-error':''}`} value={formData.instructor} onChange={e=>f('instructor',e.target.value)} placeholder="Instructor name"/>
            {errors.instructor && <p className="text-xs text-red-500 mt-1">{errors.instructor}</p>}
          </div>
          <div className="form-group">
            <label className="label">Unit</label>
            <input className="input" value={formData.unit} onChange={e=>f('unit',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="input" value={formData.status} onChange={e=>f('status',e.target.value)}>
              {['Upcoming','Completed'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 form-group">
            <label className="label">Topics</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" value={topicInput} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTopic()} placeholder="Add topic and press Enter"/>
              <button type="button" onClick={addTopic} className="btn-sky btn-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.topics.map((t,i)=>(
                <span key={i} className="badge badge-sky flex items-center gap-1">
                  {t}<button onClick={()=>removeTopic(i)} className="hover:text-red-500"><X size={10}/></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal isOpen={!!viewSession} onClose={()=>setView(null)} title={viewSession?.title||''} size="lg">
        {viewSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Date',       value:viewSession.date },
                { label:'Duration',   value:viewSession.duration },
                { label:'Instructor', value:viewSession.instructor },
                { label:'Status',     value:<StatusBadge status={viewSession.status}/> },
              ].map(r=>(
                <div key={r.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                  <div className="text-sm font-semibold text-navy-500">{r.value}</div>
                </div>
              ))}
            </div>
            {viewSession.topics.length > 0 && (
              <div>
                <p className="label">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {viewSession.topics.map((t,i)=><span key={i} className="badge badge-sky">{t}</span>)}
                </div>
              </div>
            )}
            <div>
              <p className="section-title">Attendance Records ({sessionRecords(viewSession.id).length})</p>
              {sessionRecords(viewSession.id).length===0 ? (
                <p className="text-sm text-gray-400">No records yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Cadet</th><th>Attendance</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {sessionRecords(viewSession.id).map((r, idx) => {
                        const cadetObj = r?.cadet || r;
                        const name = cadetObj?.fullName || cadetObj?.name || (typeof cadetObj === 'string' ? cadetObj : 'Cadet');
                        const status = r?.attendance || r?.status || 'Assigned';
                        return (
                          <tr key={r?._id || r?.id || r?.cadetId || idx}>
                            <td className="font-medium">{name}</td>
                            <td><StatusBadge status={status}/></td>
                            <td>{r.marks ?? r.performanceScore ?? '—'}</td>
                            <td className="font-bold">{r.grade ?? '—'}</td>
                            <td className="text-gray-400 text-xs">{r.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTgt} onClose={()=>setDelete(null)} onConfirm={()=>{setSessions(p=>p.filter(s=>s.id!==deleteTgt.id));toast.success('Session deleted.');}}
        title="Delete Session" message={`Delete "${deleteTgt?.title}"?`} confirmLabel="Delete" variant="danger"/>
    </DashboardLayout>
  );
}
