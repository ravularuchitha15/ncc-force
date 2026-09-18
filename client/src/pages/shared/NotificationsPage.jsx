import { useState } from 'react';
import { Bell, Check, CheckCheck, FileText, Dumbbell, Tent, Award, TrendingUp, Megaphone } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { notifications as initNotifs } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  leave:    { icon: FileText,  color: 'bg-yellow-100 text-yellow-600' },
  training: { icon: Dumbbell,  color: 'bg-sky-100 text-sky' },
  camp:     { icon: Tent,      color: 'bg-green-100 text-green-600' },
  rank:     { icon: TrendingUp,color: 'bg-primary/10 text-primary' },
  certificate: { icon: Award,  color: 'bg-navy-100 text-navy-500' },
  announcement:{ icon: Megaphone,color:'bg-purple-100 text-purple-600' },
};

export default function NotificationsPage({ role }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState(initNotifs);

  const myNotifs = notifs.filter(n=>n.userId===user?.id).sort((a,b)=>b.date.localeCompare(a.date));
  const unread   = myNotifs.filter(n=>!n.read).length;

  const markRead   = (id) => setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  const markAllRead = () => {
    setNotifs(p=>p.map(n=>n.userId===user?.id?{...n,read:true}:n));
    toast.success('All notifications marked as read.');
  };

  return (
    <DashboardLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread notification{unread!==1?'s':''}</p>
        </div>
        {unread>0 && (
          <button onClick={markAllRead} className="btn-outline-navy btn-sm">
            <CheckCheck size={15}/> Mark All Read
          </button>
        )}
      </div>

      {myNotifs.length===0 ? (
        <div className="card text-center py-16">
          <Bell size={48} className="text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifs.map(n=>{
            const cfg = TYPE_CONFIG[n.type]||{ icon:Bell, color:'bg-gray-100 text-gray-500' };
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-4 transition-all cursor-pointer hover:shadow-card-hover ${!n.read?'border-l-4 border-l-primary bg-primary-50/30':''}`}
                onClick={()=>markRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <cfg.icon size={18}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.read?'text-navy-500':'text-gray-600'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"/>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{n.date}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={e=>{e.stopPropagation();markRead(n.id);}}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-500 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check size={14}/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
