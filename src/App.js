// App.js — Fairway LinkedIn Copilot V2 (The "Loading Dock")
// Focus-mode UI, Template Toggles, and "Fairway" Aesthetics.

import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, 
  Search, 
  Settings, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  UploadCloud,
  FileText,
  RefreshCw,
  MessageSquare
} from "lucide-react";

// --- STYLES (Embedded for Drop-in Simplicity) ---
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
    .sidebar { width: 320px; background: var(--white); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; }
    .main-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: #f8fafc; }
    
    /* Typography */
    h1, h2, h3 { margin: 0; font-weight: 700; letter-spacing: -0.02em; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate); font-weight: 600; margin-bottom: 6px; display: block; }
    
    /* Sidebar Components */
    .sb-header { padding: 20px; border-bottom: 1px solid var(--border); }
    .sb-search { padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .search-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--light); font-size: 13px; }
    .queue-list { flex: 1; overflow-y: auto; padding: 10px; }
    .queue-item { 
      padding: 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; 
      transition: all 0.1s; margin-bottom: 4px;
    }
    .queue-item:hover { background: var(--light); }
    .queue-item.active { background: #eff6ff; border-color: var(--blue); }
    .q-name { font-weight: 600; font-size: 14px; color: var(--navy); }
    .q-role { font-size: 12px; color: var(--slate); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    /* Main Stage Components */
    .dock-card { 
      background: var(--white); width: 100%; max-width: 600px; 
      border-radius: 20px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); 
      border: 1px solid var(--border); overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }
    .dock-header { padding: 32px; border-bottom: 1px solid var(--border); background: linear-gradient(to bottom, #fff, #fcfcfc); }
    .dock-body { padding: 32px; }
    
    /* Tabs */
    .tabs { display: flex; gap: 4px; background: var(--light); padding: 4px; border-radius: 8px; margin-bottom: 20px; }
    .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 500; color: var(--slate); cursor: pointer; border-radius: 6px; transition: all 0.2s; }
    .tab.active { background: var(--white); color: var(--blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; }
    
    /* Message Preview */
    .preview-box { 
      background: #f1f5f9; padding: 20px; border-radius: 12px; 
      font-size: 14px; line-height: 1.6; color: var(--navy); 
      border: 1px solid var(--border); min-height: 120px; margin-bottom: 20px;
      white-space: pre-wrap;
    }
    .variable { color: var(--blue); background: rgba(59, 130, 246, 0.1); padding: 0 4px; border-radius: 4px; font-weight: 500; }
    
    /* Actions */
    .actions { display: flex; gap: 12px; }
    .btn { 
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 48px; border-radius: 10px; font-weight: 600; cursor: pointer; 
      transition: transform 0.1s; border: none; font-size: 14px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: var(--navy); color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
    .btn-secondary { background: white; border: 1px solid var(--border); color: var(--navy); }
    .btn-secondary:hover { background: var(--light); }
    
    /* Empty State */
    .empty-state { text-align: center; padding: 40px; }
    .upload-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--blue); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px; }
    
    /* Animations */
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Status Badges */
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
    .status-new { background: var(--blue); }
    .status-done { background: var(--green); }
  `}</style>
);

const LS_KEY = "fairway-copilot-v3";

// --- HELPERS ---

function renderTemplate(tpl, row) {
  if (!tpl) return "";
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => row?.[k] ?? `[MISSING: ${k}]`);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s"]/g, ""));
  
  return lines.slice(1).map((line) => {
    // Regex to handle commas inside quotes
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
    const cleaned = cols.map((c) => c.replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"').trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cleaned[i] ?? ""));
    row.status = "new"; 
    return row;
  });
}

// --- MAIN COMPONENT ---

export default function App() {
  // Data State
  const [prospects, setProspects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  
  // Settings & Templates
  const [templates, setTemplates] = useState({
    connect: "Hi {{name}}, great to see what you’re building at {{company}}. I partner with {{title}} leaders exploring new ways to improve {{segment}}. Worth connecting?",
    followup1: "Appreciate the connection, {{name}}! Would you be open to me sending over a short PDF on how we solved [Problem] for similar {{title}}s?",
    followup2: "{{name}} - bumping this. Any thoughts on the above?"
  });
  
  const [activeTab, setActiveTab] = useState("connect");
  const [dailyLimit, setDailyLimit] = useState(50);
  const [sentToday, setSentToday] = useState(0);

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

  // Derived State
  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter(p => 
      !q || (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q))
    );
  }, [prospects, search]);

  const current = filteredList[selectedIndex];

  // Logic
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
    
    // Open LinkedIn
    let url = current.linkedin_url || current.linkedinurl || current.url;
    if (url && !url.startsWith('http')) url = 'https://' + url;
    window.open(url || "https://linkedin.com", "_blank");

    // Mark done & advance
    const newProspects = [...prospects];
    const realIndex = prospects.indexOf(current);
    if (realIndex > -1) {
      newProspects[realIndex].status = "messaged";
      setProspects(newProspects);
    }
    
    setSentToday(prev => prev + 1);
    
    // Auto advance after short delay
    setTimeout(() => {
      if (selectedIndex < filteredList.length - 1) {
        setSelectedIndex(prev => prev + 1);
      }
    }, 500);
  };

  const skipProspect = () => {
    if (selectedIndex < filteredList.length - 1) setSelectedIndex(prev => prev + 1);
  };

  // --- RENDER ---

  if (prospects.length === 0) {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Styles />
        <div className="empty-state">
          <div style={{ background: '#eff6ff', width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <UploadCloud size={40} color="#3b82f6" />
          </div>
          <h1>Ready to Launch?</h1>
          <p style={{ color: '#64748b', marginTop: 10, maxWidth: 400 }}>
            Upload your prospect CSV to enter the <b>Fairway Loading Dock</b>. 
            <br/>We'll handle the templates and pacing.
          </p>
          <label className="upload-btn">
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
            Upload CSV List
          </label>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 20 }}>Required columns: name, title, company, linkedin_url</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Styles />
      
      {/* --- SIDEBAR (QUEUE) --- */}
      <div className="sidebar">
        <div className="sb-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, background: '#0f172a', borderRadius: 6 }}></div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Fairway Copilot</span>
          </div>
          
          {/* Progress Widget */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              <span>Daily Pace</span>
              <span style={{ color: sentToday >= dailyLimit ? 'red' : 'green' }}>{sentToday} / {dailyLimit}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(sentToday / dailyLimit) * 100}%`, background: '#0f172a', height: '100%' }}></div>
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
              style={{ paddingLeft: 32 }}
            />
          </div>
        </div>

        <div className="queue-list">
          {filteredList.map((p, i) => (
            <div 
              key={i} 
              className={`queue-item ${i === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="q-name">{p.name || "Unknown"}</div>
                {p.status === 'messaged' && <CheckCircle size={14} color="#10b981" />}
              </div>
              <div className="q-role">{p.title}</div>
              <div className="q-role" style={{ color: '#94a3b8' }}>{p.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN STAGE (FOCUS MODE) --- */}
      <div className="main-stage">
        {current ? (
          <div className="dock-card">
            {/* Header */}
            <div className="dock-header">
              <div className="label">Current Prospect</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: 24, marginBottom: 4 }}>{current.name}</h1>
                  <div style={{ fontSize: 16, color: '#475569', fontWeight: 500 }}>
                    {current.title} <span style={{ color: '#cbd5e1' }}>|</span> {current.company}
                  </div>
                </div>
                <a 
                  href={current.linkedin_url || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}
                >
                  Profile <ExternalLink size={14} />
                </a>
              </div>
              
              {/* Context Tags */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {current.segment && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{current.segment}</span>}
                {current.persona && <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{current.persona}</span>}
              </div>
            </div>

            {/* Body */}
            <div className="dock-body">
              <div className="tabs">
                <div className={`tab ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => setActiveTab('connect')}>
                  <Users size={14} style={{ marginBottom: -2, marginRight: 6 }} />
                  Connect
                </div>
                <div className={`tab ${activeTab === 'followup1' ? 'active' : ''}`} onClick={() => setActiveTab('followup1')}>
                  <MessageSquare size={14} style={{ marginBottom: -2, marginRight: 6 }} />
                  Follow-up 1
                </div>
                <div className={`tab ${activeTab === 'followup2' ? 'active' : ''}`} onClick={() => setActiveTab('followup2')}>
                  <RefreshCw size={14} style={{ marginBottom: -2, marginRight: 6 }} />
                  Follow-up 2
                </div>
              </div>

              {/* Live Editor with Highlighted Variables */}
              <div className="label">Message Preview</div>
              <div className="preview-box">
                {renderTemplate(templates[activeTab], current).split(/(\[.*?\])/g).map((part, i) => 
                  part.startsWith('[') && part.endsWith(']') ? 
                  <span key={i} className="variable">{part}</span> : part
                )}
              </div>

              {/* Template Editor Toggle (Hidden by default for cleanliness) */}
              <details style={{ marginBottom: 24 }}>
                <summary style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer', outline: 'none' }}>Edit Template</summary>
                <textarea 
                  style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, fontFamily: 'sans-serif' }}
                  rows={3}
                  value={templates[activeTab]}
                  onChange={(e) => setTemplates({...templates, [activeTab]: e.target.value})}
                />
              </details>

              <div className="actions">
                <button className="btn btn-secondary" onClick={skipProspect}>
                  Skip
                </button>
                <button className="btn btn-primary" onClick={copyAndOpen}>
                  <Copy size={16} />
                  Copy & Open LinkedIn
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <p>Select a prospect from the queue to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
