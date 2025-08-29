import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Info, Upload, FileText, BarChart3, CheckCircle2, XCircle, ArrowRight, Wand2, Search, HelpCircle, ShieldCheck, User, ClipboardCopy, Mail, Lock, LayoutDashboard, Handshake, Star, Database, Award, Zap, Lightbulb, Activity } from "lucide-react";
import './App.css'
import BudgetPacingFlowchart from "./BudgetPacingFlowchart.jsx";

const ACCENTS = [
  { name: "Neutral", class: "from-zinc-900 to-zinc-700", ring: "ring-zinc-300" },
  { name: "Royal Blue", class: "from-blue-600 to-indigo-600", ring: "ring-blue-300" },
  { name: "Emerald", class: "from-emerald-600 to-teal-600", ring: "ring-emerald-300" },
  { name: "Fuchsia", class: "from-fuchsia-600 to-pink-600", ring: "ring-fuchsia-300" },
];

function cx(...classes){ return classes.filter(Boolean).join(" "); }

function GlassCard({children, className}){
  return <div className={cx("backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl rounded-3xl", className)}>{children}</div>;
}

function PrimaryButton({children, onClick, className, icon:Icon}){
  return (
    <button onClick={onClick} className={cx("px-5 py-3 rounded-2xl text-white font-medium shadow-lg hover:shadow-xl active:scale-[.99] transition focus:outline-none", className)}>
      <div className="flex items-center gap-2">{Icon && <Icon size={18}/>}<span>{children}</span></div>
    </button>
  );
}

function SubtleButton({children, onClick, className, icon:Icon, href}){
  const base = (
    <button onClick={onClick} className={cx("px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/50 text-zinc-800 font-medium transition focus:outline-none", className)}>
      <div className="flex items-center gap-2">{Icon && <Icon size={18}/>}{children}</div>
    </button>
  );
  if (href) return (
    <a href={href} className={cx("px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/50 text-zinc-800 font-medium transition inline-flex items-center gap-2", className)}>
      {Icon && <Icon size={18}/>}{children}
    </a>
  );
  return base;
}

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h=>h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(",").map(c=>c.trim());
    const obj = {}; headers.forEach((h,i)=> obj[h] = cols[i]);
    return obj;
  });
  return { headers, rows };
}

const SAMPLE_SETS = {
  "Meta Retail (Eureka)": "Campaign,Ad,Impressions,Clicks,Spend,Conversions,Revenue\nAU_Melb_Prospecting,Carousel_A,260000,2150,3800,96,28500\nAU_Melb_Retargeting,Video_B,88000,1250,2100,110,35600",
  "Uber-Style Supply": "Campaign,Ad,Impressions,Clicks,Spend,Conversions,Revenue\nQLD_Driver_Recruitment,Static_A,120000,980,1650,64,0\nQLD_Driver_Recruitment,UGC_B,98000,1120,1580,92,0",
  "Franchise Launch (CityCave)": "Campaign,Ad,Impressions,Clicks,Spend,Conversions,Revenue\nNSW_Dapto_Launch,Video_A,145000,1300,2200,140,12600\nNSW_Dapto_Launch,Static_C,82000,640,900,62,5400",
  "Leadgen (Trades)": "Campaign,Ad,Impressions,Clicks,Spend,Conversions,Revenue\nQLD_Tradie_Super,Video_A,210000,1520,2700,84,0\nQLD_Tradie_Super,Static_B,130000,840,1200,41,0",
  "Awareness + Offer": "Campaign,Ad,Impressions,Clicks,Spend,Conversions,Revenue\nNSW_Syd_Sale,UGC_A,190000,1710,2450,60,9800\nNSW_Syd_Sale,UGC_B,110000,820,1150,28,4200",
};

function toNumber(v){ const n = Number(String(v).replace(/[^0-9.-]/g, "")); return Number.isFinite(n) ? n : 0; }

