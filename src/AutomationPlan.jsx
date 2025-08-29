import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CheckCircle2, AlertTriangle, Clock, Users, ShieldCheck, ClipboardList, Mail, Database, BarChart3, ListChecks, Settings, ChevronRight, ChevronDown, Info, CalendarCheck2, Zap, Link as LinkIcon } from "lucide-react";

function cx(...c){return c.filter(Boolean).join(" ");}

function Glass({ className, children }){
  return (
    <motion.div initial={{opacity:0, y:20, scale:0.98}} whileInView={{opacity:1, y:0, scale:1}} transition={{duration:0.6, ease:"easeOut"}} viewport={{once:true}} className={cx("rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl", className)}>
      {children}
    </motion.div>
  );
}

function Pill({ icon:Icon, children }){
  return (
    <motion.span whileHover={{scale:1.05}} className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs bg-white/80 border border-white/60">
      {Icon && <Icon size={14} />}<span>{children}</span>
    </motion.span>
  );
}

const PHASES = [
  { key: "p0", title: "Phase 0 – Baseline & guardrails", weeks: [1, 1], icon: ShieldCheck, summary: "Verify rules, map data fields, secure access, and define a single source of truth.", bullets: ["Confirm thresholds, exceptions, and EOD response policy.", "Map campaign keys across platforms and the pacing sheet.", "Set up read-only credentials and secrets storage.", "Agree on Sheet as the MVP surface while APIs become data source."] },
  { key: "p1", title: "Phase 1 – Automated data ingestion (keep the sheet)", weeks: [3, 5], icon: Database, summary: "Scheduled API jobs write prior-day spend into a staging tab for review and apply → live.", bullets: ["API connectors for Google, Meta, DV360, Broadsign.", "Row reconciliation and mismatch surfacing.", "Variance computation per campaign (±5, >5, >25).", "Audit log of loads and changes."] },
  { key: "p2", title: "Phase 2 – Alerts & daily summary", weeks: [3, 4], icon: Mail, summary: "Automated flags to Slack/Email: >5 in digest, >25 immediate, plus missing/mismatch cases.", bullets: ["Rules engine for severity and deduping.", "Daily digest to named roles; deep links to sheet and campaigns.", "Track and mark issue/solution/no issue inline in sheet."] },
  { key: "p3", title: "Phase 3 – Month rollover & mid-month changes", weeks: [4, 6], icon: CalendarCheck2, summary: "First-working-day tab creation, multi-month rollovers, and structured budget updates.", bullets: ["Auto create new month tab and roll yellow campaigns.", "Backfill totals for the prior month.", "Intake flow for budget updates."] },
  { key: "p4", title: "Phase 4 – Unified dashboard & role views", weeks: [5, 7], icon: BarChart3, summary: "Read-only dashboard with filters, drill-downs, and role-based summaries.", bullets: ["Client and platform filters; variance slicing.", "Drill-down to campaign; export and audit trails.", "Sheet remains as fallback until adoption is stable."] },
];

const TEAM = [
  { role: "Ops", icon: ListChecks, duties: ["Sheet integrity and annotations.", "Month rollovers and multi-month highlights.", "Approve staging → live updates."] },
  { role: "Supervisor", icon: ShieldCheck, duties: ["Policy and escalation rules.", "Sign off daily digest content and channels."] },
  { role: "Data / Platforms", icon: Settings, duties: ["Budget sources and investigations.", "Resolve mismatches and confirm changes by EOD."] },
  { role: "Account Leads", icon: Users, duties: ["Confirm IDs and naming conventions.", "Sanity-check alerts and threshold edge cases."] },
  { role: "Engineering / IT", icon: Zap, duties: ["Credentials, runners, monitoring.", "Storage and secrets management."] },
  { role: "Management / Finance", icon: ClipboardList, duties: ["Tolerances and risk acceptance.", "Prioritise phases and go-live checks."] },
];

