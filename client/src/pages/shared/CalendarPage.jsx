import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, X, Check, MapPin, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { events as initEvents } from '../../data/mockData';
import campService from '../../services/camp.service';
import trainingService from '../../services/training.service';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['Parade','Training','Camp','Examination','Competition','Meeting','Ceremony','Other'];
const TYPE_COLORS = {
  Parade:      'bg-navy-100 text-navy-700 border-navy-200',
  Training:    'bg-sky-100 text-sky-700 border-sky-200',
  Camp:        'bg-green-100 text-green-700 border-green-200',
  Examination: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Competition: 'bg-red-100 text-red-700 border-red-200',
  Meeting:     'bg-purple-100 text-purple-700 border-purple-200',
  Ceremony:    'bg-orange-100 text-orange-700 border-orange-200',
  Other:       'bg-gray-100 text-gray-700 border-gray-200',
};
const DOT_COLORS = {
  Parade:'bg-navy-500', Training:'bg-sky', Camp:'bg-green-500',
  Examination:'bg-yellow-500', Competition:'bg-red-500', Meeting:'bg-purple-500',
  Ceremony:'bg-orange-500', Other:'bg-gray-400',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const empty = { title:'', type:EVENT_TYPES[0], date:'', time:'', endTime:'', location:'', description:'', audience:'All', unit:'All' };

export default function CalendarPage({ role }) {
  const [events, setEvents]     = useState(initEvents);
  const today = new Date();
  const [curYear, setCurYear]   = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [viewDay, setViewDay]   = useState(null);
  const [showForm, setForm]     = useState(false);
  const [formData, setFD]       = useState(empty);
  const [errors, setErrors]     = useState({});
  const [selectedEvent, setSelEv] = useState(null);

  useEffect(() => {
    const fetchApiEvents = async () => {
      try {
        const [campsRes, trainRes] = await Promise.all([
          campService.getCamps().catch(() => ({ success: false })),
          trainingService.getTrainings().catch(() => ({ success: false })),
        ]);
        const dynamicEvents = [];
        if (campsRes?.success && campsRes?.data) {
          campsRes.data.forEach(c => {
            if (c.startDate) {
              dynamicEvents.push({
                id: `camp-${c._id}`,
                title: c.name || 'NCC Camp',
                type: 'Camp',
                date: c.startDate.split('T')[0],
                time: '08:00',
                endTime: '18:00',
                location: c.location || '',
                description: c.description || `${c.type || 'NCC'} Camp`,
                audience: 'All',
                unit: 'All'
              });
            }
          });
        }
        if (trainRes?.success && trainRes?.data) {
          trainRes.data.forEach(t => {
            if (t.date) {
              dynamicEvents.push({
                id: `train-${t._id}`,
                title: t.topic || t.title || 'Training Session',
                type: 'Training',
                date: t.date.split('T')[0],
                time: t.time || '06:00',
                endTime: t.endTime || '08:00',
                location: t.venue || t.location || '',
                description: t.description || `Trainer: ${t.trainer || 'Instructor'}`,
                audience: 'Cadets',
                unit: t.unit || 'All'
              });
            }
          });
        }
        if (dynamicEvents.length > 0) {
          setEvents(prev => [...dynamicEvents, ...prev]);
        }
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      }
    };
    fetchApiEvents();
  }, []);

  const f = (k,v) => setFD(p=>({...p,[k]:v}));

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title required.';
    if (!formData.date)         e.date  = 'Date required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setEvents(p=>[...p,{...formData,id:`ev${Date.now()}`}]);
    toast.success('Event created.');
    setForm(false);
    setFD(empty);
  };

  // Build calendar grid
  const firstDay  = new Date(curYear, curMonth, 1).getDay();
  const daysInMon = new Date(curYear, curMonth + 1, 0).getDate();
  const cells     = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMon ? day : null;
  });

  const eventsOnDay = (day) => {
    if (!day) return [];
    const dateStr = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => { if (curMonth===0){setCurMonth(11);setCurYear(y=>y-1);}else setCurMonth(m=>m-1); };
  const nextMonth = () => { if (curMonth===11){setCurMonth(0);setCurYear(y=>y+1);}else setCurMonth(m=>m+1); };

  const isToday = (day) => day===today.getDate()&&curMonth===today.getMonth()&&curYear===today.getFullYear();

  // Upcoming events list
  const upcoming = [...events].sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>e.date>=today.toISOString().split('T')[0]).slice(0,8);

  return (
    <DashboardLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">NCC Calendar</h1>
          <p className="page-subtitle">{events.length} events scheduled</p>
        </div>
        {role==='officer' && (
          <button onClick={()=>{setFD(empty);setErrors({});setForm(true);}} className="btn-primary btn-sm">
            <Plus size={15}/> Add Event
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={18}/></button>
              <h2 className="text-lg font-bold text-navy-500">{MONTHS[curMonth]} {curYear}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={18}/></button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d=>(
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                const dayEvents = eventsOnDay(day);
                return (
                  <div
                    key={i}
                    className={`min-h-[70px] p-1 rounded-lg cursor-pointer transition-colors ${
                      day ? 'hover:bg-gray-50' : 'bg-transparent cursor-default'
                    } ${isToday(day) ? 'bg-primary-50 ring-2 ring-primary ring-offset-1' : ''}`}
                    onClick={() => day && setViewDay({ day, events: dayEvents })}
                  >
                    {day && (
                      <>
                        <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday(day) ? 'bg-primary text-white' : 'text-navy-500'
                        }`}>{day}</div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0,2).map(ev=>(
                            <div key={ev.id} className={`text-xs px-1 py-0.5 rounded truncate font-medium ${TYPE_COLORS[ev.type]||TYPE_COLORS.Other}`}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length>2 && <div className="text-xs text-gray-400 pl-1">+{dayEvents.length-2}</div>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {EVENT_TYPES.map(t=>(
                <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${DOT_COLORS[t]}`}/>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="section-title">Upcoming Events</h3>
            {upcoming.length===0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(ev=>(
                  <button key={ev.id} onClick={()=>setSelEv(ev)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="text-center bg-navy-50 rounded-lg px-2 py-1 min-w-[40px] flex-shrink-0">
                      <div className="text-xs font-black text-navy-500">{new Date(ev.date).getDate()}</div>
                      <div className="text-xs text-gray-400 uppercase">{new Date(ev.date).toLocaleDateString('en-IN',{month:'short'})}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-500 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.time && `${ev.time} · `}{ev.location}</p>
                      <span className={`badge text-xs mt-1 ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      <Modal isOpen={!!viewDay} onClose={()=>setViewDay(null)}
        title={viewDay ? `${viewDay.day} ${MONTHS[curMonth]} ${curYear}` : ''} size="sm">
        {viewDay && (
          viewDay.events.length===0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No events on this day.</p>
          ) : (
            <div className="space-y-3">
              {viewDay.events.map(ev=>(
                <div key={ev.id} className={`p-3 rounded-lg border ${TYPE_COLORS[ev.type]}`}>
                  <p className="font-bold text-sm">{ev.title}</p>
                  {ev.time && <p className="text-xs mt-0.5 flex items-center gap-1"><Clock size={11}/>{ev.time}{ev.endTime&&` — ${ev.endTime}`}</p>}
                  {ev.location && <p className="text-xs mt-0.5 flex items-center gap-1"><MapPin size={11}/>{ev.location}</p>}
                  {ev.description && <p className="text-xs mt-1 opacity-80">{ev.description}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      {/* Event detail modal */}
      <Modal isOpen={!!selectedEvent} onClose={()=>setSelEv(null)} title={selectedEvent?.title||''} size="sm">
        {selectedEvent && (
          <div className="space-y-3">
            {[
              { label:'Type',     value:<span className={`badge text-xs ${TYPE_COLORS[selectedEvent.type]}`}>{selectedEvent.type}</span> },
              { label:'Date',     value:selectedEvent.date },
              { label:'Time',     value:selectedEvent.time?(selectedEvent.endTime?`${selectedEvent.time} — ${selectedEvent.endTime}`:selectedEvent.time):'—' },
              { label:'Location', value:selectedEvent.location||'—' },
              { label:'Audience', value:selectedEvent.audience||'—' },
            ].map(r=>(
              <div key={r.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{r.label}</span>
                <div className="text-sm text-navy-500 font-medium">{r.value}</div>
              </div>
            ))}
            {selectedEvent.description && (
              <div><p className="label">Description</p><p className="text-sm text-gray-600">{selectedEvent.description}</p></div>
            )}
          </div>
        )}
      </Modal>

      {/* Add event modal (officer only) */}
      {role==='officer' && (
        <Modal isOpen={showForm} onClose={()=>setForm(false)} title="Add New Event" size="md"
          footer={<><button onClick={()=>setForm(false)} className="btn-outline-navy btn-sm">Cancel</button><button onClick={handleSave} className="btn-primary btn-sm"><Check size={15}/> Create</button></>}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 form-group">
              <label className="label">Title *</label>
              <input className={`input ${errors.title?'input-error':''}`} value={formData.title} onChange={e=>f('title',e.target.value)}/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="form-group">
              <label className="label">Type</label>
              <select className="input" value={formData.type} onChange={e=>f('type',e.target.value)}>
                {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Date *</label>
              <input type="date" className={`input ${errors.date?'input-error':''}`} value={formData.date} onChange={e=>f('date',e.target.value)}/>
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div className="form-group">
              <label className="label">Start Time</label>
              <input type="time" className="input" value={formData.time} onChange={e=>f('time',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="label">End Time</label>
              <input type="time" className="input" value={formData.endTime} onChange={e=>f('endTime',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" value={formData.location} onChange={e=>f('location',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="label">Audience</label>
              <select className="input" value={formData.audience} onChange={e=>f('audience',e.target.value)}>
                <option>All</option><option>Officers</option><option>Cadets</option>
              </select>
            </div>
            <div className="sm:col-span-2 form-group">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={formData.description} onChange={e=>f('description',e.target.value)}/>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
