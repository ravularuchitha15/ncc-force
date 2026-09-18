import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ChevronLeft, User, Shield, ClipboardCheck, Tent,
  Dumbbell, Award, TrendingUp, Trophy, FileText,
  Star, Phone, Mail, Building, Calendar, Hash,
  CheckCircle, XCircle, Clock, ArrowUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/shared/Badge';
import cadetService from '../../services/cadet.service';
import attendanceService from '../../services/attendance.service';
import certificateService from '../../services/certificate.service';
import rankService from '../../services/rank.service';
import achievementService from '../../services/achievement.service';
import performanceService from '../../services/performance.service';

const TABS = [
  { key: 'personal',     label: 'Personal Info',   icon: User },
  { key: 'attendance',   label: 'Attendance',       icon: ClipboardCheck },
  { key: 'training',     label: 'Training',         icon: Dumbbell },
  { key: 'camps',        label: 'Camps',            icon: Tent },
  { key: 'certificates', label: 'Certificates',     icon: Award },
  { key: 'ranks',        label: 'Ranks',            icon: TrendingUp },
  { key: 'achievements', label: 'Achievements',     icon: Trophy },
  { key: 'leave',        label: 'Leave History',    icon: FileText },
  { key: 'performance',  label: 'Performance',      icon: Star },
];

