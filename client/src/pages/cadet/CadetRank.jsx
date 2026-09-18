import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import rankService from '../../services/rank.service';
import { ArrowUp, TrendingUp } from 'lucide-react';

export default function CadetRank() {
  const { user } = useAuth();
  const [myPromos, setMyPromos]       = useState([]);
  const [rankHierarchy, setRankHier]  = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const cadetId = user?.cadetProfile?._id || user?._id;
        const [promoRes, rankRes] = await Promise.all([
          rankService.getCadetRankHistory(cadetId).catch(() => ({ success: false })),
          rankService.getRanks(),
        ]);
        if (promoRes.success) setMyPromos(promoRes.data || []);
        if (rankRes.success) setRankHier((rankRes.data || []).map(r => r.name));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const currentIdx = rankHierarchy.indexOf(user?.rank || '');

  return (
    <DashboardLayout role="cadet">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Rank</h1>
          <p className="page-subtitle">Current rank and promotion history</p>
        </div>
      </div>

      {/* Current rank card */}
      <div className="card bg-gradient-to-r from-navy-500 to-navy-600 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp size={28} className="text-white"/>
          </div>
          <div>
            <p className="text-white/70 text-sm mb-1">Current Rank</p>
            <h2 className="text-3xl font-black text-white">{user?.rank}</h2>
            <p className="text-sky-200 text-sm mt-1">{myPromos.length} promotion{myPromos.length !== 1 ? 's' : ''} recorded</p>
          </div>
        </div>
      </div>

      {/* Rank progression */}
      <div className="card mb-6">
        <h3 className="section-title">Rank Progression</h3>
        <div className="flex flex-wrap items-center gap-2">
          {rankHierarchy.map((r, i) => (
            <div key={r} className="flex items-center gap-1">
              <span className={`badge text-xs px-3 py-1 ${
                r === user?.rank ? 'bg-primary text-white font-bold' :
                i < currentIdx  ? 'badge-green' : 'badge-gray opacity-50'
              }`}>
                {r === user?.rank && '✓ '}{r}
              </span>
              {i < rankHierarchy.length - 1 && <ArrowUp size={12} className="text-gray-300 rotate-90 flex-shrink-0"/>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          You are at level {currentIdx + 1} of {rankHierarchy.length}.
          {currentIdx < rankHierarchy.length - 1 && ` Next rank: ${rankHierarchy[currentIdx + 1]}`}
        </p>
      </div>

      {/* Promotion history */}
      <h2 className="section-title">Promotion History</h2>
      {myPromos.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No promotions recorded yet.</div>
      ) : (
        <div className="relative pl-8 space-y-5">
          {myPromos.map((p, i) => (
            <div key={p.id} className="relative">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <ArrowUp size={12} className="text-white"/>
              </div>
              {i < myPromos.length - 1 && <div className="absolute -left-[21px] top-6 w-0.5 h-full bg-gray-200"/>}
              <div className="card border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-navy-500">
                    {p.fromRank} <span className="text-primary">→</span> {p.toRank}
                  </p>
                  <span className="badge badge-green text-xs">Promoted</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{p.date}</p>
                {p.remarks && <p className="text-sm text-gray-500 italic">"{p.remarks}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
