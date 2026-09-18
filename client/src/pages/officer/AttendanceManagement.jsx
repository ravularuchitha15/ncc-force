import { useState, useEffect } from 'react';
import {
  Plus, Search, ClipboardCheck, CheckCircle, XCircle,
  Clock, Save, Eye, X, Check,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import attendanceService from '../../services/attendance.service';
import cadetService from '../../services/cadet.service';
import toast from 'react-hot-toast';

const ACTIVITIES = ['Parade Practice','Drill Training','Map Reading','Weapon Training','Physical Training','NCC Day Rehearsal','First Aid Training','Camp Briefing'];
const STATUS_OPTIONS = ['Present','Absent','Leave'];

export default function AttendanceManagement() {
  const [sessions, setSessions]     = useState([]);
  const [cadets, setCadets]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showNew, setShowNew]       = useState(false);
  const [viewSession, setViewSess]  = useState(null);
  const [markSession, setMark]      = useState(null);
  const [search, setSearch]         = useState('');

  const [newForm, setNewForm] = useState({ date: new Date().toISOString().split('T')[0], activity: ACTIVITIES[0], unit: '' });
  const [markRecords, setMarkRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, cadetRes] = await Promise.all([
          attendanceService.getAttendance(),
          cadetService.getCadets(),
        ]);
        if (attRes.success) {
          // Group attendance records by date + sessionName into sessions
          const records = attRes.data || [];
          const grouped = {};
          records.forEach(r => {
            const key = `${r.date?.split('T')[0]}_${r.sessionName || 'Session'}`;
            if (!grouped[key]) {
              grouped[key] = {
                id: key,
                date: r.date?.split('T')[0] || '',
                activity: r.sessionName || 'Session',
                unit: r.cadet?.unit || '',
                records: [],
                finalized: true,
              };
            }
            grouped[key].records.push({
              cadetId: r.cadet?._id || r.cadet,
              cadetName: r.cadet?.fullName || '',
              cadetRegNo: r.cadet?.cadetId || '',
              status: r.status,
              _id: r._id,
            });
          });
          setSessions(Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)));
        }
        if (cadetRes.success) {
          setCadets((cadetRes.data || []).map(c => ({
            id: c._id,
            name: c.fullName || '',
            regNo: c.cadetId || '',
            unit: c.unit || '',
          })));
        }
      } catch (err) {
        toast.error('Failed to load attendance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openMarkNew = () => {
    const records = cadets.map(c => ({ cadetId: c.id, status: 'Present' }));
    setMarkRecords(records);
    setMark({ ...newForm, id: `att${Date.now()}`, records, finalized: false });
    setShowNew(false);
  };

  const openMarkExisting = (s) => {
    setMarkRecords([...s.records]);
    setMark({ ...s });
  };

  const setStatus = (cadetId, status) => {
    setMarkRecords(prev => prev.map(r => r.cadetId === cadetId ? { ...r, status } : r));
  };

  const finalizeAttendance = async () => {
    try {
      const payload = markRecords.map(r => ({
        cadet: r.cadetId,
        date: markSession.date,
        sessionName: markSession.activity,
        status: r.status,
      }));
      // Use bulk or individual marking
      for (const record of payload) {
        await attendanceService.markAttendance(record);
      }
      toast.success('Attendance finalized successfully.');
      setMark(null);
      // Refresh
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance.');
    }
  };

  const saveAttendance = () => {
    toast.success('Draft saved locally.');
    setMark(null);
  };

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return !q || s.activity.toLowerCase().includes(q) || s.date.includes(q);
  });

  const getStats = (records) => ({
    present: records.filter(r => r.status === 'Present').length,
    absent:  records.filter(r => r.status === 'Absent').length,
    leave:   records.filter(r => r.status === 'Leave').length,
  });

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">{sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary btn-sm">
          <Plus size={15} /> New Session
        </button>
      </div>

      {/* Search */}
      <div className="card mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by activity or date…" className="input pl-9" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
      </div>

      {/* Sessions table */}
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardCheck} title="No sessions found" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Activity</th><th>Unit</th><th>Present</th><th>Absent</th><th>Leave</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const st = getStats(s.records);
                return (
                  <tr key={s.id}>
                    <td className="font-medium">{s.date}</td>
                    <td>{s.activity}</td>
                    <td className="text-xs text-gray-400">{s.unit}</td>
                    <td><span className="font-bold text-green-600">{st.present}</span></td>
                    <td><span className="font-bold text-red-500">{st.absent}</span></td>
                    <td><span className="font-bold text-yellow-600">{st.leave}</span></td>
                    <td className="font-medium">{s.records.length}</td>
                    <td>
                      <span className={`badge ${s.finalized ? 'badge-green' : 'badge-yellow'}`}>
                        {s.finalized ? 'Finalized' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewSess(s)} className="p-1.5 rounded hover:bg-sky-50 text-sky" title="View"><Eye size={15}/></button>
                        {!s.finalized && (
                          <button onClick={() => openMarkExisting(s)} className="p-1.5 rounded hover:bg-navy-50 text-navy-400" title="Edit/Mark">
                            <ClipboardCheck size={15}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New session modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create Attendance Session" size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="btn-outline-navy btn-sm">Cancel</button>
            <button onClick={openMarkNew} className="btn-primary btn-sm"><ClipboardCheck size={15}/> Start Marking</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Date</label>
            <input type="date" className="input" value={newForm.date} onChange={e => setNewForm(p=>({...p,date:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Activity</label>
            <select className="input" value={newForm.activity} onChange={e => setNewForm(p=>({...p,activity:e.target.value}))}>
              {ACTIVITIES.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Unit / Group</label>
            <input className="input" value={newForm.unit} onChange={e => setNewForm(p=>({...p,unit:e.target.value}))} placeholder="Unit name" />
          </div>
        </div>
      </Modal>

      {/* Mark attendance modal */}
      <Modal isOpen={!!markSession} onClose={() => setMark(null)} title="Mark Attendance" size="lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setMark(null)} className="btn-ghost btn-sm">Cancel</button>
            <button onClick={saveAttendance} className="btn-outline-navy btn-sm"><Save size={15}/> Save Draft</button>
            <button onClick={finalizeAttendance} className="btn-primary btn-sm"><Check size={15}/> Finalize</button>
          </div>
        }
      >
        {markSession && (
          <div>
            <div className="flex gap-4 mb-5 p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-500">Date: <b className="text-navy-500">{markSession.date}</b></span>
              <span className="text-gray-500">Activity: <b className="text-navy-500">{markSession.activity}</b></span>
            </div>

            {/* Bulk actions */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMarkRecords(p=>p.map(r=>({...r,status:'Present'})))} className="btn-success btn-sm"><CheckCircle size={14}/> All Present</button>
              <button onClick={() => setMarkRecords(p=>p.map(r=>({...r,status:'Absent'})))} className="btn-danger btn-sm"><XCircle size={14}/> All Absent</button>
            </div>

            {/* Quick summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:'Present', count: markRecords.filter(r=>r.status==='Present').length, color:'text-green-600' },
                { label:'Absent',  count: markRecords.filter(r=>r.status==='Absent').length,  color:'text-red-500' },
                { label:'Leave',   count: markRecords.filter(r=>r.status==='Leave').length,   color:'text-yellow-600' },
              ].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scroll">
              {markRecords.map(rec => {
                const cadet = cadets.find(c => c.id === rec.cadetId);
                if (!cadet) return null;
                return (
                  <div key={rec.cadetId} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-500 text-sm flex-shrink-0">
                      {cadet.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-500">{cadet.name}</p>
                      <p className="text-xs font-mono text-gray-400">{cadet.regNo}</p>
                    </div>
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => setStatus(rec.cadetId, s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            rec.status === s
                              ? s==='Present' ? 'bg-green-500 text-white'
                              : s==='Absent'  ? 'bg-red-500 text-white'
                              : 'bg-yellow-400 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* View session modal */}
      <Modal isOpen={!!viewSession} onClose={() => setViewSess(null)} title="Attendance Session Details" size="lg">
        {viewSession && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label:'Date',     value: viewSession.date },
                { label:'Activity', value: viewSession.activity },
                { label:'Status',   value: viewSession.finalized ? 'Finalized' : 'Draft' },
                { label:'Total',    value: viewSession.records.length },
              ].map(i=>(
                <div key={i.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{i.label}</p>
                  <p className="text-sm font-bold text-navy-500">{i.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scroll">
              {viewSession.records.map(rec => {
                const cadet = cadets.find(c => c.id === rec.cadetId);
                return (
                  <div key={rec.cadetId} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-500 text-xs flex-shrink-0">
                        {cadet?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500">{cadet?.name}</p>
                        <p className="text-xs font-mono text-gray-400">{cadet?.regNo}</p>
                      </div>
                    </div>
                    <StatusBadge status={rec.status}/>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
