// App.js — Fairway LinkedIn Copilot (Manual-Assist, STAR token CSS)
// - Uses your design tokens/classes from styles.css
// - CSV upload, queue, templates, copy & open, daily caps, activity export

import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const LS_KEY = "fairway-li-copilot-v2";

// Simple {{token}} interpolation for: name,title,company,persona,segment
function renderTemplate(tpl, row) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => row?.[k] ?? "");
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
    const cleaned = cols.map((c) =>
      c.replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"').trim()
    );
    const row = {};
    headers.forEach((h, i) => (row[h] = cleaned[i] ?? ""));
    row.status = row.status || "new"; // new | requested | connected | messaged
    row.lastActionAt = row.lastActionAt || "";
    return row;
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.warn("Clipboard error", e);
  }
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const body = rows
    .map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const csv = [headers.join(","), body].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function statusBadge(status) {
  const map = {
    new: { label: "new", color: "#93C5FD" },
    requested: { label: "requested", color: "#7DD3FC" },
    connected: { label: "connected", color: "#A78BFA" },
    messaged: { label: "messaged", color: "#FBBF24" },
  };
  const s = map[status] || map.new;
  return (
    <span
      className="badge"
      style={{
        borderColor: "transparent",
        color: "#0f172a",
        background: s.color,
        fontWeight: 700,
      }}
    >
      {s.label}
    </span>
  );
}

