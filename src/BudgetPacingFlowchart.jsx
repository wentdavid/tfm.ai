import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Mail,
  Database,
  FileSpreadsheet,
  Activity,
  Info,
  ChevronRight,
  Filter,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  CalendarCheck2,
  ListChecks,
  FileCheck2,
  Wrench,
  Users,
} from "lucide-react";

const GRID = { col: 360, row: 160, xPad: 40, yPad: 40 };
const NODE = { w: 300, h: 96, r: 18 };

const COLORS = {
  bg: "#0B0B0D",
  panel: "#121216",
  node: "#1A1A20",
  nodeHover: "#20202A",
  stroke: "#2C2C36",
  text: "#ECECF1",
  subtext: "#B9B9C6",
  accent: "#7AA2FF",
  role: {
    Ops: "#7AA2FF",
    Campaign: "#4CC38A",
    Supervisor: "#F5A524",
    Data: "#A78BFA",
    Finance: "#EAB308",
  },
};

const LIGHT_COLORS = {
  bg: "#ffffff",
  panel: "#ffffff",
  node: "#ffffff",
  nodeHover: "#ffffff",
  stroke: "#e5e7eb",
  text: "#0f172a",
  subtext: "#475569",
  accent: "#0ea5e9",
  role: COLORS.role,
};

const ROLES = {
  Ops: { color: COLORS.role.Ops },
  Supervisor: { color: COLORS.role.Supervisor },
  Data: { color: COLORS.role.Data },
  Campaign: { color: COLORS.role.Campaign },
};

const gp = (col, row) => ({ x: GRID.xPad + col * GRID.col, y: GRID.yPad + row * GRID.row });

const NODES = [
  { id: "start", title: "Start of Day", subtitle: "Open platforms and reports", role: "Ops", icon: Activity, ...gp(0, 0), notes: ["Daily cadence for pacing checks.", "Scope: TFM Clients and City Cave."] },
  { id: "pullReports", title: "Pull Spend Reports", subtitle: "DV360, Meta, Google Ads, Broadsign, Looker Studio", role: "Data", icon: Database, ...gp(1, 0), notes: ["Filter to prior day spend.", "Ensure data freshness and matching campaign IDs."] },
  { id: "updateSheet", title: "Update Pacing Sheet", subtitle: "Paste or sync into Budget Pacing Sheet", role: "Ops", icon: FileSpreadsheet, ...gp(2, 0), notes: ["Highlight finished campaigns in green.", "Highlight multi-month campaigns in yellow."] },
  { id: "computeVariance", title: "Compute Variance vs Budget", subtitle: "Per campaign variance", role: "Data", icon: ListChecks, ...gp(3, 0), notes: ["Within ±5% = OK.", "> 5% off = Flag in daily email.", "> 25% off = Immediate flag."] },
  { id: "ok", title: "Within ±5%", subtitle: "Continue monitoring", role: "Campaign", icon: CheckCircle2, ...gp(4, -0.6), notes: ["No action needed beyond routine checks."] },
  { id: "flagDaily", title: "Over/Under > 5%", subtitle: "Add to daily email", role: "Ops", icon: Mail, ...gp(4, 0.6), notes: ["Subject: Date – TFM Clients – Over and Under.", "Attach screengrabs or % over/under by platform."] },
  { id: "flagImmediate", title: "> 25% Variance", subtitle: "Immediate escalation", role: "Supervisor", icon: AlertTriangle, ...gp(4, 1.8), notes: ["Escalate ASAP for intervention."] },
  { id: "missingAny", title: "Missing or Mismatched", subtitle: "In sheet but not in spend reports, or vice versa", role: "Data", icon: RefreshCcw, ...gp(3, 1.4), notes: ["If not in sheet but in reports → flag immediately.", "If in sheet but not in reports → flag immediately."] },
  { id: "investigateCaves", title: "Verify Caves Budget", subtitle: "Mitch checks sheet vs Caves budget", role: "Data", icon: Wrench, ...gp(5, 0.2), notes: ["If variance persists after update, verify budget source.", "Respond per cave with issue/solution/no issue."] },
  { id: "investigateIMBA", title: "Verify IMBA Budget", subtitle: "Zaine checks sheet vs IMBA", role: "Data", icon: Wrench, ...gp(5, 1.0), notes: ["If variance persists after update, verify budget source.", "Respond per campaign with issue/solution/no issue."] },
  { id: "addComments", title: "Add Comments", subtitle: "Callan updates sheet annotations", role: "Ops", icon: FileCheck2, ...gp(5, 1.8), notes: ["Document outcomes and next steps in the sheet."] },
  { id: "supervisor", title: "Supervisor Review", subtitle: "Reuben supervision", role: "Supervisor", icon: Users, ...gp(6, 1.0), notes: ["Ensure pacing issues responded to by EOD."] },
  { id: "resolve", title: "Resolve + Communicate", subtitle: "Adjust budgets / fix tracking / pause where needed", role: "Campaign", icon: CheckCircle2, ...gp(7, 1.0), notes: ["Implement fix and confirm in sheet/email.", "Resume monitoring."] },
  { id: "midMonth", title: "Mid‑Month Budget Changes", subtitle: "Mitch/Zaine → Callan or self-update", role: "Data", icon: CalendarCheck2, ...gp(2, 2.2), notes: ["Communicate changes promptly to avoid drift.", "Mitch handles City Cave, Zaine handles TFM clients."] },
  { id: "newMonth", title: "New Month Roll‑over", subtitle: "Add City Cave tab, roll multi‑month campaigns", role: "Ops", icon: CalendarCheck2, ...gp(3, 2.2), notes: ["First working day of new month.", "Update previous month spend totals.", "Send IMBAs to Callan or update directly."] },
];

