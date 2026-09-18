import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, Award, Check, X, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import certificateService from '../../services/certificate.service';
import cadetService from '../../services/cadet.service';
import toast from 'react-hot-toast';

const CERT_TYPES = ['A Certificate','B Certificate','C Certificate'];
const empty = { cadetId:'', type:'A Certificate', examDate:'', resultDate:'', result:'Pending', grade:'', certNumber:'', issueDate:'', verified:false, remarks:'' };

export default function CertificateManagement() {
  const [certs, setCerts]     = useState([]);
  const [cadets, setCadets]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showForm, setForm]   = useState(false);
  const [editTgt, setEdit]    = useState(null);
  const [formData, setFD]     = useState(empty);
  const [errors, setErrors]   = useState({});
  const [viewCert, setView]   = useState(null);

  const fetchData = async () => {
    try {
      const [certRes, cadetRes] = await Promise.all([
        certificateService.getCertificates(),
        cadetService.getCadets(),
      ]);
      if (certRes.success) {
        setCerts((certRes.data || []).map(c => ({
          id: c._id,
          cadetId: c.cadet?._id || c.cadet,
          cadetName: c.cadet?.fullName || '',
          type: c.certificateType || c.type || '',
          examDate: c.examDate?.split('T')[0] || '',
          resultDate: c.resultDate?.split('T')[0] || '',
          result: c.result || 'Pending',
          grade: c.grade || '',
          certNumber: c.certificateNumber || '',
          issueDate: c.issueDate?.split('T')[0] || '',
          verified: c.verified || false,
          remarks: c.remarks || '',
        })));
      }
      if (cadetRes.success) {
        setCadets((cadetRes.data || []).map(c => ({ id: c._id, name: c.fullName || '', regNo: c.cadetId || '' })));
      }
    } catch (err) {
      toast.error('Failed to load certificates.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = certs.filter(c => {
    const q = search.toLowerCase();
    return !q || c.cadetName?.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
  });

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const validate = () => {
    const e = {};
    if (!formData.cadetId)    e.cadetId = 'Select a cadet.';
    if (!formData.examDate)   e.examDate = 'Exam date required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openAdd  = () => { setFD(empty); setEdit(null); setErrors({}); setForm(true); };
  const openEdit = (c) => { setFD({...c}); setEdit(c); setErrors({}); setForm(true); };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        cadet: formData.cadetId,
        certificateType: formData.type,
        examDate: formData.examDate,
        result: formData.result,
        grade: formData.grade,
        certificateNumber: formData.certNumber,
        issueDate: formData.issueDate,
        verified: formData.verified,
        remarks: formData.remarks,
      };
      if (editTgt) {
        await certificateService.updateCertificate(editTgt.id, payload);
        toast.success('Certificate updated.');
      } else {
        await certificateService.createCertificate(payload);
        toast.success('Certificate record added.');
      }
      setForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save certificate.');
    }
  };

  const resultColor = { Pass:'badge-green', Fail:'badge-red', Pending:'badge-yellow' };

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="page-subtitle">{certs.length} certificate records</p>
        </div>
        <button onClick={openAdd} className="btn-primary btn-sm"><Plus size={15}/> Add Record</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {CERT_TYPES.map(type => {
          const count = certs.filter(c=>c.type===type&&c.result==='Pass').length;
          return (
            <div key={type} className="card text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Award size={18} className="text-primary"/>
              </div>
              <p className="text-2xl font-black text-navy-500">{count}</p>
              <p className="text-xs text-gray-500">{type} — Passed</p>
            </div>
          );
        })}
      </div>

      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by cadet name or type…" className="input pl-9"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="card"><EmptyState icon={Award} title="No certificate records"/></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Cadet</th><th>Type</th><th>Exam Date</th><th>Result</th><th>Grade</th><th>Cert. No.</th><th>Issue Date</th><th>Verified</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c=>{
                const cadet = cadets.find(cd=>cd.id===c.cadetId);
                return (
                  <tr key={c.id}>
                    <td className="font-semibold">{cadet?.name||'—'}</td>
                    <td><span className="badge badge-navy text-xs">{c.type}</span></td>
                    <td>{c.examDate}</td>
                    <td><StatusBadge status={c.result}/></td>
                    <td className="font-black text-primary">{c.grade||'—'}</td>
                    <td><span className="font-mono text-xs">{c.certNumber||'—'}</span></td>
                    <td>{c.issueDate||'—'}</td>
                    <td>
                      {c.verified
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={13}/>Yes</span>
                        : <span className="text-gray-400 text-xs">No</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={()=>setView(c)} className="p-1.5 rounded hover:bg-sky-50 text-sky"><Eye size={15}/></button>
                        <button onClick={()=>openEdit(c)} className="p-1.5 rounded hover:bg-navy-50 text-navy-400"><Edit2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={()=>setForm(false)} title={editTgt?'Edit Certificate':'Add Certificate Record'} size="lg"
        footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/>{editTgt?'Update':'Save'}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Cadet *</label>
            <select className={`input ${errors.cadetId?'input-error':''}`} value={formData.cadetId} onChange={e=>f('cadetId',e.target.value)} disabled={!!editTgt}>
              <option value="">Select cadet…</option>
              {cadets.map(c=><option key={c.id} value={c.id}>{c.name} ({c.regNo})</option>)}
            </select>
            {errors.cadetId && <p className="text-xs text-red-500 mt-1">{errors.cadetId}</p>}
          </div>
          <div className="form-group">
            <label className="label">Certificate Type</label>
            <select className="input" value={formData.type} onChange={e=>f('type',e.target.value)}>
              {CERT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Exam Date *</label>
            <input type="date" className={`input ${errors.examDate?'input-error':''}`} value={formData.examDate} onChange={e=>f('examDate',e.target.value)}/>
            {errors.examDate && <p className="text-xs text-red-500 mt-1">{errors.examDate}</p>}
          </div>
          <div className="form-group">
            <label className="label">Result Date</label>
            <input type="date" className="input" value={formData.resultDate||''} onChange={e=>f('resultDate',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="label">Result</label>
            <select className="input" value={formData.result} onChange={e=>f('result',e.target.value)}>
              {['Pending','Pass','Fail'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Grade</label>
            <input className="input" value={formData.grade||''} onChange={e=>f('grade',e.target.value)} placeholder="A, B+, etc."/>
          </div>
          <div className="form-group">
            <label className="label">Certificate Number</label>
            <input className="input font-mono" value={formData.certNumber||''} onChange={e=>f('certNumber',e.target.value)} placeholder="NCC/A/DL/2024/xxxx"/>
          </div>
          <div className="form-group">
            <label className="label">Issue Date</label>
            <input type="date" className="input" value={formData.issueDate||''} onChange={e=>f('issueDate',e.target.value)}/>
          </div>
          <div className="sm:col-span-2 form-group">
            <label className="label">Remarks</label>
            <input className="input" value={formData.remarks||''} onChange={e=>f('remarks',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.verified} onChange={e=>f('verified',e.target.checked)}/>
              <span className="label mb-0">Verified</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal isOpen={!!viewCert} onClose={()=>setView(null)} title="Certificate Details" size="sm">
        {viewCert && (
          <div className="space-y-3">
            {[
              { label:'Cadet',    value: cadets.find(c=>c.id===viewCert.cadetId)?.name },
              { label:'Type',     value: viewCert.type },
              { label:'Exam Date',value: viewCert.examDate },
              { label:'Result',   value: <StatusBadge status={viewCert.result}/> },
              { label:'Grade',    value: viewCert.grade||'—' },
              { label:'Cert No.', value: viewCert.certNumber||'—', mono:true },
              { label:'Issued',   value: viewCert.issueDate||'—' },
              { label:'Verified', value: viewCert.verified?'Yes':'No' },
              { label:'Remarks',  value: viewCert.remarks||'—' },
            ].map(r=>(
              <div key={r.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 w-24 flex-shrink-0">{r.label}</span>
                <span className={`text-sm text-navy-500 font-medium ${r.mono?'font-mono':''}`}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
