import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const servers = new Map();
const DEFAULT_REPORT = "build/model-drift/model-drift-index.json";

function jsonResponse(res, status, value) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
    });
    res.end(JSON.stringify(value));
}

function htmlResponse(res) {
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:",
        "X-Content-Type-Options": "nosniff",
    });
    res.end(renderHtml());
}

function resolveReportPath(workingDirectory, inputPath) {
    const root = resolve(workingDirectory || process.cwd());
    const candidate = resolve(root, inputPath || DEFAULT_REPORT);
    const outside = relative(root, candidate);
    if (outside.startsWith("..") || isAbsolute(outside)) {
        throw new Error("Report path must remain inside the active workspace.");
    }
    return { root, candidate };
}

async function readJson(path) {
    const info = await stat(path);
    if (!info.isFile() || info.size > 64 * 1024 * 1024) {
        throw new Error("Report must be a JSON file no larger than 64 MiB.");
    }
    return JSON.parse(await readFile(path, "utf8"));
}

function normalizeChange(change) {
    return {
        id: String(change.changeId || change.elementId || "change"),
        kind: String(change.kind || "modified"),
        category: String(change.category || change.elementType || "model"),
        elementType: String(change.elementType || "element"),
        path: String(change.modelPath || change.elementId || "model"),
        property: change.property == null ? null : String(change.property),
        classification: String(change.functionalClassification || "unknown"),
        before: change.before ?? null,
        after: change.after ?? null,
        evidence: change.evidence ?? null,
    };
}

function driftModel(id, label, drift, record = {}) {
    const topology = drift?.topology || drift || {};
    return {
        id,
        label,
        changeType: String(record.changeType || "pair"),
        basePath: record.basePath || drift?.comparison?.baseArtifact || null,
        headPath: record.headPath || drift?.comparison?.targetArtifact || null,
        analysisStatus: String(record.analysisStatus || drift?.comparison?.status || "unknown"),
        policyStatus: String(record.policyStatus || "unknown"),
        summary: record.summary || drift?.summary || {},
        findingCounts: record.findingCounts || {},
        changes: Array.isArray(drift?.changes) ? drift.changes.map(normalizeChange) : [],
        topology: {
            blocks: Array.isArray(topology.blocks)
                ? topology.blocks.map((block) => ({
                      id: String(block.id || block.path || "block"),
                      name: String(block.name || block.path || "block"),
                      type: String(block.blockType || "Block"),
                      path: String(block.path || block.name || "block"),
                  }))
                : [],
            connections: Array.isArray(topology.connections) ? topology.connections : [],
        },
    };
}

async function loadReport(workingDirectory, reportPath) {
    const { candidate } = resolveReportPath(workingDirectory, reportPath);
    const document = await readJson(candidate);
    if (Array.isArray(document.models)) {
        const models = [];
        for (const record of document.models) {
            let drift = { changes: [], comparison: {}, summary: record.summary || {} };
            const artifact = record?.artifacts?.json;
            if (typeof artifact === "string") {
                const child = resolve(dirname(candidate), artifact);
                const rootRelative = relative(dirname(candidate), child);
                if (!rootRelative.startsWith("..") && !isAbsolute(rootRelative)) {
                    drift = await readJson(child);
                }
            }
            const label = record.headPath || record.basePath || record.id || "model";
            models.push(driftModel(String(record.id || label), String(label), drift, record));
        }
        return {
            source: candidate,
            kind: "aggregate",
            status: String(document.status || "unknown"),
            baseRef: document.baseRef || document.baseCommit || null,
            headRef: document.headRef || document.headCommit || null,
            summary: document.summary || {},
            models,
        };
    }

    if (
        document.model &&
        Array.isArray(document.blocks) &&
        Array.isArray(document.connections)
    ) {
        const label = String(document.model.name || candidate.split(/[\\/]/).pop());
        return {
            source: candidate,
            kind: "canonical",
            status: String(document.analysis?.status || "unknown"),
            baseRef: null,
            headRef: document.source?.artifact || null,
            summary: {
                added: 0,
                removed: 0,
                modified: 0,
                moved: 0,
                interfaceChanges: 0,
            },
            models: [driftModel("canonical", label, document, {
                changeType: "snapshot",
                analysisStatus: document.analysis?.status,
                policyStatus: "not evaluated",
            })],
        };
    }

    const drift = document.drift && typeof document.drift === "object" ? document.drift : document;
    if (!Array.isArray(drift.changes) || typeof drift.comparison !== "object") {
        throw new Error(
            "Expected model-drift-index.json or a model-drift JSON report with comparison and changes.",
        );
    }
    const label =
        drift.comparison.targetArtifact || drift.comparison.baseArtifact || candidate.split(/[\\/]/).pop();
    return {
        source: candidate,
        kind: "single",
        status: String(drift.comparison.status || "unknown"),
        baseRef: drift.comparison.baseArtifact || null,
        headRef: drift.comparison.targetArtifact || null,
        summary: drift.summary || {},
        models: [driftModel("model", String(label), drift, document)],
    };
}

