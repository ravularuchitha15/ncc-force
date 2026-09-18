import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import attendanceService from '../../services/attendance.service';
import { StatusBadge } from '../../components/shared/Badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CadetAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const cadetId = user?.cadetProfile?._id || user?._id;
        const res = await attendanceService.getAttendanceById(cadetId);
        if (res.success) setRecords(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const present = records.filter(r => r.status === 'Present').length;
  const absent  = records.filter(r => r.status === 'Absent').length;
  const leave   = records.filter(r => r.status === 'Leave').length;
  const total   = records.length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Complete attendance record</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label:'Present', value:present, color:'text-green-600 bg-green-50' },
          { icon: XCircle,     label:'Absent',  value:absent,  color:'text-red-500 bg-red-50' },
          { icon: Clock,       label:'On Leave', value:leave,  color:'text-yellow-600 bg-yellow-50' },
          { icon: CheckCircle, label:'Overall',  value:`${pct}%`, color:pct>=75?'text-sky bg-sky-50':'text-primary bg-primary-50' },
        ].map(s => (
          <div key={s.label} className={`card flex items-center gap-3 ${s.color}`}>
            <s.icon size={20} />
            <div><p className="text-xl font-black">{s.value}</p><p className="text-xs font-semibold">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-600">Attendance Rate</span>
          <span className={`font-black text-lg ${pct>=75?'text-green-600':'text-primary'}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${pct>=75?'bg-green-500':'bg-primary'}`} style={{ width:`${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{pct>=75 ? '✓ Attendance above minimum requirement (75%)' : '⚠ Below minimum 75% — please attend more sessions'}</p>
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No attendance records found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>#</th><th>Date</th><th>Activity</th><th>Unit</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td className="text-gray-400">{i+1}</td>
                  <td className="font-medium">{r.session.date}</td>
                  <td>{r.session.activity}</td>
                  <td className="text-xs text-gray-400">{r.session.unit}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
