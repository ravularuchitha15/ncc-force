import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, Filter, Eye, Edit2, Trash2,
  Download, Users, ChevronDown, X, Check,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import cadetService from '../../services/cadet.service';
import toast from 'react-hot-toast';

const WINGS = ['Army', 'Navy', 'Air'];
const RANKS = ['Cadet','Lance Corporal','Corporal','Sergeant','Company Sergeant Major','Junior Under Officer','Senior Under Officer','Under Officer'];
const STATUSES = ['Active', 'Inactive'];

const emptyForm = {
  name:'', regNo:'', dob:'', gender:'Male', phone:'', email:'',
  college:'', unit:'', wing:'Army', enrollmentDate:'', rank:'Cadet',
  batch:'', status:'Active',
};

export default function CadetManagement() {
  const [cadets, setCadets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEdit]     = useState(null);   // null = add, cadet = edit
  const [form, setForm]           = useState(emptyForm);
  const [errors, setErrors]       = useState({});
  const [deleteTarget, setDelete] = useState(null);
  const [showFilters, setFilters] = useState(false);

  // ── Fetch cadets from API ────────────────────────────────────────────────
  const fetchCadets = async () => {
    try {
      const res = await cadetService.getCadets();
      if (res.success) {
        const mapped = (res.data || []).map(c => ({
          id: c._id,
          name: c.fullName || c.name || '',
          regNo: c.cadetId || '',
          dob: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
          gender: c.gender || 'Male',
          phone: c.phone || '',
          email: c.email || '',
          college: c.institution || '',
          unit: c.unit || '',
          wing: c.wing || 'Army',
          enrollmentDate: c.enrollmentDate ? c.enrollmentDate.split('T')[0] : '',
          rank: c.currentRank?.name || c.rank || 'Cadet',
          batch: c.yearSemester || c.batch || '',
          status: c.status || 'Active',
        }));
        setCadets(mapped);
      }
    } catch (err) {
      toast.error('Failed to load cadets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCadets(); }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = cadets.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.regNo.toLowerCase().includes(q) || c.college.toLowerCase().includes(q);
    const matchWing   = wingFilter === 'All' || c.wing === wingFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchWing && matchStatus;
  });

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setEdit(null); setErrors({}); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setEdit(c); setErrors({}); setShowForm(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name = 'Full name is required.';
    if (!form.regNo.trim())          e.regNo = 'Regimental number is required.';
    if (!form.phone.trim())          e.phone = 'Phone number is required.';
    if (!form.college.trim())        e.college = 'College/School is required.';
    if (!form.unit.trim())           e.unit = 'NCC Unit is required.';
    if (!form.enrollmentDate)        e.enrollmentDate = 'Enrollment date is required.';
    if (!form.batch.trim())          e.batch = 'Batch is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        fullName: form.name,
        cadetId: form.regNo,
        dateOfBirth: form.dob,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        institution: form.college,
        unit: form.unit,
        wing: form.wing,
        enrollmentDate: form.enrollmentDate,
        yearSemester: form.batch,
        status: form.status,
      };
      if (editTarget) {
        await cadetService.updateCadet(editTarget.id, payload);
        toast.success('Cadet updated successfully.');
      } else {
        await cadetService.createCadet(payload);
        toast.success('Cadet added successfully.');
      }
      setShowForm(false);
      fetchCadets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cadet.');
    }
  };

  const handleDelete = async () => {
    try {
      await cadetService.deleteCadet(deleteTarget.id);
      toast.success('Cadet record deleted.');
      setDelete(null);
      fetchCadets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cadet.');
    }
  };

  const field = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <DashboardLayout role="officer">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cadet Management</h1>
          <p className="page-subtitle">{filtered.length} cadet{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilters(!showFilters)} className="btn-outline-navy btn-sm">
            <Filter size={15} /> Filters
            {(wingFilter!=='All'||statusFilter!=='All') && <span className="w-2 h-2 rounded-full bg-primary ml-0.5"/>}
          </button>
          <button className="btn-outline-navy btn-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={openAdd} className="btn-primary btn-sm">
            <Plus size={15} /> Add Cadet
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg. number or college…"
              className="input pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          {showFilters && (
            <>
              <select value={wingFilter} onChange={e => setWingFilter(e.target.value)} className="input w-auto">
                <option value="All">All Wings</option>
                {WINGS.map(w => <option key={w}>{w}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="input w-auto">
                <option value="All">All Status</option>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => { setWingFilter('All'); setStatus('All'); }} className="btn-ghost btn-sm text-xs">
                Clear
              </button>
            </>
          )}
        </div>

        {/* Active filter chips */}
        {(wingFilter !== 'All' || statusFilter !== 'All') && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {wingFilter !== 'All' && (
              <span className="badge badge-sky flex items-center gap-1">
                Wing: {wingFilter}
                <button onClick={() => setWingFilter('All')}><X size={10} /></button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="badge badge-navy flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatus('All')}><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="No cadets found" description="Try adjusting your search or filters." />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cadet</th>
                <th>Reg. Number</th>
                <th>Rank</th>
                <th>Wing</th>
                <th>Unit</th>
                <th>College</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td className="text-gray-400 font-medium">{idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-500 text-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-500">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{c.regNo}</span></td>
                  <td><span className="text-sm font-medium">{c.rank}</span></td>
                  <td>
                    <span className={`badge text-xs ${c.wing==='Army'?'badge-green':c.wing==='Navy'?'badge-blue':'badge-sky'}`}>
                      {c.wing}
                    </span>
                  </td>
                  <td className="text-sm max-w-[140px] truncate">{c.unit}</td>
                  <td className="text-sm max-w-[140px] truncate">{c.college}</td>
                  <td className="text-sm">{c.batch}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/officer/cadets/${c.id}`}
                        className="p-1.5 rounded hover:bg-sky-50 text-sky transition-colors"
                        title="View Profile"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded hover:bg-navy-50 text-navy-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDelete(c)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? `Edit Cadet — ${editTarget.name}` : 'Add New Cadet'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-outline-navy btn-sm">Cancel</button>
            <button onClick={handleSave} className="btn-primary btn-sm">
              <Check size={15} /> {editTarget ? 'Update' : 'Save Cadet'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name *" error={errors.name}>
            <input className={`input ${errors.name?'input-error':''}`} value={form.name} onChange={e=>field('name',e.target.value)} placeholder="Full name" />
          </FormField>
          <FormField label="Regimental Number *" error={errors.regNo}>
            <input className={`input font-mono uppercase ${errors.regNo?'input-error':''}`} value={form.regNo} onChange={e=>field('regNo',e.target.value.toUpperCase())} placeholder="e.g. DL-ARY-0001" disabled={!!editTarget} />
          </FormField>
          <FormField label="Date of Birth">
            <input type="date" className="input" value={form.dob} onChange={e=>field('dob',e.target.value)} />
          </FormField>
          <FormField label="Gender">
            <select className="input" value={form.gender} onChange={e=>field('gender',e.target.value)}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </FormField>
          <FormField label="Phone *" error={errors.phone}>
            <input className={`input ${errors.phone?'input-error':''}`} value={form.phone} onChange={e=>field('phone',e.target.value)} placeholder="+91-XXXXXXXXXX" />
          </FormField>
          <FormField label="Email">
            <input type="email" className="input" value={form.email} onChange={e=>field('email',e.target.value)} placeholder="cadet@example.com" />
          </FormField>
          <FormField label="College / School *" error={errors.college}>
            <input className={`input ${errors.college?'input-error':''}`} value={form.college} onChange={e=>field('college',e.target.value)} placeholder="School / College name" />
          </FormField>
          <FormField label="NCC Unit *" error={errors.unit}>
            <input className={`input ${errors.unit?'input-error':''}`} value={form.unit} onChange={e=>field('unit',e.target.value)} placeholder="e.g. 1 Delhi NCC Battalion" />
          </FormField>
          <FormField label="Wing">
            <select className="input" value={form.wing} onChange={e=>field('wing',e.target.value)}>
              {WINGS.map(w=><option key={w}>{w}</option>)}
            </select>
          </FormField>
          <FormField label="Current Rank">
            <select className="input" value={form.rank} onChange={e=>field('rank',e.target.value)}>
              {RANKS.map(r=><option key={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Enrollment Date *" error={errors.enrollmentDate}>
            <input type="date" className={`input ${errors.enrollmentDate?'input-error':''}`} value={form.enrollmentDate} onChange={e=>field('enrollmentDate',e.target.value)} />
          </FormField>
          <FormField label="Batch *" error={errors.batch}>
            <input className={`input ${errors.batch?'input-error':''}`} value={form.batch} onChange={e=>field('batch',e.target.value)} placeholder="e.g. 2023-2026" />
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={e=>field('status',e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={handleDelete}
        title="Delete Cadet"
        message={`Are you sure you want to delete the record for ${deleteTarget?.name} (${deleteTarget?.regNo})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </DashboardLayout>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
