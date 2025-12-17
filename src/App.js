// App.js — Fairway 6/7 Iron 👋 (Intelligence Console) — Persona Deep-Pack
// Adds granular personas, buyer-role inference, lifecycle presence, and auto-prescriptive messaging.

import React, { useEffect, useMemo, useState } from "react";
import {
  Users, Search, ChevronRight, Copy, ExternalLink, CheckCircle, UploadCloud,
  MessageSquare, RefreshCw, Trash2, Zap, Target, BrainCircuit, ShieldCheck,
  Briefcase, DollarSign, FileCheck2, Scale, Key, Building2, Bug, Cog,
  Wrench, ServerCog, Shield, Database, Spline, PenTool, HeadphonesIcon
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Styles (kept lightweight; add focus ring + hover lift)             */
/* ------------------------------------------------------------------ */
const Styles = () => (
  <style>{`
    :root {
      --navy:#0f172a; --slate:#64748b; --light:#f8fafc; --white:#fff;
      --blue:#3b82f6; --green:#10b981; --orange:#f97316; --purple:#8b5cf6;
      --border:#e2e8f0; --radius:12px;
      --ring: 0 0 0 3px rgba(34,197,94,.35);
    }
    *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f1f5f9;color:var(--navy)}
    .app-shell{display:flex;height:100vh;overflow:hidden}
    .sidebar{width:340px;background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:10}
    .main-stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;position:relative;padding:20px}
    h1,h2,h3{margin:0;font-weight:700;letter-spacing:-.02em}
    .label{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--slate);font-weight:600;margin-bottom:6px;display:block}
    .queue-item{padding:12px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:all .1s;margin-bottom:4px;position:relative}
    .queue-item:hover{background:var(--light)} .queue-item.active{background:#eff6ff;border-color:var(--blue)}
    .queue-item.done{opacity:.6;background:#f0fdf4}
    .q-name{font-weight:600;font-size:14px;color:var(--navy)}
    .q-role{font-size:12px;color:var(--slate);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
    .iron-grid{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1100px;width:100%;height:100%;max-height:800px}
    .iron-card{background:var(--white);border-radius:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);border:1px solid var(--border);overflow:hidden;display:flex;flex-direction:column}
    .iron-header{padding:24px;border-bottom:1px solid var(--border);background:linear-gradient(to bottom,#fff,#f8fafc)}
    .iron-body{padding:24px;flex:1;display:flex;flex-direction:column}
    .persona-card{background:var(--navy);color:#fff;border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:16px;border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 25px -5px rgba(15,23,42,.3);animation:fadeIn .4s ease-out}
    .persona-card a{color:#93c5fd}
    .p-section h4{font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
    .p-list{list-style:none;padding:0;margin:0}.p-list li{display:flex;gap:8px;margin-bottom:6px;font-size:13px;color:#e2e8f0;line-height:1.4}
    .tabs{display:flex;gap:4px;background:var(--light);padding:4px;border-radius:8px;margin-bottom:20px}
    .tab{flex:1;padding:8px;text-align:center;font-size:13px;font-weight:500;color:var(--slate);cursor:pointer;border-radius:6px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
    .tab.active{background:var(--white);color:var(--blue);box-shadow:0 1px 2px rgba(0,0,0,.05);font-weight:600}
    .tab.active.tab-msg{color:var(--orange)}
    .preview-box{background:#f8fafc;padding:20px;border-radius:12px;font-size:15px;line-height:1.6;color:var(--navy);border:1px solid var(--border);flex:1;margin-bottom:20px;white-space:pre-wrap;font-family:-apple-system,system-ui,sans-serif}
    .variable{color:var(--blue);background:rgba(59,130,246,.1);padding:0 4px;border-radius:4px;font-weight:500}
    .actions{display:flex;gap:12px;margin-top:auto}
    .btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:48px;border-radius:10px;font-weight:600;cursor:pointer;transition:transform .1s, box-shadow .15s;border:none;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.06)}
    .btn:focus-visible{outline:none;box-shadow:var(--ring)}
    .btn:active{transform:translateY(1px)}
    .btn-primary{background:var(--navy);color:#fff}.btn-primary:hover{background:#1e293b}
    .btn-secondary{background:#fff;border:1px solid var(--border);color:var(--navy)}.btn-secondary:hover{background:var(--light)}
    .toggle-row{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:13px;font-weight:500;color:var(--slate);cursor:pointer}
    .toggle-check{accent-color:var(--blue);width:16px;height:16px}
    .search-input{width:100%;border:1px solid var(--border);padding:10px;border-radius:8px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Persona Engine                                                     */
/* ------------------------------------------------------------------ */

// 1) Title splitter → level + function
const LEVEL_PATTERNS = [
  { re: /(chief|c[ -]?level|cfo|cio|cto|cmo|cro|cso|ciso|coo|ceo)/i, level: "C-Level" },
  { re: /(vp|vice president|svp|evp|vice[- ]president)/i, level: "VP" },
  { re: /(head of|director)/i, level: "Director" },
  { re: /(manager|lead|practice lead|principal)/i, level: "Manager" },
  { re: /(specialist|analyst|coordinator|associate|engineer|designer|developer|architect)/i, level: "IC" },
];

const FUNCTION_MAP = [
  { fn: "Revenue Operations", keys: /(rev ?ops|revenue operations|sales operations|sf[ac]|crm|enablement)/i },
  { fn: "Sales - Account Executive", keys: /(account executive|ae|enterprise sales|strategic account)/i },
  { fn: "Sales - SDR/BDR", keys: /(sdr|bdr|business development|lead development)/i },
  { fn: "Marketing - Demand Gen", keys: /(demand gen|growth marketer|performance marketing|abm)/i },
  { fn: "Marketing - Product Marketing", keys: /(product marketing|pmm)/i },
  { fn: "Marketing - Brand/Comms", keys: /(brand|communications|pr)/i },
  { fn: "Customer Success", keys: /(customer success|csm|account manager|renewals)/i },
  { fn: "Support", keys: /(support|help ?desk)/i },
  { fn: "Product Management", keys: /(product manager|pm(?!m)|product owner)/i },
  { fn: "Design/UX", keys: /(ux|ui|designer|researcher|uxr)/i },
  { fn: "Engineering", keys: /(engineer|developer|software|frontend|backend|full[- ]?stack)/i },
  { fn: "DevOps/SRE", keys: /(devops|sre|site reliability|platform engineer|kubernetes|infra)/i },
  { fn: "Data/Analytics", keys: /(data|analytics|bi|ml|ai|data scientist)/i },
  { fn: "IT Operations", keys: /(it(?!\s*security)|sysadmin|systems administrator|it operations)/i },
  { fn: "Security", keys: /(security|ciso|g[r]?c|secops|appsec)/i },
  { fn: "Finance", keys: /(finance|fp&a|controller|cfo|accounting)/i },
  { fn: "Legal", keys: /(legal|counsel|privacy|gdpr)/i },
  { fn: "Procurement", keys: /(procurement|sourcing|purchasing)/i },
  { fn: "HR/Talent", keys: /(hr|people|talent|recruit(ing|er)|total rewards)/i },
  { fn: "Operations/PMO", keys: /(operations|pmo|program manager|project manager|business operations)/i },
  { fn: "Facilities/Workplace", keys: /(facilities|workplace|real estate)/i },
  { fn: "Executive Leadership", keys: /(ceo|founder|president|principal|coo)/i },
];

function splitTitle(title = "") {
  const t = String(title);
  const level = (LEVEL_PATTERNS.find(p => p.re.test(t))?.level) || "IC";
  const entry = FUNCTION_MAP.find(f => f.keys.test(t));
  const fn = entry?.fn || "General";
  return { level, function: fn };
}

// 2) Persona Ontology: granular field set with goals/challenges/measures/preferences
const PERSONAS = [
  {
    id: "revops",
    label: "Revenue Operations",
    match: /(rev ?ops|revenue operations|sales operations|enablement|crm|sf[a|c])/i,
    icon: <Target size={16}/>,
    color:"#10b981",
    goals:["Accurate forecasting","Process consistency","Tool ROI"],
    challenges:["Dirty data","Rep adoption","Attribution clarity"],
    success:["Forecast accuracy","Cycle time","Win rate"],
    interaction:["Short proof-led demos","Benchmarks","Integrations detail"],
    preferred:["Analyst reports","Case studies","Sales playbooks"],
    buyerRoleByLevel:{ "C-Level":"Decisionmaker","VP":"Decisionmaker","Director":"Champion","Manager":"Champion","IC":"Influencer" },
    lifecycle:["deliver/initiate","develop/participate","retain/actualize","grow/advocate"]
  },
  {
    id:"ae",
    label:"Sales - Account Executive",
    match:/(account executive|enterprise sales|strategic account)/i,
    icon:<DollarSign size={16}/>,
    color:"#10b981",
    goals:["Quota attainment","Pipeline velocity","Multi-threaded deals"],
    challenges:["Access to power","Stalled champions","Tool fatigue"],
    success:["Bookings","ACV","Pipeline coverage"],
    interaction:["Tactical, fast","Proof they can share","Customer logos"],
    preferred:["Battlecards","Customer references","Email scripts"],
    buyerRoleByLevel:{ "C-Level":"Decisionmaker","VP":"Decisionmaker","Director":"Champion","Manager":"Champion","IC":"User" },
    lifecycle:["develop/participate","retain/actualize"]
  },
  {
    id:"sdr",
    label:"Sales - SDR/BDR",
    match:/(sdr|bdr|business development|lead development)/i,
    icon:<Zap size={16}/>,
    color:"#f97316",
    goals:["Meetings set","Reply rate","Account coverage"],
    challenges:["Personalization at scale","Deliverability","ICP fit"],
    success:["Meetings","Reply %","Account penetration"],
    interaction:["Snippets/templates","Step-by-step plays"],
    preferred:["Scripts","Sequences","One-pagers"],
    buyerRoleByLevel:{ "IC":"User" },
    lifecycle:["develop/participate"]
  },
  {
    id:"demandgen",
    label:"Marketing - Demand Gen",
    match:/(demand gen|performance marketing|abm|growth marketer)/i,
    icon:<Zap size={16}/>,
    color:"#f97316",
    goals:["Pipeline by segment","CAC/LTV","Channel mix"],
    challenges:["Attribution","Data quality","Budget efficiency"],
    success:["MQAs/SAOs","Cost per opp","Influenced revenue"],
    interaction:["Evidence-first","Dashboards","Tactic benchmarks"],
    preferred:["Interactive calculators","Case studies","Analyst notes"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Champion","Manager":"Champion","IC":"User" },
    lifecycle:["deliver/initiate","develop/participate"]
  },
  {
    id:"pmm",
    label:"Marketing - Product Marketing",
    match:/(product marketing|pmm)/i,
    icon:<Briefcase size={16}/>,
    color:"#8b5cf6",
    goals:["Positioning clarity","Win/loss insights","Sales readiness"],
    challenges:["Differentiation","Persona alignment","Proof assets"],
    success:["Win rate","Sales adoption","Content usage"],
    interaction:["Messaging frameworks","Competitive grids","Customer proof"],
    preferred:["Battlecards","Narrative docs","Case studies"],
    buyerRoleByLevel:{ "Director":"Champion","Manager":"Influencer","IC":"Influencer" },
    lifecycle:["deliver/initiate","develop/participate","grow/advocate"]
  },
  {
    id:"csm",
    label:"Customer Success",
    match:/(customer success|csm|account manager|renewals)/i,
    icon:<CheckCircle size={16}/>,
    color:"#10b981",
    goals:["Retention","Adoption","Expansion"],
    challenges:["Risk visibility","Product gaps","Value realization"],
    success:["NRR/GRR","Health score","Time-to-value"],
    interaction:["Playbooks","Health dashboards","Reference creation"],
    preferred:["Success plans","ROI calculators","How-to videos"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Champion","Manager":"Champion","IC":"User" },
    lifecycle:["retain/actualize","grow/advocate"]
  },
  {
    id:"product",
    label:"Product Management",
    match:/(product manager|product owner|^pm$)/i,
    icon:<Cog size={16}/>,
    color:"#3b82f6",
    goals:["Market fit","Roadmap clarity","Outcome metrics"],
    challenges:["Signal vs. noise","Stakeholder alignment","Evidence"],
    success:["Activation","Feature adoption","NPS"],
    interaction:["Concise proofs","Integration detail","User research"],
    preferred:["Problem statements","Opportunity sizing","User stories"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Decisionmaker","Manager":"Champion","IC":"Influencer" },
    lifecycle:["deliver/initiate","develop/participate"]
  },
  {
    id:"engineering",
    label:"Engineering",
    match:/(engineer|developer|software|frontend|backend|full[- ]?stack)/i,
    icon:<BrainCircuit size={16}/>,
    color:"#3b82f6",
    goals:["Stability","Dev velocity","Debt control"],
    challenges:["Integration risk","Security/perf","Maintenance load"],
    success:["MTTR","Lead time","Change fail rate"],
    interaction:["APIs, docs, proofs","No fluff"],
    preferred:["Docs","SDKs","Reference arch"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Champion","Manager":"Influencer","IC":"User" },
    lifecycle:["deliver/initiate","develop/participate"]
  },
  {
    id:"devops",
    label:"DevOps / SRE",
    match:/(devops|sre|site reliability|platform engineer|kubernetes|infra)/i,
    icon:<ServerCog size={16}/>,
    color:"#3b82f6",
    goals:["Uptime","Scalability","Automations"],
    challenges:["On-call load","Config drift","Cost visibility"],
    success:["SLO/SLA","MTTR","Change failure %"],
    interaction:["Runbooks","Diagrams","Security posture"],
    preferred:["Architecture refs","Terraform examples","SLI/SLO docs"],
    buyerRoleByLevel:{ "Director":"Champion","Manager":"Influencer","IC":"User" },
    lifecycle:["deliver/initiate","develop/participate","retain/actualize"]
  },
  {
    id:"data",
    label:"Data/Analytics",
    match:/(data|analytics|bi|ml|ai|data scientist)/i,
    icon:<Database size={16}/>,
    color:"#3b82f6",
    goals:["Reliable data","Time-to-insight","Governance"],
    challenges:["Data quality","Fragmentation","Privacy"],
    success:["Adoption","Query latency","Trust score"],
    interaction:["Schema samples","Lineage","Benchmarks"],
    preferred:["Notebooks","Dashboards","Playbooks"],
    buyerRoleByLevel:{ "Director":"Decisionmaker","Manager":"Champion","IC":"User" },
    lifecycle:["deliver/initiate","develop/participate"]
  },
  {
    id:"security",
    label:"Security",
    match:/(security|ciso|g[r]?c|secops|appsec)/i,
    icon:<Shield size={16}/>,
    color:"#0f172a",
    goals:["Risk reduction","Compliance","Incident response"],
    challenges:["Shadow IT","Proof of controls","Vendor risk"],
    success:["Audit pass rate","MTTD/MTTR","Policy coverage"],
    interaction:["Evidence, attestations","Least promises"],
    preferred:["SOC2/ISO docs","Pen test summaries","Reference arch"],
    buyerRoleByLevel:{ "C-Level":"Decisionmaker","VP":"Decisionmaker","Director":"Ratifier","Manager":"Influencer","IC":"Influencer" },
    lifecycle:["deliver/initiate","retain/actualize"]
  },
  {
    id:"finance",
    label:"Finance",
    match:/(finance|fp&a|controller|cfo|accounting)/i,
    icon:<DollarSign size={16}/>,
    color:"#0f172a",
    goals:["Profitability","Spend control","Cash flow"],
    challenges:["Unproven ROI","Contract risk","Shelfware"],
    success:["Payback","Gross margin","Budget variance"],
    interaction:["Clear ROI, no fluff","References"],
    preferred:["TCO models","ROI calculators","Case studies"],
    buyerRoleByLevel:{ "C-Level":"Decisionmaker","VP":"Decisionmaker","Director":"Ratifier","Manager":"Influencer" },
    lifecycle:["selection","retain/actualize"]
  },
  {
    id:"legal",
    label:"Legal",
    match:/(legal|counsel|privacy|gdpr)/i,
    icon:<Scale size={16}/>,
    color:"#0f172a",
    goals:["Risk mitigation","Compliance","Contract velocity"],
    challenges:["Data transfer","IP/Liability","Reg change"],
    success:["Cycle time","Risk flags","Exceptions rate"],
    interaction:["Plain terms","Security exhibits"],
    preferred:["DPAs","T&Cs","Summaries"],
    buyerRoleByLevel:{ "Director":"Ratifier","Manager":"Influencer" },
    lifecycle:["selection","retain/actualize"]
  },
  {
    id:"procurement",
    label:"Procurement",
    match:/(procurement|sourcing|purchasing)/i,
    icon:<FileCheck2 size={16}/>,
    color:"#0f172a",
    goals:["Value for money","Compliance","Supplier performance"],
    challenges:["Opaque pricing","Non-standard terms"],
    success:["Savings %","On-time PO","Risk score"],
    interaction:["Comparable quotes","Standard terms"],
    preferred:["Pricing sheets","Security/Privacy pack","References"],
    buyerRoleByLevel:{ "Director":"Ratifier","Manager":"Ratifier" },
    lifecycle:["selection"]
  },
  {
    id:"hr",
    label:"HR / Talent",
    match:/(hr|people|talent|recruit(ing|er)|total rewards)/i,
    icon:<Users size={16}/>,
    color:"#8b5cf6",
    goals:["Retention","Hiring velocity","Culture health"],
    challenges:["Tool sprawl","Adoption","Change mgmt"],
    success:["Time-to-fill","Attrition","Engagement"],
    interaction:["Empathy first","Proof of human impact"],
    preferred:["Guides","Stories","Benchmarks"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Champion","Manager":"Influencer","IC":"User" },
    lifecycle:["deliver/initiate","retain/actualize","grow/advocate"]
  },
  {
    id:"ops",
    label:"Operations / PMO",
    match:/(operations|pmo|program manager|project manager|business operations)/i,
    icon:<Wrench size={16}/>,
    color:"#64748b",
    goals:["Execution reliability","Throughput","Cost/time"],
    challenges:["Cross-team alignment","Visibility","Dependencies"],
    success:["On-time delivery","Throughput","Cycle time"],
    interaction:["Playbooks","Dashboards","Checklists"],
    preferred:["RACI","Roadmaps","Status templates"],
    buyerRoleByLevel:{ "VP":"Decisionmaker","Director":"Champion","Manager":"Champion","IC":"User" },
    lifecycle:["deliver/initiate","develop/participate","retain/actualize"]
  },
  {
    id:"design",
    label:"Design/UX",
    match:/(ux|ui|designer|researcher|uxr)/i,
    icon:<PenTool size={16}/>,
    color:"#8b5cf6",
    goals:["Usability","Adoption","Consistency"],
    challenges:["Evidence for decisions","Accessibility debt"],
    success:["Task success","SUS/NPS","Time-to-task"],
    interaction:["Show, don't tell","Prototypes"],
    preferred:["Design docs","Heuristics","Case studies"],
    buyerRoleByLevel:{ "Director":"Champion","Manager":"Influencer","IC":"User" },
    lifecycle:["develop/participate","retain/actualize"]
  },
  {
    id:"support",
    label:"Support",
    match:/(support|help ?desk)/i,
    icon:<HeadphonesIcon size={16}/>,
    color:"#64748b",
    goals:["FCR","CSAT","Handle time"],
    challenges:["Knowledge gaps","Routing","Instrumenting feedback"],
    success:["CSAT","FCR","Backlog age"],
    interaction:["Runbooks","Macros","Analytics"],
    preferred:["Playbooks","How-to videos","Dashboards"],
    buyerRoleByLevel:{ "Manager":"Champion","IC":"User" },
    lifecycle:["retain/actualize"]
  },
  {
    id:"executive",
    label:"Executive Leadership",
    match:/(ceo|founder|president|principal|coo)/i,
    icon:<ShieldCheck size={16}/>,
    color:"#0f172a",
    goals:["EBITDA","Market share","Risk mitigation"],
    challenges:["Time","Proof","Execution risk"],
    success:["Revenue growth","Margin","Risk score"],
    interaction:["1-page brief","Bottom-line impact"],
    preferred:["Board slides","Customer logos","ROI"],
    buyerRoleByLevel:{ "C-Level":"Decisionmaker","VP":"Decisionmaker" },
    lifecycle:["selection"]
  }
];

// 3) Buyer role fallback (from research): Champion/Influencer/Decisionmaker/User/Ratifier
function inferBuyerRole(level, personaId) {
  const def = PERSONAS.find(p => p.id === personaId);
  if (def?.buyerRoleByLevel?.[level]) return def.buyerRoleByLevel[level];
  // sensible defaults
  if (level === "C-Level" || level === "VP") return "Decisionmaker";
  if (level === "Director" || level === "Manager") return "Champion";
  return "Influencer";
}

// 4) Persona detect from title
function detectPersonaDeep(title = "") {
  const { level, function: fn } = splitTitle(title);
  const match = PERSONAS.find(p => p.match.test(title)) || null;
  const persona = match || {
    id: "general",
    label: "Professional",
    icon: <Users size={16} />,
    color: "#64748b",
    goals: ["Efficiency","Growth","Impact"],
    challenges: ["Tool sprawl","Competing priorities"],
    success: ["Saved time","Delivered outcomes","Happier stakeholders"],
    interaction: ["Keep it relevant","Proof first"],
    preferred: ["Case studies","Short briefs"],
    lifecycle: ["deliver/initiate"]
  };
  const buyerRole = inferBuyerRole(level, persona.id);
  return { level, fn, buyerRole, ...persona };
}

// 5) Prescriptive messaging from persona + buyer role
function makeTemplates(persona, row) {
  const fn = persona.label;
  const goal = persona.goals[0];
  const proof = persona.preferred?.[0] || "case study";
  const hook =
    persona.id === "security" ? "risk & compliance"
    : persona.id === "finance" ? "hard ROI & payback"
    : persona.id.startsWith("sales") || persona.id==="revops" ? "pipeline & forecast"
    : persona.id === "csm" ? "retention & expansion"
    : persona.id === "engineering" || persona.id === "devops" ? "integration & reliability"
    : "efficiency & outcomes";

  const roleLine =
    persona.buyerRole === "Decisionmaker" ? "bottom-line impact in under 90 seconds"
    : persona.buyerRole === "Champion" ? "quick proof you can share internally"
    : "technical details and credible references";

  return {
    connect:
      `Hi {{firstName}} — I work with ${fn} teams on ${hook}. Have a 1-pager showing ${goal} gains with peers in your space. Open to connect?`,
    message:
      `Thanks for connecting, {{firstName}}. For ${fn}, we focus on ${goal} without adding tool bloat. If helpful, I can share a ${proof.toLowerCase()} and ${roleLine} for {{company}}.`,
    followup:
      `{{firstName}} — sending a quick resource on ${hook}: [Link]. If ${goal} is on your 2025 OKRs, worth a 12-min walkthrough to see fit at {{company}}?`
  };
}

/* ------------------------------------------------------------------ */
/* Existing helpers (with small enrichment)                           */
/* ------------------------------------------------------------------ */
const LS_KEY = "fairway-iron-v3";

function getFirstName(fullName) {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

function mapRow(rawRow, headers) {
  const normalize = (h) => h.toLowerCase().replace(/[\s_"]/g, "");
  const findIdx = (variations) => headers.findIndex(h => variations.includes(normalize(h)));
  const nameIdx = findIdx(['fullname','name','profilename']);
  const titleIdx = findIdx(['headline','title','jobtitle']);
  const companyIdx = findIdx(['companyname','company']);
  const urlIdx = findIdx(['profileurl','linkedinurl','url','linkedin']);
  const degIdx = findIdx(['degree','connection','distance']);
  const rawName = rawRow[nameIdx] || "Unknown";
  const title = rawRow[titleIdx] || "Unknown Title";
  const persona = detectPersonaDeep(title);

  return {
    name: rawName,
    firstName: getFirstName(rawName),
    title,
    company: rawRow[companyIdx] || "Unknown Company",
    linkedin_url: rawRow[urlIdx] || "",
    degree: rawRow[degIdx] || "",
    status: "new",
    persona // attach enriched persona
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
    if (!val || String(val).toLowerCase().includes("unknown")) return `[MISSING: ${k}]`;
    return val;
  });
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

  // Load persisted
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

  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter(p =>
      !q || (p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q))
    );
  }, [prospects, search]);

  const current = filteredList[selectedIndex];

  // Persona derived from enriched row
  const persona = useMemo(() => current?.persona || detectPersonaDeep(current?.title || ""), [current]);

  // Auto-generate persona templates on contact change if user hasn't customized the active tab
  useEffect(() => {
    if (!current) return;
    const auto = makeTemplates(persona, current);
    setTemplates(prev => ({
      connect: prev.connect?.length ? prev.connect : auto.connect,
      message: prev.message?.length ? prev.message : auto.message,
      followup: prev.followup?.length ? prev.followup : auto.followup
    }));
  }, [selectedIndex, current?.title]);

  // Auto-switch tabs based on degree and status
  useEffect(() => {
    if (!current) return;
    const isConnected = current.degree?.includes("1st") || current.status === "connected" || isFirstDegree;
    if (isConnected) { setActiveTab("message"); setIsFirstDegree(true); }
    else { setActiveTab("connect"); setIsFirstDegree(false); }
  }, [current, selectedIndex]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      setProspects(rows);
      setSelectedIndex(0);
      // reset persona-specific autogenerated templates so they refresh for first contact
      setTemplates({ connect:"", message:"", followup:"" });
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

  if (prospects.length === 0) {
    return (
      <div className="app-shell" style={{ alignItems:'center', justifyContent:'center' }}>
        <Styles />
        <div className="empty-state" role="region" aria-label="Upload CSV">
          <div style={{ background:'#eff6ff', width:80, height:80, borderRadius:40, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <UploadCloud size={40} color="#3b82f6" aria-hidden />
          </div>
          <h1 style={{ fontSize:32, marginBottom:12 }}>Fairway 6/7 Iron 👋</h1>
          <p style={{ color:'#64748b', fontSize:16, lineHeight:1.5 }}>
            Upload your CSV. We’ll auto-detect **granular personas**, infer buyer roles, and prescript messaging.
          </p>
          <label className="upload-btn" tabIndex={0}>
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleUpload} aria-label="Select CSV File" />
            Select CSV File
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Styles />
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sb-header" style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:18 }}>Queue</h2>
            <button onClick={resetData} title="Reset" aria-label="Reset" style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
              <Trash2 size={16} />
            </button>
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
            <div key={i} className={`queue-item ${i===selectedIndex?'active':''} ${p.status==='messaged'?'done':''}`} onClick={() => setSelectedIndex(i)} role="button" tabIndex={0}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div className="q-name">{p.name}</div>
                {(p.status==='messaged'||p.status==='requested') && <CheckCircle size={14} color="#10b981" aria-hidden />}
              </div>
              <div className="q-role" style={{ marginTop:2 }}>{p.title}</div>
              <div className="q-role" style={{ color:'#94a3b8' }}>{p.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
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
                <div className="tabs" role="tablist" aria-label="Messaging tabs">
                  <div className={`tab ${activeTab==='connect'?'active':''}`} role="tab" onClick={()=>setActiveTab('connect')}>
                    <Users size={16}/> Connect
                  </div>
                  <div className={`tab tab-msg ${activeTab==='message'?'active':''}`} role="tab" onClick={()=>setActiveTab('message')}>
                    <MessageSquare size={16}/> Message
                  </div>
                  <div className={`tab ${activeTab==='followup'?'active':''}`} role="tab" onClick={()=>setActiveTab('followup')}>
                    <RefreshCw size={16}/> Follow-up
                  </div>
                </div>

                <div className="label">MESSAGE PREVIEW</div>
                <div className="preview-box">
                  {renderTemplate(templates[activeTab], current).split(/(\[.*?\])/g).map((part, i) =>
                    part.startsWith('[') && part.endsWith(']') ? <span key={i} className="variable">{part}</span> : part
                  )}
                </div>

                <details style={{ marginBottom:24 }}>
                  <summary style={{ fontSize:12, color:'#94a3b8', cursor:'pointer', outline:'none', fontWeight:500 }}>
                    Adjust Template...
                  </summary>
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

            {/* Persona Intelligence Card */}
            <div className="persona-card" aria-live="polite">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ padding:8, background:'rgba(255,255,255,.1)', borderRadius:8 }}>{persona.icon}</div>
                <div>
                  <div style={{ fontSize:10, opacity:.7, textTransform:'uppercase', letterSpacing:'.05em' }}>
                    Persona • {persona.buyerRole}</div>
                  <div style={{ fontSize:16, fontWeight:700 }}>{persona.label} <span style={{ opacity:.7, fontWeight:500 }}>({persona.level || current?.persona?.level})</span></div>
                </div>
              </div>

              <div className="p-section">
                <h4>Top Goals</h4>
                <ul className="p-list">{persona.goals.map(g => <li key={g}><Target size={12}/> {g}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Key Challenges</h4>
                <ul className="p-list">{persona.challenges.map(c => <li key={c}><Bug size={12}/> {c}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Success Measures</h4>
                <ul className="p-list">{persona.success.map(s => <li key={s}><ShieldCheck size={12}/> {s}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Interaction Preferences</h4>
                <ul className="p-list">{persona.interaction.map(i => <li key={i}><ChevronRight size={12}/> {i}</li>)}</ul>
              </div>
              <div className="p-section">
                <h4>Preferred Resources</h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {persona.preferred.map(p => <span key={p} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', padding:'4px 8px', borderRadius:999, fontSize:12 }}>{p}</span>)}
                </div>
              </div>
              <div className="p-section" style={{ opacity:.8 }}>
                <h4>Lifecycle Presence</h4>
                <div style={{ fontSize:12 }}>{(persona.lifecycle||[]).join(' • ')}</div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign:'center', color:'#94a3b8' }}>
            <p>Select a prospect from the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
