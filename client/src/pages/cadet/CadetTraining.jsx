import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import trainingService from '../../services/training.service';
import { StatusBadge } from '../../components/shared/Badge';
import { Dumbbell, Calendar, Clock, BookOpen } from 'lucide-react';

export default function CadetTraining() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await trainingService.getTrainings();
        if (res.success) {
          const all = (res.data || []).map(t => ({
            id: t._id, title: t.title || t.name || '', date: t.date?.split('T')[0] || '',
            instructor: t.instructor?.name || t.instructor || '', duration: t.duration || '',
            status: t.status || '', topics: t.topics || [],
          }));
          setCompleted(all.filter(s => s.status === 'Completed'));
          setUpcoming(all.filter(s => s.status !== 'Completed'));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Training</h1>
          <p className="page-subtitle">Training sessions, topics and assessments</p>
        </div>
      </div>

      <h2 className="section-title">Upcoming Training ({upcoming.length})</h2>
      {upcoming.length === 0 ? (
        <div className="card mb-6 text-center py-8 text-gray-400">No upcoming sessions.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {upcoming.map(s=>(
            <div key={s.id} className="card border-l-4 border-l-sky">
              <h3 className="font-bold text-navy-500 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{s.instructor}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1.5"><Calendar size={13}/>{s.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={13}/>{s.duration}</span>
              </div>
              {s.topics.length>0&&<div className="flex flex-wrap gap-1">{s.topics.map((t,i)=><span key={i} className="badge badge-sky text-xs">{t}</span>)}</div>}
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Completed Training ({completed.length})</h2>
      {completed.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No completed sessions yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Title</th><th>Date</th><th>Status</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
            <tbody>
              {completed.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{s.title}</td>
                  <td>{s.date}</td>
                  <td><StatusBadge status={s.status}/></td>
                  <td className="font-bold">{s.marks ?? '—'}</td>
                  <td className="font-black text-primary">{s.grade ?? '—'}</td>
                  <td className="text-gray-400 text-xs">{s.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
