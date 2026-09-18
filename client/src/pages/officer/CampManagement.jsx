import { useState, useEffect } from 'react';
import {
  Plus, Search, Eye, Edit2, Trash2, Tent,
  MapPin, Calendar, Users, X, Check,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import campService from '../../services/camp.service';
import toast from 'react-hot-toast';

const CAMP_TYPES = ['Annual Training Camp','Republic Day Camp','Adventure Camp','Integration Camp','Pre-RDC Camp','Trekking Camp','Naval Camp','Air Camp'];
const empty = { name:'', type:CAMP_TYPES[0], startDate:'', endDate:'', location:'', description:'', eligibility:'', capacity:'', instructions:'', status:'Upcoming' };

export default function CampManagement() {
  const [camps, setCamps]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showForm, setForm]     = useState(false);
  const [editTarget, setEdit]   = useState(null);
  const [formData, setFD]       = useState(empty);
  const [errors, setErrors]     = useState({});
  const [deleteTgt, setDelete]  = useState(null);
  const [viewCamp, setView]     = useState(null);

  const fetchCamps = async () => {
    try {
      const res = await campService.getCamps();
      if (res.success) {
        setCamps((res.data || []).map(c => ({
          id: c._id,
          name: c.name || '',
          type: c.type || '',
          startDate: c.startDate?.split('T')[0] || '',
          endDate: c.endDate?.split('T')[0] || '',
          location: c.location || '',
          description: c.description || '',
          eligibility: c.eligibility || '',
          capacity: c.capacity || '',
          instructions: c.instructions || '',
          status: c.status || 'Upcoming',
          participants: c.participatingCadets || [],
        })));
      }
    } catch (err) {
      toast.error('Failed to load camps.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCamps(); }, []);

  const filtered = camps.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
  });

  const openAdd  = () => { setFD(empty); setEdit(null); setErrors({}); setForm(true); };
  const openEdit = (c) => { setFD({ ...c }); setEdit(c); setErrors({}); setForm(true); };
  const f = (k, v) => setFD(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!formData.name.trim())      e.name = 'Camp name is required.';
    if (!formData.startDate)        e.startDate = 'Start date is required.';
    if (!formData.endDate)          e.endDate = 'End date is required.';
    if (!formData.location.trim())  e.location = 'Location is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await campService.updateCamp(editTarget.id, formData);
        toast.success('Camp updated.');
      } else {
        await campService.createCamp(formData);
        toast.success('Camp created.');
      }
      setForm(false);
      fetchCamps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save camp.');
    }
  };

  const handleDelete = async () => {
    try {
      await campService.deleteCamp(deleteTgt.id);
      toast.success('Camp deleted.');
      setDelete(null);
      fetchCamps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete camp.');
    }
  };

  const getParticipants = (campId) => {
    const camp = camps.find(c => c.id === campId);
    return camp?.participants || [];
  };

  const statusColor = { Upcoming:'badge-sky', Completed:'badge-green', Ongoing:'badge-yellow' };

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Camp Management</h1>
          <p className="page-subtitle">{camps.length} camps total</p>
        </div>
        <button onClick={openAdd} className="btn-primary btn-sm"><Plus size={15}/> Create Camp</button>
      </div>

      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search camps…" className="input pl-9"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Tent} title="No camps found"/></div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(camp => {
            const parts = getParticipants(camp.id);
            return (
              <div key={camp.id} className="card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Tent size={18} className="text-green-600"/>
                  </div>
                  <StatusBadge status={camp.status}/>
                </div>
                <h3 className="font-bold text-navy-500 mb-1 leading-snug">{camp.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{camp.type}</p>
                <div className="space-y-1.5 text-sm text-gray-500 flex-1">
                  <div className="flex items-center gap-2"><MapPin size={13} className="text-gray-400"/>{camp.location}</div>
                  <div className="flex items-center gap-2"><Calendar size={13} className="text-gray-400"/>{camp.startDate} → {camp.endDate}</div>
                  <div className="flex items-center gap-2"><Users size={13} className="text-gray-400"/>{parts.length} / {camp.capacity || '—'} participants</div>
                </div>
                {camp.capacity && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width:`${Math.min((parts.length/camp.capacity)*100,100)}%`}}/>
                    </div>
                  </div>
                )}
                <div className="divider"/>
                <div className="flex gap-1.5">
                  <button onClick={()=>setView(camp)} className="btn-ghost btn-sm flex-1 justify-center"><Eye size={14}/> View</button>
                  <button onClick={()=>openEdit(camp)} className="btn-ghost btn-sm flex-1 justify-center"><Edit2 size={14}/> Edit</button>
                  <button onClick={()=>setDelete(camp)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={()=>setForm(false)} title={editTarget?`Edit — ${editTarget.name}`:'Create New Camp'} size="lg"
        footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/>{editTarget?'Update':'Create'}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 form-group">
            <label className="label">Camp Name *</label>
            <input className={`input ${errors.name?'input-error':''}`} value={formData.name} onChange={e=>f('name',e.target.value)} placeholder="Camp name"/>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label className="label">Camp Type</label>
            <select className="input" value={formData.type} onChange={e=>f('type',e.target.value)}>
              {CAMP_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="input" value={formData.status} onChange={e=>f('status',e.target.value)}>
              {['Upcoming','Ongoing','Completed'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Start Date *</label>
            <input type="date" className={`input ${errors.startDate?'input-error':''}`} value={formData.startDate} onChange={e=>f('startDate',e.target.value)}/>
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div className="form-group">
            <label className="label">End Date *</label>
            <input type="date" className={`input ${errors.endDate?'input-error':''}`} value={formData.endDate} onChange={e=>f('endDate',e.target.value)}/>
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
          </div>
          <div className="form-group">
            <label className="label">Location *</label>
            <input className={`input ${errors.location?'input-error':''}`} value={formData.location} onChange={e=>f('location',e.target.value)} placeholder="City, State"/>
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
          <div className="form-group">
            <label className="label">Capacity</label>
            <input type="number" className="input" value={formData.capacity} onChange={e=>f('capacity',e.target.value)} placeholder="Max participants"/>
          </div>
          <div className="sm:col-span-2 form-group">
            <label className="label">Eligibility</label>
            <input className="input" value={formData.eligibility} onChange={e=>f('eligibility',e.target.value)} placeholder="Who can apply?"/>
          </div>
          <div className="sm:col-span-2 form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={formData.description} onChange={e=>f('description',e.target.value)} placeholder="Camp description…"/>
          </div>
          <div className="sm:col-span-2 form-group">
            <label className="label">Instructions</label>
            <textarea className="input" rows={2} value={formData.instructions} onChange={e=>f('instructions',e.target.value)} placeholder="Packing list, reporting instructions…"/>
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal isOpen={!!viewCamp} onClose={()=>setView(null)} title={viewCamp?.name||''} size="lg">
        {viewCamp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Type',      value:viewCamp.type },
                { label:'Status',    value:<StatusBadge status={viewCamp.status}/> },
                { label:'Start',     value:viewCamp.startDate },
                { label:'End',       value:viewCamp.endDate },
                { label:'Location',  value:viewCamp.location },
                { label:'Capacity',  value:viewCamp.capacity||'—' },
              ].map(r=>(
                <div key={r.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                  <div className="text-sm font-semibold text-navy-500">{r.value}</div>
                </div>
              ))}
            </div>
            {viewCamp.eligibility && <div><p className="label">Eligibility</p><p className="text-sm text-gray-600">{viewCamp.eligibility}</p></div>}
            {viewCamp.description  && <div><p className="label">Description</p><p className="text-sm text-gray-600">{viewCamp.description}</p></div>}
            {viewCamp.instructions && <div><p className="label">Instructions</p><p className="text-sm text-gray-600">{viewCamp.instructions}</p></div>}

            {/* Participants */}
            <div>
              <p className="section-title">Participants ({getParticipants(viewCamp.id).length})</p>
              {getParticipants(viewCamp.id).length === 0 ? (
                <p className="text-sm text-gray-400">No participants registered.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Cadet</th><th>Reg. No.</th><th>Status</th><th>Performance</th></tr></thead>
                    <tbody>
                      {getParticipants(viewCamp.id).map((cp, idx) => {
                        const name = cp?.fullName || cp?.name || (typeof cp === 'string' ? cp : 'Cadet');
                        const regNo = cp?.cadetId || cp?.regNo || '—';
                        const status = cp?.status || 'Registered';
                        return (
                          <tr key={cp?._id || cp?.id || cp?.cadetId || idx}>
                            <td className="font-medium">{name}</td>
                            <td className="font-mono text-xs">{regNo}</td>
                            <td><StatusBadge status={status}/></td>
                            <td>{cp.performance||'—'}</td>
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

      <ConfirmDialog isOpen={!!deleteTgt} onClose={()=>setDelete(null)} onConfirm={handleDelete}
        title="Delete Camp" message={`Delete "${deleteTgt?.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger"/>
    </DashboardLayout>
  );
}
