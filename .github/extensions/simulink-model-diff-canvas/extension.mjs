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
:root{color-scheme:light;--paper:#ece8db;--paper2:#f7f3e8;--ink:#162522;--faint:#8f9488;--rule:#b9b8ab;--signal:#e64a2e;--teal:#087c78;--lime:#b9d84c;--blueprint:#102e2d;--blueprint2:#173a37;--white:#fffdf5}
*{box-sizing:border-box}body{margin:0;color:var(--ink);font:14px/1.45 "Segoe UI",Arial,sans-serif;background-color:var(--paper);background-image:linear-gradient(rgba(22,37,34,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(22,37,34,.045) 1px,transparent 1px);background-size:24px 24px}
button{font:inherit}header{height:70px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;border-bottom:2px solid var(--ink);background:var(--paper2);position:sticky;top:0;z-index:4}
.wordmark{height:70px;display:flex;align-items:center;padding:0 22px;border-right:2px solid var(--ink);font:800 13px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em}.wordmark i{display:inline-block;width:9px;height:31px;background:var(--signal);margin-right:12px;transform:skew(-13deg)}
.fileline{min-width:0;padding:0 20px}.fileline strong{display:block;font:700 10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase}.sub{margin-top:5px;color:#62675f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:12px ui-monospace,SFMono-Regular,Consolas,monospace}
.status{align-self:stretch;display:grid;place-items:center;min-width:120px;padding:0 18px;border-left:2px solid var(--ink);font:800 11px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;background:var(--lime)}
main{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:calc(100vh - 70px)}aside{border-right:2px solid var(--ink);background:rgba(247,243,232,.88);padding:22px 0;overflow:auto}
.index-title{padding:0 18px 13px;font:800 10px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;border-bottom:1px solid var(--rule)}.index-title b{float:right;color:var(--signal)}
.model{width:100%;display:grid;grid-template-columns:34px 1fr;gap:7px;text-align:left;color:var(--ink);background:transparent;border:0;border-bottom:1px solid var(--rule);padding:13px 14px;cursor:pointer}.model:before{content:attr(data-number);font:800 10px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--faint);padding-top:2px}.model:hover{background:#fff8dd}.model.active{background:var(--ink);color:var(--white);box-shadow:inset 7px 0 0 var(--signal)}.model span{overflow:hidden;text-overflow:ellipsis}.model small{display:block;color:inherit;opacity:.62;margin-top:4px;font:10px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.content{padding:34px clamp(22px,4vw,58px) 70px;overflow:auto;max-width:1450px;width:100%;margin:auto}.folio{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:25px;padding-bottom:22px;border-bottom:5px solid var(--ink)}
.kicker{font:800 10px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--signal)}h1{font:500 clamp(34px,5vw,68px)/.95 Georgia,"Times New Roman",serif;letter-spacing:-.045em;margin:12px 0 14px;max-width:850px;overflow-wrap:anywhere}
.route{display:grid;grid-template-columns:auto 28px auto;align-items:center;gap:8px;width:min(100%,850px);font:11px ui-monospace,SFMono-Regular,Consolas,monospace;color:#4f5751}.route span:first-child,.route span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.route b{height:1px;background:var(--signal);position:relative}.route b:after{content:"";position:absolute;right:0;top:-3px;border-left:6px solid var(--signal);border-top:3px solid transparent;border-bottom:3px solid transparent}
.stamp{width:134px;height:134px;border:2px solid var(--ink);display:grid;place-content:center;text-align:center;transform:rotate(2deg);font:800 11px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.13em}.stamp strong{font-size:23px;color:var(--signal);letter-spacing:0;margin:4px 0}.stamp:after{content:"SEMANTIC REVIEW";border-top:1px solid var(--ink);padding-top:7px;margin-top:5px}
.tape{display:grid;grid-template-columns:repeat(5,1fr);border:2px solid var(--ink);border-top:0;background:var(--paper2)}.metric{padding:13px 15px;border-right:1px solid var(--ink);display:flex;align-items:baseline;justify-content:space-between;gap:8px}.metric:last-child{border:0}.metric b{font:500 30px Georgia,serif}.metric span{font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.1em}
.sheet-label{display:flex;align-items:center;gap:12px;margin:34px 0 12px;font:800 10px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase}.sheet-label:after{content:"";height:1px;background:var(--ink);flex:1}.sheet-label em{font-style:normal;color:var(--signal)}
.schematic{position:relative;background:var(--blueprint);color:#e8f2df;border:2px solid var(--ink);min-height:260px;padding:46px 28px 28px;overflow:auto;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:18px 18px;box-shadow:8px 8px 0 #b7b3a5}.schematic:before{content:"MODEL ROUTE / SIGNAL FLOW";position:absolute;top:14px;left:18px;font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;color:#9eb6a7}.schematic:after{content:"NOT TO SCALE";position:absolute;top:14px;right:18px;font:9px ui-monospace,SFMono-Regular,Consolas,monospace;color:#9eb6a7}
.topology{display:flex;align-items:center;gap:0;min-width:max-content;padding:35px 2px}.node{width:152px;min-height:80px;padding:12px;border:1px solid #9bbab0;background:var(--blueprint2);position:relative}.node:before,.node:after{content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:var(--blueprint);border:1px solid #9bbab0;top:35px}.node:before{left:-5px}.node:after{right:-5px}.node.changed{background:var(--signal);border-color:#ffcabd;color:#fff}.node.changed:before,.node.changed:after{border-color:#fff;background:var(--signal)}.node-name{font:700 12px ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.node-type{font:9px ui-monospace,SFMono-Regular,Consolas,monospace;opacity:.66;margin-top:8px;text-transform:uppercase;letter-spacing:.1em}.node-mark{font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:7px}.connector{height:1px;width:42px;background:#9bbab0;position:relative}.connector:after{content:"";position:absolute;right:0;top:-3px;border-left:6px solid #9bbab0;border-top:3px solid transparent;border-bottom:3px solid transparent}
.ledger{border-top:2px solid var(--ink)}.change{display:grid;grid-template-columns:92px minmax(190px,.8fr) minmax(0,1.7fr);border-bottom:1px solid var(--ink);background:rgba(247,243,232,.76)}.change:hover{background:#fff8dd}.change-code{padding:16px 12px;border-right:1px solid var(--ink);font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.1em}.change-code i{display:block;width:12px;height:12px;margin-bottom:9px;background:var(--teal)}.change.added .change-code i{background:var(--lime)}.change.removed .change-code i{background:var(--signal)}.change.modified .change-code i{background:#f4b942}.change.moved .change-code i{background:#6b64d8}
.change-identity{padding:15px 16px;border-right:1px solid var(--ink)}.change-identity code{font:700 12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.change-identity .meta{margin-top:8px;color:#62675f;font:9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.values{display:grid;grid-template-columns:1fr 1fr}.value{padding:15px 17px;min-width:0}.value+ .value{border-left:1px solid var(--rule)}.value label{display:block;font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.13em;color:#696e66}.value pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.before pre{text-decoration-color:var(--signal)}.after{background:rgba(185,216,76,.11)}.after pre{color:#174f49}
.empty,.error{padding:28px;border:1px solid var(--ink);background:var(--paper2);font:13px ui-monospace,SFMono-Regular,Consolas,monospace}.error{border-left:9px solid var(--signal)}
@media(max-width:900px){main{grid-template-columns:1fr}aside{border-right:0;border-bottom:2px solid var(--ink);max-height:230px}.content{padding:26px 16px 55px}.folio{grid-template-columns:1fr}.stamp{width:100%;height:auto;display:flex;gap:12px;padding:10px;transform:none;justify-content:center}.stamp:after{border:0;margin:0;padding:0}.tape{grid-template-columns:repeat(2,1fr)}.metric{border-bottom:1px solid var(--ink)}.change{grid-template-columns:70px 1fr}.change-identity{border-right:0}.values{grid-column:1/-1;border-top:1px solid var(--rule)}}
</style>
</head>
<body>
<header><div class="wordmark"><i></i>MODEL / DELTA</div><div class="fileline"><strong>Change record</strong><div class="sub" id="source">Reading report</div></div><div class="status" id="status">loading</div></header>
<main><aside><div class="index-title">Model index <b id="model-count">00</b></div><div id="models"></div></aside><section class="content" id="content"><div class="empty">Reading model evidence.</div></section></main>
<script>
let state=null, selected=null;
const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pretty=(v)=>v==null?"none":typeof v==="string"?v:JSON.stringify(v,null,2);
function count(summary,key){return Number(summary?.[key]||0)}
function choose(id){selected=id;render()}
function render(){
 const source=document.getElementById("source"), status=document.getElementById("status"), models=document.getElementById("models"), content=document.getElementById("content");
 if(!state){return}
 source.textContent=state.report?.source||state.reportPath||"No report";
 status.textContent=state.error?"error":state.report?.status||"unknown";
 if(state.error){models.innerHTML="";content.innerHTML='<div class="error"><strong>Report unavailable</strong><br>'+esc(state.error)+'</div>';return}
 const list=state.report?.models||[]; document.getElementById("model-count").textContent=String(list.length).padStart(2,"0"); if(!selected||!list.some(m=>m.id===selected))selected=state.selectedModelId||list[0]?.id;
 models.innerHTML=list.map((m,i)=>'<button class="model '+(m.id===selected?"active":"")+'" data-id="'+esc(m.id)+'" data-number="'+String(i+1).padStart(2,"0")+'"><span>'+esc(m.label)+'<small>'+esc(m.changeType)+' / '+esc(m.analysisStatus)+'</small></span></button>').join("");
 models.querySelectorAll("button").forEach(b=>b.onclick=()=>choose(b.dataset.id));
 const m=list.find(x=>x.id===selected); if(!m){content.innerHTML='<div class="empty">No changed models were found.</div>';return}
 const s=m.summary||{}, changes=m.changes||[], topology=m.topology||{};
 const changedPaths=new Set(changes.map(c=>c.path));
 const nodes=(topology.blocks||[]).slice(0,14);
 const nodeMarkup=nodes.length?nodes.map((n,i)=>(i?'<span class="connector"></span>':'')+'<div class="node '+(changedPaths.has(n.path)?"changed":"")+'"><div class="node-name">'+esc(n.name)+'</div><div class="node-type">'+esc(n.type)+'</div>'+(changedPaths.has(n.path)?'<div class="node-mark">REVISION POINT</div>':'')+'</div>').join(""):'<div class="empty" style="width:100%;color:#d4e2d8;background:transparent;border-color:#9bbab0">No topology was attached to this report. The revision ledger remains authoritative.</div>';
 const metrics=[["Added",count(s,"added")],["Removed",count(s,"removed")],["Modified",count(s,"modified")],["Moved",count(s,"moved")],["Interfaces",count(s,"interfaceChanges")]];
 content.innerHTML='<section class="folio"><div><div class="kicker">Engineering change record / '+esc(m.changeType)+'</div><h1>'+esc(m.label)+'</h1><div class="route"><span>'+esc(m.basePath||"empty model")+'</span><b></b><span>'+esc(m.headPath||"empty model")+'</span></div></div><div class="stamp"><span>Analysis</span><strong>'+esc(m.analysisStatus)+'</strong><span>Policy '+esc(m.policyStatus)+'</span></div></section>'+
 '<div class="tape">'+metrics.map(x=>'<div class="metric"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("")+'</div>'+
 '<div class="sheet-label"><em>01</em> signal route</div><section class="schematic"><div class="topology">'+nodeMarkup+'</div></section>'+
 '<div class="sheet-label"><em>02</em> revision ledger / '+changes.length+' entries</div>'+
 (changes.length?'<div class="ledger">'+changes.map((c,i)=>'<article class="change '+esc(c.kind)+'"><div class="change-code"><i></i>'+String(i+1).padStart(2,"0")+' / '+esc(c.kind)+'</div><div class="change-identity"><code>'+esc(c.path)+'</code><div class="meta">'+esc(c.category)+' / '+esc(c.elementType)+(c.property?' / '+esc(c.property):'')+' / '+esc(c.classification)+'</div></div><div class="values"><div class="value before"><label>Previous state</label><pre>'+esc(pretty(c.before))+'</pre></div><div class="value after"><label>Revised state</label><pre>'+esc(pretty(c.after))+'</pre></div></div></article>').join("")+'</div>':'<div class="empty">The semantic report contains no revisions for this model.</div>');
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