const EDGES = [
  { from: "start", to: "pullReports" },
  { from: "pullReports", to: "updateSheet" },
  { from: "updateSheet", to: "computeVariance" },
  { from: "computeVariance", to: "ok", label: "±5%" },
  { from: "computeVariance", to: "flagDaily", label: ">5%" },
  { from: "computeVariance", to: "flagImmediate", label: ">25%" },
  { from: "computeVariance", to: "missingAny", label: "Missing/Mismatch" },
  { from: "flagDaily", to: "investigateCaves" },
  { from: "flagDaily", to: "investigateIMBA" },
  { from: "flagImmediate", to: "investigateCaves" },
  { from: "flagImmediate", to: "investigateIMBA" },
  { from: "missingAny", to: "investigateCaves" },
  { from: "missingAny", to: "investigateIMBA" },
  { from: "investigateCaves", to: "addComments" },
  { from: "investigateIMBA", to: "addComments" },
  { from: "addComments", to: "supervisor" },
  { from: "supervisor", to: "resolve" },
  { from: "midMonth", to: "updateSheet" },
  { from: "newMonth", to: "updateSheet" },
];

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));

const FOCUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "minor", label: "Minor (>5%)" },
  { value: "major", label: "Major (>25%)" },
  { value: "mismatch", label: "Missing/Mismatch" },
];

function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = Math.exp(delta * 0.001);
    const next = Math.min(2.25, Math.max(0.5, scale * factor));
    if (next !== scale) setScale(next);
  };
  const onMouseDown = (e) => {
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setTx((v) => v + dx);
    setTy((v) => v + dy);
  };
  const onMouseUp = () => {
    draggingRef.current = false;
  };
  return { scale, tx, ty, setScale, setTx, setTy, onWheel, onMouseDown, onMouseMove, onMouseUp };
}

function RoleBadge({ role, palette }) {
  const color = ROLES[role]?.color || palette.accent;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: `${color}1A`, color }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {role}
    </span>
  );
}

function NodeCard({ node, active, dimmed, inPath, onClick, palette }) {
  const Icon = node.icon || Info;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <motion.rect
        x={node.x}
        y={node.y}
        rx={NODE.r}
        width={NODE.w}
        height={NODE.h}
        fill={active ? palette.nodeHover : palette.node}
        stroke={active || inPath ? palette.accent : palette.stroke}
        strokeWidth={active || inPath ? 2 : 1}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: dimmed ? 0.25 : inPath ? 1 : 0.9, y: 0 }}
        transition={{ duration: 0.25 }}
      />
      <g transform={`translate(${node.x + 16}, ${node.y + 18})`}>
        <Icon width={20} height={20} color={palette.subtext} />
      </g>
      <text x={node.x + 48} y={node.y + 30} fill={palette.text} fontSize={14} fontWeight={600}>
        {node.title}
      </text>
      <text x={node.x + 48} y={node.y + 54} fill={palette.subtext} fontSize={12}>
        {node.subtitle}
      </text>
      <foreignObject x={node.x + 48} y={node.y + 64} width={NODE.w - 60} height={28}>
        <div style={{ display: "flex", gap: 8 }}>
          <RoleBadge role={node.role} palette={palette} />
        </div>
      </foreignObject>
    </g>
  );
}

