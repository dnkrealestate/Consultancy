'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Phone, Plus, X,
  Search, Clock, User, CheckCircle2, Bell, Download,
  Mail, Briefcase, Trash2,
} from 'lucide-react';
import * as ics from 'ics';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const STATUS_COLORS = {
  New:       '#60a5fa',
  Contacted: '#fbbf24',
  Qualified: '#c084fc',
  Closed:    '#4ade80',
  Lost:      '#f87171',
};

const inp = {
  width:'100%', boxSizing:'border-box',
  background:'rgba(0,0,0,0.4)',
  border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:10, padding:'10px 14px',
  color:'white', fontSize:13, outline:'none', fontFamily:'inherit',
};
const lbl = {
  display:'block', color:'#64748b', fontSize:11,
  fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = '#14b8a6' }) {
  return (
    <span style={{ width:size, height:size, border:'2px solid rgba(255,255,255,0.15)', borderTopColor:color, borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
  );
}

function toLocalDateStr(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function toLocalTimeStr(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtFull(iso) {
  return new Date(iso).toLocaleDateString('en-GB',{ weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

function downloadIcs(lead, dateStr, timeStr) {
  const [year,month,day]  = dateStr.split('-').map(Number);
  const [hours,minutes]   = (timeStr||'09:00').split(':').map(Number);
  ics.createEvent({
    start:[year,month,day,hours,minutes], duration:{ hours:1 },
    title:`Callback: ${lead.name} – DNK Consultancy`,
    description:`Phone: ${lead.phone||''}\nService: ${lead.service||''}\nEmail: ${lead.email||''}`,
    location:'Phone Call', status:'CONFIRMED', busyStatus:'BUSY',
    organizer:{ name:'DNK Consultancy', email:'dnkrealestate2022@gmail.com' },
    ...(lead.email?{ attendees:[{ name:lead.name, email:lead.email, rsvp:true }] }:{}),
  }, (err,value) => {
    if (err) return;
    const blob = new Blob([value],{ type:'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.setAttribute('download',`callback_${lead.name.replace(/\s+/g,'_')}.ics`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminCalendar() {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const today                 = new Date();
  const [viewDate, setViewDate]   = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Schedule (new) modal
  const [showSchedule, setShowSchedule]   = useState(false);
  const [schedLead,    setSchedLead]      = useState(null);
  const [schedDate,    setSchedDate]      = useState('');
  const [schedTime,    setSchedTime]      = useState('09:00');
  const [schedSearch,  setSchedSearch]    = useState('');
  const [schedSaving,  setSchedSaving]    = useState(false);
  const [schedSuccess, setSchedSuccess]   = useState(false);
  const [schedError,   setSchedError]     = useState('');

  // Edit existing callback modal
  const [editingLead,  setEditingLead]    = useState(null);
  const [editDate,     setEditDate]       = useState('');
  const [editTime,     setEditTime]       = useState('09:00');
  const [editSaving,   setEditSaving]     = useState(false);
  const [editSuccess,  setEditSuccess]    = useState(false);
  const [editError,    setEditError]      = useState('');

  // ── Fetch leads ──────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) setLeads(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Calendar math ────────────────────────────────────────────────────────────
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek  = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month+1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const callbackLeads = leads.filter(l => l.callbackDate);

  const eventsForDate = (y, m, d) =>
    callbackLeads.filter(l => {
      const cb = new Date(l.callbackDate);
      return cb.getFullYear()===y && cb.getMonth()===m && cb.getDate()===d;
    }).sort((a,b) => new Date(a.callbackDate)-new Date(b.callbackDate));

  const cells = [];
  for (let i = firstDayOfWeek-1; i>=0; i--)
    cells.push({ day:daysInPrevMonth-i, current:false });
  for (let d=1; d<=daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day:d, current:true, dateStr, events:eventsForDate(year,month,d) });
  }
  let nxt=1; while (cells.length<42) cells.push({ day:nxt++, current:false });

  const isToday    = d => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
  const isSelected = d => selectedDay && selectedDay.year===year && selectedDay.month===month && selectedDay.day===d;

  const thisMonthCount = callbackLeads.filter(l => {
    const cb = new Date(l.callbackDate);
    return cb.getFullYear()===year && cb.getMonth()===month;
  }).length;

  const in7 = new Date(today); in7.setDate(in7.getDate()+7);
  const upcoming = callbackLeads
    .filter(l => { const cb = new Date(l.callbackDate); return cb>=today && cb<=in7; })
    .sort((a,b) => new Date(a.callbackDate)-new Date(b.callbackDate));

  const filteredLeads = leads.filter(l => {
    if (!schedSearch.trim()) return false;
    const q = schedSearch.toLowerCase();
    return l.name?.toLowerCase().includes(q)||l.phone?.includes(q)||l.email?.toLowerCase().includes(q);
  }).slice(0,8);

  const selectedDayEvents = selectedDay ? eventsForDate(selectedDay.year,selectedDay.month,selectedDay.day) : [];

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (lead) => {
    setEditingLead(lead);
    setEditDate(toLocalDateStr(lead.callbackDate));
    setEditTime(toLocalTimeStr(lead.callbackDate));
    setEditSaving(false); setEditSuccess(false); setEditError('');
  };

  // ── Save rescheduled callback ────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editingLead || !editDate) return;
    setEditSaving(true); setEditError('');
    const combined = new Date(`${editDate}T${editTime||'09:00'}`);
    try {
      const res = await fetch(`/api/leads/${editingLead._id}`, {
        method:'PUT', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ callbackDate:combined.toISOString() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id===updated._id ? updated : l));
        setEditSuccess(true);
        setTimeout(() => { setEditingLead(null); setEditSuccess(false); }, 1100);
      } else { setEditError('Failed to save. Try again.'); }
    } catch { setEditError('Network error.'); }
    finally { setEditSaving(false); }
  };

  // ── Remove callback date ─────────────────────────────────────────────────────
  const removeCallback = async () => {
    if (!editingLead || !window.confirm(`Remove scheduled callback for ${editingLead.name}?`)) return;
    try {
      const res = await fetch(`/api/leads/${editingLead._id}`, {
        method:'PUT', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ callbackDate:null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id===updated._id ? updated : l));
        setEditingLead(null);
      }
    } catch { /* ignore */ }
  };

  // ── Save new callback ────────────────────────────────────────────────────────
  const saveSchedule = async () => {
    if (!schedLead || !schedDate) return;
    setSchedSaving(true); setSchedError('');
    const combined = new Date(`${schedDate}T${schedTime||'09:00'}`);
    try {
      const res = await fetch(`/api/leads/${schedLead._id}`, {
        method:'PUT', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ callbackDate:combined.toISOString() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id===updated._id ? updated : l));
        setSchedSuccess(true);
        setTimeout(() => {
          setShowSchedule(false); setSchedSuccess(false);
          setSchedLead(null); setSchedDate(''); setSchedTime('09:00'); setSchedSearch('');
        }, 1100);
      } else { setSchedError('Failed to save. Try again.'); }
    } catch { setSchedError('Network error.'); }
    finally { setSchedSaving(false); }
  };

  const openSchedule = (prefillDate='') => {
    setSchedDate(prefillDate || today.toISOString().split('T')[0]);
    setSchedLead(null); setSchedSearch(''); setSchedSuccess(false); setSchedError('');
    setShowSchedule(true);
  };

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'white', margin:0 }}>Callback Calendar</h1>
          <p style={{ color:'#475569', fontSize:13, marginTop:4 }}>Schedule and manage callback appointments for leads.</p>
        </div>
        <button onClick={() => openSchedule()} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:12, background:'linear-gradient(135deg,#0f766e,#0d9488)', border:'none', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(13,148,136,0.3)', flexShrink:0 }}>
          <Plus size={16} /> Schedule Callback
        </button>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>

        {/* ══ CALENDAR ══════════════════════════════════════════════════════════ */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, overflow:'hidden' }}>

          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setViewDate(new Date(year,month-1,1))} style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronLeft size={16}/>
            </button>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:'white', fontWeight:800, fontSize:20 }}>{MONTHS[month]} {year}</div>
              <div style={{ color:'#475569', fontSize:12, marginTop:2 }}>{thisMonthCount} callback{thisMonthCount!==1?'s':''} this month</div>
            </div>
            <button onClick={() => setViewDate(new Date(year,month+1,1))} style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronRight size={16}/>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding:'10px 0', textAlign:'center', color:'#475569', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>{d}</div>
            ))}
          </div>

          {/* Grid cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {cells.map((cell,i) => {
              const tod = cell.current && isToday(cell.day);
              const sel = cell.current && isSelected(cell.day);
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (!cell.current) return;
                    setSelectedDay(sel ? null : { year, month, day:cell.day, dateStr:cell.dateStr });
                  }}
                  style={{ minHeight:100, padding:'8px 10px', borderRight:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:cell.current?'pointer':'default', background:sel?'rgba(20,184,166,0.1)':tod?'rgba(20,184,166,0.05)':'transparent', transition:'background 0.15s' }}
                  onMouseEnter={e => { if (cell.current&&!sel) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background=sel?'rgba(20,184,166,0.1)':tod?'rgba(20,184,166,0.05)':'transparent'; }}
                >
                  {/* Day number */}
                  <div style={{ width:26, height:26, borderRadius:'50%', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:tod||sel?800:400, color:tod?'#0d2226':cell.current?'white':'#2e4a4a', background:tod?'#14b8a6':sel?'rgba(20,184,166,0.25)':'transparent', border:sel&&!tod?'2px solid rgba(20,184,166,0.6)':'none' }}>
                    {cell.day}
                  </div>

                  {/* Event chips — click to edit */}
                  {cell.current && cell.events?.slice(0,3).map(lead => {
                    const sc = STATUS_COLORS[lead.status]||'#60a5fa';
                    const t  = toLocalTimeStr(lead.callbackDate);
                    return (
                      <div
                        key={lead._id}
                        onClick={e => { e.stopPropagation(); openEdit(lead); }}
                        title={`${lead.name} · ${t} — click to edit`}
                        style={{ background:`${sc}1a`, border:`1px solid ${sc}44`, borderLeft:`3px solid ${sc}`, borderRadius:5, padding:'2px 6px', marginBottom:3, fontSize:10, fontWeight:700, color:sc, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:'pointer' }}
                      >
                        ✏ {t} {lead.name}
                      </div>
                    );
                  })}
                  {cell.current && cell.events?.length>3 && (
                    <div style={{ fontSize:10, color:'#475569', fontWeight:600, paddingLeft:2 }}>+{cell.events.length-3} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <button onClick={() => { setViewDate(new Date()); setSelectedDay(null); }} style={{ width:'100%', padding:'10px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Jump to Today
          </button>

          {/* Selected-day panel */}
          {selectedDay && (
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(20,184,166,0.3)', borderRadius:16, padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div>
                  <div style={{ color:'#2dd4bf', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>{MONTHS[selectedDay.month]} {selectedDay.year}</div>
                  <div style={{ color:'white', fontSize:26, fontWeight:800, lineHeight:1 }}>{selectedDay.day}</div>
                </div>
                <button onClick={() => openSchedule(selectedDay.dateStr)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.3)', color:'#2dd4bf', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  <Plus size={13}/> Add
                </button>
              </div>
              {selectedDayEvents.length===0 ? (
                <div style={{ textAlign:'center', padding:'18px 0', color:'#334155', fontSize:13 }}>No callbacks this day.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {selectedDayEvents.map(lead => {
                    const sc = STATUS_COLORS[lead.status]||'#60a5fa';
                    return (
                      <div key={lead._id} onClick={() => openEdit(lead)} style={{ padding:'10px 12px', borderRadius:11, background:`${sc}12`, border:`1px solid ${sc}30`, cursor:'pointer' }} title="Click to edit">
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:7, height:7, borderRadius:'50%', background:sc, flexShrink:0 }}/>
                          <div style={{ color:'white', fontWeight:700, fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lead.name}</div>
                          <div style={{ color:'#2dd4bf', fontSize:12, fontWeight:700, flexShrink:0 }}>{toLocalTimeStr(lead.callbackDate)}</div>
                        </div>
                        <div style={{ color:'#64748b', fontSize:11, marginTop:4, paddingLeft:15 }}>{lead.phone}{lead.service ? ` · ${lead.service}`:''}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming 7 days */}
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Bell size={14} style={{ color:'#2dd4bf' }}/>
              <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Next 7 Days</span>
              {upcoming.length>0 && <span style={{ marginLeft:'auto', background:'rgba(20,184,166,0.15)', color:'#2dd4bf', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>{upcoming.length}</span>}
            </div>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'20px 0' }}><Spinner/></div>
            ) : upcoming.length===0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#334155', fontSize:13 }}>No upcoming callbacks.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {upcoming.map(lead => {
                  const cb = new Date(lead.callbackDate);
                  const sc = STATUS_COLORS[lead.status]||'#60a5fa';
                  const isToday2 = cb.toDateString()===today.toDateString();
                  return (
                    <div key={lead._id} onClick={() => openEdit(lead)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, background:isToday2?'rgba(20,184,166,0.08)':'rgba(255,255,255,0.02)', border:`1px solid ${isToday2?'rgba(20,184,166,0.25)':'rgba(255,255,255,0.05)'}`, cursor:'pointer' }} title="Click to edit">
                      <div style={{ width:8, height:8, borderRadius:'50%', background:sc, flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:'white', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{lead.name}</div>
                        <div style={{ color:'#475569', fontSize:11, marginTop:2 }}>
                          {isToday2 ? `🔔 Today · ${toLocalTimeStr(lead.callbackDate)}` : `${cb.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · ${toLocalTimeStr(lead.callbackDate)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status legend */}
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:16 }}>
            <div style={{ color:'#64748b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Status Legend</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {Object.entries(STATUS_COLORS).map(([s,c]) => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:c, flexShrink:0 }}/>
                  <span style={{ color:'#94a3b8', fontSize:12 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ══ SCHEDULE NEW CALLBACK MODAL ══════════════════════════════════════ */}
      {showSchedule && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setShowSchedule(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'linear-gradient(160deg,#0d2226,#091a1e)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 24px 80px rgba(0,0,0,0.8)', overflow:'hidden' }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(20,184,166,0.15)', border:'1px solid rgba(20,184,166,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Calendar size={18} style={{ color:'#2dd4bf' }}/>
                </div>
                <div>
                  <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Schedule Callback</div>
                  <div style={{ color:'#475569', fontSize:12 }}>Pick a lead, set date and time</div>
                </div>
              </div>
              <button onClick={() => setShowSchedule(false)} style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={15}/>
              </button>
            </div>

            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:18 }}>
              {/* Lead search */}
              <div>
                <label style={lbl}>Select Lead</label>
                <div style={{ position:'relative', marginBottom:8 }}>
                  <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', pointerEvents:'none' }}/>
                  <input value={schedSearch} onChange={e => { setSchedSearch(e.target.value); if (schedLead) setSchedLead(null); }} placeholder="Search name, phone, or email…" style={{ ...inp, paddingLeft:36 }}/>
                </div>

                {schedLead ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.3)', borderRadius:10 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:'rgba(20,184,166,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#2dd4bf', fontWeight:800, fontSize:14, flexShrink:0 }}>{schedLead.name[0]?.toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'white', fontWeight:700, fontSize:13 }}>{schedLead.name}</div>
                      <div style={{ color:'#64748b', fontSize:11 }}>{schedLead.phone}{schedLead.service ? ` · ${schedLead.service}`:''}</div>
                    </div>
                    <button onClick={() => { setSchedLead(null); setSchedSearch(''); }} style={{ color:'#475569', background:'none', border:'none', cursor:'pointer', display:'flex' }}><X size={14}/></button>
                  </div>
                ) : schedSearch.trim() ? (
                  <div style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden', maxHeight:240, overflowY:'auto' }}>
                    {filteredLeads.length===0 ? (
                      <div style={{ padding:'14px 16px', color:'#475569', fontSize:13 }}>No leads found.</div>
                    ) : filteredLeads.map(l => (
                      <div key={l._id} onClick={() => { setSchedLead(l); setSchedSearch(l.name); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontWeight:800, fontSize:12, flexShrink:0 }}>{l.name[0]?.toUpperCase()}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:'white', fontWeight:600, fontSize:13 }}>{l.name}</div>
                          <div style={{ color:'#475569', fontSize:11 }}>{l.phone}{l.service ? ` · ${l.service}`:''}</div>
                        </div>
                        <div style={{ padding:'2px 8px', borderRadius:20, background:`${STATUS_COLORS[l.status]||'#60a5fa'}20`, color:STATUS_COLORS[l.status]||'#60a5fa', fontSize:10, fontWeight:700, flexShrink:0 }}>{l.status}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Date + Time */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Time</label>
                  <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} style={inp}/>
                </div>
              </div>

              {/* ICS download (shown after lead + date selected) */}
              {schedLead && schedDate && (
                <div>
                  <label style={{ ...lbl, marginBottom:8 }}>Export to Calendar App</label>
                  <button onClick={() => downloadIcs(schedLead, schedDate, schedTime)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    <Download size={14}/> Download .ICS (Outlook / Apple Calendar)
                  </button>
                </div>
              )}

              {schedError && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#f87171', fontSize:13 }}>
                  ⚠ {schedError}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:10, padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setShowSchedule(false)} style={{ flex:1, padding:13, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={saveSchedule} disabled={!schedLead||!schedDate||schedSaving} style={{ flex:2, padding:13, borderRadius:12, border:'none', color:(!schedLead||!schedDate)?'#475569':'white', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:(!schedLead||!schedDate||schedSaving)?'not-allowed':'pointer', background:schedSuccess?'linear-gradient(135deg,#166534,#15803d)':(!schedLead||!schedDate)?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#0f766e,#0d9488)', opacity:schedSaving?0.75:1 }}>
                {schedSaving?<><Spinner/> Saving…</>:schedSuccess?<><CheckCircle2 size={15}/> Scheduled!</>:<><Calendar size={15}/> Save Callback</>}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ══ EDIT / RESCHEDULE MODAL ══════════════════════════════════════════ */}
      {editingLead && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)', zIndex:210, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setEditingLead(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'linear-gradient(160deg,#0d2226,#091a1e)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:20, width:'100%', maxWidth:420, boxShadow:'0 24px 80px rgba(0,0,0,0.8)', overflow:'hidden' }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:13, background:`${STATUS_COLORS[editingLead.status]||'#60a5fa'}22`, border:`1px solid ${STATUS_COLORS[editingLead.status]||'#60a5fa'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, color:STATUS_COLORS[editingLead.status]||'#60a5fa' }}>
                  {editingLead.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ color:'white', fontWeight:800, fontSize:16 }}>{editingLead.name}</div>
                  <div style={{ color:STATUS_COLORS[editingLead.status]||'#60a5fa', fontSize:11, fontWeight:700, marginTop:2 }}>{editingLead.status}</div>
                </div>
              </div>
              <button onClick={() => setEditingLead(null)} style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={14}/>
              </button>
            </div>

            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              {/* Current scheduled time */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:11 }}>
                <Clock size={14} style={{ color:'#2dd4bf', flexShrink:0 }}/>
                <div>
                  <div style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>Currently scheduled</div>
                  <div style={{ color:'#2dd4bf', fontWeight:700, fontSize:13, marginTop:2 }}>
                    {fmtFull(editingLead.callbackDate)} · {toLocalTimeStr(editingLead.callbackDate)}
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {editingLead.phone && <div style={{ display:'flex', alignItems:'center', gap:8, color:'#94a3b8', fontSize:12 }}><Phone size={12} style={{ color:'#475569' }}/>{editingLead.phone}</div>}
                {editingLead.email && <div style={{ display:'flex', alignItems:'center', gap:8, color:'#94a3b8', fontSize:12 }}><Mail size={12} style={{ color:'#475569' }}/>{editingLead.email}</div>}
                {editingLead.service && <div style={{ display:'flex', alignItems:'center', gap:8, color:'#94a3b8', fontSize:12 }}><Briefcase size={12} style={{ color:'#475569' }}/>{editingLead.service}</div>}
              </div>

              {/* Divider */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16 }}>
                <label style={{ ...lbl, color:'#2dd4bf' }}>Reschedule to</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={lbl}>Date</label>
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Time</label>
                    <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={inp}/>
                  </div>
                </div>
              </div>

              {/* ICS export */}
              <button onClick={() => downloadIcs(editingLead, editDate, editTime)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'#64748b', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <Download size={13}/> Export .ICS (Outlook / Apple Calendar)
              </button>

              {editError && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#f87171', fontSize:13 }}>
                  ⚠ {editError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', gap:8, padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={removeCallback} style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                <Trash2 size={13}/> Remove
              </button>
              <button onClick={() => setEditingLead(null)} style={{ flex:1, padding:12, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={!editDate||editSaving} style={{ flex:2, padding:12, borderRadius:12, border:'none', color:!editDate?'#475569':'white', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:(!editDate||editSaving)?'not-allowed':'pointer', background:editSuccess?'linear-gradient(135deg,#166534,#15803d)':!editDate?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#0f766e,#0d9488)', opacity:editSaving?0.75:1 }}>
                {editSaving?<><Spinner/> Saving…</>:editSuccess?<><CheckCircle2 size={15}/> Updated!</>:<><Calendar size={15}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
