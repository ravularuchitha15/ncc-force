import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, X, Check, ArrowUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import rankService from '../../services/rank.service';
import cadetService from '../../services/cadet.service';
import toast from 'react-hot-toast';

export default function RankManagement() {
  const [cadets, setCadets]         = useState([]);
  const [promos, setPromos]         = useState([]);
  const [rankHierarchy, setRanks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showForm, setForm]         = useState(false);
  const [formData, setFD]           = useState({ cadetId:'', toRank:'', date: new Date().toISOString().split('T')[0], remarks:'' });
  const [errors, setErrors]         = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cadetRes, rankRes] = await Promise.all([
          cadetService.getCadets(),
          rankService.getRanks(),
        ]);
        if (cadetRes.success) {
          setCadets((cadetRes.data || []).map(c => ({
            id: c._id,
            name: c.fullName || '',
            regNo: c.cadetId || '',
            rank: c.currentRank?.name || 'Cadet',
            wing: c.wing || 'Army',
          })));
        }
        if (rankRes.success) {
          setRanks((rankRes.data || []).map(r => r.name));
        }
      } catch (err) {
        toast.error('Failed to load rank data.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const cadetCurrentRank = (cadetId) => {
    const cadet = cadets.find(c=>c.id===cadetId);
    return cadet?.rank || '';
  };

  const validate = () => {
    const e = {};
    if (!formData.cadetId)       e.cadetId = 'Select a cadet.';
    if (!formData.toRank)        e.toRank = 'Select new rank.';
    if (!formData.date)          e.date = 'Date required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePromote = async () => {
    if (!validate()) return;
    try {
      await rankService.promoteCadet(formData.cadetId, {
        newRank: formData.toRank,
        promotionDate: formData.date,
        reason: formData.remarks,
      });
      const cadet = cadets.find(c=>c.id===formData.cadetId);
      toast.success(`${cadet?.name} promoted to ${formData.toRank}.`);
      setForm(false);
      setFD({ cadetId:'', toRank:'', date: new Date().toISOString().split('T')[0], remarks:'' });
      // Refresh cadets
      const res = await cadetService.getCadets();
      if (res.success) {
        setCadets((res.data || []).map(c => ({
          id: c._id, name: c.fullName || '', regNo: c.cadetId || '',
          rank: c.currentRank?.name || 'Cadet', wing: c.wing || 'Army',
        })));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote cadet.');
    }
  };

  const filtered = cadets.filter(c=>{
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.regNo.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ranks & Promotions</h1>
          <p className="page-subtitle">Manage cadet rank progression</p>
        </div>
        <button onClick={()=>setForm(true)} className="btn-primary btn-sm"><Plus size={15}/> Record Promotion</button>
      </div>

      {/* Rank hierarchy reference */}
      <div className="card mb-6">
        <h3 className="section-title">Rank Hierarchy</h3>
        <div className="flex flex-wrap items-center gap-2">
          {rankHierarchy.map((r,i)=>(
            <div key={r} className="flex items-center gap-1">
              <span className="badge badge-navy text-xs">{r}</span>
              {i<rankHierarchy.length-1 && <ArrowUp size={12} className="text-gray-300 rotate-90"/>}
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cadets…" className="input pl-9"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {/* Cadets rank table */}
      <div className="table-wrapper mb-8">
        <table className="table">
          <thead><tr><th>Cadet</th><th>Reg. No.</th><th>Current Rank</th><th>Wing</th><th>Promotions</th></tr></thead>
          <tbody>
            {filtered.map(c=>{
              const myPromos = promos.filter(p=>p.cadetId===c.id);
              return (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-500 text-sm">{c.name.charAt(0)}</div>
                      <span className="font-semibold text-navy-500">{c.name}</span>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{c.regNo}</span></td>
                  <td>
                    <span className="font-semibold text-primary">{c.rank}</span>
                  </td>
                  <td><span className={`badge text-xs ${c.wing==='Army'?'badge-green':c.wing==='Navy'?'badge-blue':'badge-sky'}`}>{c.wing}</span></td>
                  <td><span className="font-bold text-navy-500">{myPromos.length}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Promotion history */}
      <h2 className="section-title">Promotion History ({promos.length})</h2>
      {promos.length === 0 ? (
        <div className="card"><EmptyState icon={TrendingUp} title="No promotions recorded"/></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Cadet</th><th>From Rank</th><th>To Rank</th><th>Date</th><th>Remarks</th></tr></thead>
            <tbody>
              {[...promos].reverse().map(p=>{
                const c = cadets.find(cd=>cd.id===p.cadetId);
                return (
                  <tr key={p.id}>
                    <td className="font-semibold">{c?.name}</td>
                    <td><span className="badge badge-gray">{p.fromRank}</span></td>
                    <td><span className="badge badge-green flex items-center gap-1"><ArrowUp size={10}/>{p.toRank}</span></td>
                    <td>{p.date}</td>
                    <td className="text-gray-400 text-xs max-w-[180px] truncate">{p.remarks||'—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Promote modal */}
      <Modal isOpen={showForm} onClose={()=>setForm(false)} title="Record Promotion" size="sm"
        footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handlePromote} className="btn-primary btn-sm"><Check size={15}/> Record</button></>}
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Cadet *</label>
            <select className={`input ${errors.cadetId?'input-error':''}`} value={formData.cadetId} onChange={e=>f('cadetId',e.target.value)}>
              <option value="">Select cadet…</option>
              {cadets.map(c=><option key={c.id} value={c.id}>{c.name} ({c.regNo}) — {c.rank}</option>)}
            </select>
            {errors.cadetId && <p className="text-xs text-red-500 mt-1">{errors.cadetId}</p>}
          </div>
          {formData.cadetId && (
            <div className="bg-navy-50 rounded-lg px-3 py-2 text-sm">
              Current Rank: <span className="font-bold text-primary">{cadetCurrentRank(formData.cadetId)}</span>
            </div>
          )}
          <div className="form-group">
            <label className="label">New Rank *</label>
            <select className={`input ${errors.toRank?'input-error':''}`} value={formData.toRank} onChange={e=>f('toRank',e.target.value)}>
              <option value="">Select new rank…</option>
              {rankHierarchy.map(r=><option key={r}>{r}</option>)}
            </select>
            {errors.toRank && <p className="text-xs text-red-500 mt-1">{errors.toRank}</p>}
          </div>
          <div className="form-group">
            <label className="label">Promotion Date *</label>
            <input type="date" className={`input ${errors.date?'input-error':''}`} value={formData.date} onChange={e=>f('date',e.target.value)}/>
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div className="form-group">
            <label className="label">Remarks</label>
            <textarea className="input" rows={3} value={formData.remarks} onChange={e=>f('remarks',e.target.value)} placeholder="Optional remarks…"/>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
