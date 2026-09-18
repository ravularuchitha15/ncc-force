import { useState, useEffect } from 'react';
import { Download, FileText, Users, ClipboardCheck, Tent, Dumbbell, Award, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import cadetService from '../../services/cadet.service';
import attendanceService from '../../services/attendance.service';
import campService from '../../services/camp.service';
import trainingService from '../../services/training.service';
import certificateService from '../../services/certificate.service';
import achievementService from '../../services/achievement.service';
import { campParticipants, leaveRequests } from '../../data/mockData';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id:'attendance',   label:'Attendance Report',   icon:ClipboardCheck, color:'bg-sky-100 text-sky' },
  { id:'cadets',       label:'Cadet Report',         icon:Users,          color:'bg-navy-100 text-navy-500' },
  { id:'camps',        label:'Camp Participation',   icon:Tent,           color:'bg-green-100 text-green-600' },
  { id:'training',     label:'Training Report',      icon:Dumbbell,       color:'bg-sky-100 text-sky' },
  { id:'certificates', label:'Certificate Report',   icon:Award,          color:'bg-yellow-100 text-yellow-600' },
  { id:'leave',        label:'Leave Report',         icon:FileText,       color:'bg-orange-100 text-orange-600' },
  { id:'ranks',        label:'Rank Report',          icon:TrendingUp,     color:'bg-primary/10 text-primary' },
  { id:'achievements', label:'Achievement Report',   icon:Award,          color:'bg-purple-100 text-purple-600' },
];

