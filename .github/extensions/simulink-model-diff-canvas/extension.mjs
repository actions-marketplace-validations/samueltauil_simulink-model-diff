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
:root{color-scheme:light dark;--bg:#0d1117;--panel:#161b22;--line:#30363d;--text:#e6edf3;--muted:#8b949e;--blue:#58a6ff;--green:#3fb950;--red:#f85149;--amber:#d29922;--violet:#a371f7}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
header{display:flex;align-items:center;gap:16px;padding:16px 20px;border-bottom:1px solid var(--line);background:#010409;position:sticky;top:0;z-index:4}
h1{font-size:18px;margin:0}.sub{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status{margin-left:auto;border:1px solid var(--line);border-radius:999px;padding:3px 9px;text-transform:capitalize}
main{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:calc(100vh - 58px)}aside{border-right:1px solid var(--line);padding:14px;overflow:auto}
.model{display:block;width:100%;text-align:left;color:var(--text);background:transparent;border:1px solid transparent;border-radius:7px;padding:10px;margin-bottom:6px;cursor:pointer}
.model:hover,.model.active{background:#21262d;border-color:var(--line)}.model small{display:block;color:var(--muted);margin-top:4px}
.content{padding:20px;overflow:auto}.cards{display:grid;grid-template-columns:repeat(5,minmax(105px,1fr));gap:10px;margin:14px 0 20px}.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px}.card b{display:block;font-size:22px}.card span{color:var(--muted)}
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pill{border:1px solid var(--line);border-radius:999px;padding:3px 8px;color:var(--muted)}
.changes{display:grid;gap:10px}.change{background:var(--panel);border:1px solid var(--line);border-left:5px solid var(--blue);border-radius:8px;padding:13px}.change.added{border-left-color:var(--green)}.change.removed{border-left-color:var(--red)}.change.moved{border-left-color:var(--violet)}.change.modified{border-left-color:var(--amber)}
.change-head{display:flex;align-items:center;gap:8px}.change-head code{font-weight:700;color:var(--text);overflow-wrap:anywhere}.kind{text-transform:uppercase;font-size:11px;font-weight:700}.meta{color:var(--muted);margin-top:5px}
.values{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.value{background:#0d1117;border:1px solid var(--line);border-radius:6px;padding:8px;overflow:auto}.value label{display:block;color:var(--muted);font-size:11px;text-transform:uppercase}.value pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:5px 0 0;font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace}
.empty,.error{padding:24px;border:1px dashed var(--line);border-radius:8px;color:var(--muted)}.error{color:#ff7b72;border-color:var(--red)}
@media(max-width:850px){main{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--line)}.cards{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<header><h1>Simulink Model Drift</h1><div class="sub" id="source">Loading report…</div><div class="status" id="status">loading</div></header>
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
 const s=m.summary||{}, changes=m.changes||[];
 content.innerHTML='<div class="toolbar"><h2 style="margin:0">'+esc(m.label)+'</h2><span class="pill">analysis: '+esc(m.analysisStatus)+'</span><span class="pill">policy: '+esc(m.policyStatus)+'</span></div>'+
 '<div class="meta">'+esc(m.basePath||"∅")+' → '+esc(m.headPath||"∅")+'</div>'+
 '<div class="cards">'+[["Added",count(s,"added")],["Removed",count(s,"removed")],["Modified",count(s,"modified")],["Moved",count(s,"moved")],["Interfaces",count(s,"interfaceChanges")]].map(x=>'<div class="card"><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join("")+'</div>'+
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