async function updateReport(entry, reportPath, modelId) {
    entry.reportPath = reportPath || entry.reportPath || DEFAULT_REPORT;
    try {
        entry.report = await loadReport(entry.workingDirectory, entry.reportPath);
        entry.error = null;
        const requested = modelId || entry.selectedModelId;
        entry.selectedModelId = entry.report.models.some((model) => model.id === requested)
            ? requested
            : entry.report.models[0]?.id || null;
    } catch (error) {
        entry.report = null;
        entry.error = error instanceof Error ? error.message : String(error);
        entry.selectedModelId = null;
    }
}

function publicState(entry) {
    return {
        reportPath: entry.reportPath,
        selectedModelId: entry.selectedModelId,
        report: entry.report,
        error: entry.error,
        updatedAt: entry.updatedAt,
    };
}

async function startServer(instanceId, entry) {
    const server = createServer((req, res) => {
        const url = new URL(req.url || "/", "http://127.0.0.1");
        if (req.method === "GET" && url.pathname === "/") {
            htmlResponse(res);
            return;
        }
        if (req.method === "GET" && url.pathname === "/api/state") {
            jsonResponse(res, 200, publicState(entry));
            return;
        }
        jsonResponse(res, 404, { error: "Not found" });
    });
    await new Promise((resolveListen, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolveListen);
    });
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/`, instanceId };
}

function findEntry(instanceId) {
    const entry = servers.get(instanceId);
    if (!entry) {
        throw new Error(`Canvas instance ${instanceId} is not open.`);
    }
    return entry;
}

function renderHtml() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Simulink Model Drift</title>
<style>
:root{color-scheme:dark;--bg:#080b12;--panel:#111827;--panel2:#0d1422;--line:#26334a;--text:#eef4ff;--muted:#93a4bd;--blue:#57a6ff;--green:#42d392;--red:#ff6b7a;--amber:#f2bd5d;--violet:#b98cff;--cyan:#63e6e2}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 75% -10%,#172b4c 0,#080b12 38rem);color:var(--text);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
header{display:flex;align-items:center;gap:14px;padding:15px 22px;border-bottom:1px solid var(--line);background:rgba(8,11,18,.84);backdrop-filter:blur(16px);position:sticky;top:0;z-index:4}
h1{font-size:17px;letter-spacing:.01em;margin:0}.mark{width:28px;height:28px;border:1px solid #38577d;border-radius:9px;background:linear-gradient(135deg,#1c416a,#17203a);display:grid;place-items:center;color:var(--cyan);font-weight:800}.sub{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status{margin-left:auto;border:1px solid #38577d;background:#102138;border-radius:999px;padding:4px 10px;text-transform:capitalize;color:#b8d8ff}
main{display:grid;grid-template-columns:285px minmax(0,1fr);min-height:calc(100vh - 59px)}aside{border-right:1px solid var(--line);padding:18px 14px;overflow:auto;background:rgba(8,11,18,.35)}
.eyebrow{color:var(--cyan);font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;margin-bottom:6px}.model{display:block;width:100%;text-align:left;color:var(--text);background:transparent;border:1px solid transparent;border-radius:10px;padding:11px 12px;margin:9px 0;cursor:pointer;transition:.16s}
.model:hover,.model.active{background:linear-gradient(100deg,#172943,#121b2b);border-color:#355074;box-shadow:0 7px 24px rgba(0,0,0,.18)}.model small{display:block;color:var(--muted);margin-top:5px}.model.active small{color:#a9d0ff}
.content{padding:28px 30px;overflow:auto;max-width:1320px;width:100%;margin:auto}.hero{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.hero h2{font-size:27px;letter-spacing:-.025em;margin:0}.hero .meta{max-width:650px}.cards{display:grid;grid-template-columns:repeat(5,minmax(105px,1fr));gap:10px;margin:22px 0}.card{background:linear-gradient(145deg,rgba(24,36,57,.92),rgba(13,20,34,.92));border:1px solid var(--line);border-radius:12px;padding:14px;box-shadow:0 10px 28px rgba(0,0,0,.14)}.card b{display:block;font-size:25px;letter-spacing:-.04em}.card span{color:var(--muted);font-size:12px}
.pill{border:1px solid #385074;border-radius:999px;padding:4px 9px;color:#bcd7f5;background:#101d30;font-size:12px}.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.meta{color:var(--muted);margin-top:6px}.route{display:flex;gap:10px;align-items:center;color:#b5c8e4;font:12px ui-monospace,SFMono-Regular,Consolas,monospace}.route .arrow{color:var(--cyan);font-size:18px}
.map{background:linear-gradient(145deg,rgba(16,28,47,.9),rgba(11,17,29,.96));border:1px solid var(--line);border-radius:15px;padding:18px;margin:8px 0 22px;box-shadow:0 16px 42px rgba(0,0,0,.2)}.map-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.map-head strong{font-size:13px}.map-head span{color:var(--muted);font-size:12px}.topology{display:flex;align-items:center;gap:8px;overflow:auto;padding:12px 4px 16px}.node{min-width:145px;padding:11px 12px;border:1px solid #365477;border-radius:11px;background:#13233a;position:relative}.node.changed{border-color:var(--amber);box-shadow:0 0 0 1px rgba(242,189,93,.2),0 0 22px rgba(242,189,93,.13)}.node-name{font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.node-type{color:var(--muted);font-size:11px;margin-top:4px}.node-mark{color:var(--amber);font-size:11px;margin-top:6px}.connector{height:1px;min-width:27px;background:linear-gradient(90deg,#365477,var(--cyan));position:relative}.connector:after{content:"›";color:var(--cyan);position:absolute;right:-2px;top:-10px;font-size:18px}
.changes{display:grid;gap:12px}.change{background:linear-gradient(145deg,rgba(19,29,46,.96),rgba(13,19,32,.96));border:1px solid var(--line);border-left:4px solid var(--blue);border-radius:12px;padding:15px;box-shadow:0 8px 26px rgba(0,0,0,.14)}.change.added{border-left-color:var(--green)}.change.removed{border-left-color:var(--red)}.change.moved{border-left-color:var(--violet)}.change.modified{border-left-color:var(--amber)}.change.unresolved{border-left-color:var(--violet)}
.change-head{display:flex;align-items:center;gap:9px}.change-head code{font-weight:750;color:var(--text);overflow-wrap:anywhere}.kind{text-transform:uppercase;font-size:10px;letter-spacing:.1em;font-weight:800}.values{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.value{background:#090e18;border:1px solid #263952;border-radius:9px;padding:10px;overflow:auto}.value label{display:block;color:var(--muted);font-size:10px;letter-spacing:.1em;text-transform:uppercase}.value pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;color:#cfe2ff}
.empty,.error{padding:28px;border:1px dashed #3a4f6d;border-radius:12px;color:var(--muted);background:rgba(15,24,39,.62)}.error{color:#ff9aa5;border-color:var(--red)}
@media(max-width:850px){main{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--line)}.content{padding:22px 16px}.cards{grid-template-columns:repeat(2,1fr)}.hero{display:block}.values{grid-template-columns:1fr}}
</style>
</head>
<body>
<header><div class="mark">Δ</div><h1>Simulink Model Diff</h1><div class="sub" id="source">Loading report…</div><div class="status" id="status">loading</div></header>
<main><aside><strong>Changed models</strong><div id="models"></div></aside><section class="content" id="content"><div class="empty">Loading visual diff…</div></section></main>
<script>
let state=null, selected=null;
const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pretty=(v)=>v==null?"—":typeof v==="string"?v:JSON.stringify(v,null,2);
function count(summary,key){return Number(summary?.[key]||0)}
function choose(id){selected=id;render()}
function render(){
 const source=document.getElementById("source"), status=document.getElementById("status"), models=document.getElementById("models"), content=document.getElementById("content");
 if(!state){return}
 source.textContent=state.report?.source||state.reportPath||"No report";
 status.textContent=state.error?"error":state.report?.status||"unknown";
 if(state.error){models.innerHTML="";content.innerHTML='<div class="error"><strong>Report unavailable</strong><br>'+esc(state.error)+'</div>';return}
 const list=state.report?.models||[]; if(!selected||!list.some(m=>m.id===selected))selected=state.selectedModelId||list[0]?.id;
 models.innerHTML=list.map(m=>'<button class="model '+(m.id===selected?"active":"")+'" data-id="'+esc(m.id)+'">'+esc(m.label)+'<small>'+esc(m.changeType)+' · '+esc(m.analysisStatus)+'</small></button>').join("");
 models.querySelectorAll("button").forEach(b=>b.onclick=()=>choose(b.dataset.id));
 const m=list.find(x=>x.id===selected); if(!m){content.innerHTML='<div class="empty">No changed models were found.</div>';return}
 const s=m.summary||{}, changes=m.changes||[], topology=m.topology||{};
 const changedPaths=new Set(changes.map(c=>c.path));
 const nodes=(topology.blocks||[]).slice(0,14);
 const nodeMarkup=nodes.length?nodes.map((n,i)=>(i?'<span class="connector"></span>':'')+'<div class="node '+(changedPaths.has(n.path)?"changed":"")+'"><div class="node-name">'+esc(n.name)+'</div><div class="node-type">'+esc(n.type)+'</div>'+(changedPaths.has(n.path)?'<div class="node-mark">● changed</div>':'')+'</div>').join(""):'<div class="empty" style="width:100%">Topology is available when a canonical manifest is loaded. Changed elements are still visualized below.</div>';
 content.innerHTML='<div class="hero"><div><div class="eyebrow">Review surface</div><h2>'+esc(m.label)+'</h2><div class="route"><span>'+esc(m.basePath||"snapshot")+'</span><span class="arrow">→</span><span>'+esc(m.headPath||"snapshot")+'</span></div></div><div class="toolbar"><span class="pill">analysis: '+esc(m.analysisStatus)+'</span><span class="pill">policy: '+esc(m.policyStatus)+'</span></div></div>'+
 '<div class="cards">'+[["Added",count(s,"added")],["Removed",count(s,"removed")],["Modified",count(s,"modified")],["Moved",count(s,"moved")],["Interfaces",count(s,"interfaceChanges")]].map(x=>'<div class="card"><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join("")+'</div>'+
 '<section class="map"><div class="map-head"><strong>Model topology</strong><span>'+nodes.length+' structural elements'+(topology.connections?.length?' · '+topology.connections.length+' connections':'')+'</span></div><div class="topology">'+nodeMarkup+'</div></section>'+
 (changes.length?'<div class="changes">'+changes.map(c=>'<article class="change '+esc(c.kind)+'"><div class="change-head"><span class="kind">'+esc(c.kind)+'</span><code>'+esc(c.path)+'</code></div><div class="meta">'+esc(c.category)+' · '+esc(c.elementType)+(c.property?' · '+esc(c.property):'')+' · '+esc(c.classification)+'</div><div class="values"><div class="value"><label>Before</label><pre>'+esc(pretty(c.before))+'</pre></div><div class="value"><label>After</label><pre>'+esc(pretty(c.after))+'</pre></div></div></article>').join("")+'</div>':'<div class="empty">No semantic changes were reported for this model.</div>');
}
async function refresh(){try{const r=await fetch("/api/state",{cache:"no-store"});state=await r.json();render()}catch(e){state={error:e.message};render()}}
refresh();setInterval(refresh,1500);
</script>
</body>
</html>`;
}

