// App.js — Fairway 6/7 Iron 👋 (Manual-Assist Outreach)
// Rebranded & Smart CSV Parsing to fix "Unknowns"

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
  Trash2
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
      --border: #e2e8f0;
      --radius: 12px;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: var(--navy); }
    
    /* Layout */
    .app-shell { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 340px; background: var(--white); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; }
    .main-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; position: relative; }
    
    /* Typography */
    h1, h2, h3 { margin: 0; font-weight: 700; letter-spacing: -0.02em; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate); font-weight: 600; margin-bottom: 6px; display: block; }
    .mono { font-family: monospace; font-size: 12px; color: var(--slate); }

    /* Sidebar */
    .sb-header { padding: 20px; border-bottom: 1px solid var(--border); background: var(--white); }
    .sb-search { padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid var(--border); border-radius: 6px; background: var(--light); font-size: 13px; }
    .queue-list { flex: 1; overflow-y: auto; padding: 10px; }
    
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
    
    /* Main Card */
    .iron-card { 
      background: var(--white); width: 100%; max-width: 640px; 
      border-radius: 20px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); 
      border: 1px solid var(--border); overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }
    .iron-header { padding: 32px; border-bottom: 1px solid var(--border); background: linear-gradient(to bottom, #fff, #f8fafc); }
    .iron-body { padding: 32px; }
    
    /* Tabs & Editor */
    .tabs { display: flex; gap: 4px; background: var(--light); padding: 4px; border-radius: 8px; margin-bottom: 24px; }
    .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .tab.active { background: var(--white); color: var(--blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; }
    
    .preview-box { 
      background: #f1f5f9; padding: 24px; border-radius: 12px; 
      font-size: 15px; line-height: 1.6; color: var(--navy); 
      border: 1px solid var(--border); min-height: 140px; margin-bottom: 24px;
      white-space: pre-wrap; font-family: sans-serif;
    }
    .variable { color: var(--blue); background: rgba(59, 130, 246, 0.1); padding: 0 4px; border-radius: 4px; font-weight: 500; }
    .missing-var { color: red; background: #fee2e2; }

    /* Actions */
    .actions { display: flex; gap: 12px; }
    .btn { 
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 52px; border-radius: 10px; font-weight: 600; cursor: pointer; 
      transition: transform 0.1s; border: none; font-size: 15px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: var(--navy); color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
    .btn-primary:hover { background: #1e293b; }
    .btn-secondary { background: white; border: 1px solid var(--border); color: var(--navy); }
    .btn-secondary:hover { background: var(--light); }
    
    /* Empty State */
    .empty-state { text-align: center; padding: 60px; max-width: 480px; }
    .upload-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--blue); color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 24px; transition: background 0.2s; }
    .upload-btn:hover { background: #2563eb; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

const LS_KEY = "fairway-iron-v1";

// --- HELPERS ---

// Smart field mapper for the specific CSV you uploaded
function mapRow(rawRow, headers) {
  const normalize = (h) => h.toLowerCase().replace(/[\s_"]/g, "");
  
  // Find index of key columns based on common variations
  const findIdx = (variations) => headers.findIndex(h => variations.includes(normalize(h)));
  
  const nameIdx = findIdx(['fullname', 'name', 'profilename']);
  const titleIdx = findIdx(['headline', 'title', 'jobtitle']);
  const companyIdx = findIdx(['companyname', 'company']);
  const urlIdx = findIdx(['profileurl', 'linkedinurl', 'url', 'linkedin']);
  const reactIdx = findIdx(['reactiontype', 'reaction']);

  return {
    name: rawRow[nameIdx] || "Unknown",
    title: rawRow[titleIdx] || "Unknown Title",
    company: rawRow[companyIdx] || "Unknown Company",
    linkedin_url: rawRow[urlIdx] || "",
    reaction: rawRow[reactIdx] || "",
    status: "new"
  };
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  
  // Parse headers
  const headers = lines[0].match(/("([^"]|"")*"|[^,]+)/g).map(h => h.replace(/^"|"$/g, '').trim());
  
  return lines.slice(1).map((line) => {
    // Handle CSV quoting madness
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
  // --- STATE ---
  const [prospects, setProspects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  
  const [templates, setTemplates] = useState({
    connect: "Hi {{name}}, saw you engaged with the post about [Topic]. I work with {{title}}s on similar challenges. Would be great to connect.",
    followup1: "Thanks for connecting {{name}}! Curious if you're seeing [Problem] at {{company}} right now?",
    followup2: "{{name}} - thought this resource might be helpful given your role: [Link]"
  });
  
  const [activeTab, setActiveTab] = useState("connect");
  const [sentToday, setSentToday] = useState(0);
  const dailyLimit = 50;

  // --- PERSISTENCE ---
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

  // --- LOGIC ---
  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter(p => 
      !q || (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q))
    );
  }, [prospects, search]);

  const current = filteredList[selectedIndex];

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
    
    // Smart URL handling
    let url = current.linkedin_url;
    if (url && !url.startsWith('http')) url = 'https://' + url;
    window.open(url || "https://linkedin.com", "_blank");

    // Mark done
    const newProspects = [...prospects];
    const realIndex = prospects.indexOf(current);
    if (realIndex > -1) {
      newProspects[realIndex].status = "messaged";
      setProspects(newProspects);
    }
    setSentToday(prev => prev + 1);
    
    // Auto advance
    setTimeout(() => {
      if (selectedIndex < filteredList.length - 1) setSelectedIndex(prev => prev + 1);
    }, 500);
  };

  const resetData = () => {
    if (window.confirm("Clear all data and start fresh?")) {
      setProspects([]);
      setSentToday(0);
      localStorage.removeItem(LS_KEY);
    }
  };

  // --- RENDER EMPTY STATE ---
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
            Upload your LinkedIn engagement CSV.<br/>
            We'll parse the <b>Names, Headlines, and Profile URLs</b> automatically.
          </p>
          <label className="upload-btn">
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
            Select CSV File
          </label>
          <p className="mono" style={{ marginTop: 24, fontSize: 11, color: '#94a3b8' }}>
            Supports: ProfileUrl, FullName, Headline, CompanyName
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN UI ---
  return (
    <div className="app-shell">
      <Styles />
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sb-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Fairway 6/7 Iron 👋</h2>
            <button onClick={resetData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Reset">
              <Trash2 size={16} />
            </button>
          </div>
          
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              <span>Daily Pace</span>
              <span style={{ color: sentToday >= dailyLimit ? 'red' : 'green' }}>{sentToday} / {dailyLimit}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((sentToday / dailyLimit) * 100, 100)}%`, background: '#0f172a', height: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="sb-search">
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            <input 
              className="search-input" 
              placeholder="Search queue..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
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
                {p.status === 'messaged' && <CheckCircle size={14} color="#10b981" />}
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
          <div className="iron-card">
            {/* Header */}
            <div className="iron-header">
              <div className="label">TARGET PROFILE</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h1 style={{ fontSize: 28, marginBottom: 6 }}>{current.name}</h1>
                  <div style={{ fontSize: 16, color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                    {current.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>
                    {current.company}
                  </div>
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
            </div>

            {/* Body */}
            <div className="iron-body">
              {/* Tabs */}
              <div className="tabs">
                <div className={`tab ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => setActiveTab('connect')}>
                  <Users size={16} /> Connect
                </div>
                <div className={`tab ${activeTab === 'followup1' ? 'active' : ''}`} onClick={() => setActiveTab('followup1')}>
                  <MessageSquare size={16} /> Follow-up 1
                </div>
                <div className={`tab ${activeTab === 'followup2' ? 'active' : ''}`} onClick={() => setActiveTab('followup2')}>
                  <RefreshCw size={16} /> Follow-up 2
                </div>
              </div>

              {/* Message Preview */}
              <div className="label">MESSAGE PREVIEW</div>
              <div className="preview-box">
                {renderTemplate(templates[activeTab], current).split(/(\[.*?\])/g).map((part, i) => 
                  part.startsWith('[') && part.endsWith(']') ? 
                  <span key={i} className="variable">{part}</span> : part
                )}
              </div>

              {/* Template Editor Toggle */}
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

              {/* Actions */}
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
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <p>Select a prospect from the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
