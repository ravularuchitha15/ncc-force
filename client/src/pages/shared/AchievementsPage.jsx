import { useState, useEffect } from 'react';
import { Trophy, Plus, Search, X, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import achievementService from '../../services/achievement.service';
import cadetService from '../../services/cadet.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Award','Medal','Certificate','Recognition','Competition'];
const CAT_ICONS  = { Award:'🏆', Medal:'🥇', Certificate:'📜', Recognition:'🌟', Competition:'🎯' };

const empty = { cadetId:'', title:'', category:CATEGORIES[0], date:'', description:'', awardedBy:'' };

export default function AchievementsPage({ role }) {
  const { user } = useAuth();
  const [achievements, setAch] = useState([]);
  const [cadets, setCadets]    = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');
  const [catFilter, setCat]    = useState('All');
  const [showForm, setForm]    = useState(false);
  const [formData, setFD]      = useState(empty);
  const [errors, setErrors]    = useState({});

  const fetchData = async () => {
    try {
      const [achRes, cadetRes] = await Promise.all([
        achievementService.getAchievements(),
        role === 'officer' ? cadetService.getCadets() : Promise.resolve({ success: true, data: [] }),
      ]);
      if (achRes.success) setAch((achRes.data || []).map(a => ({
        id: a._id, cadetId: a.cadet?._id || a.cadet, cadetName: a.cadet?.fullName || '',
        title: a.title || '', category: a.category || '', date: a.date?.split('T')[0] || '',
        description: a.description || '', awardedBy: a.awardedBy || '',
      })));
      if (cadetRes.success) setCadets((cadetRes.data || []).map(c => ({ id: c._id, name: c.fullName || '', regNo: c.cadetId || '' })));
    } catch (err) { toast.error('Failed to load achievements.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const myAch = role==='cadet' ? achievements.filter(a=>a.cadetId===user?.cadetProfile?._id) : achievements;

  const filtered = myAch.filter(a=>{
    const q = search.toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.cadetName?.toLowerCase().includes(q);
    const matchC = catFilter==='All' || a.category===catFilter;
    return matchQ && matchC;
  });

  const validate = () => {
    const e = {};
    if (role==='officer' && !formData.cadetId) e.cadetId = 'Select a cadet.';
    if (!formData.title.trim())  e.title = 'Title required.';
    if (!formData.date)          e.date  = 'Date required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await achievementService.createAchievement({
        cadet: role==='cadet' ? user?.cadetProfile?._id : formData.cadetId,
        title: formData.title, category: formData.category,
        date: formData.date, description: formData.description, awardedBy: formData.awardedBy,
      });
      toast.success('Achievement recorded.');
      setForm(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.'); }
  };

  return (
    <DashboardLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{role==='cadet'?'My ':''}Achievements</h1>
          <p className="page-subtitle">{filtered.length} achievement{filtered.length!==1?'s':''}</p>
        </div>
        {role==='officer' && (
          <button onClick={()=>{setFD(empty);setErrors({});setForm(true);}} className="btn-primary btn-sm">
            <Plus size={15}/> Record Achievement
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All',...CATEGORIES].map(c=>(
          <button key={c} onClick={()=>setCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${catFilter===c?'bg-primary text-white':'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}>
            {c!=='All'&&<span className="mr-1">{CAT_ICONS[c]}</span>}{c}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search achievements…" className="input pl-9"/>
          {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="card"><EmptyState icon={Trophy} title="No achievements found"/></div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(a=>{
            const cadet = cadets.find(c=>c.id===a.cadetId);
            return (
              <div key={a.id} className="card-hover border-t-4 border-t-yellow-400">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl flex-shrink-0">{CAT_ICONS[a.category]||'🏅'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="badge badge-yellow text-xs mb-1">{a.category}</span>
                    <h3 className="font-bold text-navy-500 leading-snug">{a.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{a.description}</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Date: <span className="text-navy-400 font-medium">{a.date}</span></p>
                  <p>Awarded by: <span className="text-navy-400 font-medium">{a.awardedBy}</span></p>
                  {role==='officer' && cadet && (
                    <p>Cadet: <span className="text-navy-400 font-medium">{cadet.name} ({cadet.regNo})</span></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal (officer) */}
      {role==='officer' && (
        <Modal isOpen={showForm} onClose={()=>setForm(false)} title="Record Achievement" size="md"
          footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/> Record</button></>}
        >
          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Cadet *</label>
              <select className={`input ${errors.cadetId?'input-error':''}`} value={formData.cadetId} onChange={e=>f('cadetId',e.target.value)}>
                <option value="">Select cadet…</option>
                {cadets.map(c=><option key={c.id} value={c.id}>{c.name} ({c.regNo})</option>)}
              </select>
              {errors.cadetId && <p className="text-xs text-red-500 mt-1">{errors.cadetId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">Category</label>
                <select className="input" value={formData.category} onChange={e=>f('category',e.target.value)}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Date *</label>
                <input type="date" className={`input ${errors.date?'input-error':''}`} value={formData.date} onChange={e=>f('date',e.target.value)}/>
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Title *</label>
              <input className={`input ${errors.title?'input-error':''}`} value={formData.title} onChange={e=>f('title',e.target.value)} placeholder="Achievement title"/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={formData.description} onChange={e=>f('description',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="label">Awarded By</label>
              <input className="input" value={formData.awardedBy} onChange={e=>f('awardedBy',e.target.value)}/>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
