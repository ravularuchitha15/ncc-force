import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import certificateService from '../../services/certificate.service';
import { StatusBadge } from '../../components/shared/Badge';
import { Award, CheckCircle } from 'lucide-react';

export default function CadetCertificates() {
  const { user } = useAuth();
  const [myCerts, setMyCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const cadetId = user?.cadetProfile?._id || user?._id;
        const res = await certificateService.getCertificates({ cadet: cadetId });
        if (res.success) setMyCerts((res.data || []).map(c => ({
          id: c._id, type: c.certificateType || c.type || '', examDate: c.examDate?.split('T')[0] || '',
          resultDate: c.resultDate?.split('T')[0] || '', result: c.result || 'Pending',
          grade: c.grade || '', certNumber: c.certificateNumber || '',
          issueDate: c.issueDate?.split('T')[0] || '', verified: c.verified || false, remarks: c.remarks || '',
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="page-subtitle">NCC certificate status and records</p>
        </div>
      </div>

      {myCerts.length === 0 ? (
        <div className="card text-center py-12">
          <Award size={40} className="text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400">No certificate records found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {myCerts.map(c => (
            <div key={c.id} className="card border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Award size={22} className="text-primary"/>
                </div>
                <StatusBadge status={c.result}/>
              </div>
              <h3 className="text-xl font-black text-navy-500 mb-1">{c.type}</h3>
              {c.grade && <p className="text-4xl font-black text-primary mb-3">{c.grade}</p>}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between"><span>Exam Date</span><span className="font-medium text-navy-500">{c.examDate}</span></div>
                {c.resultDate && <div className="flex justify-between"><span>Result Date</span><span className="font-medium text-navy-500">{c.resultDate}</span></div>}
                {c.certNumber && <div className="flex justify-between"><span>Certificate No.</span><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{c.certNumber}</span></div>}
                {c.issueDate && <div className="flex justify-between"><span>Issued On</span><span className="font-medium text-navy-500">{c.issueDate}</span></div>}
              </div>
              {c.verified && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle size={15}/> Verified by NCC Authority
                </div>
              )}
              {c.remarks && <p className="text-xs text-gray-400 mt-2 italic">{c.remarks}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