await joinSession({
    canvases: [
        createCanvas({
            id: "simulink-model-diff",
            displayName: "Simulink Model Diff",
            description:
                "Open an interactive visual canvas for model-drift-index.json or a per-model drift report.",
            inputSchema: {
                type: "object",
                properties: {
                    reportPath: {
                        type: "string",
                        description:
                            "Workspace-relative path to model-drift-index.json or model-drift.json.",
                        default: DEFAULT_REPORT,
                    },
                    modelId: {
                        type: "string",
                        description: "Optional model record id to select initially.",
                    },
                },
            },
            actions: [
                {
                    name: "load_report",
                    description: "Load a different model drift report into this canvas.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            reportPath: { type: "string" },
                            modelId: { type: "string" },
                        },
                        required: ["reportPath"],
                    },
                    handler: async (ctx) => {
                        const entry = findEntry(ctx.instanceId);
                        await updateReport(entry, ctx.input?.reportPath, ctx.input?.modelId);
                        entry.updatedAt = new Date().toISOString();
                        return publicState(entry);
                    },
                },
                {
                    name: "select_model",
                    description: "Select a changed model by id in an open visual diff canvas.",
                    inputSchema: {
                        type: "object",
                        properties: { modelId: { type: "string" } },
                        required: ["modelId"],
                    },
                    handler: (ctx) => {
                        const entry = findEntry(ctx.instanceId);
                        const modelId = String(ctx.input?.modelId || "");
                        if (!entry.report?.models.some((model) => model.id === modelId)) {
                            throw new Error(`Unknown model id: ${modelId}`);
                        }
                        entry.selectedModelId = modelId;
                        entry.updatedAt = new Date().toISOString();
                        return publicState(entry);
                    },
                },
                {
                    name: "refresh",
                    description: "Reload the current drift artifacts from disk.",
                    handler: async (ctx) => {
                        const entry = findEntry(ctx.instanceId);
                        await updateReport(entry, entry.reportPath, entry.selectedModelId);
                        entry.updatedAt = new Date().toISOString();
                        return publicState(entry);
                    },
                },
            ],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = {
                        workingDirectory: ctx.session?.workingDirectory || process.cwd(),
                        reportPath: ctx.input?.reportPath || DEFAULT_REPORT,
                        selectedModelId: ctx.input?.modelId || null,
                        report: null,
                        error: null,
                        updatedAt: new Date().toISOString(),
                    };
                    await updateReport(entry, entry.reportPath, entry.selectedModelId);
                    const server = await startServer(ctx.instanceId, entry);
                    Object.assign(entry, server);
                    servers.set(ctx.instanceId, entry);
                }
                return {
                    title: "Simulink Model Diff",
                    status: entry.error ? entry.error : `${entry.report?.models.length || 0} model(s)`,
                    url: entry.url,
                };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolveClose) => entry.server.close(resolveClose));
                }
            },
        }),
    ],
});
