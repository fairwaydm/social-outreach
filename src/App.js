// App.js — Fairway 6/7 Iron 👋 (Intelligence Console)
// Features: Dynamic Persona Cards, Smart Name Parsing, Connection Logic.

import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, 
  Search, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  UploadCloud,
  MessageSquare,
  RefreshCw,
  Trash2,
  Zap,
  Target,
  BrainCircuit,
  ShieldCheck
} from "lucide-react";

// --- STYLES (Embedded) ---
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
    .mono { font-family: monospace; font-size: 12px; color: var(--slate); }

    /* Queue Item */
    .queue-item { 
      padding: 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; 
      transition: all 0.1s; margin-bottom: 4px; position: relative;
    }
    .queue-item:hover { background: var(--light); }
    .queue-item.active { background: #eff6ff; border-color: var(--blue); }
    .queue-item.done { opacity: 0.6; background: #f0fdf4; }
    
    .q-name { font-weight: 600; font-size: 14px; color: var(--navy); }
    .q-role { font-size: 12px; color: var(--slate); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    
    /* Main Layout */
    .iron-grid {
      display: grid;
      grid-template-columns: 1fr 340px; /* Workspace | Persona Card */
      gap: 24px;
      max-width: 1100px;
      width: 100%;
      height: 100%;
      max-height: 800px;
    }

    /* Workbench Card */
    .iron-card { 
      background: var(--white); border-radius: 20px; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
      border: 1px solid var(--border); overflow: hidden;
      display: flex; flex-direction: column;
    }
    .iron-header { padding: 24px; border-bottom: 1px solid var(--border); background: linear-gradient(to bottom, #fff, #f8fafc); }
    .iron-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    
    /* Persona Intelligence Card */
    .persona-card {
      background: var(--navy); color: white; border-radius: 20px;
      padding: 24px; display: flex; flex-direction: column; gap: 20px;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3);
      border: 1px solid rgba(255,255,255,0.1);
      animation: fadeIn 0.4s ease-out;
    }
    .p-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px; background: rgba(255,255,255,0.1); font-size: 11px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); }
    .p-section h4 { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .p-list { list-style: none; padding: 0; margin: 0; }
    .p-list li { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; color: #e2e8f0; line-height: 1.4; }
    .p-list li svg { flex-shrink: 0; color: var(--green); margin-top: 2px; }

    /* Tabs & Editor */
    .tabs { display: flex; gap: 4px; background: var(--light); padding: 4px; border-radius: 8px; margin-bottom: 20px; }
    .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .tab.active { background: var(--white); color: var(--blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; }
    .tab.active.tab-msg { color: var(--orange); } /* Different color for message tab */
    
    .preview-box { 
      background: #f8fafc; padding: 20px; border-radius: 12px; 
      font-size: 15px; line-height: 1.6; color: var(--navy); 
      border: 1px solid var(--border); flex: 1; margin-bottom: 20px;
      white-space: pre-wrap; font-family: -apple-system, system-ui, sans-serif;
    }
    .variable { color: var(--blue); background: rgba(59, 130, 246, 0.1); padding: 0 4px; border-radius: 4px; font-weight: 500; }

    /* Actions */
    .actions { display: flex; gap: 12px; margin-top: auto; }
    .btn { 
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 48px; border-radius: 10px; font-weight: 600; cursor: pointer; 
      transition: transform 0.1s; border: none; font-size: 14px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: var(--navy); color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
    .btn-primary:hover { background: #1e293b; }
    .btn-secondary { background: white; border: 1px solid var(--border); color: var(--navy); }
    .btn-secondary:hover { background: var(--light); }
    
    /* Toggle Switch */
    .toggle-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; }
    .toggle-check { accent-color: var(--blue); width: 16px; height: 16px; }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px; max-width: 480px; }
    .upload-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--blue); color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 24px; transition: background 0.2s; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

const LS_KEY = "fairway-iron-v2";

// --- INTELLIGENCE ENGINE (PERSONA LOGIC) ---

const PERSONA_DB = {
  sales: {
    role: "Revenue Leader",
    icon: <Target size={16} />,
    color: "#10b981", // Green
    priorities: ["Pipeline Velocity", "Quota Attainment", "Forecast Accuracy"],
    strategy: "Focus on speed to revenue and removing friction for reps.",
    mindset: "Impatient. Wants to know 'How does this help me hit my number?' immediately."
  },
  marketing: {
    role: "Growth Leader",
    icon: <Zap size={16} />,
    color: "#f97316", // Orange
    priorities: ["CAC Reduction", "Brand Equity", "Lead Quality"],
    strategy: "Highlight efficiency and creative leverage. Avoid technical jargon.",
    mindset: "Overwhelmed by tools. Looking for consolidation and clarity."
  },
  engineering: {
    role: "Technical Leader",
    icon: <BrainCircuit size={16} />,
    color: "#3b82f6", // Blue
    priorities: ["System Stability", "Dev Velocity", "Technical Debt"],
    strategy: "Be precise. Focus on integration, security, and scalability.",
    mindset: "Skeptical of fluff. Needs proof and documentation."
  },
  hr: {
    role: "People Leader",
    icon: <Users size={16} />,
    color: "#8b5cf6", // Purple
    priorities: ["Retention", "Culture", "Talent Acquisition"],
    strategy: "Emphasize human connection, empathy, and organizational health.",
    mindset: "Protective of the team. Values trust above all."
  },
  executive: {
    role: "Executive (C-Suite)",
    icon: <ShieldCheck size={16} />,
    color: "#0f172a", // Navy
    priorities: ["EBITDA", "Market Share", "Risk Mitigation"],
    strategy: "Keep it extremely brief. Focus on bottom-line impact and strategic edge.",
    mindset: "Time-poor. Decision-maker. Don't waste a second."
  },
  default: {
    role: "Professional",
    icon: <Users size={16} />,
    color: "#64748b",
    priorities: ["Efficiency", "Growth", "Impact"],
    strategy: "Focus on value and relevance to their specific industry.",
    mindset: "Open to connection if the value prop is clear."
  }
};

function detectPersona(title) {
  if (!title) return PERSONA_DB.default;
  const t = title.toLowerCase();
  
  if (t.includes("sales") || t.includes("revenue") || t.includes("account") || t.includes("cro")) return PERSONA_DB.sales;
  if (t.includes("marketing") || t.includes("brand") || t.includes("growth") || t.includes("cmo")) return PERSONA_DB.marketing;
  if (t.includes("engineer") || t.includes("developer") || t.includes("cto") || t.includes("tech")) return PERSONA_DB.engineering;
  if (t.includes("hr") || t.includes("people") || t.includes("talent") || t.includes("human")) return PERSONA_DB.hr;
  if (t.includes("ceo") || t.includes("founder") || t.includes("president") || t.includes("principal")) return PERSONA_DB.executive;
  
  return PERSONA_DB.default;
}

// --- DATA HELPERS ---

function getFirstName(fullName) {
  if (!fullName) return "";
  return fullName.split(" ")[0]; // "Scott Smith" -> "Scott"
}

function mapRow(rawRow, headers) {
  const normalize = (h) => h.toLowerCase().replace(/[\s_"]/g, "");
  const findIdx = (variations) => headers.findIndex(h => variations.includes(normalize(h)));
  
  const nameIdx = findIdx(['fullname', 'name', 'profilename']);
  const titleIdx = findIdx(['headline', 'title', 'jobtitle']);
  const companyIdx = findIdx(['companyname', 'company']);
  const urlIdx = findIdx(['profileurl', 'linkedinurl', 'url', 'linkedin']);
  const degIdx = findIdx(['degree', 'connection', 'distance']); // Look for connection degree

  const rawName = rawRow[nameIdx] || "Unknown";
  const rawDegree = rawRow[degIdx] || ""; 

  return {
    name: rawName,
    firstName: getFirstName(rawName),
    title: rawRow[titleIdx] || "Unknown Title",
    company: rawRow[companyIdx] || "Unknown Company",
    linkedin_url: rawRow[urlIdx] || "",
    degree: rawDegree, // "1st", "2nd", etc.
    status: "new"
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
  if (!tpl) return "";
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const val = row?.[k];
    if (!val || val.toLowerCase().includes("unknown")) return `[MISSING: ${k}]`;
    return val;
  });
}

// --- MAIN COMPONENT ---

export default function App() {
  const [prospects, setProspects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  
  // Note: Templates now use {{firstName}} instead of full name
  const [templates, setTemplates] = useState({
    connect: "Hi {{firstName}}, saw you engaged with the post about [Topic]. I work with {{title}}s on similar challenges. Would be great to connect.",
    message: "Thanks for connecting {{firstName}}! Curious if you're seeing [Problem] at {{company}} right now?",
    followup: "{{firstName}} - thought this resource might be helpful given your role: [Link]"
  });
  
  const [activeTab, setActiveTab] = useState("connect");
  const [isFirstDegree, setIsFirstDegree] = useState(false); // Manual override state
  const [sentToday, setSentToday] = useState(0);
  const dailyLimit = 50;

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProspects(parsed.prospects || []);
        setTemplates(parsed.templates || templates);
        setSentToday(parsed.sentToday || 0);
      } catch (e) { console.error("Load failed", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ prospects, templates, sentToday }));
  }, [prospects, templates, sentToday]);

  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter(p => 
      !q || (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q))
    );
  }, [prospects, search]);

  const current = filteredList[selectedIndex];
  
  // Dynamic Persona Intelligence
  const persona = useMemo(() => detectPersona(current?.title), [current]);

  // Effect: Auto-switch tabs based on connection degree
  useEffect(() => {
    if (!current) return;
    
    // Check CSV data or manual override
    const isConnected = current.degree?.includes("1st") || current.status === "connected" || isFirstDegree;
    
    if (isConnected) {
      setActiveTab("message");
      setIsFirstDegree(true); // Sync UI toggle
    } else {
      setActiveTab("connect");
      setIsFirstDegree(false);
    }
  }, [current, selectedIndex]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      setProspects(rows);
      setSelectedIndex(0);
    };
    reader.readAsText(f);
  };

  const copyAndOpen = async () => {
    if (!current) return;
    const text = renderTemplate(templates[activeTab], current);
    await navigator.clipboard.writeText(text);
    
    let url = current.linkedin_url;
    if (url && !url.startsWith('http')) url = 'https://' + url;
    
    // If it's a message, try to open messaging directly (experimental, usually just profile is safer)
    window.open(url || "https://linkedin.com", "_blank");

    // Update status
    const newProspects = [...prospects];
    const realIndex = prospects.indexOf(current);
    if (realIndex > -1) {
      newProspects[realIndex].status = activeTab === 'connect' ? "requested" : "messaged";
      setProspects(newProspects);
    }
    setSentToday(prev => prev + 1);
    
    setTimeout(() => {
      if (selectedIndex < filteredList.length - 1) setSelectedIndex(prev => prev + 1);
    }, 500);
  };

  const resetData = () => {
    if (window.confirm("Clear all data?")) {
      setProspects([]);
      setSentToday(0);
      localStorage.removeItem(LS_KEY);
    }
  };

  // --- RENDER EMPTY ---
  if (prospects.length === 0) {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Styles />
        <div className="empty-state">
          <div style={{ background: '#eff6ff', width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <UploadCloud size={40} color="#3b82f6" />
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Fairway 6/7 Iron 👋</h1>
          <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.5 }}>
            Upload your CSV. We'll auto-detect Personas and organize your outreach.
          </p>
          <label className="upload-btn">
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
            Select CSV File
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
        <div className="sb-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Queue</h2>
            <button onClick={resetData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Reset">
              <Trash2 size={16} />
            </button>
          </div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              <span>Daily Velocity</span>
              <span style={{ color: sentToday >= dailyLimit ? 'red' : 'green' }}>{sentToday} / {dailyLimit}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((sentToday / dailyLimit) * 100, 100)}%`, background: '#0f172a', height: '100%' }}></div>
            </div>
          </div>
        </div>
        <div className="sb-search">
          <input 
            className="search-input" 
            placeholder="Search queue..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="queue-list">
          {filteredList.map((p, i) => (
            <div 
              key={i} 
              className={`queue-item ${i === selectedIndex ? 'active' : ''} ${p.status === 'messaged' ? 'done' : ''}`}
              onClick={() => setSelectedIndex(i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="q-name">{p.name}</div>
                {(p.status === 'messaged' || p.status === 'requested') && <CheckCircle size={14} color="#10b981" />}
              </div>
              <div className="q-role" style={{ marginTop: 2 }}>{p.title}</div>
              <div className="q-role" style={{ color: '#94a3b8' }}>{p.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN STAGE */}
      <div className="main-stage">
        {current ? (
          <div className="iron-grid">
            
            {/* LEFT: WORKBENCH */}
            <div className="iron-card">
              <div className="iron-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>{current.name}</h1>
                    <div style={{ fontSize: 16, color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>{current.title}</div>
                    <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>{current.company}</div>
                  </div>
                  <a 
                    href={current.linkedin_url || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, background: '#eff6ff', padding: '6px 12px', borderRadius: 6 }}
                  >
                    View <ExternalLink size={14} />
                  </a>
                </div>
                
                {/* Manual Override for Connection Status */}
                <div style={{ marginTop: 20 }}>
                  <label className="toggle-row">
                    <input 
                      type="checkbox" 
                      className="toggle-check"
                      checked={isFirstDegree}
                      onChange={(e) => {
                        setIsFirstDegree(e.target.checked);
                        setActiveTab(e.target.checked ? "message" : "connect");
                      }}
                    />
                    Already a 1st Degree Connection?
                  </label>
                </div>
              </div>

              <div className="iron-body">
                <div className="tabs">
                  <div className={`tab ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => setActiveTab('connect')}>
                    <Users size={16} /> Connect
                  </div>
                  <div className={`tab tab-msg ${activeTab === 'message' ? 'active' : ''}`} onClick={() => setActiveTab('message')}>
                    <MessageSquare size={16} /> Message
                  </div>
                  <div className={`tab ${activeTab === 'followup' ? 'active' : ''}`} onClick={() => setActiveTab('followup')}>
                    <RefreshCw size={16} /> Follow-up
                  </div>
                </div>

                <div className="label">MESSAGE PREVIEW</div>
                <div className="preview-box">
                  {renderTemplate(templates[activeTab], current).split(/(\[.*?\])/g).map((part, i) => 
                    part.startsWith('[') && part.endsWith(']') ? 
                    <span key={i} className="variable">{part}</span> : part
                  )}
                </div>

                <details style={{ marginBottom: 24 }}>
                  <summary style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer', outline: 'none', fontWeight: 500 }}>
                    Adjust Template...
                  </summary>
                  <textarea 
                    style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, fontFamily: 'sans-serif', minHeight: 80 }}
                    value={templates[activeTab]}
                    onChange={(e) => setTemplates({...templates, [activeTab]: e.target.value})}
                  />
                </details>

                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => setSelectedIndex(prev => Math.min(prev + 1, filteredList.length - 1))}>
                    Skip
                  </button>
                  <button className="btn btn-primary" onClick={copyAndOpen}>
                    <Copy size={18} />
                    Copy & Open LinkedIn
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: PERSONA INTELLIGENCE CARD */}
            <div className="persona-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>{persona.icon}</div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identified Persona</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{persona.role}</div>
                </div>
              </div>
              
              <div className="p-section">
                <h4>Top Priorities</h4>
                <ul className="p-list">
                  {persona.priorities.map(p => <li key={p}><Target size={12} /> {p}</li>)}
                </ul>
              </div>

              <div className="p-section">
                <h4>Messaging Logic</h4>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{persona.strategy}</p>
              </div>

              <div className="p-section">
                <h4>Mindset</h4>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>"{persona.mindset}"</p>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <p>Select a prospect from the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
