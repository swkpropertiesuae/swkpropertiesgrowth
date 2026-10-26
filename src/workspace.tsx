import Intelligence from "./intelligence";
import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Send,
  LayoutDashboard,
  Users,
  FolderKanban,
  Megaphone,
  ListTodo,
  ChartNoAxesCombined,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calculator,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  Check,
  Trash2,
  Download,
  SlidersHorizontal,
  GripVertical,
  ChevronRight,
  LogOut,
  Target,
  FileCheck,
  Globe,
} from "lucide-react";
import { Logo, Modal } from "./main";
import {
  initialTasks,
  campaigns as seedCampaigns,
  projects as seedProjects,
  clients as seedClients,
  leads as seedLeads,
  agents,
  roles,
  type Task,
  type RecordItem,
  type Proposal,
  type Audit,
} from "./data";
import { calculateROI, mayApprove, csvCell, approvalRole } from "./domain.mjs";
import { cityById } from "./growth/cities.mjs";
import { CityPicker, CityBrief } from "./growth/CityExplorer";
import LeadEngine from "./growth/LeadEngine";
function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
const nav = [
  ["Overview", LayoutDashboard],
  ["Clients", Users],
  ["Projects", FolderKanban],
  ["Campaigns", Megaphone],
  ["Leads", Target],
  ["Tasks", ListTodo],
  ["Analytics", ChartNoAxesCombined],
  ["Agent hub", Sparkles],
  ["Approvals", ShieldCheck],
  ["Lead engine", Send],
  ["City planner", MapPin],
  ["ROI explorer", Calculator],
  ["Intelligence", Globe],
  ["Truth passport", FileCheck],
  ["Settings", Settings],
] as const;
const widgetNames = [
  "Hours This Week",
  "Tasks Completed",
  "Your Growth Workspace",
  "Weekly Activity",
  "Campaign Progress",
  "Recent Activity",
  "Team Overview",
];
function useLocal<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem("swkgrowth:" + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("swkgrowth:" + key, JSON.stringify(value));
    } catch {
      window.dispatchEvent(new CustomEvent("storage-error"));
    }
  }, [key, value]);
  return [value, setValue];
}
function download(name: string, body: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Workspace() {
  const [page, setPage] = useState("Overview"),
    [drawer, setDrawer] = useState(false),
    [collapsed, setCollapsed] = useLocal("collapsed", false),
    [workspace, setWorkspace] = useLocal("workspace", "Demo agency"),
    [role, setRole] = useLocal("role", "Owner"),
    [tasks, setTasks] = useLocal<Task[]>("tasks", initialTasks),
    [campaigns, setCampaigns] = useLocal<RecordItem[]>(
      "campaigns",
      seedCampaigns,
    ),
    [projects, setProjects] = useLocal<RecordItem[]>("projects", seedProjects),
    [clients, setClients] = useLocal<RecordItem[]>("clients", seedClients),
    [leads, setLeads] = useLocal<RecordItem[]>("leads", seedLeads),
    [proposals, setProposals] = useLocal<Proposal[]>("proposals", []),
    [audit, setAudit] = useLocal<Audit[]>("audit", []),
    [widgets, setWidgets] = useLocal<string[]>("widgets", widgetNames),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All"),
    [modal, setModal] = useState(""),
    [taskEdit, setTaskEdit] = useState<Task | null>(null),
    [detail, setDetail] = useState<RecordItem | null>(null),
    [notices, setNotices] = useState(false),
    [profile, setProfile] = useState(false),
    [toast, setToast] = useState(""),
    [period, setPeriod] = useState("This week"),
    [metric, setMetric] = useState("Hours"),
    [agent, setAgent] = useState(0),
    [brief, setBrief] = useState(""),
    [reviewTier, setReviewTier] = useState(1),
    [city, setCity] = useState("ae-dubai"),
    [cityPlan, setCityPlan] = useLocal<Record<string, string>>("cityPlans", {}),
    [price, setPrice] = useState(1500000),
    [rent, setRent] = useState(100000),
    [costs, setCosts] = useState(20000),
    [drag, setDrag] = useState("");
  const cityObj = cityById(city) ?? cityById("ae-dubai")!;
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.title = "SWKGrowth — " + page + " · Demo workspace";
    return () => {
      document.title = "SWKGrowth — The Real Estate Growth Engine";
    };
  }, [page]);
  useEffect(() => {
    const fn = () =>
      setToast(
        "Browser storage is unavailable or full. Changes may not persist; export your data.",
      );
    window.addEventListener("storage-error", fn);
    return () => window.removeEventListener("storage-error", fn);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(t);
  }, [toast]);
  const go = (p: string) => {
    setPage(p);
    setSearch("");
    setFilter("All");
    setDrawer(false);
    setDetail(null);
    setNotices(false);
    setProfile(false);
    window.scrollTo(0, 0);
  };
  const log = (message: string) =>
    setAudit((a) => [
      { id: makeId(), message, time: new Date().toISOString() },
      ...a,
    ]);
  const completed = tasks.filter((t) => t.done).length,
    pending = proposals.filter((p) => p.status === "Pending"),
    overdue = tasks.filter(
      (t) => !t.done && t.due < new Date().toISOString().slice(0, 10),
    );
  const activeTasks = tasks.filter((t) => !t.done);
  const updateTask = (id: string) => {
    setTasks((a) => a.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    log("Updated task status");
  };
  const openTask = (t: Task | null = null) => {
    setTaskEdit(t);
    setModal("task");
  };
  const saveTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const task: Task = {
      id: taskEdit?.id ?? makeId(),
      title: String(d.get("title")).trim(),
      description: String(d.get("description")),
      assignee: String(d.get("assignee")),
      due: String(d.get("due")),
      priority: String(d.get("priority")),
      project: String(d.get("project")),
      done: taskEdit?.done ?? false,
    };
    if (!task.title) return;
    setTasks((a) =>
      taskEdit ? a.map((t) => (t.id === task.id ? task : t)) : [task, ...a],
    );
    log((taskEdit ? "Edited: " : "Created: ") + task.title);
    setModal("");
    setToast("Task saved in this browser.");
  };
  const resultGroups = [
    { name: "Tasks", rows: tasks.map((t) => ({ id: t.id, name: t.title })) },
    { name: "Campaigns", rows: campaigns },
    { name: "Projects", rows: projects },
    { name: "Clients", rows: clients },
    { name: "Leads", rows: leads },
  ];
  const results = search.trim()
    ? resultGroups.flatMap((g) =>
        g.rows
          .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
          .map((r) => ({ ...r, group: g.name })),
      )
    : [];
  function chart() {
    const values =
      period === "This week"
        ? metric === "Hours"
          ? [5, 8, 6, 9, 7, 4, 3]
          : [9, 14, 12, 18, 16, 8, 12]
        : period === "Last week"
          ? metric === "Hours"
            ? [4, 6, 5, 7, 8, 3, 4]
            : [7, 10, 13, 9, 14, 6, 8]
          : metric === "Hours"
            ? [18, 25, 22, 30, 26, 16, 14]
            : [28, 42, 36, 48, 39, 24, 30];
    const max = Math.max(...values);
    return (
      <>
        <div className="chart-controls">
          <select
            aria-label="Chart metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option>Hours</option>
            <option>Tasks</option>
          </select>
          <span className="badge">Demo · {period.toLowerCase()}</span>
        </div>
        <svg
          className="activity-chart"
          viewBox="0 0 560 205"
          role="img"
          aria-label={
            "Demo " + metric + " for " + period + ". " + values.join(", ")
          }
        >
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="30"
              x2="545"
              y1={20 + i * 47}
              y2={20 + i * 47}
              stroke="#e7eae5"
            />
          ))}
          {values.map((v, i) => (
            <g key={i}>
              <rect
                x={45 + i * 70}
                y={170 - (v / max) * 140}
                width="30"
                height={(v / max) * 140}
                rx="7"
                fill={i === 3 ? "#0F1714" : "#F79A75"}
                tabIndex={0}
              >
                <title>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ][i] +
                    ": " +
                    v +
                    " " +
                    metric}
                </title>
              </rect>
              <text
                x={60 + i * 70}
                y={160 - (v / max) * 140}
                textAnchor="middle"
                fontSize="11"
                fill="#0F1714"
              >
                {v}
              </text>
              <text
                x={60 + i * 70}
                y="195"
                textAnchor="middle"
                fontSize="11"
                fill="#59645d"
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </text>
            </g>
          ))}
          <polyline
            points={values
              .map((v, i) => `${60 + i * 70},${155 - (v / max) * 140}`)
              .join(" ")}
            fill="none"
            stroke="#9c5838"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </>
    );
  }
  function taskList(list: Task[], compact = false) {
    return list.length ? (
      <div className="task-list">
        {list.map((t) => (
          <div className={"task-row " + (t.done ? "done" : "")} key={t.id}>
            <button
              className="check-button"
              aria-label={(t.done ? "Reopen " : "Complete ") + t.title}
              aria-pressed={t.done}
              onClick={() => updateTask(t.id)}
            >
              {t.done && <Check size={15} />}
            </button>
            <button className="task-title" onClick={() => openTask(t)}>
              <strong>{t.title}</strong>
              <span>
                {t.project} · {t.assignee}
              </span>
            </button>
            <div>
              <span className="badge">
                {t.done
                  ? "Complete"
                  : t.due < new Date().toISOString().slice(0, 10)
                    ? "Overdue"
                    : t.priority}
              </span>
              <small>{t.due}</small>
            </div>
            {!compact && (
              <button
                className="icon-btn"
                aria-label={"Delete " + t.title}
                onClick={() => {
                  setTaskEdit(t);
                  setModal("deleteTask");
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="empty">
        <ListTodo />
        <h3>No tasks here yet.</h3>
        <p>Start with one useful next step.</p>
        <button className="btn dark small" onClick={() => openTask()}>
          Add a task
        </button>
      </div>
    );
  }
  function renderWidget(name: string) {
    switch (name) {
      case "Hours This Week":
        return (
          <>
            <span className="badge">Demo</span>
            <div className="stat">
              {period === "This week"
                ? "42"
                : period === "Last week"
                  ? "37"
                  : "151"}
              <small> hrs</small>
            </div>
            <p>Illustrative tracked hours</p>
            <span className="trend">↗ 12% sample comparison</span>
            <div className="tiny-bars">
              {[35, 60, 45, 80, 65, 40, 30, 70, 55, 100, 80, 60].map((v, i) => (
                <i key={i} style={{ height: v + "%" }} />
              ))}
            </div>
          </>
        );
      case "Tasks Completed":
        return (
          <>
            <span className="badge">Local demo records</span>
            <div className="stat">
              {completed}
              <small> / {tasks.length}</small>
            </div>
            <p>
              {activeTasks.length} in progress · {overdue.length} overdue
            </p>
            <progress max={tasks.length || 1} value={completed} />
            <button className="text-link" onClick={() => go("Tasks")}>
              Review your tasks <ArrowRight size={15} />
            </button>
          </>
        );
      case "Your Growth Workspace":
        return (
          <>
            <span className="badge">Demo plan</span>
            <h3 className="workspace-name">{workspace}</h3>
            <p>
              {campaigns.filter((c) => c.status === "Active").length} active
              campaigns · {projects.length} projects
            </p>
            <button className="btn dark small" onClick={() => go("Projects")}>
              View workspace details <ArrowUpRight size={15} />
            </button>
          </>
        );
      case "Weekly Activity":
        return chart();
      case "Campaign Progress":
        return (
          <div className="campaign-progress">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  go("Campaigns");
                  setDetail(c);
                }}
              >
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.progress}%</span>
                </div>
                <progress max="100" value={c.progress} />
                <span className="source-note">{c.status} · Demo</span>
              </button>
            ))}
          </div>
        );
      case "Recent Activity":
        return taskList(tasks.slice(0, 4), true);
      case "Team Overview":
        return (
          <>
            <span className="badge">Synthetic demo team</span>
            {[
              "Demo strategist",
              "Demo operations",
              "Demo designer",
              "Demo analyst",
              "Demo coordinator",
            ].map((n, i) => (
              <div className="demo-person" key={n}>
                <span className="avatar">
                  {n.split(" ")[1].slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>{n}</strong>
                  <span>
                    {
                      [
                        "Strategy",
                        "Operations",
                        "Creative",
                        "Research",
                        "Delivery",
                      ][i]
                    }
                  </span>
                </div>
                <progress max="100" value={[80, 60, 45, 70, 50][i]} />
              </div>
            ))}
          </>
        );
      default:
        return null;
    }
  }
  const collections: { [key: string]: RecordItem[] } = {
    Clients: clients,
    Projects: projects,
    Campaigns: campaigns,
    Leads: leads,
  };
  function updateRecord(item: RecordItem) {
    if (page === "Clients")
      setClients((a) => a.map((r) => (r.id === item.id ? item : r)));
    if (page === "Projects")
      setProjects((a) => a.map((r) => (r.id === item.id ? item : r)));
    if (page === "Campaigns")
      setCampaigns((a) => a.map((r) => (r.id === item.id ? item : r)));
    if (page === "Leads")
      setLeads((a) => a.map((r) => (r.id === item.id ? item : r)));
    setDetail(item);
    log("Updated " + page.toLowerCase() + ": " + item.name);
  }
  function exportData(format: string) {
    if (format === "csv") {
      download(
        "swkgrowth-tasks.csv",
        [
          "title,description,assignee,due,priority,project,status",
          ...tasks.map((t) =>
            [
              t.title,
              t.description,
              t.assignee,
              t.due,
              t.priority,
              t.project,
              t.done ? "Complete" : "Active",
            ]
              .map(csvCell)
              .join(","),
          ),
        ].join("\r\n"),
        "text/csv",
      );
    } else
      download(
        "swkgrowth-demo-export.json",
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            dataType: "Browser-local demonstration data",
            intelligence: Object.fromEntries(
              ["evidence", "experiments"].map((k) => {
                try {
                  return [
                    k,
                    JSON.parse(localStorage.getItem("swkgrowth:" + k) ?? "[]"),
                  ];
                } catch {
                  return [k, []];
                }
              }),
            ),
            tasks,
            clients,
            projects,
            campaigns,
            leads,
            proposals,
            audit,
            cityPlan,
          },
          null,
          2,
        ),
      );
    setToast("Export prepared.");
  }
  return (
    <div className={"app-shell " + (collapsed ? "collapsed" : "")}>
      <aside className={"sidebar " + (drawer ? "show" : "")}>
        <a href="#" className="sidebar-logo" aria-label="SWKGrowth home">
          <Logo />
        </a>
        <div className="rail-label">YOUR WORKSPACE</div>
        <nav aria-label="Workspace navigation">
          {nav.map(([n, I]) => (
            <button
              title={n}
              className={page === n ? "active" : ""}
              key={n}
              onClick={() => go(n)}
              aria-current={page === n ? "page" : undefined}
            >
              <I size={19} />
              <span>{n}</span>
              {n === "Approvals" && pending.length > 0 && (
                <i>{pending.length}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-prompt">
            <Sparkles size={22} />
            <strong>
              Thoughtful growth
              <br />
              starts with a clear plan.
            </strong>
            <a href="#contact">
              Talk to the team <ArrowUpRight size={15} />
            </a>
          </div>
          <button
            title="Collapse navigation"
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <GripVertical size={18} />
            <span>{collapsed ? "Expand" : "Collapse"} navigation</span>
          </button>
          <a href="#">
            <LogOut size={18} />
            <span>Back to website</span>
          </a>
        </div>
      </aside>
      {drawer && (
        <button
          className="drawer-overlay"
          onClick={() => setDrawer(false)}
          aria-label="Close workspace navigation"
        />
      )}
      <div className="workspace-main">
        <header className="app-header">
          <div className="app-greeting">
            <button
              className="icon-btn mobile-only"
              aria-label="Open workspace menu"
              onClick={() => setDrawer(!drawer)}
            >
              {drawer ? <X /> : <Menu />}
            </button>
            <span>
              Hi, welcome back <span className="wave">✳</span>
              <small>Let’s make room for what’s next.</small>
            </span>
          </div>
          <div className="app-header-actions">
            <select
              aria-label="Current workspace"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            >
              <option>Demo agency</option>
              <option>Demo developer</option>
            </select>
            <button
              className="icon-btn"
              aria-label="Notifications"
              aria-expanded={notices}
              onClick={() => {
                setNotices(!notices);
                setProfile(false);
              }}
            >
              <Bell size={20} />
              {pending.length + overdue.length > 0 && (
                <i className="count">{pending.length + overdue.length}</i>
              )}
            </button>
            <button
              className="avatar-button"
              aria-label="Profile and demo role"
              aria-expanded={profile}
              onClick={() => {
                setProfile(!profile);
                setNotices(false);
              }}
            >
              <img src="/brand/swk-silhouette.svg" alt="" />
            </button>
          </div>
          {notices && (
            <div className="header-dropdown">
              <h3>Notifications</h3>
              {pending.length + overdue.length === 0 ? (
                <p>You’re up to date.</p>
              ) : (
                <>
                  <button onClick={() => go("Approvals")}>
                    {pending.length} pending approval requests{" "}
                    <ArrowRight size={15} />
                  </button>
                  <button onClick={() => go("Tasks")}>
                    {overdue.length} overdue local tasks{" "}
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
              <p className="source-note">Derived from local demo records.</p>
            </div>
          )}
          {profile && (
            <div className="header-dropdown">
              <h3>Demo profile</h3>
              <label>
                Preview role
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setToast(
                      "Demo role changed. This is not secure authentication.",
                    );
                  }}
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <p className="source-note">
                Roles demonstrate approval permissions. No authentication
                service is connected.
              </p>
              <button onClick={() => go("Settings")}>
                Workspace settings <Settings size={16} />
              </button>
              <a href="#">
                Exit demo workspace <LogOut size={16} />
              </a>
            </div>
          )}
        </header>
        <div className="demo-banner">
          <span>
            <span className="dot" /> DEMO WORKSPACE
          </span>
          <p>Synthetic data · saved in this browser · no live integrations</p>
          <span className="role-label">{role}</span>
        </div>
        <main className="workspace-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">WORKSPACE / {page.toUpperCase()}</div>
              <h1>
                {page === "Overview"
                  ? "Your growth, in focus."
                  : page === "Agent hub"
                    ? "A little intelligence. A lot of oversight."
                    : page === "ROI explorer"
                      ? "Explore the numbers. Keep the perspective."
                      : page + "."}
              </h1>
              <p>
                {page === "Overview"
                  ? "A clear view of your team, your work, and the next step."
                  : "Evidence-led planning. Human decisions. Clearly labelled data."}
              </p>
            </div>
            <div className="page-actions">
              {page === "Overview" || page === "Analytics" ? (
                <select
                  aria-label="Reporting period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option>This week</option>
                  <option>Last week</option>
                  <option>This month</option>
                </select>
              ) : null}
              <button className="btn dark small" onClick={() => openTask()}>
                <Plus size={17} /> Add task
              </button>
            </div>
          </div>
          <div className="workspace-search">
            <Search size={18} />
            <input
              ref={searchRef}
              aria-label="Search workspace"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, clients, projects, campaigns…"
            />
            {search && (
              <button
                className="icon-btn"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
            <span>LOCAL RECORDS</span>
          </div>
          {search.trim() ? (
            <section className="panel search-results">
              <h2>
                Search results <span className="badge">{results.length}</span>
              </h2>
              {results.length ? (
                results.map((r) => (
                  <button
                    key={r.group + r.id}
                    onClick={() => {
                      go(r.group);
                      if (r.group === "Tasks") {
                        openTask(tasks.find((t) => t.id === r.id)!);
                      } else
                        setDetail(
                          collections[r.group].find((t) => t.id === r.id)!,
                        );
                    }}
                  >
                    <div>
                      <strong>{r.name}</strong>
                      <span>{r.group} · Demo record</span>
                    </div>
                    <ArrowUpRight size={18} />
                  </button>
                ))
              ) : (
                <div className="empty">
                  <Search />
                  <h3>No results for “{search}”.</h3>
                  <p>Try a project name, client or task title.</p>
                  <button
                    className="btn dark small"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>
              {page === "Overview" && (
                <>
                  <div className="dashboard-intro">
                    <span className="badge">
                      <ShieldCheck size={13} /> Human-approved by design
                    </span>
                    <span>
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "long",
                        timeZone: "Asia/Dubai",
                      }).format(new Date())}
                    </span>
                    <button
                      className="text-link"
                      onClick={() => setModal("widgets")}
                    >
                      <SlidersHorizontal size={15} /> Customize dashboard
                    </button>
                  </div>
                  <div className="widget-grid">
                    {widgets.map((name) => (
                      <article
                        key={name}
                        className={
                          "panel widget " +
                          (name === "Your Growth Workspace"
                            ? "peach-panel "
                            : "") +
                          (["Weekly Activity", "Recent Activity"].includes(name)
                            ? "wide"
                            : "")
                        }
                        draggable
                        onDragStart={() => setDrag(name)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (drag && drag !== name)
                            setWidgets((w) => {
                              const a = w.filter((x) => x !== drag);
                              a.splice(a.indexOf(name), 0, drag);
                              return a;
                            });
                          setDrag("");
                        }}
                      >
                        <div className="widget-header">
                          <h2>{name}</h2>
                          <GripVertical size={16} />
                        </div>
                        {renderWidget(name)}
                      </article>
                    ))}
                    <button
                      className="add-widget"
                      onClick={() => setModal("widgets")}
                    >
                      <span>
                        <Plus size={22} />
                      </span>
                      <strong>Make this space yours.</strong>
                      <small>Customize your dashboard</small>
                    </button>
                  </div>
                </>
              )}
              {collections[page] && (
                <>
                  {detail ? (
                    <section className="panel record-detail">
                      <button
                        className="text-link"
                        onClick={() => setDetail(null)}
                      >
                        ← Back to {page.toLowerCase()}
                      </button>
                      <span className="badge">
                        Demo record · not live client data
                      </span>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const d = new FormData(e.currentTarget);
                          updateRecord({
                            ...detail,
                            name: String(d.get("name")),
                            description: String(d.get("description")),
                            status: String(d.get("status")),
                            progress: Number(d.get("progress")),
                            start: String(d.get("start")),
                            due: String(d.get("due")),
                          });
                          setToast("Record saved locally.");
                        }}
                        key={detail.id}
                      >
                        <label>
                          Name
                          <input
                            name="name"
                            defaultValue={detail.name}
                            required
                          />
                        </label>
                        <label>
                          Description
                          <textarea
                            name="description"
                            defaultValue={detail.description}
                            rows={3}
                          />
                        </label>
                        <div className="form-grid">
                          <label>
                            Status
                            <select name="status" defaultValue={detail.status}>
                              {[
                                "Active",
                                "Paused",
                                "Completed",
                                "Onboarding",
                                "Inactive",
                                "Initial",
                                "Qualifying",
                                "Proposal",
                                "Negotiation",
                                "Closing",
                              ].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Progress (%)
                            <input
                              name="progress"
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={detail.progress}
                              required
                            />
                          </label>
                          <label>
                            Start date
                            <input
                              type="date"
                              name="start"
                              defaultValue={detail.start}
                              required
                            />
                          </label>
                          <label>
                            Due / follow-up date
                            <input
                              type="date"
                              name="due"
                              defaultValue={detail.due}
                              required
                            />
                          </label>
                        </div>
                        <p>
                          <strong>Association:</strong> {detail.client} ·{" "}
                          <strong>
                            {page === "Projects" ? "Priority" : "Type/source"}:
                          </strong>{" "}
                          {detail.type}
                        </p>
                        {page === "Campaigns" && (
                          <p className="badge">
                            Illustrative budget: USD{" "}
                            {detail.budget.toLocaleString()}
                          </p>
                        )}
                        <button className="btn dark" type="submit">
                          Save changes <Check size={17} />
                        </button>
                      </form>
                      {page === "Projects" && (
                        <>
                          <h3>Project checklist</h3>
                          {taskList(
                            tasks.filter((t) => t.project === detail.name),
                          )}
                        </>
                      )}
                      {page === "Clients" && (
                        <>
                          <h3>Associated projects and campaigns</h3>
                          {[...projects, ...campaigns]
                            .filter((c) => c.client === detail.name)
                            .map((c) => (
                              <details key={c.id}>
                                <summary>
                                  {c.name}
                                  <ChevronRight size={16} />
                                </summary>
                                <p>{c.description}</p>
                                <p>
                                  {c.status} · {c.progress}% complete · Demo
                                </p>
                              </details>
                            ))}
                        </>
                      )}
                    </section>
                  ) : (
                    <>
                      <div className="toolbar">
                        <span>{collections[page].length} demo records</span>
                        <label>
                          Filter status
                          <select
                            aria-label="Filter records by status"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          >
                            {[
                              "All",
                              ...new Set(
                                collections[page].map((r) => r.status),
                              ),
                            ].map((f) => (
                              <option key={f}>{f}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="record-grid">
                        {collections[page]
                          .filter(
                            (r) =>
                              (filter === "All" || r.status === filter) &&
                              (page === "Clients" || r.client === workspace),
                          )
                          .map((r) => (
                            <button
                              className="panel record-card"
                              key={r.id}
                              onClick={() => setDetail(r)}
                            >
                              <div className="card-top">
                                <span className="record-icon">
                                  {page === "Clients" ? (
                                    <Users />
                                  ) : page === "Campaigns" ? (
                                    <Megaphone />
                                  ) : page === "Leads" ? (
                                    <Target />
                                  ) : (
                                    <FolderKanban />
                                  )}
                                </span>
                                <span className="badge">{r.status}</span>
                              </div>
                              <h2>{r.name}</h2>
                              <p>{r.description}</p>
                              <div className="property-meta">
                                <span>
                                  {r.client} · {r.type}
                                </span>
                                <ArrowUpRight size={17} />
                              </div>
                              <progress max="100" value={r.progress} />
                              <span className="source-note">
                                {r.progress}% · Demo · Due {r.due}
                              </span>
                            </button>
                          ))}
                      </div>
                      {!collections[page].some(
                        (r) =>
                          (filter === "All" || r.status === filter) &&
                          (page === "Clients" || r.client === workspace),
                      ) && (
                        <div className="panel empty">
                          <FolderKanban />
                          <h3>No records match this workspace and filter.</h3>
                          <p>Change the status filter or workspace selector.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {page === "Tasks" && (
                <section className="panel">
                  <div className="toolbar">
                    <div className="segmented">
                      {["All", "Active", "Completed", "Overdue"].map((f) => (
                        <button
                          key={f}
                          className={filter === f ? "selected" : ""}
                          onClick={() => setFilter(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <button
                      className="text-link"
                      onClick={() => exportData("csv")}
                    >
                      <Download size={16} /> CSV
                    </button>
                  </div>
                  {taskList(
                    tasks.filter(
                      (t) =>
                        filter === "All" ||
                        (filter === "Active" && !t.done) ||
                        (filter === "Completed" && t.done) ||
                        (filter === "Overdue" &&
                          !t.done &&
                          t.due < new Date().toISOString().slice(0, 10)),
                    ),
                  )}
                </section>
              )}
              {page === "Analytics" && (
                <>
                  <div className="analytics-metrics">
                    {[
                      [
                        "Campaigns",
                        campaigns.filter((c) => c.client === workspace).length,
                      ],
                      [
                        "Task completion",
                        Math.round((completed / (tasks.length || 1)) * 100) +
                          "%",
                      ],
                      ["Open local tasks", activeTasks.length],
                      [
                        "Active enquiries",
                        leads.filter((l) => l.client === workspace).length,
                      ],
                    ].map(([n, v]) => (
                      <article className="panel" key={n}>
                        <span className="badge">Demo / local</span>
                        <h2>{n}</h2>
                        <div className="stat">{v}</div>
                      </article>
                    ))}
                  </div>
                  <div className="two-columns">
                    <section className="panel">
                      <h2>Activity over time</h2>
                      {chart()}
                    </section>
                    <section className="panel">
                      <h2>Campaign delivery</h2>
                      {renderWidget("Campaign Progress")}
                    </section>
                    <section className="panel">
                      <h2>SEO & enquiry exploration</h2>
                      <p>
                        Illustrative analytics series. No Google Analytics, ad
                        account, search console or CRM is connected.
                      </p>
                      {[
                        "Property pages",
                        "Organic enquiries",
                        "Keyword visibility",
                      ].map((s, i) => (
                        <div className="metric-line" key={s}>
                          <span>{s}</span>
                          <strong>
                            {(period === "This month"
                              ? 4
                              : period === "Last week"
                                ? 0.8
                                : 1) * [1200, 45, 68][i]}
                          </strong>
                        </div>
                      ))}
                      <span className="source-note">
                        Synthetic values for interface exploration only.
                      </span>
                    </section>
                    <section className="panel">
                      <h2>Project delivery</h2>
                      {projects
                        .filter((p) => p.client === workspace)
                        .map((p) => (
                          <div className="metric-line" key={p.id}>
                            <span>{p.name}</span>
                            <span className="badge">
                              {p.progress >= 60 ? "On track" : "At risk"} · Demo
                            </span>
                          </div>
                        ))}
                    </section>
                  </div>
                </>
              )}
              {page === "Agent hub" && (
                <>
                  <div className="notice">
                    <ShieldCheck size={21} />
                    <p>
                      <strong>
                        Demo planning assistants. No AI service is connected.
                      </strong>
                      <br />
                      These agents generate deterministic planning templates,
                      not market intelligence. No guaranteed leads, sales or
                      returns. All output remains internal.
                    </p>
                  </div>
                  <div className="agent-layout">
                    <section className="panel agent-list">
                      <h2>Your thinking partners</h2>
                      {agents.map(([name, tier], i) => (
                        <button
                          className={agent === i ? "selected" : ""}
                          key={name}
                          onClick={() => {
                            setAgent(i);
                            setReviewTier(agents[i][1]);
                            setBrief("");
                          }}
                        >
                          <span className="agent-avatar">
                            <Sparkles size={17} />
                          </span>
                          <span>
                            <strong>{name}</strong>
                            <small>Tier {tier} · Template mode</small>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </section>
                    <section className="panel agent-work">
                      <div className="agent-emblem">
                        <Sparkles size={32} />
                      </div>
                      <span className="badge">
                        Tier {agents[agent][1]} · Confidence: low / unvalidated
                      </span>
                      <h2>{agents[agent][0]}</h2>
                      <p>{agents[agent][2]}</p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!brief.trim()) return;
                          const tier = Math.max(reviewTier, agents[agent][1]);
                          const content = `INTERNAL DRAFT — ${agents[agent][0]}\nBrief: ${brief.trim()}\n\n1. Define the audience and the decision to be made.\n2. Collect dated, authorised evidence before drafting factual claims.\n3. ${agents[agent][2]}\n4. Record assumptions and a review date; do not publish or spend automatically.\n\nSource: user brief and deterministic SWKGrowth template; no external sources consulted. Confidence: low / unvalidated. Classification: inferred planning draft, not a forecast. Required review: ${approvalRole(tier) ?? "self-serve internal draft"}.`;
                          const p: Proposal = {
                            id: makeId(),
                            agent: agents[agent][0],
                            tier,
                            content,
                            status: tier === 0 ? "Internal draft" : "Pending",
                            created: new Date().toISOString(),
                          };
                          setProposals((a) => [p, ...a]);
                          log(
                            "Created " + p.agent + " template at Tier " + tier,
                          );
                          setToast(
                            tier === 0
                              ? "Internal draft saved."
                              : "Draft added to the human review queue.",
                          );
                          go("Approvals");
                        }}
                      >
                        <label>
                          Your internal planning brief
                          <textarea
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            rows={6}
                            required
                            maxLength={3000}
                            placeholder="Describe the audience, project, and question. Use synthetic business information only."
                          />
                        </label>
                        <label>
                          Approval requirement
                          <select
                            value={reviewTier}
                            onChange={(e) =>
                              setReviewTier(Number(e.target.value))
                            }
                          >
                            {[0, 1, 2, 3]
                              .filter((t) => t >= agents[agent][1])
                              .map((t) => (
                                <option key={t} value={t}>
                                  Tier {t} —{" "}
                                  {approvalRole(t) ?? "Internal draft only"}
                                </option>
                              ))}
                          </select>
                        </label>
                        <button className="btn dark" type="submit">
                          <Sparkles size={17} /> Create planning draft
                        </button>
                      </form>
                      <p className="source-note">
                        Tier 0: internal notes only. Tier 1: team lead (BDM).
                        Tier 2: management. Tier 3: executive. Approval records
                        never execute external actions.
                      </p>
                    </section>
                  </div>
                </>
              )}
              {page === "Approvals" && (
                <>
                  <div className="approval-ladder">
                    {[
                      "Self-serve internal drafts",
                      "Team lead review",
                      "Management review",
                      "Executive review",
                    ].map((s, i) => (
                      <article className="panel" key={s}>
                        <span className="badge">TIER {i}</span>
                        <h3>{s}</h3>
                        <p>
                          {
                            [
                              "Notes & ideas",
                              "Campaign drafts & follow-ups",
                              "Regional plans & projections",
                              "Company-wide plans & major spend",
                            ][i]
                          }
                        </p>
                      </article>
                    ))}
                  </div>
                  <section className="panel">
                    <h2>
                      Review queue{" "}
                      <span className="badge">{pending.length} pending</span>
                    </h2>
                    <p className="source-note">
                      Current demo role: {role}. Local role checks are
                      illustrative and do not provide secure authorization.
                      Approval never publishes, spends or sends.
                    </p>
                    {proposals.length ? (
                      proposals.map((p) => (
                        <article className="proposal" key={p.id}>
                          <div className="card-top">
                            <h3>{p.agent}</h3>
                            <span className="badge">
                              Tier {p.tier} · {p.status}
                            </span>
                          </div>
                          <pre>{p.content}</pre>
                          <small>
                            {new Date(p.created).toLocaleString("en-GB", {
                              timeZone: "Asia/Dubai",
                            })}{" "}
                            GST
                            {p.reviewer
                              ? " · Reviewed by demo " + p.reviewer
                              : ""}
                          </small>
                          {p.status === "Pending" && (
                            <div className="button-row">
                              <button
                                className="btn dark small"
                                disabled={!mayApprove(role, p.tier)}
                                onClick={() => {
                                  if (!mayApprove(role, p.tier)) return;
                                  setProposals((a) =>
                                    a.map((r) =>
                                      r.id === p.id
                                        ? {
                                            ...r,
                                            status:
                                              "Approved for internal planning",
                                            reviewer: role,
                                          }
                                        : r,
                                    ),
                                  );
                                  log(
                                    "Approved internal draft " +
                                      p.id +
                                      " as demo " +
                                      role,
                                  );
                                  setToast(
                                    "Internal plan approved. No external action was executed.",
                                  );
                                }}
                              >
                                Approve internal plan <Check size={16} />
                              </button>
                              <button
                                className="btn outline small"
                                disabled={!mayApprove(role, p.tier)}
                                onClick={() => {
                                  if (!mayApprove(role, p.tier)) return;
                                  setProposals((a) =>
                                    a.map((r) =>
                                      r.id === p.id
                                        ? {
                                            ...r,
                                            status: "Rejected",
                                            reviewer: role,
                                          }
                                        : r,
                                    ),
                                  );
                                  log(
                                    "Rejected draft " +
                                      p.id +
                                      " as demo " +
                                      role,
                                  );
                                }}
                              >
                                Reject
                              </button>
                              {!mayApprove(role, p.tier) && (
                                <span className="source-note">
                                  Requires {approvalRole(p.tier)} or higher.
                                </span>
                              )}
                            </div>
                          )}
                        </article>
                      ))
                    ) : (
                      <div className="empty">
                        <ShieldCheck />
                        <h3>Room for a thoughtful next step.</h3>
                        <p>
                          Create a planning draft in the agent hub to review it
                          here.
                        </p>
                        <button
                          className="btn dark small"
                          onClick={() => go("Agent hub")}
                        >
                          Explore agent hub <ArrowUpRight size={16} />
                        </button>
                      </div>
                    )}
                  </section>
                  <section className="panel audit">
                    <h2>Local audit trail</h2>
                    <p className="source-note">
                      Browser-local activity log. Editable through browser
                      storage; not an immutable security audit.
                    </p>
                    {audit.length ? (
                      audit.slice(0, 30).map((a) => (
                        <div className="audit-row" key={a.id}>
                          <span className="dot" />
                          <span>{a.message}</span>
                          <small>
                            {new Date(a.time).toLocaleString("en-GB", {
                              timeZone: "Asia/Dubai",
                            })}{" "}
                            GST
                          </small>
                        </div>
                      ))
                    ) : (
                      <p>No recorded actions yet.</p>
                    )}
                  </section>
                </>
              )}
              {page === "City planner" && (
                <>
                  <div className="notice">
                    <Globe size={21} />
                    <p>
                      <strong>A city-by-city planning canvas.</strong>
                      <br />
                      Every city in the programme with its tier, rollout wave,
                      languages, channel stack and Dubai-time posting windows.
                      No live market data or legal advice is implied; confirm
                      local advertising and data rules before any paid or direct
                      outreach.
                    </p>
                  </div>
                  <div className="two-columns">
                    <section className="panel">
                      <h2>Choose a city</h2>
                      <CityPicker value={city} onChange={setCity} />
                    </section>
                    <section className="panel" key={city}>
                      <span className="badge">
                        Illustrative planning template
                      </span>
                      <h2>{cityObj.name}, {cityObj.countryName}. Your next conversation.</h2>
                      <CityBrief city={cityObj} />
                      <p>
                        Build a local brief before you choose a channel or a
                        budget. Research is required before using any plan.
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const d = new FormData(e.currentTarget);
                          const text = `City: ${cityObj.name}, ${cityObj.countryName} (${city})\nAudience: ${d.get("audience")}\nLanguage for review: ${d.get("language")}\nIllustrative budget (USD): ${d.get("budget")}\nHypothesis and review rule: ${d.get("hypothesis")}\nRequired checks: local advertising rules, property permits, consent, licensed advice, source verification.\nNo market data connected. KPI targets are not guarantees.`;
                          setCityPlan((a) => ({ ...a, [city]: text }));
                          log("Saved city plan for " + cityObj.name);
                          setToast("City plan saved locally.");
                        }}
                      >
                        <label>
                          Audience
                          <input
                            name="audience"
                            required
                            placeholder="e.g. Voluntary enquiries from local businesses"
                          />
                        </label>
                        <div className="form-grid">
                          <label>
                            Language to evaluate
                            <input
                              name="language"
                              required
                              placeholder="e.g. English"
                            />
                          </label>
                          <label>
                            Test budget (USD, illustrative)
                            <input
                              type="number"
                              min="0"
                              name="budget"
                              required
                              defaultValue="1000"
                            />
                          </label>
                        </div>
                        <label>
                          Hypothesis, KPI target, review date & stopping rule
                          <textarea name="hypothesis" rows={4} required />
                        </label>
                        <button className="btn dark small">
                          Save local plan <Check size={16} />
                        </button>
                      </form>
                      {cityPlan[city] && (
                        <>
                          <pre className="saved-plan">{cityPlan[city]}</pre>
                          <button
                            className="text-link"
                            onClick={() =>
                              download(
                                "swkgrowth-" + city + "-plan.txt",
                                cityPlan[city],
                                "text/plain",
                              )
                            }
                          >
                            <Download size={16} /> Export plan
                          </button>
                        </>
                      )}
                    </section>
                  </div>
                </>
              )}
              {page === "ROI explorer" && (
                <>
                  <div className="notice">
                    <Calculator size={21} />
                    <p>
                      <strong>
                        Illustrative arithmetic. Computes, never concludes.
                      </strong>
                      <br />
                      No forecasts, appreciation assumptions, or investment
                      recommendations. Values are user-entered. Consult
                      qualified advisers.
                    </p>
                  </div>
                  <div className="two-columns">
                    <section className="panel">
                      <h2>Set your assumptions</h2>
                      <p>
                        All inputs in AED. The same currency is required
                        throughout.
                      </p>
                      <label>
                        Purchase price (AED)
                        <input
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.valueAsNumber)}
                        />
                      </label>
                      <label>
                        Annual rent (AED)
                        <input
                          type="number"
                          min="0"
                          value={rent}
                          onChange={(e) => setRent(e.target.valueAsNumber)}
                        />
                      </label>
                      <label>
                        Annual running costs (AED)
                        <input
                          type="number"
                          min="0"
                          value={costs}
                          onChange={(e) => setCosts(e.target.valueAsNumber)}
                        />
                      </label>
                      <p className="source-note">
                        Excludes acquisition fees, vacancy, financing, taxes,
                        currency movements and capital changes. This is not a
                        complete investment appraisal.
                      </p>
                    </section>
                    <section className="panel roi-results">
                      <span className="badge">
                        Illustrative · User assumptions · Not a forecast
                      </span>
                      <h2>Your scenario, calculated.</h2>
                      {(() => {
                        const r = calculateROI(price, rent, costs);
                        return r ? (
                          <>
                            <div className="roi-number">
                              {r.net.toFixed(2)}
                              <span>%</span>
                            </div>
                            <p>Net annual yield before excluded costs</p>
                            <div className="metric-line">
                              <span>Gross yield</span>
                              <strong>{r.gross.toFixed(2)}%</strong>
                            </div>
                            <div className="metric-line">
                              <span>Rent minus running costs</span>
                              <strong>AED {r.cashflow.toLocaleString()}</strong>
                            </div>
                            <p className="source-note">
                              Gross yield = rent ÷ purchase price × 100.
                              <br />
                              Net yield = (rent − running costs) ÷ purchase
                              price × 100.
                            </p>
                          </>
                        ) : (
                          <p role="alert">
                            Enter a positive purchase price and non-negative
                            finite rent and costs.
                          </p>
                        );
                      })()}
                      <p>
                        No conclusion is made about suitability, value or future
                        returns.
                      </p>
                    </section>
                  </div>
                </>
              )}
              {page === "Intelligence" && <Intelligence />}
              {page === "Lead engine" && <LeadEngine role={role} />}
              {page === "Truth passport" && (
                <>
                  <div className="notice">
                    <FileCheck size={21} />
                    <p>
                      <strong>
                        A property’s source record, with the uncertainty
                        visible.
                      </strong>
                      <br />
                      Source provenance does not verify live availability or
                      substantiate every claim in an original listing.
                    </p>
                  </div>
                  <section className="panel">
                    <div className="passport-heading">
                      <span className="passport-icon">
                        <ShieldCheck size={36} />
                      </span>
                      <div>
                        <span className="eyebrow">
                          PROPERTY TRUTH PASSPORT / DEMONSTRATION
                        </span>
                        <h2>Golf Fields</h2>
                        <p>Source record · Emaar Properties · Dubai South</p>
                      </div>
                      <span className="badge">
                        Source-derived · Not independently verified
                      </span>
                    </div>
                    {[
                      [
                        "Classification",
                        "Observed in source repository; not a live feed",
                      ],
                      ["Retrieved", "25 October 2026"],
                      [
                        "Source",
                        "data/properties.json, SWK Properties repository",
                      ],
                      ["Snapshot", "f50616a934e2902ad8ec592a2f1913e4fd6013e9"],
                      [
                        "Price / availability / yields",
                        "Not asserted. Requires fresh verification.",
                      ],
                      [
                        "Permits / consent / disclosure",
                        "Not checked. Release remains blocked.",
                      ],
                      [
                        "Confidence",
                        "Low for current market or inventory claims",
                      ],
                    ].map(([n, v]) => (
                      <div className="metric-line" key={n}>
                        <strong>{n}</strong>
                        <span>{v}</span>
                      </div>
                    ))}
                    <a
                      className="text-link"
                      href="https://github.com/swkpropertiesuae/swkpropertiesuae.com/blob/f50616a934e2902ad8ec592a2f1913e4fd6013e9/data/properties.json"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Inspect source snapshot <ArrowUpRight size={16} />
                    </a>
                    <h3>Pre-release compliance gate</h3>
                    <p className="source-note">
                      A checklist is a planning aid. This demo cannot publish
                      property listings or validate permits.
                    </p>
                    {[
                      "Current listing authority and permits verified",
                      "Facts checked against dated primary evidence",
                      "Image and contact consent documented",
                      "Risks, fees and disclosures reviewed",
                      "Appropriate human authorization recorded",
                    ].map((t) => (
                      <label className="checkbox" key={t}>
                        <input type="checkbox" />
                        {t}
                      </label>
                    ))}
                    <span className="badge">
                      Publishing disabled · External verification required
                    </span>
                  </section>
                </>
              )}
              {page === "Settings" && (
                <div className="two-columns">
                  <section className="panel">
                    <h2>A workspace that stays clear.</h2>
                    <label>
                      Demo workspace
                      <select
                        value={workspace}
                        onChange={(e) => setWorkspace(e.target.value)}
                      >
                        <option>Demo agency</option>
                        <option>Demo developer</option>
                      </select>
                    </label>
                    <label>
                      Preview role
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        {roles.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <p>
                      These selectors explore demo views and approval rules.
                      They are not authentication, tenant isolation, or secure
                      access control.
                    </p>
                    <h3>Integration status</h3>
                    {[
                      "AI provider",
                      "CRM / analytics",
                      "Payments",
                      "Authentication",
                      "Market data / API",
                    ].map((s) => (
                      <div className="metric-line" key={s}>
                        <span>{s}</span>
                        <span className="badge">Not connected</span>
                      </div>
                    ))}
                  </section>
                  <section className="panel">
                    <h2>Your local data.</h2>
                    <p>
                      Data is stored in this browser only. Use synthetic
                      information. Export your work before clearing it.
                    </p>
                    <div className="button-stack">
                      <button
                        className="btn outline"
                        onClick={() => exportData("json")}
                      >
                        <Download size={17} /> Export all records as JSON
                      </button>
                      <button
                        className="btn outline"
                        onClick={() => exportData("csv")}
                      >
                        <Download size={17} /> Export tasks as CSV
                      </button>
                      <button
                        className="btn dark"
                        onClick={() => setModal("reset")}
                      >
                        <Trash2 size={17} /> Reset demo data
                      </button>
                    </div>
                    <h3>Privacy & scope</h3>
                    <p className="source-note">
                      No data is sent to a server by this workspace. No
                      compliance certification or uptime SLA is claimed. Local
                      storage and audit logs are not secure storage. A
                      production service requires backend authorization, consent
                      management, data processing terms, monitoring and
                      integration verification.
                    </p>
                  </section>
                </div>
              )}
            </>
          )}
          <div className="workspace-footer">
            <Logo />
            <span>Evidence-led. Human-approved. Always in perspective.</span>
            <span>LOCAL DEMO / v0.1</span>
          </div>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <Check size={18} />
          {toast}
          <button
            className="icon-btn"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "task"
              ? taskEdit
                ? "Edit task"
                : "One useful next step."
              : modal === "widgets"
                ? "Make this space yours."
                : modal === "deleteTask"
                  ? "Delete this task?"
                  : "Reset local demo data?"
          }
          onClose={() => setModal("")}
        >
          {modal === "task" ? (
            <form onSubmit={saveTask}>
              <label>
                Task title
                <input
                  required
                  name="title"
                  defaultValue={taskEdit?.title}
                  maxLength={180}
                  autoFocus
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  defaultValue={taskEdit?.description}
                  rows={3}
                />
              </label>
              <div className="form-grid">
                <label>
                  Assignee
                  <select
                    name="assignee"
                    defaultValue={taskEdit?.assignee ?? "Demo strategist"}
                  >
                    {[
                      "Demo strategist",
                      "Demo operations",
                      "Demo designer",
                      "Demo analyst",
                      "Demo coordinator",
                    ].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Due date
                  <input
                    type="date"
                    name="due"
                    required
                    defaultValue={
                      taskEdit?.due ?? new Date().toISOString().slice(0, 10)
                    }
                  />
                </label>
                <label>
                  Priority
                  <select
                    name="priority"
                    defaultValue={taskEdit?.priority ?? "Medium"}
                  >
                    {["Low", "Medium", "High"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Project
                  <select
                    name="project"
                    defaultValue={taskEdit?.project ?? projects[0]?.name}
                  >
                    {projects.map((n) => (
                      <option key={n.id}>{n.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="btn dark" type="submit">
                Save task <Check size={17} />
              </button>
            </form>
          ) : modal === "widgets" ? (
            <>
              <p>
                Choose what matters. Drag cards on desktop, or use the arrows
                here to reorder with a keyboard or touch.
              </p>
              {widgetNames.map((n) => (
                <div className="widget-option" key={n}>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={widgets.includes(n)}
                      onChange={(e) =>
                        setWidgets((w) =>
                          e.target.checked
                            ? [...w, n]
                            : w.filter((x) => x !== n),
                        )
                      }
                    />
                    {n}
                  </label>
                  <button
                    className="icon-btn"
                    aria-label={"Move " + n + " earlier"}
                    disabled={!widgets.includes(n) || widgets.indexOf(n) === 0}
                    onClick={() =>
                      setWidgets((w) => {
                        const a = [...w],
                          i = a.indexOf(n);
                        [a[i - 1], a[i]] = [a[i], a[i - 1]];
                        return a;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={"Move " + n + " later"}
                    disabled={
                      !widgets.includes(n) ||
                      widgets.indexOf(n) === widgets.length - 1
                    }
                    onClick={() =>
                      setWidgets((w) => {
                        const a = [...w],
                          i = a.indexOf(n);
                        [a[i + 1], a[i]] = [a[i], a[i + 1]];
                        return a;
                      })
                    }
                  >
                    ↓
                  </button>
                </div>
              ))}
              <button className="btn dark small" onClick={() => setModal("")}>
                Done <Check size={16} />
              </button>
            </>
          ) : modal === "deleteTask" ? (
            <>
              <p>
                “{taskEdit?.title}” will be removed from this browser’s demo
                workspace.
              </p>
              <div className="button-row">
                <button
                  className="btn dark"
                  onClick={() => {
                    setTasks((a) => a.filter((t) => t.id !== taskEdit?.id));
                    log("Deleted task: " + taskEdit?.title);
                    setModal("");
                    setToast("Task deleted.");
                  }}
                >
                  Delete task
                </button>
                <button className="btn outline" onClick={() => setModal("")}>
                  Keep task
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                This removes all local SWKGrowth records and preferences and
                restores the initial sample data. Export anything you want to
                keep first.
              </p>
              <div className="button-row">
                <button
                  className="btn dark"
                  onClick={() => {
                    Object.keys(localStorage)
                      .filter((k) => k.startsWith("swkgrowth:"))
                      .forEach((k) => localStorage.removeItem(k));
                    location.reload();
                  }}
                >
                  Reset demo
                </button>
                <button className="btn outline" onClick={() => setModal("")}>
                  Keep my data
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