export default function Reports() {
  const [activeReport, setActive] = useState('attendance');
  const [filters, setFilters]     = useState({ wing:'All', unit:'', dateFrom:'', dateTo:'' });
  const [cadets, setCadets]       = useState([]);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [camps, setCamps]         = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cadetRes, attRes, campRes, trainRes, certRes, achRes] = await Promise.all([
          cadetService.getCadets(),
          attendanceService.getAttendance(),
          campService.getCamps(),
          trainingService.getTrainings(),
          certificateService.getCertificates(),
          achievementService.getAchievements(),
        ]);
        if (cadetRes.success) setCadets((cadetRes.data || []).map(c => ({
          id: c._id, name: c.fullName || '', regNo: c.cadetId || '',
          unit: c.unit || '', wing: c.wing || 'Army', rank: c.currentRank?.name || 'Cadet',
          status: c.status || 'Active', college: c.institution || '', batch: c.yearSemester || '',
        })));
        if (attRes.success) setAttendanceSessions(attRes.data || []);
        if (campRes.success) setCamps((campRes.data || []).map(c => ({
          id: c._id, name: c.name || '', type: c.type || '', startDate: c.startDate?.split('T')[0] || '',
          endDate: c.endDate?.split('T')[0] || '', location: c.location || '', status: c.status || '',
        })));
        if (trainRes.success) setTrainingSessions((trainRes.data || []).map(t => ({
          id: t._id, title: t.title || '', date: t.date?.split('T')[0] || '',
          instructor: t.instructor?.name || t.instructor || '', duration: t.duration || '',
          status: t.status || '', topics: t.topics || [],
        })));
        if (certRes.success) setCertificates((certRes.data || []).map(c => ({
          id: c._id, cadetId: c.cadet?._id || c.cadet, cadetName: c.cadet?.fullName || '',
          type: c.certificateType || c.type || '', examDate: c.examDate?.split('T')[0] || '',
          result: c.result || 'Pending', grade: c.grade || '', certNumber: c.certificateNumber || '',
        })));
        if (achRes.success) setAchievements((achRes.data || []).map(a => ({
          id: a._id, cadetId: a.cadet?._id || a.cadet, cadetName: a.cadet?.fullName || '',
          title: a.title || '', category: a.category || '', date: a.date?.split('T')[0] || '',
          awardedBy: a.awardedBy || '',
        })));
      } catch (err) {
        toast.error('Failed to load report data.');
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const ff = (k,v) => setFilters(p=>({...p,[k]:v}));

  const handleExport = (format) => {
    toast.success(`${format} export initiated. File will download shortly.`);
  };

  const filteredCadets = cadets.filter(c => {
    const matchWing = filters.wing==='All' || c.wing===filters.wing;
    const matchUnit = !filters.unit || c.unit.toLowerCase().includes(filters.unit.toLowerCase());
    return matchWing && matchUnit;
  });

  const renderReport = () => {
    switch (activeReport) {
      case 'attendance': {
        const stats = filteredCadets.map(c=>{
          const recs = attendanceSessions.flatMap(s=>s.records.filter(r=>r.cadetId===c.id));
          const p = recs.filter(r=>r.status==='Present').length;
          const t = recs.length;
          return { ...c, present:p, absent:recs.filter(r=>r.status==='Absent').length, leave:recs.filter(r=>r.status==='Leave').length, total:t, pct:t?Math.round((p/t)*100):0 };
        });
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Cadet</th><th>Reg. No.</th><th>Unit</th><th>Present</th><th>Absent</th><th>Leave</th><th>Total</th><th>%</th></tr></thead>
              <tbody>
                {stats.map(c=>(
                  <tr key={c.id}>
                    <td className="font-semibold">{c.name}</td>
                    <td className="font-mono text-xs">{c.regNo}</td>
                    <td className="text-xs text-gray-400">{c.unit}</td>
                    <td className="text-green-600 font-bold">{c.present}</td>
                    <td className="text-red-500 font-bold">{c.absent}</td>
                    <td className="text-yellow-600 font-bold">{c.leave}</td>
                    <td>{c.total}</td>
                    <td><span className={`font-black text-sm ${c.pct>=75?'text-green-600':'text-primary'}`}>{c.pct}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case 'cadets': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>#</th><th>Name</th><th>Reg. No.</th><th>Rank</th><th>Wing</th><th>Unit</th><th>Batch</th><th>Status</th></tr></thead>
              <tbody>
                {filteredCadets.map((c,i)=>(
                  <tr key={c.id}>
                    <td className="text-gray-400">{i+1}</td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="font-mono text-xs">{c.regNo}</td>
                    <td>{c.rank}</td>
                    <td><span className={`badge text-xs ${c.wing==='Army'?'badge-green':c.wing==='Navy'?'badge-blue':'badge-sky'}`}>{c.wing}</span></td>
                    <td className="text-xs">{c.unit}</td>
                    <td>{c.batch}</td>
                    <td><span className={`badge ${c.status==='Active'?'badge-green':'badge-red'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case 'camps': {
        // Build a flat list of all camp participations joined with camp + cadet data
        const rows = campParticipants
          .map(cp => ({
            ...cp,
            camp:  camps.find(c => c.id === cp.campId),
            cadet: cadets.find(c => c.id === cp.cadetId),
          }))
          .filter(r => r.camp && r.cadet);

        return (
          <div>
            {/* Camp summary table */}
            <div className="table-wrapper mb-6">
              <p className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">Camp Summary</p>
              <table className="table">
                <thead>
                  <tr><th>Camp Name</th><th>Type</th><th>Dates</th><th>Location</th><th>Participants</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {camps.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold">{c.name}</td>
                      <td>{c.type}</td>
                      <td className="text-xs">{c.startDate} → {c.endDate}</td>
                      <td>{c.location}</td>
                      <td className="font-bold text-navy-500">{campParticipants.filter(cp => cp.campId === c.id).length}</td>
                      <td>
                        <span className={`badge text-xs ${
                          c.status === 'Completed' ? 'badge-green' :
                          c.status === 'Upcoming'  ? 'badge-sky'   : 'badge-yellow'
                        }`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Participation details */}
            <div className="table-wrapper">
              <p className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">Participation Details</p>
              {rows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No participation records.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr><th>Cadet</th><th>Reg. No.</th><th>Camp</th><th>Type</th><th>Location</th><th>Status</th><th>Performance</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td className="font-semibold">{r.cadet.name}</td>
                        <td className="font-mono text-xs">{r.cadet.regNo}</td>
                        <td>{r.camp.name}</td>
                        <td className="text-xs text-gray-400">{r.camp.type}</td>
                        <td className="text-xs text-gray-400">{r.camp.location}</td>
                        <td>
                          <span className={`badge text-xs ${
                            r.status === 'Completed'  ? 'badge-green' :
                            r.status === 'Registered' ? 'badge-sky'   : 'badge-gray'
                          }`}>{r.status}</span>
                        </td>
                        <td className="font-medium">{r.performance || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      }
      case 'leave': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Cadet</th><th>Type</th><th>From</th><th>To</th><th>Applied</th><th>Status</th></tr></thead>
              <tbody>
                {leaveRequests.map(r=>{
                  const c = cadets.find(cd=>cd.id===r.cadetId);
                  return (
                    <tr key={r.id}>
                      <td className="font-semibold">{c?.name}</td>
                      <td>{r.type}</td>
                      <td>{r.fromDate}</td>
                      <td>{r.toDate}</td>
                      <td>{r.appliedDate}</td>
                      <td><span className={`badge text-xs ${r.status==='Approved'?'badge-green':r.status==='Pending'?'badge-yellow':'badge-red'}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      case 'certificates': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Cadet</th><th>Type</th><th>Exam Date</th><th>Result</th><th>Grade</th><th>Cert No.</th></tr></thead>
              <tbody>
                {certificates.map(c=>{
                  const cadet = cadets.find(cd=>cd.id===c.cadetId);
                  return (
                    <tr key={c.id}>
                      <td className="font-semibold">{cadet?.name}</td>
                      <td>{c.type}</td>
                      <td>{c.examDate}</td>
                      <td><span className={`badge text-xs ${c.result==='Pass'?'badge-green':c.result==='Pending'?'badge-yellow':'badge-red'}`}>{c.result}</span></td>
                      <td className="font-black text-primary">{c.grade||'—'}</td>
                      <td className="font-mono text-xs">{c.certNumber||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      case 'ranks': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Cadet</th><th>From Rank</th><th>To Rank</th><th>Date</th><th>Remarks</th></tr></thead>
              <tbody>
                {promotions.map(p=>{
                  const c = cadets.find(cd=>cd.id===p.cadetId);
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold">{c?.name}</td>
                      <td><span className="badge badge-gray text-xs">{p.fromRank}</span></td>
                      <td><span className="badge badge-green text-xs">{p.toRank}</span></td>
                      <td>{p.date}</td>
                      <td className="text-gray-400 text-xs">{p.remarks||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      case 'achievements': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Cadet</th><th>Title</th><th>Category</th><th>Date</th><th>Awarded By</th></tr></thead>
              <tbody>
                {achievements.map(a=>{
                  const c = cadets.find(cd=>cd.id===a.cadetId);
                  return (
                    <tr key={a.id}>
                      <td className="font-semibold">{c?.name}</td>
                      <td>{a.title}</td>
                      <td><span className="badge badge-yellow text-xs">{a.category}</span></td>
                      <td>{a.date}</td>
                      <td className="text-xs text-gray-400">{a.awardedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      case 'training': {
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>#</th><th>Title</th><th>Date</th><th>Instructor</th><th>Duration</th><th>Status</th></tr></thead>
              <tbody>
                {trainingSessions.map((s,i)=>(
                  <tr key={s.id}>
                    <td className="text-gray-400">{i+1}</td>
                    <td className="font-semibold">{s.title}</td>
                    <td>{s.date}</td>
                    <td>{s.instructor}</td>
                    <td>{s.duration}</td>
                    <td><span className={`badge text-xs ${s.status==='Completed'?'badge-green':'badge-sky'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      default: return null;
    }
  };

  const activeRpt = REPORT_TYPES.find(r=>r.id===activeReport);

  return (
    <DashboardLayout role="officer">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export operational reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>handleExport('PDF')} className="btn-outline-navy btn-sm"><Download size={15}/> PDF</button>
          <button onClick={()=>handleExport('Excel')} className="btn-sky btn-sm"><Download size={15}/> Excel</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Report selector */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="section-title">Report Type</h3>
            <div className="space-y-1">
              {REPORT_TYPES.map(r=>(
                <button key={r.id} onClick={()=>setActive(r.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeReport===r.id?'bg-primary text-white':'text-gray-500 hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeReport===r.id?'bg-white/20':r.color}`}>
                    <r.icon size={14} className={activeReport===r.id?'text-white':''}/>
                  </div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="card mt-4">
            <h3 className="section-title">Filters</h3>
            <div className="space-y-3">
              <div className="form-group">
                <label className="label">Wing</label>
                <select className="input text-xs" value={filters.wing} onChange={e=>ff('wing',e.target.value)}>
                  <option value="All">All Wings</option>
                  <option>Army</option><option>Navy</option><option>Air</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Unit</label>
                <input className="input text-xs" value={filters.unit} onChange={e=>ff('unit',e.target.value)} placeholder="Filter by unit…"/>
              </div>
              <div className="form-group">
                <label className="label">Date From</label>
                <input type="date" className="input text-xs" value={filters.dateFrom} onChange={e=>ff('dateFrom',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="label">Date To</label>
                <input type="date" className="input text-xs" value={filters.dateTo} onChange={e=>ff('dateTo',e.target.value)}/>
              </div>
            </div>
          </div>
        </div>

        {/* Report output */}
        <div className="lg:col-span-3">
          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeRpt && (
                  <div className={`w-10 h-10 rounded-xl ${activeRpt.color} flex items-center justify-center`}>
                    <activeRpt.icon size={18}/>
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-navy-500">{activeRpt?.label}</h2>
                  <p className="text-xs text-gray-400">Generated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleExport('PDF')} className="btn-outline btn-sm text-xs"><Download size={13}/> PDF</button>
                <button onClick={()=>handleExport('CSV')} className="btn-sky btn-sm text-xs"><Download size={13}/> CSV</button>
              </div>
            </div>
          </div>
          {renderReport()}
        </div>
      </div>
    </DashboardLayout>
  );
}