function computeMetrics(rows){
  return rows.map(r=>{
    const Impressions = toNumber(r.Impressions);
    const Clicks = toNumber(r.Clicks);
    const Spend = toNumber(r.Spend);
    const Conversions = toNumber(r.Conversions);
    const Revenue = toNumber(r.Revenue);
    const CTR = Impressions ? (Clicks/Impressions)*100 : 0;
    const CPC = Clicks ? (Spend/Clicks) : 0;
    const CPA = Conversions ? (Spend/Conversions) : 0;
    const ROAS = Spend ? (Revenue/Spend) : 0;
    return { ...r, Impressions, Clicks, Spend, Conversions, Revenue, CTR, CPC, CPA, ROAS };
  });
}

function actionables(metrics){
  const out = [];
  metrics.forEach(m=>{
    if(m.CTR < 0.7){ out.push({ severity: "warn", text: `Low CTR for ${m.Ad} in ${m.Campaign}. Test first-frame hook and thumb-stop.`}); }
    if(m.ROAS < 1){ out.push({ severity: "stop", text: `ROAS < 1 on ${m.Ad}. Tighten audience, creative hook, or pause.`}); }
    if(m.CPA > 80){ out.push({ severity: "warn", text: `High CPA on ${m.Campaign}/${m.Ad}. Trial geo-dayparting or intent signals.`}); }
    if(m.ROAS > 3 && m.CTR > 1){ out.push({ severity: "go", text: `Scale winner: ${m.Ad} in ${m.Campaign}. +20% budget with guardrails.`}); }
  });
  return Array.from(new Set(out.map(o=>o.severity+o.text))).map(s=>{ const sev = s.startsWith("stop")?"stop" : s.startsWith("go")?"go":"warn"; return { severity: sev, text: s.replace(/^(stop|go)/, "") }; });
}

function buildContent({brand, theme, platform}){
  const tones = {
    Instagram: { opener: "Hook: A quick before/after to stop the scroll.", cta: "CTA: Book today and get the launch bonus.", tags: ["#local", "#australia", "#offer"] },
    TikTok: { opener: "Hook: Show transformation in 3 seconds.", cta: "CTA: Tap to claim the limited offer.", tags: ["#fyp", "#smallbusiness", "#BeforeAfter"] },
    Facebook: { opener: "Hook: Lead with the clearest benefit.", cta: "CTA: Secure your spot today.", tags: ["#community", "#localbusiness", "#specialoffer"] },
  };
  const t = tones[platform] || tones.Facebook;
  const copy = `${t.opener}\n${brand} presents: ${theme}. Built for your suburb.\n${t.cta}`;
  const script = [
    "Shot 1: Problem in 1.5 seconds",
    "Shot 2: Solution reveal",
    "Shot 3: Proof or testimonial",
    "Shot 4: Offer on screen",
    "Shot 5: Clear CTA button",
  ];
  return { copy, tags: t.tags, script };
}

function seoPlan({service, location}){
  const base = [service, `${service} ${location}`, `${service} near me`, `${location} ${service} pricing`, `${service} booking ${location}`];
  const ideas = [
    `Top 5 ${service} myths in ${location}`,
    `${service} price guide for ${location}`,
    `How to choose a ${service} provider in ${location}`,
    `FAQs: ${service} in ${location}`,
  ];
  const metaTitle = `${service} in ${location} | Book Today`;
  const metaDesc = `Local ${service} in ${location}. Transparent pricing and fast booking. Reserve your spot today.`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${service} ${location}`,
    address: { "@type": "PostalAddress", addressLocality: location },
    areaServed: location,
    url: `https://example.com/${service.toLowerCase().replace(/\s+/g,'-')}-${location.toLowerCase().replace(/\s+/g,'-')}`
  };
  return { keywords: base, ideas, metaTitle, metaDesc, schema };
}

const TOUR = [
  { key: "welcome", title: "Welcome", text: "This toolkit demonstrates fast, useful AI for media, content and SEO." },
  { key: "auditor", title: "Campaign Auditor", text: "Pick a sample dataset to auto-calc CTR/CPC/CPA/ROAS and suggested actions." },
  { key: "content", title: "Content Generator", text: "Brief → platform copy, tags, and a simple shot list in seconds." },
  { key: "seo", title: "Local SEO Planner", text: "Generate location-first keywords, meta, and JSON-LD schema." },
  { key: "ops", title: "Ops Copilot", text: "QA checklist + handoff notes to reduce errors and speed approvals." },
  { key: "cv", title: "About David", text: "See my CV, AI work, and why I’m a fit for TFM." },
];