export default function AutomationPlan(){
  const totals = useMemo(()=>{ const min = PHASES.reduce((a,p)=> a + p.weeks[0], 0); const max = PHASES.reduce((a,p)=> a + p.weeks[1], 0); return { min, max, mvpMin: 1 + 3, mvpMax: 1 + 4 }; }, []);
  return (
    <div className="text-zinc-900">
      <header className="px-0 pt-2 pb-2">
        <div className="flex items-start justify-between gap-6">
          <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:.5}} className="text-zinc-900">
            <div className="inline-flex items-center gap-2 text-sm text-zinc-600"><Rocket size={16} /> <span>TFM.ai</span><span className="opacity-70">Automation Plan</span></div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">How we fix it — steps, team, and timeline</h2>
            <p className="mt-2 text-zinc-700 max-w-2xl">Start inside your current sheet, add alerts, then move to a unified dashboard. Ship value early and reduce manual effort.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill icon={CheckCircle2}>MVP in ~4–5 weeks</Pill>
              <Pill icon={Clock}>Full rollout ~16–23 weeks</Pill>
              <Pill icon={AlertTriangle}>Conservative estimate</Pill>
            </div>
          </motion.div>
        </div>
      </header>
      <main>
        <div className="grid gap-4">
          <Glass className="p-6">
            <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:.6}}>
              <div className="grid md:grid-cols-4 gap-4">
                <Stat title="Phase 0" subtitle="Baseline & guardrails" value="~1 wk" icon={ShieldCheck} />
                <Stat title="Phase 1" subtitle="Data ingestion" value="~3–5 wks" icon={Database} />
                <Stat title="Phase 2" subtitle="Alerts & digest" value="~3–4 wks" icon={Mail} />
                <Stat title="Total" subtitle="Conservative" value={`~${totals.min}–${totals.max} wks`} icon={Clock} />
              </div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.3}} className="mt-4 text-sm text-zinc-700 flex flex-wrap items-center gap-3"><CheckCircle2 size={16} className="text-emerald-600"/> MVP target: <span className="font-medium">~{totals.mvpMin}–{totals.mvpMax} weeks</span></motion.div>
            </motion.div>
          </Glass>
          <Section title="Steps" subtitle="Phased delivery designed to ship value early." icon={Settings}>
            <div className="grid md:grid-cols-2 gap-4">
              {PHASES.map((p, idx)=> (<PhaseCard key={p.key} phase={p} index={idx+1} />))}
            </div>
          </Section>
          <Section title="Team involvement" subtitle="Clear responsibilities keep changes safe and fast." icon={Users}>
            <div className="grid md:grid-cols-3 gap-4">
              {TEAM.map((t)=> (<TeamCard key={t.role} {...t} />))}
            </div>
          </Section>
          <Section title="Risks and mitigations" subtitle="Questions a critical reviewer will ask." icon={AlertTriangle}>
            <ul className="text-sm text-zinc-800 grid gap-2 list-disc list-inside">
              <li><span className="font-medium">API quotas and friction</span> — mitigate with caching and incremental fetches.</li>
              <li><span className="font-medium">ID mismatches</span> — deterministic keys and reconciliation view.</li>
              <li><span className="font-medium">Alert noise</span> — dedupe and severity routing.</li>
              <li><span className="font-medium">Change fatigue</span> — keep the sheet for MVP and retire gradually.</li>
            </ul>
          </Section>
          <Glass className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} transition={{duration:.5}}>
              <div className="text-sm text-zinc-600 flex items-center gap-2"><Info size={16}/> Next steps</div>
              <h3 className="text-xl font-semibold">Ready to start with Phase 0 and API access</h3>
              <p className="text-zinc-700">Begin with baselining and credentials setup, then deliver an MVP that auto-updates your sheet and ships a daily digest.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-700">
                <Link href="mailto:davidwent@me.com" icon={Mail}>Email</Link>
                
              </div>
            </motion.div>
            <Progress min={totals.min} max={totals.max} />
          </Glass>
        </div>
      </main>
    </div>
  );
}

function Stat({ title, subtitle, value, icon:Icon }){
  return (
    <motion.div whileHover={{scale:1.05}} className="rounded-2xl border border-white/60 bg-white/80 p-4">
      <div className="flex items-center gap-2 text-zinc-600 text-sm"><Icon size={16}/><span>{title}</span></div>
      <div className="text-xs text-zinc-500">{subtitle}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </motion.div>
  );
}

function Section({ title, subtitle, icon:Icon, children }){
  return (
    <Glass className="p-6">
      <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} transition={{duration:.5}}>
        <div className="flex items-center gap-2 text-zinc-700"><Icon size={18}/><h3 className="text-lg font-semibold">{title}</h3></div>
        <p className="text-sm text-zinc-600 mt-1">{subtitle}</p>
        <div className="mt-4">{children}</div>
      </motion.div>
    </Glass>
  );
}

function PhaseCard({ phase, index }){
  const [open, setOpen] = useState(false);
  const Icon = phase.icon;
  return (
    <motion.div layout whileHover={{scale:1.02}} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} className="rounded-2xl border border-white/60 bg-white/80 overflow-hidden">
      <div className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl border border-white/60 shadow"><Icon size={18}/></div>
          <div>
            <div className="text-sm text-zinc-600">Phase {index}</div>
            <div className="font-semibold">{phase.title.replace(/^Phase \d+\s–\s/, "")}</div>
            <div className="text-xs text-zinc-600">{phase.summary}</div>
          </div>
        </div>
        <div className="text-sm text-zinc-700 flex items-center gap-2">
          <Clock size={16}/> ~{phase.weeks[0]}–{phase.weeks[1]} wks
          {open ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} transition={{duration:.3}}>
            <div className="px-4 pb-4">
              <ul className="list-disc list-inside text-sm text-zinc-800 grid gap-1">
                {phase.bullets.map((b,i)=> <li key={i}>{b}</li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TeamCard({ role, duties, icon:Icon }){
  return (
    <motion.div whileHover={{scale:1.03}} className="rounded-2xl border border-white/60 bg-white/80 p-4">
      <div className="flex items-center gap-2 text-zinc-700"><Icon size={18}/><div className="font-semibold">{role}</div></div>
      <ul className="mt-2 text-sm text-zinc-800 grid gap-1 list-disc list-inside">
        {duties.map((d,i)=> <li key={i}>{d}</li>)}
      </ul>
    </motion.div>
  );
}

function Progress({ min, max }){
  const pct = (min / max) * 100;
  return (
    <div className="w-72">
      <div className="text-sm text-zinc-700 mb-1 flex items-center gap-2"><Clock size={16}/> Overall window</div>
      <div className="h-3 rounded-full bg-white/50 border border-white/60 overflow-hidden">
        <motion.div initial={{width:0}} animate={{width: pct + "%"}} transition={{duration:.8}} className="h-full bg-zinc-900"/>
      </div>
      <div className="mt-1 text-xs text-zinc-700">~{min}–{max} weeks</div>
    </div>
  );
}

function Link({ href, children, icon:Icon }){
  return (
    <a href={href} className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 border border-white/60 text-sm hover:bg-white/80">
      {Icon && <Icon size={16}/>}{children}
    </a>
  );
}
