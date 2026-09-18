import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import campService from '../../services/camp.service';
import { StatusBadge } from '../../components/shared/Badge';
import { MapPin, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CadetCamps() {
  const { user } = useAuth();
  const [myCamps, setMyCamps]       = useState([]);
  const [upcomingAll, setUpcoming]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await campService.getCamps();
        if (res.success) {
          const all = res.data || [];
          const cadetId = user?.cadetProfile?._id || user?._id;
          setMyCamps(all.filter(c => (c.participatingCadets || []).some(p => p === cadetId || p._id === cadetId)).map(c => ({
            id: c._id, name: c.name || '', type: c.type || '', location: c.location || '',
            startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '', status: c.status || '',
          })));
          setUpcoming(all.filter(c => c.status === 'Upcoming').map(c => ({
            id: c._id, name: c.name || '', type: c.type || '', location: c.location || '',
            startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '',
            status: c.status || '', eligibility: c.eligibility || '',
          })));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const handleRegister = (camp) => {
    toast.success(`Registration request sent for "${camp.name}". Awaiting officer approval.`);
  };

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Camps</h1>
          <p className="page-subtitle">Camp participation and upcoming registrations</p>
        </div>
      </div>

      {/* My participations */}
      <h2 className="section-title">My Participations ({myCamps.length})</h2>
      {myCamps.length === 0 ? (
        <div className="card mb-6 text-center py-8 text-gray-400">No camp participation yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {myCamps.map(camp => (
            <div key={camp.id} className="card border-l-4 border-l-green-400">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-navy-500 leading-tight">{camp.name}</h3>
                <StatusBadge status={camp.status}/>
              </div>
              <p className="text-xs text-gray-400 mb-3">{camp.type}</p>
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-2"><MapPin size={13}/>{camp.location}</div>
                <div className="flex items-center gap-2"><Calendar size={13}/>{camp.startDate} → {camp.endDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available camps */}
      <h2 className="section-title">Available Camps</h2>
      {upcomingAll.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No upcoming camps available.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {upcomingAll.map(camp => (
            <div key={camp.id} className="card-hover">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-navy-500 leading-tight">{camp.name}</h3>
                <StatusBadge status={camp.status}/>
              </div>
              <p className="text-xs text-gray-400 mb-3">{camp.type}</p>
              <div className="space-y-1 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-2"><MapPin size={13}/>{camp.location}</div>
                <div className="flex items-center gap-2"><Calendar size={13}/>{camp.startDate} → {camp.endDate}</div>
                <div className="flex items-center gap-2"><Users size={13}/>{camp.registered}/{camp.capacity} registered</div>
              </div>
              {camp.eligibility && <p className="text-xs text-gray-400 mb-3">Eligibility: {camp.eligibility}</p>}
              <button onClick={() => handleRegister(camp)} className="btn-sky btn-sm w-full justify-center">
                Apply / Register
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