export default function App(){
  const [launched, setLaunched] = useState(false);
  const [accentIdx, setAccentIdx] = useState(0);
  const accent = ACCENTS[accentIdx];
  const [active, setActive] = useState("auditor");
  const [guideOpen, setGuideOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const bgGrad = `bg-gradient-to-br ${accent.class}`;

  return (
    <div className="min-h-screen text-zinc-900 relative overflow-hidden">
      <motion.div
        key={accentIdx}
        className={cx("absolute inset-0 -z-10 bg-gradient-to-br", accent.class)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[.04]" style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'2\\'/></filter><rect width=\\'100%\\' height=\\'100%\\' filter=\\'url(%23n)\\'/></svg>')"}}/>
      {!launched ? (
        <Welcome onLaunch={()=>{setLaunched(true); setGuideOpen(true);}} accent={accent} setAccentIdx={setAccentIdx} />
      ) : (
        <Main accent={accent} active={active} setActive={setActive} onStartTour={()=>setGuideOpen(true)} onOpenCV={()=>setCvOpen(true)} onWhy={()=>setWhyOpen(true)} />
      )}
      <AnimatePresence>
        {guideOpen && (
          <TourModal onClose={()=>setGuideOpen(false)} onFinish={()=>{setGuideOpen(false); setCelebrate(true); setTimeout(()=>setCelebrate(false), 1600);}} />
        )}
        {whyOpen && <WhyModal onClose={()=>setWhyOpen(false)} />}
        {cvOpen && <CVModal onClose={()=>setCvOpen(false)} />}
        {celebrate && <Confetti />}
      </AnimatePresence>
    </div>
  );
}

