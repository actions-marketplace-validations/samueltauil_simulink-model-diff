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

function assessReview(analysisStatus, policyStatus, changeCount) {
    const analysis = String(analysisStatus || "").toLowerCase();
    const policy = String(policyStatus || "").toLowerCase();
    if (["failed", "unsupported"].includes(analysis)) {
        return {
            tone: "stop",
            title: "Analysis unavailable",
            detail: "The model evidence is not sufficient for a merge decision.",
        };
    }
    if (analysis && analysis !== "complete") {
        return {
            tone: "warn",
            title: "Qualified extraction needed",
            detail:
                "This report is partial. Review the visible drift, then run the approved " +
                "semantic extractor before merge.",
        };
    }
    if (policy === "failed") {
        return {
            tone: "stop",
            title: "Policy gate failed",
            detail: "Resolve the reported policy findings before this change is merged.",
        };
    }
    if (changeCount > 0) {
        return {
            tone: "warn",
            title: "Reviewer decision required",
            detail:
                "The analysis completed and found model drift. Confirm the intended " +
                "behavior and supporting tests.",
        };
    }
    return {
        tone: "pass",
        title: "No drift detected",
        detail: "The available analysis completed without model changes.",
    };
}

function driftModel(id, label, drift, record = {}) {
    const topology = drift?.topology || drift || {};
    const changes = Array.isArray(drift?.changes) ? drift.changes.map(normalizeChange) : [];
    const analysisStatus = String(
        record.analysisStatus || drift?.comparison?.status || "unknown",
    );
    const policyStatus = String(record.policyStatus || "unknown");
    return {
        id,
        label,
        changeType: String(record.changeType || "pair"),
        basePath: record.basePath || drift?.comparison?.baseArtifact || null,
        headPath: record.headPath || drift?.comparison?.targetArtifact || null,
        analysisStatus,
        policyStatus,
        summary: record.summary || drift?.summary || {},
        findingCounts: record.findingCounts || {},
        changes,
        review: assessReview(analysisStatus, policyStatus, changes.length),
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
:root{color-scheme:light;--shell:#151a22;--shell2:#1d2430;--paper:#f1f0eb;--surface:#fbfaf6;--line:#c9c8c1;--line-dark:#343c49;--text:#1a2027;--muted:#66707a;--accent:#315efb;--accent2:#ff5a3c;--acid:#d8f36a;--amber:#eaa62b;--rose:#d83c55;--olive:#6d9d20;--shadow:rgba(21,26,34,.14)}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;color:var(--text);font:14px/1.45 "Segoe UI",Inter,Arial,sans-serif;background:var(--paper);letter-spacing:.005em}
button{font:inherit}
header{height:64px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;background:var(--shell);color:#f7f7f2;position:sticky;top:0;z-index:10;border-bottom:4px solid var(--accent2)}
.wordmark{height:60px;display:flex;align-items:center;padding:0 20px;border-right:1px solid var(--line-dark);font:800 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}.wordmark i{display:inline-block;width:12px;height:12px;background:var(--acid);margin-right:12px;transform:rotate(45deg)}
.fileline{min-width:0;padding:0 18px}.fileline strong{display:block;font:700 9px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;color:#9aa4b2}.sub{margin-top:5px;color:#c2cad3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px ui-monospace,SFMono-Regular,Consolas,monospace}
.status{align-self:stretch;display:grid;place-items:center;min-width:118px;padding:0 18px;border-left:1px solid var(--line-dark);font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--acid)}
main{display:grid;grid-template-columns:clamp(210px,18vw,280px) minmax(0,1fr);min-height:calc(100vh - 64px)}aside{background:var(--shell);color:#f7f7f2;padding:18px 0 0;overflow:auto}
.index-title{padding:0 18px 14px;font:800 9px/1.1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;color:#8e99a8;border-bottom:1px solid var(--line-dark)}.index-title b{float:right;color:var(--acid);font-size:11px}
.model{width:100%;display:grid;grid-template-columns:28px 1fr;gap:8px;text-align:left;color:#f7f7f2;background:transparent;border:0;border-bottom:1px solid var(--line-dark);padding:13px 14px;cursor:pointer}.model:before{content:attr(data-number);font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;color:#758091;padding-top:2px}.model:hover{background:var(--shell2)}.model.active{background:#263040;box-shadow:inset 4px 0 0 var(--acid)}.model span{overflow:hidden;text-overflow:ellipsis}.model small{display:block;color:#9da8b7;margin-top:4px;font:9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.content{padding:0;overflow:auto;width:100%;margin:auto;background:var(--paper)}.phasebar{display:grid;grid-template-columns:repeat(4,1fr);background:var(--surface);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.phase{padding:13px 16px;border-right:1px solid var(--line);font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.12em}.phase:last-child{border:0}.phase b{display:block;color:var(--accent);font-size:10px;margin-bottom:4px}.phase.warn b{color:var(--amber)}.phase.stop b{color:var(--rose)}
.workspace{display:grid;grid-template-columns:minmax(0,1fr) clamp(250px,23vw,330px);gap:0;max-width:1600px;margin:auto}.review-main{padding:clamp(24px,3vw,46px)}.decision-rail{border-left:1px solid #b8b7b0;background:#deddd6;color:#1a2027;padding:24px;position:relative}.decision{position:sticky;top:78px}.folio{padding-bottom:24px;border-bottom:1px solid var(--line)}
.kicker{font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}h1{font:650 clamp(30px,3vw,50px)/1.04 "Segoe UI",Inter,Arial,sans-serif;letter-spacing:-.045em;margin:11px 0 13px;max-width:850px;overflow-wrap:anywhere}
.route{display:grid;grid-template-columns:auto 28px auto;align-items:center;gap:8px;width:min(100%,800px);font:10px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted)}.route span:first-child,.route span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.route b{height:2px;background:var(--accent2);position:relative}.route b:after{content:"";position:absolute;right:0;top:-3px;border-left:6px solid var(--accent2);border-top:4px solid transparent;border-bottom:4px solid transparent}
.tape{display:grid;border:1px solid var(--line);background:var(--surface);overflow:hidden;margin-top:22px}.metric{padding:12px 14px;border-right:1px solid var(--line);display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-height:66px}.metric:last-child{border-right:0}.metric b{font:650 25px/1.1 "Segoe UI",Inter,Arial,sans-serif;letter-spacing:-.05em}.metric span{font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.sheet-label{display:flex;align-items:center;gap:12px;margin:30px 0 11px;font:800 9px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.sheet-label:after{content:"";height:1px;background:var(--line);flex:1}.sheet-label em{font-style:normal;color:var(--accent)}
.schematic{position:relative;background:#101823;color:#f5f7f8;border:1px solid #101823;padding:34px 20px 22px;overflow:auto;box-shadow:8px 8px 0 #d6d4cc}.schematic:before{content:"IMPACT MAP";position:absolute;top:12px;left:16px;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;color:#8895a5}.schematic:after{content:"DECLARED TOPOLOGY";position:absolute;top:12px;right:16px;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#8895a5}
.system-map{display:grid;grid-template-columns:minmax(0,2fr) minmax(190px,.72fr);gap:20px}.topology{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;align-content:start}.node{min-height:80px;padding:12px;border:1px solid #435063;background:#1b2634;position:relative;cursor:pointer;color:#f6f7f8}.node:hover{border-color:#8fa1ba}.node.changed{background:#28334a;border-color:var(--accent2);box-shadow:inset 4px 0 0 var(--accent2)}.node.focused{outline:2px solid var(--acid);outline-offset:2px}.node-name{font:700 11px ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.node-type{font:8px ui-monospace,SFMono-Regular,Consolas,monospace;color:#9ca8b7;margin-top:8px;text-transform:uppercase;letter-spacing:.1em}.node-mark{font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;margin-top:8px;color:#ff8d78}.edge-register{border-left:1px solid #364253;padding-left:18px}.edge-register h3{font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8f9baa;margin:0 0 10px}.edge{display:grid;grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr);gap:6px;padding:8px 0;border-top:1px solid #2c3745;font:9px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;color:#b7c0cb}.edge b{color:var(--acid);text-align:center}.edge span{overflow-wrap:anywhere}
.filterbar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}.filter{border:1px solid var(--line);background:var(--surface);color:var(--muted);padding:7px 10px;cursor:pointer;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.1em}.filter:hover{border-color:#8d9296}.filter.active{background:var(--accent);border-color:var(--accent);color:#fff}.clear-focus{margin-left:auto}
.ledger{border-top:1px solid var(--line);overflow:hidden;background:var(--surface)}.change{display:grid;grid-template-columns:88px minmax(180px,.75fr) minmax(0,1.6fr);border-bottom:1px solid var(--line)}.change:hover{background:#f5f5ef}.change.hidden{display:none}.change-code{padding:16px 12px;border-right:1px solid var(--line);font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.11em;color:var(--muted)}.change-code i{display:block;width:11px;height:11px;margin-bottom:10px;background:var(--accent)}.change.added .change-code i{background:var(--olive)}.change.removed .change-code i{background:var(--rose)}.change.modified .change-code i{background:var(--amber)}.change.moved .change-code i{background:#786ad9}
.change-identity{padding:15px 16px;border-right:1px solid var(--line)}.change-identity code{font:700 12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.change-identity .meta{margin-top:8px;color:var(--muted);font:9px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.evidence-line{margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);color:var(--muted);font-size:10px}.evidence-line b{color:var(--text)}
.values{display:grid;grid-template-columns:1fr 1fr}.value{padding:15px 17px;min-width:0}.value + .value{border-left:1px solid var(--line)}.value label{display:block;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}.value pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--text)}.before{background:rgba(255,117,133,.04)}.after{background:rgba(90,200,193,.06)}
.decision h2{color:#111820;font-size:20px;letter-spacing:-.03em;margin:0 0 12px}.decision-state{border-top:6px solid var(--accent);background:#fffefa;color:#111820;padding:18px;margin-bottom:18px;box-shadow:0 6px 22px var(--shadow)}.decision-state.warn{border-color:var(--amber)}.decision-state.stop{border-color:var(--rose)}.decision-state strong{display:block;color:#111820;font-size:21px;line-height:1.1;margin-bottom:9px}.decision-state p{margin:0;color:#46515d;font-size:12px}.review-facts{border-top:1px solid #a8a8a1}.fact{display:grid;grid-template-columns:1fr auto;gap:12px;padding:11px 0;border-bottom:1px solid #b8b8b1;font-size:12px}.fact span{color:#4e5963}.fact b{color:#111820;text-align:right}.review-note{margin-top:18px;padding:13px;background:#cacbc3;color:#26313a;font-size:11px;line-height:1.5}.review-note b{display:block;color:#111820;margin-bottom:5px;font:800 8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase}
.empty,.error{padding:26px;border:1px solid var(--line);background:var(--surface);font:12px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted)}.error{border-left:8px solid var(--rose);color:var(--text)}
@media(max-width:1200px){.workspace{grid-template-columns:1fr}.decision-rail{border-left:0;border-top:1px solid var(--line)}.decision{position:static;display:grid;grid-template-columns:minmax(220px,.7fr) 1fr;gap:20px}.review-facts{border-top:0}.system-map{grid-template-columns:1fr}.edge-register{border-left:0;border-top:1px solid #364253;padding:18px 0 0}}
@media(max-width:760px){main{grid-template-columns:1fr}aside{border-bottom:1px solid var(--line-dark);max-height:210px}.wordmark{padding:0 11px;font-size:9px;letter-spacing:.1em}.fileline{padding:0 10px}.status{min-width:78px;padding:0 8px;font-size:8px}.phasebar{grid-template-columns:repeat(2,1fr);position:static}.workspace{display:block}.review-main,.decision-rail{padding:20px 14px}.decision{display:block}.tape{grid-template-columns:repeat(2,1fr)!important}.metric{border-bottom:1px solid var(--line)}.change{grid-template-columns:70px 1fr}.change-identity{border-right:0}.values{grid-column:1/-1;border-top:1px solid var(--line)}}
</style>
</head>
<body>
<header><div class="wordmark"><i></i>DRIFT / REVIEW</div><div class="fileline"><strong>Pull request model evidence</strong><div class="sub" id="source">Reading report</div></div><div class="status" id="status">loading</div></header>
<main><aside><div class="index-title">Model index <b id="model-count">00</b></div><div id="models"></div></aside><section class="content" id="content"><div class="empty">Reading model evidence.</div></section></main>
<script>
let state=null, selected=null, changeFilter="all", pathFilter=null;
const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const known=(v)=>v!=null&&!["","unknown","not evaluated"].includes(String(v).toLowerCase());
const pretty=(v,kind,side)=>v!=null?(typeof v==="string"?v:JSON.stringify(v,null,2)):((kind==="added"&&side==="before")||(kind==="removed"&&side==="after")?"not present":"not reported");
function count(summary,key){return Number(summary?.[key]||0)}
function choose(id){selected=id;changeFilter="all";pathFilter=null;render()}
function setFilter(value){changeFilter=value;pathFilter=null;render()}
function focusPath(value){pathFilter=pathFilter===value?null:value;render()}
function filterChange(change){
 if(pathFilter&&change.path!==pathFilter)return false;
 if(changeFilter==="functional")return String(change.classification).includes("functional");
 if(changeFilter==="interface")return change.category==="interface";
 if(changeFilter==="structural")return ["block","system","connection","stateflow"].includes(change.category);
 return true;
}
function render(){
 const source=document.getElementById("source"), status=document.getElementById("status"), models=document.getElementById("models"), content=document.getElementById("content");
 if(!state){return}
 source.textContent=state.report?.source||state.reportPath||"No report";
 status.textContent=state.error?"error":known(state.report?.status)?state.report.status:"loaded";
 if(state.error){models.innerHTML="";content.innerHTML='<div class="error"><strong>Report unavailable</strong><br>'+esc(state.error)+'</div>';return}
 const list=state.report?.models||[]; document.getElementById("model-count").textContent=String(list.length).padStart(2,"0"); if(!selected||!list.some(m=>m.id===selected))selected=state.selectedModelId||list[0]?.id;
 models.innerHTML=list.map((m,i)=>{const facts=[m.changeType,known(m.analysisStatus)?m.analysisStatus:null].filter(Boolean);return '<button class="model '+(m.id===selected?"active":"")+'" data-id="'+esc(m.id)+'" data-number="'+String(i+1).padStart(2,"0")+'"><span>'+esc(m.label)+(facts.length?'<small>'+facts.map(esc).join(" / ")+'</small>':'')+'</span></button>'}).join("");
 models.querySelectorAll("button").forEach(b=>b.onclick=()=>choose(b.dataset.id));
 const m=list.find(x=>x.id===selected); if(!m){content.innerHTML='<div class="empty">No changed models were found.</div>';return}
 const s=m.summary||{}, changes=m.changes||[], topology=m.topology||{};
 const decision=m.review;
 const changedPaths=new Set(changes.map(c=>c.path));
 const nodes=(topology.blocks||[]).slice(0,14);
 const connections=(topology.connections||[]).filter(c=>c&&known(c.source)&&known(c.destination));
 const nodeMarkup=nodes.map(n=>'<button class="node '+(changedPaths.has(n.path)?"changed ":"")+(pathFilter===n.path?"focused":"")+'" data-path="'+esc(n.path)+'"><div class="node-name">'+esc(n.name)+'</div>'+(known(n.type)?'<div class="node-type">'+esc(n.type)+'</div>':'')+(changedPaths.has(n.path)?'<div class="node-mark">HAS RECORDED DRIFT</div>':'')+'</button>').join("");
 const edgeMarkup=connections.map(c=>'<div class="edge"><span>'+esc(c.source)+'</span><b>→</b><span>'+esc(c.destination)+'</span></div>').join("");
 const rawMetrics=[["Added",count(s,"added")],["Removed",count(s,"removed")],["Modified",count(s,"modified")],["Moved",count(s,"moved")],["Interfaces",count(s,"interfaceChanges")]];
 const metrics=[["Revisions",changes.length],...rawMetrics.filter(x=>x[1]>0)];
 const route=known(m.basePath)&&known(m.headPath)?'<div class="route"><span>'+esc(m.basePath)+'</span><b></b><span>'+esc(m.headPath)+'</span></div>':(known(m.headPath)||known(m.basePath)?'<div class="route" style="display:block"><span>'+esc(m.headPath||m.basePath)+'</span></div>':'');
 const topologySection=nodes.length?'<div class="sheet-label"><em>01</em> model inventory / '+nodes.length+' blocks'+(connections.length?' / '+connections.length+' connections':'')+'</div><section class="schematic"><div class="system-map"><div class="topology">'+nodeMarkup+'</div>'+(connections.length?'<div class="edge-register"><h3>Recorded connections</h3>'+edgeMarkup+'</div>':'')+'</div></section>':'';
 const ledgerNumber=nodes.length?"02":"01";
 const visible=changes.filter(filterChange);
 const extractor=[...new Set(changes.map(c=>c.evidence?.extractor).filter(known))].join(", ");
 const affected=new Set(changes.map(c=>c.path)).size;
 const filters=[["all","All drift"],["functional","Functional"],["interface","Interfaces"],["structural","Structural"]];
 const phaseTrust=String(m.analysisStatus).toLowerCase()==="complete"?"pass":decision.tone;
 const phases='<div class="phasebar"><div class="phase '+phaseTrust+'"><b>01 / Trust</b>'+esc(known(m.analysisStatus)?m.analysisStatus:"not reported")+'</div><div class="phase"><b>02 / Scope</b>'+affected+' affected path'+(affected===1?"":"s")+'</div><div class="phase"><b>03 / Evidence</b>'+changes.length+' revision'+(changes.length===1?"":"s")+'</div><div class="phase '+decision.tone+'"><b>04 / Decision</b>'+esc(decision.title)+'</div></div>';
 const filterbar=changes.length?'<div class="filterbar">'+filters.map(f=>'<button class="filter '+(changeFilter===f[0]&&!pathFilter?"active":"")+'" data-filter="'+f[0]+'">'+f[1]+'</button>').join("")+(pathFilter?'<button class="filter active clear-focus" data-clear-focus>Focused path ×</button>':'')+'</div>':'';
 const ledger=visible.length?'<div class="ledger">'+visible.map((c,i)=>{const facts=[c.category,c.elementType,c.property,known(c.classification)?c.classification:null].filter(Boolean);const detail=c.evidence?.details&&typeof c.evidence.details==="object"?Object.entries(c.evidence.details).map(([k,v])=>esc(k)+": "+esc(v)).join(" · "):"";return '<article class="change '+esc(c.kind)+'"><div class="change-code"><i></i>'+String(i+1).padStart(2,"0")+' / '+esc(c.kind)+'</div><div class="change-identity"><code>'+esc(c.path)+'</code>'+(facts.length?'<div class="meta">'+facts.map(esc).join(" / ")+'</div>':'')+(detail?'<div class="evidence-line"><b>Evidence</b> '+detail+'</div>':'')+'</div><div class="values"><div class="value before"><label>Previous state</label><pre>'+esc(pretty(c.before,c.kind,"before"))+'</pre></div><div class="value after"><label>Revised state</label><pre>'+esc(pretty(c.after,c.kind,"after"))+'</pre></div></div></article>'}).join("")+'</div>':(changes.length?'<div class="empty">No revisions match the current focus.</div>':'<div class="empty">No revisions are recorded for this model.</div>');
 const decisionFacts=[["Analysis",known(m.analysisStatus)?m.analysisStatus:"not reported"],...(known(m.policyStatus)?[["Policy",m.policyStatus]]:[]),["Affected paths",affected],["Topology",nodes.length?nodes.length+" blocks":"not supplied"],...(extractor?[["Evidence source",extractor]]:[])];
 const decisionPanel='<section class="decision-rail"><div class="decision"><h2>Merge assessment</h2><div class="decision-state '+decision.tone+'"><strong>'+esc(decision.title)+'</strong><p>'+esc(decision.detail)+'</p></div><div class="review-facts">'+decisionFacts.map(f=>'<div class="fact"><span>'+esc(f[0])+'</span><b>'+esc(f[1])+'</b></div>').join("")+'</div><div class="review-note"><b>Workflow position</b>Use this review after CI creates the drift artifact and before approving the pull request. The canvas presents evidence; repository policy remains authoritative.</div></div></section>';
 content.innerHTML=phases+'<div class="workspace"><div class="review-main"><section class="folio"><div class="kicker">Model change under review'+(known(m.changeType)?' / '+esc(m.changeType):'')+'</div><h1>'+esc(m.label)+'</h1>'+route+'</section>'+
 '<div class="tape" style="grid-template-columns:repeat('+metrics.length+',minmax(0,1fr))">'+metrics.map(x=>'<div class="metric"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("")+'</div>'+
 topologySection+'<div class="sheet-label"><em>'+ledgerNumber+'</em> inspect evidence / '+visible.length+' of '+changes.length+' shown</div>'+filterbar+ledger+'</div>'+decisionPanel+'</div>';
 content.querySelectorAll("[data-filter]").forEach(button=>button.onclick=()=>setFilter(button.dataset.filter));
 content.querySelectorAll("[data-path]").forEach(button=>button.onclick=()=>focusPath(button.dataset.path));
 const clear=content.querySelector("[data-clear-focus]");if(clear)clear.onclick=()=>{pathFilter=null;render()};
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
