// App.js — Fairway 6/7 Iron 👋 (Intelligence Console)
// Updates: Persistent Upload Button, "Cpu" icon fix, Polished Drop-in UI.

import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, 
  Search, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  UploadCloud, // Used for the Import Button
  MessageSquare, 
  RefreshCw, 
  Trash2, 
  Zap, 
  Target, 
  Cpu, // Replaced BrainCircuit with Cpu for compatibility
  ShieldCheck,
  Briefcase, 
  DollarSign, 
  FileCheck2, 
  Scale, 
  Building2, 
  Bug, 
  Cog, 
  Wrench, 
  ServerCog, 
  Shield, 
  Database, 
  PenTool, 
  HeadphonesIcon
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const Styles = () => (
  <style>{`
    :root {
      --navy: #0f172a;
      --slate: #64748b;
      --light: #f8fafc;
      --white: #ffffff;
      --blue: #3b82f6;
      --green: #10b981;
      --orange: #f97316;
      --purple: #8b5cf6;
      --border: #e2e8f0;
      --radius: 12px;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: var(--navy); }
    
    /* Layout */
    .app-shell { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 340px; background: var(--white); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; }
    .main-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; position: relative; padding: 20px; }
    
    /* Typography */
    h1, h2, h3 { margin: 0; font-weight: 700; letter-spacing: -0.02em; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate); font-weight: 600; margin-bottom: 6px; display: block; }
    
    /* Sidebar Items */
    .queue-item { padding: 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.1s; margin-bottom: 4px; position: relative; }
    .queue-item:hover { background: var(--light); }
    .queue-item.active { background: #eff6ff; border-color: var(--blue); }
    .queue-item.done { opacity: 0.6; background: #f0fdf4; }
    .q-name { font-weight: 600; font-size: 14px; color: var(--navy); }
    .q-role { font-size: 12px; color: var(--slate); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    
    /* Main Layout Grid */
    .iron-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; max-width: 1100px; width: 100%; height: 100%; max-height: 800px; }

    /* Workbench Card */
    .iron-card { background: var(--white); border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; }
    .iron-header { padding: 24px; border-bottom: 1px solid var(--border); background: linear-gradient(to bottom, #fff, #f8fafc); }
    .iron-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    
    /* Persona Card */
    .persona-card { background: var(--navy); color: white; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3); animation: fadeIn 0.4s ease-out; }
    .p-list { list-style: none; padding: 0; margin: 0; }
    .p-list li { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #e2e8f0; line-height: 1.4; }
    .p-section h4 { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }

    /* Tabs & Editor */
    .tabs { display: flex; gap: 4px; background: var(--light); padding: 4px; border-radius: 8px; margin-bottom: 20px; }
    .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .tab.active { background: var(--white); color: var(--blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; }
    .preview-box { background: #f8fafc; padding: 20px; border-radius: 12px; font-size: 15px; line-height: 1.6; color: var(--navy); border: 1px solid var(--border); flex: 1; margin-bottom: 20px; white-space: pre-wrap; font-family: -apple-system, system-ui, sans-serif; }
    .variable { color: var(--blue); background: rgba(59, 130, 246, 0.1); padding: 0 4px; border-radius: 4px; font-weight: 500; }

    /* Buttons */
    .actions { display: flex; gap: 12px; margin-top: auto; }
    .btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.1s; border: none; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.06); }
    .btn:active { transform: translateY(1px); }
    .btn-primary { background: var(--navy); color: white; }
    .btn-secondary { background: white; border: 1px solid var(--border); color: var(--navy); }
    
    /* Empty State (Polished) */
    .empty-state { text-align: center; padding: 40px; width: 100%; max-width: 500px; background: white; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); border: 1px solid var(--border); }
    .upload-zone { border: 2px dashed var(--border); border-radius: 16px; padding: 40px; margin-top: 24px; transition: all 0.2s; cursor: pointer; }
    .upload-zone:hover { border-color: var(--blue); background: #eff6ff; }
    .upload-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--blue); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; pointer-events: none; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Logic & Persona Definitions                                        */
/* ------------------------------------------------------------------ */

// 1) Title splitter
const LEVEL_PATTERNS = [
  { re: /(chief|c[ -]?level|cfo|cio|cto|cmo|cro|cso|ciso|coo|ceo)/i, level: "C-Level" },
  { re: /(vp|vice president|svp|evp|vice[- ]president)/i, level: "VP" },
  { re: /(head of|director)/i, level: "Director" },
  { re: /(manager|lead|practice lead|principal)/i, level: "Manager" },
  { re: /(specialist|analyst|coordinator|associate|engineer|designer|developer|architect)/i, level: "IC" },
];

const FUNCTION_MAP = [
  { fn: "Revenue Operations", keys: /(rev ?ops|revenue operations|sales operations|sf[ac]|crm|enablement)/i },
  { fn: "Sales", keys: /(account executive|ae|enterprise sales|strategic account|sdr|bdr)/i },
  { fn: "Marketing", keys: /(demand gen|growth|marketing|brand|pmm)/i },
  { fn: "Engineering", keys: /(engineer|developer|software|frontend|backend|full[- ]?stack|devops|sre)/i },
  { fn: "Product", keys: /(product manager|pm|owner)/i },
  { fn: "Data", keys: /(data|analytics|bi|ml|ai)/i },
  { fn: "HR/People", keys: /(hr|people|talent|recruit)/i },
  { fn: "Finance", keys: /(finance|fp&a|controller|cfo)/i },
  { fn: "Security", keys: /(security|ciso|secops)/i },
  { fn: "Executive", keys: /(ceo|founder|president)/i },
];

function splitTitle(title = "") {
  const t = String(title);
  const level = (LEVEL_PATTERNS.find(p => p.re.test(t))?.level) || "IC";
  const entry = FUNCTION_MAP.find(f => f.keys.test(t));
  const fn = entry?.fn || "General";
  return { level, function: fn };
}

// 2) Persona Ontology
const PERSONAS = [
  {
    id: "revops", label: "Revenue Operations", match: /(rev ?ops|revenue operations|sales operations)/i,
    icon: <Target size={16}/>, color: "#10b981",
    goals: ["Accurate forecasting","Process consistency"], challenges: ["Dirty data","Rep adoption"],
    success: ["Forecast accuracy","Win rate"], interaction: ["Short proof-led demos"],
    preferred: ["Analyst reports","Playbooks"], lifecycle: ["participate","actualize"]
  },
  {
    id: "sales", label: "Sales Leader", match: /(account executive|sales|ae|sdr|bdr)/i,
    icon: <DollarSign size={16}/>, color: "#10b981",
    goals: ["Quota attainment","Pipeline velocity"], challenges: ["Access to power","Stalled deals"],
    success: ["Revenue","ACV"], interaction: ["Tactical, fast"],
    preferred: ["Battlecards","Email scripts"], lifecycle: ["develop","retain"]
  },
  {
    id: "engineering", label: "Engineering", match: /(engineer|developer|software|cto|devops)/i,
    icon: <Cpu size={16}/>, color: "#3b82f6", // Changed BrainCircuit to Cpu
    goals: ["Stability","Velocity"], challenges: ["Technical debt","Maintenance"],
    success: ["Uptime","Lead time"], interaction: ["APIs, docs, proofs"],
    preferred: ["Documentation","SDKs"], lifecycle: ["initiate","develop"]
  },
  {
    id: "marketing", label: "Marketing", match: /(marketing|growth|demand|brand)/i,
    icon: <Zap size={16}/>, color: "#f97316",
    goals: ["Pipeline generation","CAC efficiency"], challenges: ["Attribution","Budget"],
    success: ["MQLs/SQLs","ROI"], interaction: ["Evidence-first"],
    preferred: ["Case studies","Calculators"], lifecycle: ["initiate","develop"]
  },
  {
    id: "hr", label: "HR / Talent", match: /(hr|people|talent|recruit)/i,
    icon: <Users size={16}/>, color: "#8b5cf6",
    goals: ["Retention","Hiring speed"], challenges: ["Burnout","Culture"],
    success: ["eNPS","Time-to-fill"], interaction: ["Empathy first"],
    preferred: ["Guides","Benchmarks"], lifecycle: ["retain","grow"]
  },
  {
    id: "executive", label: "Executive", match: /(ceo|founder|president|coo)/i,
    icon: <ShieldCheck size={16}/>, color: "#0f172a",
    goals: ["Profitability","Market share"], challenges: ["Execution risk","Time"],
    success: ["Growth","Margin"], interaction: ["Bottom-line impact"],
    preferred: ["Executive summaries"], lifecycle: ["select"]
  }
];

// 3) Detect Logic
function detectPersonaDeep(title = "") {
  const match = PERSONAS.find(p => p.match.test(title));
  if (match) return { ...match, ...splitTitle(title) };
  return {
    id: "general", label: "Professional", icon: <Users size={16}/>,
    goals: ["Efficiency","Impact"], challenges: ["Time management"],
    success: ["Outcomes"], interaction: ["Relevant value"],
    preferred: ["Case studies"], lifecycle: ["initiate"],
    ...splitTitle(title)
  };
}

// 4) Messaging
function makeTemplates(persona, row) {
  const fn = persona.label;
  const goal = persona.goals[0];
  return {
    connect: `Hi {{firstName}} — I work with ${fn} teams focused on ${goal}. Have a short resource on how peers are solving this. Open to connect?`,
    message: `Thanks for connecting, {{firstName}}. For ${fn}, we usually focus on ${goal} without the fluff. If helpful, I can share a specific example for {{company}}.`,
    followup: `{{firstName}} — sending that resource on ${goal} here: [Link]. Worth a quick look given your role?`
  };
}

// 5) CSV Helpers
const LS_KEY = "fairway-iron-v4";

function getFirstName(fullName) { return fullName ? fullName.split(" ")[0] : ""; }

function mapRow(rawRow, headers) {
  const normalize = (h) => h.toLowerCase().replace(/[\s_"]/g, "");
  const findIdx = (variations) => headers.findIndex(h => variations.includes(normalize(h)));
  
  const nameIdx = findIdx(['fullname','name','profilename']);
  const titleIdx = findIdx(['headline','title','jobtitle']);
  const companyIdx = findIdx(['companyname','company']);
  const urlIdx = findIdx(['profileurl','linkedinurl','url','linkedin']);
  const degIdx = findIdx(['degree','connection']); // Detects "1st"

  const rawName = rawRow[nameIdx] || "Unknown";
  const title = rawRow[titleIdx] || "Unknown Title";
  const persona = detectPersonaDeep(title);

  return {
    name: rawName,
    firstName: getFirstName(rawName),
    title,
    company: rawRow[companyIdx] || "Unknown Company",
    linkedin_url: rawRow[urlIdx] || "",
    degree: rawRow[degIdx] || "", // e.g. "1st"
    status: "new",
    persona
  };
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = lines[0].match(/("([^"]|"")*"|[^,]+)/g).map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map((line) => {
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
    const cleaned = cols.map((c) => c.replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"').trim());
    return mapRow(cleaned, headers);
  });
}

function renderTemplate(tpl, row) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => row?.[k] || `[${k}]`);
}

/* ------------------------------------------------------------------ */
/* Main App                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [prospects, setProspects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState({ connect:"", message:"", followup:"" });
  const [activeTab, setActiveTab] = useState("connect");
  const [isFirstDegree, setIsFirstDegree] = useState(false);
  const [sentToday, setSentToday] = useState(0);
  const dailyLimit = 50;

  // Load / Save
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProspects(parsed.prospects || []);
        setTemplates(parsed.templates || templates);
        setSentToday(parsed.sentToday || 0);
      } catch {}
    }
  }, []);

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify({ prospects, templates, sentToday })); }, [prospects, templates, sentToday]);

  // Derived
  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter(p => !q || (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q)));
  }, [prospects, search]);

  const current = filteredList[selectedIndex];
  const persona = useMemo(() => current?.persona || detectPersonaDeep(current?.title || ""), [current]);

  // Auto-switch tabs based on degree
  useEffect(() => {
    if (!current) return;
    const isConnected = current.degree?.includes("1st") || current.status === "connected" || isFirstDegree;
    if (isConnected) { setActiveTab("message"); setIsFirstDegree(true); } 
    else { setActiveTab("connect"); setIsFirstDegree(false); }
  }, [current, selectedIndex]);

  // Auto-generate templates if empty
  useEffect(() => {
    if (!current) return;
    const auto = makeTemplates(persona, current);
    setTemplates(prev => ({
      connect: prev.connect || auto.connect,
      message: prev.message || auto.message,
      followup: prev.followup || auto.followup
    }));
  }, [selectedIndex, current]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      setProspects(rows);
      setSelectedIndex(0);
      setTemplates({ connect:"", message:"", followup:"" }); // Reset to allow auto-gen
    };
    reader.readAsText(f);
  };

  const copyAndOpen = async () => {
    if (!current) return;
    const text = renderTemplate(templates[activeTab], current);
    await navigator.clipboard.writeText(text);
    let url = current.linkedin_url; if (url && !url.startsWith('http')) url = 'https://' + url;
    window.open(url || "https://linkedin.com", "_blank");

    const newProspects = [...prospects];
    const realIndex = prospects.indexOf(current);
    if (realIndex > -1) { newProspects[realIndex].status = activeTab === 'connect' ? "requested" : "messaged"; setProspects(newProspects); }
    setSentToday(prev => prev + 1);
    setTimeout(() => { if (selectedIndex < filteredList.length - 1) setSelectedIndex(prev => prev + 1); }, 500);
  };

  const resetData = () => { if (window.confirm("Clear all data?")) { setProspects([]); setSentToday(0); localStorage.removeItem(LS_KEY); } };

  // --- RENDER EMPTY STATE ---
  if (prospects.length === 0) {
    return (
      <div className="app-shell" style={{ alignItems:'center', justifyContent:'center' }}>
        <Styles />
        <div className="empty-state">
          <div style={{ background:'#eff6ff', width:80, height:80, borderRadius:40, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <UploadCloud size={40} color="#3b82f6" />
          </div>
          <h1 style={{ fontSize:32, marginBottom:12 }}>Fairway 6/7 Iron 👋</h1>
          <p style={{ color:'#64748b', fontSize:16, lineHeight:1.5 }}>
            Upload your CSV. We’ll auto-detect <b>Personas</b> and prescript messaging.
          </p>
          <label className="upload-zone">
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleUpload} />
            <div className="upload-btn"><UploadCloud size={18}/> Select CSV File</div>
          </label>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN ---
  return (
    <div className="app-shell">
      <Styles />
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sb-header" style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:18 }}>Queue</h2>
            
            {/* New Persistent Import Button */}
            <div style={{ display:'flex', gap:8 }}>
              <label title="Import New CSV" style={{ cursor:'pointer', color:'#64748b' }}>
                <UploadCloud size={18} />
                <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleUpload} />
              </label>
              <button onClick={resetData} title="Reset" style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div style={{ background:'#f8fafc', padding:12, borderRadius:8, border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, marginBottom:6 }}>
              <span>Daily Velocity</span>
              <span style={{ color: sentToday >= dailyLimit ? 'red' : 'green' }}>{sentToday} / {dailyLimit}</span>
            </div>
            <div style={{ height:6, background:'#e2e8f0', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${Math.min((sentToday/dailyLimit)*100,100)}%`, background:'#0f172a', height:'100%' }} />
            </div>
          </div>
        </div>
        <div className="sb-search" style={{ padding:16 }}>
          <input className="search-input" placeholder="Search queue..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="queue-list" style={{ padding:16, overflow:'auto' }}>
          {filteredList.map((p, i) => (
            <div key={i} className={`queue-item ${i===selectedIndex?'active':''} ${p.status!=='new'?'done':''}`} onClick={() => setSelectedIndex(i)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div className="q-name">{p.name}</div>
                {p.status!=='new' && <CheckCircle size={14} color="#10b981" />}
              </div>
              <div className="q-role" style={{ marginTop:2 }}>{p.title}</div>
              <div className="q-role" style={{ color:'#94a3b8' }}>{p.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN STAGE */}
      <div className="main-stage">
        {current ? (
          <div className="iron-grid">
            
            {/* Workbench */}
            <div className="iron-card">
              <div className="iron-header">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                  <div>
                    <h1 style={{ fontSize:28, marginBottom:6 }}>{current.name}</h1>
                    <div style={{ fontSize:16, color:'#475569', fontWeight:500, lineHeight:1.4 }}>{current.title}</div>
                    <div style={{ fontSize:14, color:'#94a3b8', fontWeight:500, marginTop:4 }}>{current.company}</div>
                  </div>
                  <a href={current.linkedin_url || '#'} target="_blank" rel="noreferrer"
                     style={{ color:'#3b82f6', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600, background:'#eff6ff', padding:'6px 12px', borderRadius:6 }}>
                    View <ExternalLink size={14} />
                  </a>
                </div>
                <div style={{ marginTop:20 }}>
                  <label className="toggle-row">
                    <input type="checkbox" className="toggle-check"
                      checked={isFirstDegree}
                      onChange={(e)=>{ setIsFirstDegree(e.target.checked); setActiveTab(e.target.checked ? "message":"connect"); }}
                    />
                    Already a 1st Degree Connection?
                  </label>
                </div>
              </div>

              <div className="iron-body">
                <div className="tabs">
                  <div className={`tab ${activeTab==='connect'?'active':''}`} onClick={()=>setActiveTab('connect')}><Users size={16}/> Connect</div>
                  <div className={`tab ${activeTab==='message'?'active':''}`} onClick={()=>setActiveTab('message')}><MessageSquare size={16}/> Message</div>
                  <div className={`tab ${activeTab==='followup'?'active':''}`} onClick={()=>setActiveTab('followup')}><RefreshCw size={16}/> Follow-up</div>
                </div>

                <div className="label">MESSAGE PREVIEW</div>
                <div className="preview-box">
                  {renderTemplate(templates[activeTab], current).split(/(\[.*?\])/g).map((part, i) =>
                    part.startsWith('[') && part.endsWith(']') ? <span key={i} className="variable">{part}</span> : part
                  )}
                </div>

                <details style={{ marginBottom:24 }}>
                  <summary style={{ fontSize:12, color:'#94a3b8', cursor:'pointer', fontWeight:500 }}>Adjust Template...</summary>
                  <textarea
                    style={{ width:'100%', marginTop:8, padding:12, borderRadius:8, borderColor:'#e2e8f0', fontSize:13, fontFamily:'sans-serif', minHeight:80 }}
                    value={templates[activeTab]}
                    onChange={(e)=>setTemplates({...templates, [activeTab]: e.target.value})}
                  />
                </details>

                <div className="actions">
                  <button className="btn btn-secondary" onClick={()=>setSelectedIndex(prev=>Math.min(prev+1, filteredList.length-1))}>Skip</button>
                  <button className="btn btn-primary" onClick={copyAndOpen}><Copy size={18}/>Copy & Open LinkedIn</button>
                </div>
              </div>
            </div>

            {/* Persona Intelligence */}
            <div className="persona-card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ padding:8, background:'rgba(255,255,255,.1)', borderRadius:8 }}>{persona.icon}</div>
                <div>
                  <div style={{ fontSize:10, opacity:.7, textTransform:'uppercase', letterSpacing:'.05em' }}>Persona • {splitTitle(current.title).level}</div>
                  <div style={{ fontSize:16, fontWeight:700 }}>{persona.label}</div>
                </div>
              </div>
              <div className="p-section">
                <h4>Top Goals</h4>
                <ul className="p-list">{persona.goals.map(g => <li key={g}><Target size={12}/> {g}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Challenges</h4>
                <ul className="p-list">{persona.challenges.map(c => <li key={c}><Bug size={12}/> {c}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Success</h4>
                <ul className="p-list">{persona.success.map(s => <li key={s}><ShieldCheck size={12}/> {s}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Interaction</h4>
                <ul className="p-list">{persona.interaction.map(i => <li key={i}><ChevronRight size={12}/> {i}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Preferred Resources</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {persona.preferred.map(p => <span key={p} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', padding:'4px 8px', borderRadius:999, fontSize:12 }}>{p}</span>)}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign:'center', color:'#94a3b8' }}><p>Select a prospect from the queue.</p></div>
        )}
      </div>
    </div>
  );
}