function Welcome({ onLaunch, accent, setAccentIdx }){
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:.6}} className="w-full max-w-5xl">
        <GlassCard className="p-10 relative overflow-hidden">
          <motion.div initial={{scale:1.08, opacity:0}} animate={{scale:1, opacity:.12}} transition={{duration:1.2}} className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-white/70 blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4"><Sparkles size={16}/><span>TFM.ai Prototype</span></div>
              <h1 className="text-4xl font-semibold tracking-tight">Hi, I’m David. Here’s a working AI toolkit for TFM Digital.</h1>
              <p className="mt-4 text-zinc-700 leading-relaxed">Built to show speed, taste, and usefulness. Everything is local-first, privacy-safe, and designed to be extended into production systems.</p>
              <div className="mt-6 flex items-center gap-3">
                <PrimaryButton onClick={onLaunch} className={cx("bg-gradient-to-r", accent.class)} icon={Play}>Open dashboard</PrimaryButton>
                <SubtleButton icon={Info} onClick={()=>window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'})}>What’s inside</SubtleButton>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-zinc-700"><ShieldCheck size={16}/> <span>No external APIs. Demo-safe.</span></div>
            </div>
            <div className="shrink-0 w-52">
              <div className="rounded-3xl border border-white/50 bg-white/70 p-4 text-center">
                <div className="text-xs text-zinc-600">Accent</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ACCENTS.map((a,i)=>(
                    <motion.button
                      key={a.name}
                      type="button"
                      onClick={()=>setAccentIdx(i)}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.95 }}
                      className={cx("rounded-xl h-10 w-full border border-white/60 ring-2", a.ring)}
                      title={a.name}
                      aria-label={`Set accent ${a.name}`}
                    >
                      <div className={cx("h-full w-full rounded-xl bg-gradient-to-br", a.class)}/>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-zinc-600">Theme is configurable</div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Feature icon={BarChart3} title="Audit campaigns" text="Multi-sample CSVs, metrics, insights."/>
            <Feature icon={Wand2} title="Create content" text="Brief → copy, tags, shots."/>
            <Feature icon={Search} title="Local SEO" text="Keywords, meta, schema."/>
            <Feature icon={Zap} title="Ops Copilot" text="QA & handoff notes."/>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function Feature({icon:Icon, title, text}){
  return (
    <div className="flex items-start gap-3 bg-white/60 rounded-2xl p-4 border border-white/50">
      <div className="p-2 rounded-xl bg-white border border-white/60 shadow"><Icon size={18}/></div>
      <div><div className="font-semibold">{title}</div><div className="text-sm text-zinc-700">{text}</div></div>
    </div>
  );
}

function Main({ accent, active, setActive, onStartTour, onOpenCV, onWhy }){
  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-white">
            <div className="rounded-xl px-3 py-1 bg-white/10 border border-white/30 backdrop-blur flex items-center gap-2"><LayoutDashboard size={16}/> <span>TFM.ai</span></div>
            <div className="text-white/80 text-sm hidden md:block">Fast, useful, local-first automations</div>
          </div>
          <div className="flex items-center gap-2">
            <SubtleButton icon={HelpCircle} onClick={onStartTour}>Start tour</SubtleButton>
            <SubtleButton icon={User} onClick={onOpenCV}>About David</SubtleButton>
            <SubtleButton icon={Info} onClick={onWhy}>Why this</SubtleButton>
            <SubtleButton icon={Mail} href="mailto:davidwent@me.com">Contact</SubtleButton>
          </div>
        </div>
        <GlassCard className="p-2 overflow-hidden">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {[
              {key:"flow", label:"Budget Flow", icon:Activity},
              {key:"auditor", label:"Campaign Auditor", icon:BarChart3},
              {key:"content", label:"Content Generator", icon:Wand2},
              {key:"seo", label:"Local SEO Planner", icon:Search},
              {key:"ops", label:"Ops Copilot", icon:Handshake},
            ].map(item => (
              <button key={item.key} onClick={()=>setActive(item.key)} className={cx("flex items-center gap-2 px-4 py-2 rounded-xl border text-sm", active===item.key?"bg-white border-white/60 shadow":"bg-white/60 border-white/60 hover:bg-white/80")}>
                <item.icon size={16}/> {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 md:p-6">
            {active === "flow" && (
              <div className="-m-2">
                <BudgetPacingFlowchart showTests={false} variant="light" heightClass="h-[640px]" />
              </div>
            )}
            {active === "auditor" && <Auditor accent={accent} />}
            {active === "content" && <ContentGen accent={accent} />}
            {active === "seo" && <SEOPlanner accent={accent} />}
            {active === "ops" && <OpsCopilot accent={accent} />}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Auditor({ accent }){
  const [currentKey, setCurrentKey] = useState(Object.keys(SAMPLE_SETS)[0]);
  const [csvText, setCsvText] = useState(SAMPLE_SETS[currentKey]);
  const [metrics, setMetrics] = useState([]);
  const [insights, setInsights] = useState([]);
  const fileRef = useRef(null);
  const [gate, setGate] = useState(false);

  useEffect(()=>{
    if(csvText){
      try{
        const parsed = parseCSV(csvText);
        const m = computeMetrics(parsed.rows);
        setMetrics(m);
        setInsights(actionables(m));
      }catch(e){ console.warn(e);} 
    }
  }, [csvText]);

  useEffect(()=>{ setCsvText(SAMPLE_SETS[currentKey]); }, [currentKey]);

  const totals = useMemo(()=>metrics.reduce((a,m)=>({
    Impressions:a.Impressions+m.Impressions,
    Clicks:a.Clicks+m.Clicks,
    Spend:a.Spend+m.Spend,
    Conversions:a.Conversions+m.Conversions,
    Revenue:a.Revenue+m.Revenue
  }), {Impressions:0, Clicks:0, Spend:0, Conversions:0, Revenue:0}), [metrics]);

  function onFile(e){
    const f = e.target.files?.[0];
    if(!f) return; setGate(true); e.target.value = "";
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Campaign Auditor</h2>
          <p className="text-zinc-700">Pick one of five sample datasets or unlock uploads by hiring me.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-2xl p-2 bg-white/70 border border-white/60 flex items-center gap-2">
            <Database size={16}/>
            <select className="px-2 py-1 rounded-xl bg-white/0 focus:outline-none" value={currentKey} onChange={e=>setCurrentKey(e.target.value)}>
              {Object.keys(SAMPLE_SETS).map(k=> <option key={k}>{k}</option>)}
            </select>
          </div>
          <SubtleButton icon={Upload} onClick={()=>fileRef.current?.click()}>Upload CSV</SubtleButton>
          <input type="file" ref={fileRef} className="hidden" accept=".csv" onChange={onFile}/>
        </div>
      </div>

      {metrics.length>0 && (
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <Stat title="Impressions" value={totals.Impressions.toLocaleString()}/>
          <Stat title="Clicks" value={totals.Clicks.toLocaleString()}/>
          <Stat title="Spend" value={`$${totals.Spend.toFixed(2)}`}/>
          <Stat title="Revenue" value={`$${totals.Revenue.toFixed(2)}`}/>
        </div>
      )}

      {metrics.length>0 ? (
        <div className="mt-6 grid gap-4">
          <div className="overflow-auto rounded-2xl border border-white/60 bg-white/70">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-white">
                  {["Campaign","Ad","Impr","Clicks","Spend","Conv","CTR%","CPC","CPA","ROAS"].map(h=> <th key={h} className="px-4 py-3 font-semibold text-zinc-700">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m,i)=>(
                  <tr key={i} className="odd:bg-white/60">
                    <td className="px-4 py-2">{m.Campaign}</td>
                    <td className="px-4 py-2">{m.Ad}</td>
                    <td className="px-4 py-2">{m.Impressions.toLocaleString()}</td>
                    <td className="px-4 py-2">{m.Clicks.toLocaleString()}</td>
                    <td className="px-4 py-2">${'{'}m.Spend.toFixed(2){'}'}</td>
                    <td className="px-4 py-2">{m.Conversions}</td>
                    <td className="px-4 py-2">{m.CTR.toFixed(2)}</td>
                    <td className="px-4 py-2">${'{'}m.CPC.toFixed(2){'}'}</td>
                    <td className="px-4 py-2">${'{'}m.CPA.toFixed(2){'}'}</td>
                    <td className="px-4 py-2">{m.ROAS.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb size={18}/> Recommended actions</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {insights.map((it,i)=>(
                <div key={i} className={cx("p-3 rounded-xl border bg-white/70 flex items-start gap-3", it.severity==="stop"?"border-red-200": it.severity==="go"?"border-emerald-200":"")}>
                  {it.severity==="stop" && <XCircle className="text-red-500" size={18}/>} 
                  {it.severity==="warn" && <Info className="text-amber-500" size={18}/>} 
                  {it.severity==="go" && <CheckCircle2 className="text-emerald-600" size={18}/>} 
                  <div className="text-sm text-zinc-800">{it.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6"><EmptyState accent={accent} onClick={()=>setCsvText(SAMPLE_SETS[currentKey])}/></div>
      )}

      <HireGate open={gate} onClose={()=>setGate(false)} />
    </div>
  );
}

function EmptyState(){
  return (
    <div className="rounded-3xl border border-white/60 bg-white/60 p-10 text-center">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-white shadow border border-white/60 grid place-items-center"><Upload/></div>
      <p className="mt-4 text-zinc-700">Upload a CSV with columns: Campaign, Ad, Impressions, Clicks, Spend, Conversions, Revenue</p>
      <PrimaryButton onClick={()=>{}} className={cx("mt-4 bg-gradient-to-r", "from-zinc-900 to-zinc-700")} icon={FileText}>Use sample data</PrimaryButton>
    </div>
  );
}

function Stat({ title, value }){
  return (
    <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
      <div className="text-sm text-zinc-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ContentGen(){
  const [brand, setBrand] = useState("TFM Digital");
  const [theme, setTheme] = useState("Grand opening in Brisbane");
  const [platform, setPlatform] = useState("Instagram");
  const [out, setOut] = useState(null);
  const [gate, setGate] = useState(false);
  function run(){ const res = buildContent({ brand, theme, platform }); setOut(res); }
  return (
    <div>
      <h2 className="text-2xl font-semibold">Social Content Generator</h2>
      <p className="text-zinc-700">Turn a short brief into platform-ready copy, tags, and a shot list.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <label className="text-sm text-zinc-600">Brand</label>
          <input value={brand} onChange={e=>setBrand(e.target.value)} className="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2"/>
        </div>
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60 md:col-span-2">
          <label className="text-sm text-zinc-600">Theme</label>
          <input value={theme} onChange={e=>setTheme(e.target.value)} className="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2"/>
        </div>
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <label className="text-sm text-zinc-600">Platform</label>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2">
            {["Instagram","TikTok","Facebook"].map(p=> <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <PrimaryButton onClick={run} className={cx("bg-gradient-to-r", "from-zinc-900 to-zinc-700")} icon={Wand2}>Generate</PrimaryButton>
        <SubtleButton icon={Upload} onClick={()=>setGate(true)}>Upload brand kit</SubtleButton>
      </div>
      {out && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
            <h3 className="font-semibold mb-2">Copy</h3>
            <pre className="text-sm whitespace-pre-wrap leading-relaxed">{out.copy}</pre>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-700">
              {out.tags.map(t => <span key={t} className="px-2 py-1 rounded-lg bg-white border border-white/60">{t}</span>)}
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
            <h3 className="font-semibold mb-2">Shot list</h3>
            <ol className="list-decimal list-inside text-sm text-zinc-800 space-y-1">
              {out.script.map((s,i)=> <li key={i}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}
      <HireGate open={gate} onClose={()=>setGate(false)} />
    </div>
  );
}

function SEOPlanner(){
  const [service, setService] = useState("Electrical services");
  const [location, setLocation] = useState("Brisbane");
  const [res, setRes] = useState(null);
  function run(){ setRes(seoPlan({ service, location })); }
  return (
    <div>
      <h2 className="text-2xl font-semibold">Local SEO Planner</h2>
      <p className="text-zinc-700">Generate location keywords, meta, and JSON‑LD for franchise/location pages.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <label className="text-sm text-zinc-600">Service</label>
          <input value={service} onChange={e=>setService(e.target.value)} className="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2"/>
        </div>
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <label className="text-sm text-zinc-600">Location</label>
          <input value={location} onChange={e=>setLocation(e.target.value)} className="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2"/>
        </div>
      </div>
      <PrimaryButton onClick={run} className={cx("mt-4 bg-gradient-to-r", "from-zinc-900 to-zinc-700")} icon={Search}>Plan</PrimaryButton>
      {res && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
            <h3 className="font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2 text-sm">{res.keywords.map(k => <span key={k} className="px-2 py-1 rounded-lg bg-white border border-white/60">{k}</span>)}</div>
            <h3 className="font-semibold mt-4 mb-2">Content ideas</h3>
            <ul className="list-disc list-inside text-sm text-zinc-800 space-y-1">{res.ideas.map((i, idx)=> <li key={idx}>{i}</li>)}</ul>
          </div>
          <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
            <h3 className="font-semibold mb-2">Meta</h3>
            <div className="text-sm"><span className="font-medium">Title:</span> {res.metaTitle}</div>
            <div className="text-sm mt-1"><span className="font-medium">Description:</span> {res.metaDesc}</div>
            <h3 className="font-semibold mt-4 mb-2">Schema (JSON‑LD)</h3>
            <pre className="text-xs bg-white border border-white/60 p-2 rounded-lg overflow-auto">{JSON.stringify(res.schema, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function OpsCopilot(){
  const [qa, setQa] = useState([
    {label: "UTM params present & correct", done:false},
    {label: "Creative sizes mapped to placements", done:false},
    {label: "Budget pacing within guardrails", done:false},
    {label: "Brand safety & geo targeting", done:false},
    {label: "Naming conventions (Campaign/AdSet/Ad)", done:false},
  ]);
  const [notes, setNotes] = useState("Handoff notes…");
  const toggle = (i)=> setQa(list=> list.map((it,idx)=> idx===i?{...it, done:!it.done}:it));
  return (
    <div>
      <h2 className="text-2xl font-semibold">Ops Copilot</h2>
      <p className="text-zinc-700">A tiny helper for quality assurance and smooth handoffs.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText size={18}/> Handoff notes</h3>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full h-40 rounded-xl border border-white/60 bg-white/90 p-3 text-sm"/>
          <div className="mt-2 text-xs text-zinc-600">Export coming soon — unlock by hiring me.</div>
        </div>
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><ChecklistIcon/> QA Checklist</h3>
          <ul className="space-y-2">
            {qa.map((item, i)=>(
              <li key={i} className="flex items-center gap-3">
                <button onClick={()=>toggle(i)} className={cx("w-6 h-6 rounded-lg border flex items-center justify-center", item.done?"bg-emerald-600 border-emerald-600 text-white":"bg-white border-white/60")}>{item.done? <CheckCircle2 size={16}/> : null}</button>
                <span className={cx("text-sm", item.done?"line-through text-zinc-500":"")}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ChecklistIcon(){
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 7h16M4 12h3m9 0h4M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

function HireGate({ open, onClose }){
  if(!open) return null;
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <GlassCard className="relative max-w-lg w-full p-6">
        <div className="flex items-center gap-2 text-zinc-600 text-sm"><Lock size={16}/> Pro feature</div>
        <h3 className="text-2xl font-semibold mt-2">Unlock uploads & integrations</h3>
        <p className="text-zinc-700 mt-2">I’m thrilled you want to try real data. To keep this demo secure, uploads are disabled. I can wire this into Ad platforms, Sheets, and LLMs in a few hours once we work together.</p>
        <div className="mt-4 flex gap-2">
          <a href="mailto:davidwent@me.com" className="px-4 py-2 rounded-xl bg-zinc-900 text-white inline-flex items-center gap-2"><Mail size={16}/> Contact David</a>
          <a href="#about-david" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/60 border border-white/60 inline-flex items-center gap-2"><User size={16}/> About David</a>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function TourModal({ onClose, onFinish }){
  const [step, setStep] = useState(0);
  const s = TOUR[step];
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <GlassCard className="relative max-w-lg w-full p-6">
        <div className="flex items-center gap-2 text-zinc-600 text-sm"><Sparkles size={16}/> Guided tour</div>
        <h3 className="text-2xl font-semibold mt-2">{s.title}</h3>
        <p className="text-zinc-700 mt-2">{s.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <SubtleButton onClick={onClose}>Close</SubtleButton>
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-600">{step+1} / {TOUR.length}</div>
            {step < TOUR.length-1 ? (
              <PrimaryButton onClick={()=>setStep(step+1)} className="bg-zinc-900" icon={ArrowRight}>Next</PrimaryButton>
            ) : (
              <PrimaryButton onClick={onFinish} className="bg-zinc-900" icon={CheckCircle2}>Finish</PrimaryButton>
            )}
          </div>
        </div>
        <div className="mt-4 text-xs text-zinc-600"> Questions? <a className="underline" href="mailto:davidwent@me.com">Contact David</a> </div>
      </GlassCard>
    </motion.div>
  );
}

function Confetti(){
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 pointer-events-none z-50">
      {[...Array(80)].map((_,i)=>(
        <motion.div key={i} initial={{y:-20, x:Math.random()*window.innerWidth}} animate={{y:window.innerHeight+20}} transition={{duration:1.2+Math.random(), ease:"easeIn"}} className="absolute">
          <div className="w-2 h-2 rounded-sm" style={{backgroundColor:["#111827","#e5e7eb","#a1a1aa"][i%3], transform:`rotate(${Math.random()*360}deg)`}}/>
        </motion.div>
      ))}
      <motion.div initial={{scale:.9, opacity:0}} animate={{scale:1, opacity:1}} transition={{duration:.5}} className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 border border-white/60 shadow">
        <div className="flex items-center gap-2"><Star size={16}/> Tutorial complete — you’re good to start!</div>
      </motion.div>
    </motion.div>
  );
}

function WhyModal({ onClose }){
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <GlassCard className="relative max-w-2xl w-full p-6">
        <div className="flex items-center gap-2 text-zinc-600 text-sm"><Info size={16}/> Rationale</div>
        <h3 className="text-2xl font-semibold mt-2">Why this design & scope</h3>
        <ul className="mt-3 space-y-2 text-zinc-800 text-sm">
          <li>• Focus on daily-value workflows: campaign audit, content ops, local SEO, ops QA.</li>
          <li>• Local-first demo (no data leaves browser) to respect confidentiality.</li>
          <li>• Clear upgrade path: connect to ad APIs, LLMs/agents, Sheets/DB, auth & role-based views.</li>
          <li>• Built quickly to model TFM’s “ship fast, use it if it works” culture.</li>
        </ul>
        <div className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3"> This is an intentionally small prototype made rapidly. Minor quirks can appear. </div>
        <div className="mt-4 flex justify-end"><SubtleButton onClick={onClose}>Close</SubtleButton></div>
      </GlassCard>
    </motion.div>
  );
}

function CVModal({ onClose }){
  const CV_TEXT = `David Went — Product Manager / AI Solutions\nSydney, Australia\n\nStrengths: Rapid prototyping, workflow automation, stakeholder alignment, clear UX, data‑driven decisions.\nTech: Python, JavaScript/TypeScript, React, Tailwind, Node, LangChain basics.\nMarketing: Media buying fundamentals, SEO scaffolding, social content playbooks, reporting.\n\nHighlights\n• Built & shipped cross‑functional features with legal, marketing, sales.\n• 1.2M€ influencer campaign with 200+ creators for Back Market; exceeded reach goals.\n• Introduced support-team trainings for new product launches.\n• Designed and iterated a legal‑tech MVP (“Legal Connect”).\n\nTraining\n• Full‑Stack Developer Certificate (2023), 900+ hours of project work.\n\nAI Ownership (Legal‑tech)\n• Led AI feature exploration for user self‑service legal guidance within complex frameworks. Focus: accuracy guardrails, explainability, and feedback loops.\n\nWhy TFM\n• Fast cycles & pragmatism match my way of working.\n• Hands‑on builder who maps messy workflows into automation wins.\n• Product + marketing background bridges media, creative, and ops.`;
  const [copied, setCopied] = useState(false);
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <GlassCard className="relative max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto" id="about-david">
        <div className="flex items-center gap-2 text-zinc-600 text-sm"><User size={16}/> About David</div>
        <h3 className="text-2xl font-semibold mt-2">CV & Fit for AI Solutions Engineer</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl p-4 bg-white/70 border border-white/60">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{CV_TEXT}</pre>
            <div className="mt-3 flex gap-2">
              <SubtleButton icon={ClipboardCopy} onClick={()=>{navigator.clipboard.writeText(CV_TEXT); setCopied(true); setTimeout(()=>setCopied(false), 1200);}}>{copied?"Copied":"Copy"}</SubtleButton>
              <a className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm" href={`data:text/plain;charset=utf-8,${encodeURIComponent(CV_TEXT)}`} download="David_Went_CV_Short.txt">Download</a>
              <a className="px-4 py-2 rounded-xl bg-white/60 border border-white/60 text-sm inline-flex items-center gap-2" href="mailto:davidwent@me.com"><Mail size={16}/> Email David</a>
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-white/70 border border-white/60">
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Award size={18}/> Why a strong fit</h4>
            <ul className="text-sm text-zinc-800 space-y-2">
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-600"/> Ships usable tools quickly with clear UX.</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-600"/> Understands media & content workflows end‑to‑end.</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-600"/> Bridges product, marketing, and ops to drive adoption.</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-600"/> Comfortable with Python/JS and modern AI toolchains.</li>
            </ul>
            <div className="mt-4 text-xs text-zinc-600">Full CV on request.</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><SubtleButton onClick={onClose}>Close</SubtleButton></div>
      </GlassCard>
    </motion.div>
  );
}