function Arrow({ from, to, label, highlighted, palette }) {
  const A = NODE_MAP[from];
  const B = NODE_MAP[to];
  if (!A || !B) return null;
  const start = { x: A.x + NODE.w, y: A.y + NODE.h / 2 };
  const end = { x: B.x, y: B.y + NODE.h / 2 };
  const midX = (start.x + end.x) / 2;
  const d = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  return (
    <g>
      <path d={d} fill="none" stroke={highlighted ? palette.accent : palette.stroke} strokeWidth={highlighted ? 2 : 1} markerEnd="url(#arrow)" opacity={highlighted ? 1 : 0.5} />
      {label ? (
        <text x={midX + 4} y={Math.min(start.y, end.y) + Math.abs(start.y - end.y) / 2 - 6} fill={highlighted ? palette.accent : palette.subtext} fontSize={12}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function runSelfTests() {
  const tests = [];
  tests.push({ name: "Edge label >5% present", pass: EDGES.some((e) => e.label === ">5%") });
  tests.push({ name: "Edge label >25% present", pass: EDGES.some((e) => e.label === ">25%") });
  const mustHaveNodes = ["computeVariance", "flagDaily", "flagImmediate", "missingAny", "investigateCaves", "investigateIMBA", "addComments", "supervisor", "resolve"];
  tests.push({ name: "All critical nodes exist", pass: mustHaveNodes.every((id) => NODE_MAP[id]) });
  const focusValues = new Set(FOCUS_OPTIONS.map((o) => o.value));
  tests.push({ name: "Focus options contain all values", pass: ["all", "minor", "major", "mismatch"].every((v) => focusValues.has(v)) });
  const withinGrid = NODES.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y));
  tests.push({ name: "Node positions computed", pass: withinGrid });
  const validEdges = EDGES.every((e) => NODE_MAP[e.from] && NODE_MAP[e.to]);
  tests.push({ name: "Edges reference valid nodes", pass: validEdges });
  return tests;
}

export default function BudgetPacingFlowchart({ showTests = false, variant = "dark", heightClass }) {
  const palette = variant === "light" ? LIGHT_COLORS : COLORS;
  const [activeNode, setActiveNode] = useState(NODES[0].id);
  const [roleFilter, setRoleFilter] = useState("All");
  const [focusPath, setFocusPath] = useState("all");
  const { scale, tx, ty, setScale, setTx, setTy, onWheel, onMouseDown, onMouseMove, onMouseUp } = usePanZoom();
  const roleDim = (n) => roleFilter !== "All" && n.role !== roleFilter;
  const outMap = useMemo(() => {
    const m = {};
    EDGES.forEach((e) => {
      if (!m[e.from]) m[e.from] = [];
      m[e.from].push(e);
    });
    return m;
  }, []);
  const pathSets = useMemo(() => {
    const nodeSet = new Set();
    const edgeSet = new Set();
    const q = [activeNode];
    while (q.length) {
      const id = q.shift();
      if (nodeSet.has(id)) continue;
      nodeSet.add(id);
      const outs = outMap[id] || [];
      outs.forEach((e) => {
        edgeSet.add(`${e.from}->${e.to}`);
        q.push(e.to);
      });
    }
    return { nodeSet, edgeSet };
  }, [activeNode, outMap]);
  const filtered = useMemo(() => NODES.map((n) => ({ ...n, dim: roleDim(n) })), [roleFilter]);
  const edgeMatchesFocus = (e) => {
    if (focusPath === "all") return true;
    if (focusPath === "minor" && e.to === "flagDaily") return true;
    if (focusPath === "major" && e.to === "flagImmediate") return true;
    if (focusPath === "mismatch" && e.to === "missingAny") return true;
    return false;
  };
  const edgesToRender = useMemo(() => EDGES.filter((e) => edgeMatchesFocus(e)), [focusPath]);
  useEffect(() => {
    setTx(-120);
    setTy(0);
  }, [setTx, setTy]);
  const tests = useMemo(runSelfTests, []);
  const ActiveIcon = NODE_MAP[activeNode].icon || Info;
  const containerHeight = heightClass || "h-[720px]";
  const containerClasses = variant === "light"
    ? `w-full ${containerHeight} bg-white/70 text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-white/60`
    : `w-full ${containerHeight} bg-[#0B0B0D] text-white rounded-2xl shadow-xl overflow-hidden border border-[#2C2C36]`;
  const headerClasses = variant === "light" ? "border-b border-white/60 bg-white/70" : "border-b border-[#2C2C36] bg-[#0F0F14]";
  const controlBg = variant === "light" ? "bg-white border border-white/60" : "bg-[#121216] border border-[#2C2C36]";
  return (
    <div className={containerClasses}>
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 ${headerClasses}`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: palette.accent }} />
          <div className="text-sm opacity-90">TFM.ai · Budget Pacing Flow</div>
          <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: palette.subtext }}>
            <Info size={14} />
            <span>Click any node to see details. Drag to pan. Scroll to zoom.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-2 rounded-xl px-2 py-1 ${controlBg}`}>
            <Filter size={16} className="opacity-70" />
            <select className="bg-transparent text-sm outline-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>All</option>
              {Object.keys(ROLES).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className={`hidden sm:flex items-center gap-2 rounded-xl px-2 py-1 ${controlBg}`}>
            <ChevronRight size={16} className="opacity-70" />
            <select className="bg-transparent text-sm outline-none" value={focusPath} onChange={(e) => setFocusPath(e.target.value)}>
              {FOCUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl ${controlBg}`} onClick={() => setScale((s) => Math.min(2.25, s * 1.05))} aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl ${controlBg}`} onClick={() => setScale((s) => Math.max(0.5, s / 1.05))} aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 h-[calc(100%-48px)]">
        <div className="col-span-8 md:col-span-9 relative">
          <svg className="absolute inset-0 w-full h-full" onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={variant === "light" ? "#f1f5f9" : "#1E1E24"} strokeWidth="0.5" />
              </pattern>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.stroke} />
              </marker>
            </defs>
            <rect x={0} y={0} width="200%" height="200%" fill="url(#grid)" />
            <motion.g animate={{ x: tx, y: ty, scale }} transition={{ type: "spring", stiffness: 120, damping: 22 }}>
              {edgesToRender.map((e, i) => (
                <Arrow key={i} from={e.from} to={e.to} label={e.label} highlighted={pathSets.edgeSet.has(`${e.from}->${e.to}`)} palette={palette} />
              ))}
              {filtered.map((n) => (
                <NodeCard key={n.id} node={n} active={activeNode === n.id} dimmed={n.dim} inPath={pathSets.nodeSet.has(n.id)} onClick={() => setActiveNode(n.id)} palette={palette} />
              ))}
            </motion.g>
          </svg>
        </div>
        <div className={`col-span-4 md:col-span-3 p-4 flex flex-col gap-3 ${variant === "light" ? "border-l border-white/60 bg-white/70" : "border-l border-[#2C2C36] bg-[#0F0F14]"}`}>
          <div className="text-sm font-semibold opacity-90">Details</div>
          <div className={variant === "light" ? "bg-white/70 border border-white/60 rounded-xl p-3" : "bg-[#121216] border border-[#2C2C36] rounded-xl p-3"}>
            <div className="flex items-center gap-2 mb-1">
              <ActiveIcon size={16} color={palette.subtext} />
              <div className="text-sm font-semibold">{NODE_MAP[activeNode].title}</div>
            </div>
            <div className="text-xs mb-2" style={{ color: palette.subtext }}>{NODE_MAP[activeNode].subtitle}</div>
            <div className="mb-2"><RoleBadge role={NODE_MAP[activeNode].role} palette={palette} /></div>
            <ul className="list-disc pl-5 space-y-1 text-xs" style={{ color: variant === "light" ? "#111827" : "#D6D6DF" }}>
              {NODE_MAP[activeNode].notes?.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
          <div className={variant === "light" ? "bg-white/70 border border-white/60 rounded-xl p-3" : "bg-[#121216] border border-[#2C2C36] rounded-xl p-3"}>
            <div className="text-xs font-semibold mb-1">Legend</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ROLES).map(([role, { color }]) => (
                <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: `${color}1A`, color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {role}
                </span>
              ))}
            </div>
            <div className="mt-3 text-[11px] space-y-1" style={{ color: palette.subtext }}>
              <div>±5% → OK</div>
              <div>&gt; 5% → Daily email</div>
              <div>&gt; 25% → Immediate escalation</div>
              <div>Missing/Mismatch → Investigate sources</div>
              <div>Respond to flagged issues by EOD</div>
            </div>
          </div>
          {showTests ? (
            <div className={variant === "light" ? "bg-white/70 border border-white/60 rounded-xl p-3 text-xs" : "bg-[#121216] border border-[#2C2C36] rounded-xl p-3 text-xs text-[#B9B9C6]"}>
              <div className="font-semibold mb-2">Self‑Tests</div>
              <ul className="space-y-1">
                {tests.map((t, i) => (
                  <li key={i} className={t.pass ? (variant === "light" ? "text-emerald-600" : "text-[#92F5B4]") : (variant === "light" ? "text-amber-600" : "text-[#EAB308]") }>
                    {t.pass ? "✔" : "✖"} {t.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