export default function CadetProfile360() {
  const { id } = useParams();
  const [activeTab, setTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [cadet, setCadet] = useState(null);
  const [attendanceRecords, setAttendance] = useState([]);
  const [myCamps, setMyCamps] = useState([]);
  const [myTraining, setMyTraining] = useState([]);
  const [myCerts, setMyCerts] = useState([]);
  const [myPromos, setMyPromos] = useState([]);
  const [myAch, setMyAch] = useState([]);
  const [myLeave] = useState([]); // No leave backend
  const [perf, setPerf] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const cadetRes = await cadetService.getCadetById(id);
        if (cadetRes.success && cadetRes.data) {
          const c = cadetRes.data;
          setCadet({
            id: c._id, name: c.fullName || '', regNo: c.cadetId || '',
            dob: c.dateOfBirth?.split('T')[0] || '', gender: c.gender || '',
            phone: c.phone || '', email: c.email || '',
            college: c.institution || '', unit: c.unit || '',
            wing: c.wing || 'Army', rank: c.currentRank?.name || 'Cadet',
            batch: c.yearSemester || '', status: c.status || 'Active',
            enrollmentDate: c.enrollmentDate?.split('T')[0] || '',
            bloodGroup: c.bloodGroup || '', address: c.address || '',
            battalion: c.battalion || '',
          });
        }
        // Fetch related data concurrently
        const [attRes, certRes, rankRes, achRes, perfRes] = await Promise.all([
          attendanceService.getAttendanceById(id).catch(() => ({ success: false })),
          certificateService.getCertificates({ cadet: id }).catch(() => ({ success: false })),
          rankService.getCadetRankHistory(id).catch(() => ({ success: false })),
          achievementService.getAchievements({ cadet: id }).catch(() => ({ success: false })),
          performanceService.getPerformanceRecords({ cadet: id }).catch(() => ({ success: false })),
        ]);
        if (attRes.success) setAttendance(attRes.data || []);
        if (certRes.success) setMyCerts(certRes.data || []);
        if (rankRes.success) setMyPromos(rankRes.data || []);
        if (achRes.success) setMyAch(achRes.data || []);
        if (perfRes.success && perfRes.data?.length) setPerf(perfRes.data[0] || {});
      } catch (err) {
        console.error('Failed to load cadet profile:', err);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout role="officer">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading cadet profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!cadet) {
    return (
      <DashboardLayout role="officer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Cadet not found.</p>
            <Link to="/officer/cadets" className="btn-primary btn-sm">Back to Cadets</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const present = attendanceRecords.filter(r => r.status === 'Present').length;
  const absent  = attendanceRecords.filter(r => r.status === 'Absent').length;
  const leave   = attendanceRecords.filter(r => r.status === 'Leave').length;
  const total   = attendanceRecords.length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  return (
    <DashboardLayout role="officer">
      {/* Back + heading */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/officer/cadets" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-500 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">Cadet 360° Profile</h1>
          <p className="page-subtitle">{cadet.name} · {cadet.regNo}</p>
        </div>
      </div>

      {/* Profile header card */}
      <div className="card mb-6 bg-gradient-to-r from-navy-500 to-navy-600 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black flex-shrink-0">
            {cadet.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-2xl font-black">{cadet.name}</h2>
              <span className={`badge text-xs px-2.5 py-0.5 rounded-full font-semibold ${cadet.status==='Active'?'bg-green-400/20 text-green-200':'bg-red-400/20 text-red-200'}`}>
                {cadet.status}
              </span>
            </div>
            <p className="text-sky-200 font-mono text-sm mb-2">{cadet.regNo}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Shield size={13}/>{cadet.rank}</span>
              <span className="flex items-center gap-1.5"><Building size={13}/>{cadet.unit}</span>
              <span className="flex items-center gap-1.5"><Star size={13}/>{cadet.wing} Wing</span>
              <span className="flex items-center gap-1.5"><Calendar size={13}/>{cadet.batch}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
            <div><p className="text-2xl font-black text-white">{pct}%</p><p className="text-white/60 text-xs">Attendance</p></div>
            <div><p className="text-2xl font-black text-white">{myCamps.length}</p><p className="text-white/60 text-xs">Camps</p></div>
            <div><p className="text-2xl font-black text-white">{myAch.length}</p><p className="text-white/60 text-xs">Awards</p></div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 flex-wrap mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === t.key
                ? 'bg-white text-navy-500 shadow-sm'
                : 'text-gray-500 hover:text-navy-500'
            }`}
          >
            <t.icon size={13} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {/* PERSONAL INFO */}
        {activeTab === 'personal' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="section-title">Personal Information</h3>
              <InfoRow icon={User}     label="Full Name"        value={cadet.name} />
              <InfoRow icon={Hash}     label="Regimental No."  value={cadet.regNo} mono />
              <InfoRow icon={Calendar} label="Date of Birth"   value={cadet.dob} />
              <InfoRow icon={User}     label="Gender"          value={cadet.gender} />
              <InfoRow icon={Phone}    label="Phone"           value={cadet.phone} />
              <InfoRow icon={Mail}     label="Email"           value={cadet.email} />
              <InfoRow icon={Building} label="College / School" value={cadet.college} />
            </div>
            <div className="card">
              <h3 className="section-title">NCC Information</h3>
              <InfoRow icon={Shield}   label="NCC Unit"        value={cadet.unit} />
              <InfoRow icon={Star}     label="Wing"            value={cadet.wing} />
              <InfoRow icon={TrendingUp} label="Current Rank" value={cadet.rank} />
              <InfoRow icon={Calendar} label="Enrollment Date" value={cadet.enrollmentDate} />
              <InfoRow icon={Calendar} label="Batch"          value={cadet.batch} />
              <InfoRow icon={Shield}   label="Status"         value={<StatusBadge status={cadet.status}/>} />
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label:'Total Sessions', value:total, color:'bg-navy-100 text-navy-600' },
                { label:'Present',        value:present, color:'bg-green-100 text-green-700' },
                { label:'Absent',         value:absent,  color:'bg-red-100 text-red-600' },
                { label:'On Leave',       value:leave,   color:'bg-yellow-100 text-yellow-700' },
              ].map(s => (
                <div key={s.label} className={`card text-center ${s.color}`}>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="section-title mb-0">Overall Attendance</h3>
                <span className={`text-lg font-black ${pct>=75?'text-green-600':'text-primary'}`}>{pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pct>=75?'bg-green-500':'bg-primary'}`} style={{ width:`${pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct>=75?'Attendance satisfactory':'Below minimum 75% — needs improvement'}</p>
            </div>
            {attendanceRecords.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Date</th><th>Activity</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendanceRecords.map((r, i) => (
                      <tr key={i}>
                        <td>{r.session.date}</td>
                        <td>{r.session.activity}</td>
                        <td><StatusBadge status={r.status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="card"><p className="text-sm text-gray-400 text-center py-8">No attendance records.</p></div>}
          </div>
        )}

        {/* TRAINING */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            {myTraining.length === 0 ? (
              <div className="card"><p className="text-sm text-gray-400 text-center py-8">No training records.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Training</th><th>Date</th><th>Attendance</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {myTraining.map((tr, i) => (
                      <tr key={i}>
                        <td className="font-medium">{tr.session?.title}</td>
                        <td>{tr.session?.date}</td>
                        <td><StatusBadge status={tr.attendance}/></td>
                        <td>{tr.marks ?? '—'}</td>
                        <td><span className="font-bold text-navy-500">{tr.grade ?? '—'}</span></td>
                        <td className="text-gray-400 text-xs max-w-[160px] truncate">{tr.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CAMPS */}
        {activeTab === 'camps' && (
          <div className="space-y-4">
            {myCamps.length === 0 ? (
              <div className="card"><p className="text-sm text-gray-400 text-center py-8">No camp participation.</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myCamps.map(cp => (
                  <div key={cp.campId} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-navy-500">{cp.camp?.name}</h4>
                      <StatusBadge status={cp.status}/>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{cp.camp?.location} · {cp.camp?.type}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Registered: {cp.registrationDate}</p>
                      {cp.performance && <p>Performance: <span className="font-semibold text-navy-500">{cp.performance}</span></p>}
                      {cp.remarks && <p>Remarks: {cp.remarks}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {myCerts.length === 0 ? (
              <div className="card"><p className="text-sm text-gray-400 text-center py-8">No certificate records.</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myCerts.map(c => (
                  <div key={c.id} className="card border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-navy-500 text-lg">{c.type}</h4>
                      <StatusBadge status={c.result}/>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-500">
                      <p>Exam Date: <span className="text-navy-500 font-medium">{c.examDate}</span></p>
                      {c.resultDate && <p>Result Date: <span className="text-navy-500 font-medium">{c.resultDate}</span></p>}
                      {c.grade && <p>Grade: <span className="font-black text-primary text-lg">{c.grade}</span></p>}
                      {c.certNumber && <p>Certificate No: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{c.certNumber}</span></p>}
                      {c.issueDate && <p>Issued: <span className="text-navy-500 font-medium">{c.issueDate}</span></p>}
                      {c.remarks && <p className="text-gray-400 text-xs italic">{c.remarks}</p>}
                    </div>
                    {c.verified && (
                      <div className="mt-3 flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                        <CheckCircle size={13}/> Verified
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RANKS */}
        {activeTab === 'ranks' && (
          <div className="space-y-4">
            <div className="card">
              <p className="text-sm text-gray-500 mb-4">Current Rank: <span className="font-bold text-primary text-base">{cadet.rank}</span></p>
              {myPromos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No promotion history.</p>
              ) : (
                <div className="relative pl-8 space-y-6">
                  {myPromos.map((p, i) => (
                    <div key={p.id} className="relative">
                      <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <ArrowUp size={12} className="text-white" />
                      </div>
                      {i < myPromos.length - 1 && (
                        <div className="absolute -left-[21px] top-6 w-0.5 h-full bg-gray-200" />
                      )}
                      <div className="card border border-gray-100 ml-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-navy-500">
                              {p.fromRank} <span className="text-primary">→</span> {p.toRank}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.date}</p>
                          </div>
                          <span className="badge badge-green text-xs">Promoted</span>
                        </div>
                        {p.remarks && <p className="text-sm text-gray-500 mt-2 italic">"{p.remarks}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {myAch.length === 0 ? (
              <div className="card"><p className="text-sm text-gray-400 text-center py-8">No achievements recorded.</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myAch.map(a => {
                  const icons = { Award:'🏆', Certificate:'📜', Medal:'🥇' };
                  return (
                    <div key={a.id} className="card border-l-4 border-l-yellow-400">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{icons[a.category]||'🏅'}</span>
                        <div>
                          <h4 className="font-bold text-navy-500 leading-tight">{a.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{a.date} · {a.category}</p>
                          <p className="text-sm text-gray-500 mt-2">{a.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Awarded by: {a.awardedBy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEAVE HISTORY */}
        {activeTab === 'leave' && (
          <div className="space-y-4">
            {myLeave.length === 0 ? (
              <div className="card"><p className="text-sm text-gray-400 text-center py-8">No leave history.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th>Officer Remarks</th></tr></thead>
                  <tbody>
                    {myLeave.map(l => (
                      <tr key={l.id}>
                        <td className="font-medium">{l.type}</td>
                        <td>{l.fromDate}</td>
                        <td>{l.toDate}</td>
                        <td className="max-w-[140px] truncate text-gray-400 text-xs">{l.reason}</td>
                        <td>{l.appliedDate}</td>
                        <td><StatusBadge status={l.status}/></td>
                        <td className="text-gray-400 text-xs max-w-[140px] truncate">{l.officerRemarks||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="section-title">Performance Summary</h3>
              <div className="space-y-4">
                {[
                  { label:'Attendance',        value:perf.attendance||0,      max:100, unit:'%', color:'bg-sky' },
                  { label:'Training Score',    value:perf.trainingScore||0,   max:100, unit:'%', color:'bg-navy-400' },
                  { label:'Camp Participation',value:(perf.campParticipation||0)*20, max:100, unit:'', color:'bg-green-500' },
                  { label:'Achievements',      value:Math.min((perf.achievements||0)*25,100), max:100, unit:'', color:'bg-yellow-500' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 font-medium">{m.label}</span>
                      <span className="font-bold text-navy-500">{m.value}{m.unit}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.color} transition-all`} style={{ width:`${m.value}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="section-title">Highlights</h3>
              <div className="space-y-3">
                <HighlightRow label="Certificate Level"  value={perf.certificateLevel || 'Not yet'} />
                <HighlightRow label="Camps Attended"     value={perf.campParticipation || 0} />
                <HighlightRow label="Achievements"       value={perf.achievements || 0} />
                <HighlightRow label="Promotions"         value={myPromos.length} />
                <HighlightRow label="Leave Requests"     value={myLeave.length} />
                <HighlightRow label="Training Records"   value={myTraining.length} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-gray-400 flex-shrink-0" />
      <span className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className={`text-sm text-navy-500 font-medium flex-1 ${mono ? 'font-mono' : ''}`}>
        {typeof value === 'string' || typeof value === 'number' ? (value || '—') : value}
      </span>
    </div>
  );
}

function HighlightRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-bold text-navy-500">{value}</span>
    </div>
  );
}