export default function App() {
  const [prospects, setProspects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [connectNoteTpl, setConnectNoteTpl] = useState(
    " Hi {{name}}, great to see what you’re building at {{company}}. I partner with {{title}} leaders exploring new ways to improve {{product / need / fit}}. Worth connecting?"
  );
  const [followupTpl, setFollowupTpl] = useState(
    "Appreciate the connection, {{name}}! Would you be against me sending over some new content we've created around key insights related to [enter challenge], or should I send over a short Zoom link?"
  );

  const [dailyLimit, setDailyLimit] = useState(50);
  const [sentToday, setSentToday] = useState(0);
  const [todayStr, setTodayStr] = useState(() => new Date().toDateString());
  const [throttleMs, setThrottleMs] = useState(15000);

  const [log, setLog] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load persisted
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setProspects(s.prospects ?? []);
      setSelectedIndex(s.selectedIndex ?? 0);
      setConnectNoteTpl(s.connectNoteTpl ?? connectNoteTpl);
      setFollowupTpl(s.followupTpl ?? followupTpl);
      setDailyLimit(s.dailyLimit ?? dailyLimit);
      setSentToday(s.sentToday ?? sentToday);
      setTodayStr(s.todayStr ?? todayStr);
      setThrottleMs(s.throttleMs ?? throttleMs);
      setLog(s.log ?? []);
    } catch {}
    // eslint-disable-next-line
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        prospects,
        selectedIndex,
        connectNoteTpl,
        followupTpl,
        dailyLimit,
        sentToday,
        todayStr,
        throttleMs,
        log,
      })
    );
  }, [
    prospects,
    selectedIndex,
    connectNoteTpl,
    followupTpl,
    dailyLimit,
    sentToday,
    todayStr,
    throttleMs,
    log,
  ]);

  // Reset daily counter on day change
  useEffect(() => {
    const now = new Date().toDateString();
    if (now !== todayStr) {
      setTodayStr(now);
      setSentToday(0);
    }
  }, [todayStr]);

  const current = prospects[selectedIndex];

  const filteredProspects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      const matchesQ =
        !q ||
        [p.name, p.title, p.company, p.persona, p.segment]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q));
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesQ && matchesStatus;
    });
  }, [prospects, search, filterStatus]);

  useEffect(() => {
    if (!filteredProspects.length) return;
    const idxInFiltered = filteredProspects.indexOf(current);
    if (idxInFiltered === -1) {
      setSelectedIndex(
        Math.min(selectedIndex, Math.max(0, filteredProspects.length - 1))
      );
    }
    // eslint-disable-next-line
  }, [filteredProspects.length]);

  const connectPreview = useMemo(
    () => (current ? renderTemplate(connectNoteTpl, current) : ""),
    [current, connectNoteTpl]
  );
  const followupPreview = useMemo(
    () => (current ? renderTemplate(followupTpl, current) : ""),
    [current, followupTpl]
  );

  /* ------------ Handlers ------------ */
  function onUploadCSV(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      setProspects(rows);
      setSelectedIndex(0);
    };
    reader.readAsText(f);
  }

  function openLinkedIn(url) {
    window.open(url || "https://www.linkedin.com/", "_blank", "noopener");
  }

  function markAction(action, idx = selectedIndex) {
    const next = [...prospects];
    const p = { ...next[idx] };
    p.lastActionAt = new Date().toISOString();
    if (action === "connect") p.status = "requested";
    if (action === "message") p.status = "messaged";
    next[idx] = p;
    setProspects(next);
    setLog((l) => [
      { idx, action, name: p.name, company: p.company, at: p.lastActionAt },
      ...l,
    ]);
  }

  function nextProspect() {
    const list = filteredProspects;
    if (!list.length) return;
    const pos = list.indexOf(current);
    const target = list[Math.min(pos + 1, list.length - 1)];
    const globalIdx = prospects.indexOf(target);
    setSelectedIndex(globalIdx === -1 ? selectedIndex : globalIdx);
  }

  async function runConnect() {
    if (!current) return;
    if (sentToday >= dailyLimit) {
      alert("Daily limit reached.");
      return;
    }
    await copyToClipboard(connectPreview);
    openLinkedIn(current.linkedin_url);
    markAction("connect");
    setSentToday((n) => n + 1);
    setTimeout(() => {}, throttleMs);
  }

  async function runFollowup() {
    if (!current) return;
    await copyToClipboard(followupPreview);
    openLinkedIn(current.linkedin_url);
    markAction("message");
    setTimeout(() => {}, throttleMs);
  }

  function exportLog() {
    if (!log.length) return;
    downloadCSV("fairway_li_activity.csv", log);
  }

  /* ------------- UI ------------- */
  return (
    <div className="app">
      {/* Page head */}
      <div className="page-head">
        <h1>Fairway Digital Media • Social Outreach</h1>
        <p className="tabs-intro">
          Manual-assist outreach: you copy text and click inside LinkedIn. No
          bots.
        </p>
      </div>

      {/* Top controls */}
      <div className="pmix-grid">
        {/* Left rail: Controls & Filters */}
        <div className="pmix-controls">
          <div className="pmix-group">
            <h4>Search & Filter</h4>
            <div className="pmix-row">
              <label>Search</label>
              <input
                className="input select"
                placeholder="name, title, company, persona, segment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="pmix-row">
              <label>Status</label>
              <select
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="requested">Requested</option>
                <option value="connected">Connected</option>
                <option value="messaged">Messaged</option>
              </select>
            </div>
            <div className="pmix-row">
              <label>Upload CSV</label>
              <input
                className="select"
                type="file"
                accept=".csv"
                onChange={onUploadCSV}
              />
            </div>
            <div className="pmix-row">
              <label>Download Template</label>
              <button
                className="btn"
                onClick={() =>
                  downloadCSV("fairway_template.csv", [
                    {
                      name: "Jane Doe",
                      title: "VP Engineering",
                      company: "Acme Inc",
                      linkedin_url: "https://www.linkedin.com/in/janedoe",
                      persona: "Engineering",
                      segment: "Enterprise",
                      status: "new",
                    },
                  ])
                }
              >
                CSV Template
              </button>
            </div>
          </div>

          <div className="pmix-group">
            <h4>Safety & Pace</h4>
            <div className="pmix-row">
              <label>Daily Limit</label>
              <input
                className="input"
                type="number"
                min={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value || 0))}
              />
              <span className="pmix-right">
                <span className="num">{sentToday}</span> sent today
              </span>
            </div>
            <div className="pmix-row">
              <label>Throttle (ms)</label>
              <input
                className="input"
                type="number"
                min={0}
                value={throttleMs}
                onChange={(e) => setThrottleMs(parseInt(e.target.value || 0))}
              />
            </div>
            <div className="pmix-row">
              <label>Prospects</label>
              <span className="num">{prospects.length}</span>
            </div>
            <div className="pmix-row">
              <label>Activity Log</label>
              <button className="btn" onClick={exportLog}>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cards */}
        <div className="col gap">
          {/* Queue */}
          <div className="card">
            <div className="card-header">
              <h3>Queue</h3>
              <div className="sub">
                Showing {filteredProspects.length} of {prospects.length}
              </div>
            </div>

            <div>
              {filteredProspects.length ? (
                filteredProspects.map((p, i) => {
                  const globalIdx = prospects.indexOf(p);
                  const active = globalIdx === selectedIndex;
                  return (
                    <button
                      key={globalIdx + (p.linkedin_url || i)}
                      className={`ap-link${active ? " active" : ""}`}
                      onClick={() => setSelectedIndex(globalIdx)}
                      title={p.linkedin_url}
                    >
                      <div
                        className="row gap"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div
                          className="col gap"
                          style={{ alignItems: "flex-start" }}
                        >
                          <div className="family">{p.name || "(no name)"}</div>
                          <small className="muted">
                            {p.title} · {p.company}
                          </small>
                        </div>
                        {statusBadge(p.status)}
                      </div>
                    </button>
                  );
                })
              ) : (
                <small className="muted">
                  Upload a CSV with columns:{" "}
                  <code>name,title,company,linkedin_url,persona,segment</code>
                </small>
              )}
            </div>
          </div>

          {/* Workbench */}
          <div className="card">
            <div className="card-header">
              <h3>Workbench</h3>
              {current && (
                <a
                  className="sub"
                  href={current.linkedin_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open profile ↗
                </a>
              )}
            </div>

            {current ? (
              <>
                <div className="row gap">
                  <div className="col gap">
                    <div className="family">{current.name || "(no name)"}</div>
                    <small className="muted">
                      {current.title} · {current.company}
                    </small>
                    <small className="muted">
                      {current.persona} · {current.segment}
                    </small>
                  </div>
                  <div>{statusBadge(current.status)}</div>
                </div>

                <div className="pmix-group">
                  <h4>Connection note (you click send)</h4>
                  <div className="ap-editor" style={{ padding: 10 }}>
                    <div className="ab-card" style={{ marginBottom: 8 }}>
                      {connectPreview}
                    </div>
                    <div className="row gap">
                      <button className="btn primary" onClick={runConnect}>
                        Copy & Open LinkedIn
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          copyToClipboard(connectPreview);
                          markAction("connect");
                        }}
                      >
                        Copy Only
                      </button>
                      <button className="btn" onClick={nextProspect}>
                        Next →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pmix-group">
                  <h4>Follow-up (after acceptance)</h4>
                  <div className="ap-editor" style={{ padding: 10 }}>
                    <div className="ab-card" style={{ marginBottom: 8 }}>
                      {followupPreview}
                    </div>
                    <div className="row gap">
                      <button className="btn primary" onClick={runFollowup}>
                        Copy & Open LinkedIn
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          copyToClipboard(followupPreview);
                          markAction("message");
                        }}
                      >
                        Copy Only
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <small className="muted">No prospect selected.</small>
            )}
          </div>

          {/* Templates */}
          <div className="card">
            <div className="card-header">
              <h3>Templates & Personalization</h3>
              <div className="sub">
                Use variables: <code>{"{{name}}"}</code>,{" "}
                <code>{"{{title}}"}</code>, <code>{"{{company}}"}</code>,{" "}
                <code>{"{{persona}}"}</code>, <code>{"{{segment}}"}</code>
              </div>
            </div>

            <div className="row gap">
              <div className="col gap" style={{ flex: 1 }}>
                <small className="muted">Connection Note</small>
                <textarea
                  className="ap-textarea"
                  value={connectNoteTpl}
                  onChange={(e) => setConnectNoteTpl(e.target.value)}
                />
              </div>
              <div className="col gap" style={{ flex: 1 }}>
                <small className="muted">Follow-up Message</small>
                <textarea
                  className="ap-textarea"
                  value={followupTpl}
                  onChange={(e) => setFollowupTpl(e.target.value)}
                />
              </div>
            </div>

            <div className="ap-help">
              <details>
                <summary>Fairway guidance</summary>
                <ul className="bullets">
                  <li>
                    This is manual-assist. You perform the final click in
                    LinkedIn.
                  </li>
                  <li>
                    Keep first notes short. Personalize with title/company
                    context.
                  </li>
                  <li>Stay under sensible daily caps to avoid risk.</li>
                </ul>
              </details>
            </div>
          </div>

          {/* Activity (compact) */}
          {log.length > 0 && (
            <div className="card analysis">
              <h3>Recent Activity</h3>
              <div className="subhead">Most recent first</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Action</th>
                      <th className="right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((r, i) => (
                      <tr key={i}>
                        <td>{r.name}</td>
                        <td>{r.company}</td>
                        <td>{r.action}</td>
                        <td className="right">
                          <span className="num">
                            {new Date(r.at).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
