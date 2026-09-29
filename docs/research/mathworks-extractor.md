# MathWorks Research Notes: Production Simulink Semantic Extractor

> Research summary of official MathWorks documentation and authoritative sources for
> implementing the extractor described in `docs/architecture.md` and `context/reference.md`.
> This document records the official API basis and the implementation boundary
> for the checked-in extractor. Static and contract tests are available, but no
> licensed MATLAB runtime was available for live compatibility testing.

## Implementation status

The first-party implementation is:

- `tools/matlab/extract_simulink_model.m` for documented-API static inspection;
- `tools/run_matlab_extractor.py` for safe `-batch` invocation, timeout handling,
  canonical schema validation, artifact SHA-256 verification, and deterministic
  canonicalization;
- invoked as `python tools/run_matlab_extractor.py {artifact}`.

It extracts blocks and selected dialog parameters, top-level declared
interfaces, line endpoints, model and library references, selected
configuration, data-dictionary references, and best-effort Stateflow objects.
It deliberately does not compile or update the model. Therefore effective
compiled data types, dimensions, sample times, requirements links, dictionary
contents, unresolved dependency semantics, and complete Stateflow coverage
remain explicit unsupported features and normally produce `analysis.status =
partial`.

## 1. Capability matrix

| Concern | Documented API / mechanism | Status | Key constraints | Source |
|---|---|---|---|---|
| Load model without opening editor | `load_system` | Documented | Executes `PreLoadFcn`; does **not** run `InitFcn` (that only runs on simulate/update). Loads into memory only, no Editor window. | [load_system](https://www.mathworks.com/help/simulink/slref/load_system.html) |
| Open model (visual) | `open_system` | Documented | Also triggers `PreLoadFcn` if not already loaded; still does not run `InitFcn`. | [open_system](https://www.mathworks.com/help/simulink/slref/open_system.html) |
| Close model | `close_system` | Documented | Use `'bdclose'`/`close_system(model,0)` to discard changes; does not by itself stop callback side effects already executed at load time. | [close_system](https://www.mathworks.com/help/simulink/slref/close_system.html) |
| Suppress callback execution | `set_param(model,'PreLoadFcn','')`, `'PostLoadFcn'`, `'InitFcn'`, etc. | Documented | Must be applied to a **copy** of the model file (or set before load, e.g. by templated skip) since `PreLoadFcn` runs during `load_system` itself — you cannot clear it before it has already fired on that same load call. There is no supported "disable all callbacks" load flag; each callback parameter must be read/cleared individually, or the model file's callback text pre-scrubbed before load for untrusted input. | [Model, Block, and Port Callbacks](https://www.mathworks.com/help/simulink/callback-functions.html), [Model Callbacks](https://www.mathworks.com/help/simulink/ug/model-callbacks.html) |
| Enumerate blocks/ports/lines | `find_system`, `find_system(...,'FindAll','on')`, `get_param(block,'PortHandles')`, `get_param(line,'SrcBlockHandle')` etc. | Documented | `find_system` defaults to blocks only; ports/lines need `'FindAll','on'` or explicit `PortHandles`/`LineHandles` queries. Search is O(model size); prefer scoping with `'SearchDepth'`/`'LookUnderMasks'`. | [find_system](https://www.mathworks.com/help/simulink/slref/find_system.html), [Search Programmatically](https://www.mathworks.com/help/simulink/ug/find-models-and-model-elements-programmatically.html) |
| Static block/model parameters | `get_param(obj, 'ParamName')` | Documented | Only documented parameters are stable across releases; use `get_param(obj,'ObjectParameters')` to enumerate available parameter names/attributes at runtime rather than hardcoding an undocumented list. | [get_param](https://www.mathworks.com/help/simulink/slref/get_param.html) |
| Compiled port data type / dimensions / sample time | `get_param(blockHandle,'CompiledPortDataTypes')`, `'CompiledPortDimensions'`, `'CompiledSampleTime'` | Documented, but **only valid while the model is in compiled state** | Requires `model([],[],[],'compile')` ... `model([],[],[],'term')` bracket (or a documented simulation-object equivalent from R2024a+ for Accelerator/Rapid-Accelerator modes). Compiling a model can itself trigger initialization-time behavior and is more invasive than a static parse; extractor must document when it enters compiled mode and guarantee `'term'` always runs (including on error) to avoid leaving the model in a compiled state. | [get_param](https://www.mathworks.com/help/simulink/slref/get_param.html), [Programmatically Specify Block Parameters and Properties](https://www.mathworks.com/help/simulink/ug/programmatic-specification.html) |
| Top-level Inport/Outport contracts | `find_system(model,'SearchDepth',1,'BlockType','Inport'/'Outport')` + `get_param` on `'DataType'`, `'PortDimensions'`, `'SampleTime'`, `'Unit'`, `'OutMin'/'OutMax'`, `'Port'` (index) | Documented | Declared (uncompiled) attributes may say `'auto'`/`'inherit'`; resolving the *effective* type/dimension/sample time requires the compiled-attribute path above. Extractor should report both declared and (optionally) compiled values, and mark compiled-only values as requiring compile. | [get_param](https://www.mathworks.com/help/simulink/slref/get_param.html) |
| Model references | `find_mdlrefs`, `Simulink.SubSystem`/Model block `'ModelName'` param, `view_mdlrefs`, `pathsToReferencedModel` | Documented | `find_mdlrefs` recursively loads referenced models (has a `KeepModelsLoaded` option) — loading referenced models re-triggers their own callbacks, so the same untrusted-callback controls must extend recursively. | [find_mdlrefs](https://www.mathworks.com/help/simulink/slref/find_mdlrefs.html), [Visualize Model Reference Hierarchies](https://www.mathworks.com/help/simulink/slref/visualizing-model-reference-architectures.html), [pathsToReferencedModel](https://www.mathworks.com/help/simulink/slref/pathstoreferencedmodel.html) |
| Library links | `Simulink.findLibraryLinks`, `get_param(block,'ReferenceBlock')`, `'LinkStatus'` | Documented | Resolving a library link requires the library itself to be resolvable/loadable on the analysis machine (path or project dependency); unresolved/broken links must surface as `unsupported`/`unresolved`, not silently ignored. | [Simulink.findLibraryLinks](https://www.mathworks.com/help/simulink/slref/simulink.findlibrarylinks.html) |
| Data dictionaries | `Simulink.data.dictionary.open`, `Simulink.data.Dictionary` object, `getSection`, `addDataSource` | Documented | Dictionaries can reference other dictionaries (`DataSources`); a full extraction must recurse referenced dictionaries and record unresolved reference chains. | [Simulink.data.Dictionary](https://www.mathworks.com/help/simulink/slref/simulink.data.dictionary.html), [Store Data in Dictionary Programmatically](https://www.mathworks.com/help/simulink/ug/store-data-in-dictionary-programmatically.html) |
| Requirements links | `slreq.find`, `slreq.Link`, `slreq.createLink`, Requirements Toolbox API | Documented, **requires Requirements Toolbox license** | Only available when Requirements Toolbox is installed/licensed; extractor must treat missing product as `unsupported`, not an error. | [Author, Import, Link, and Justify Requirements Programmatically](https://www.mathworks.com/help/slrequirements/gs/author-import-link-and-justify-requirements-programmatically.html), [Create Requirement Links](https://www.mathworks.com/help/slrequirements/create-links.html) |
| Stateflow object access | `sfroot`, `Stateflow.Machine`, `Stateflow.Chart`, `Stateflow.State`, `Stateflow.Transition`, `Stateflow.Data`, `find(sfroot, 'PropertyName', Value)` | Documented, **requires Stateflow license** | Object hierarchy is rooted at `sfroot`; must locate the `Stateflow.Machine` for the loaded model by name before traversing charts/states/transitions. | [Stateflow Programmatic Interface](https://www.mathworks.com/help/stateflow/programmatic-interface.html), [Overview of Stateflow Objects](https://www.mathworks.com/help/stateflow/ug/overview-of-stateflow-objects.html) |
| Persistent/stable identifiers | `get_param(block,'SID')` | Documented, but **only stable within the same model file across saves in general use; can be renumbered by certain operations (copy/paste, some refactors).** | Do not rely on SID alone for cross-version identity matching; combine with path, block type, and neighboring-connection heuristics as `context/reference.md` already recommends. Related undocumented internal property `SIDHighWatermark` exists but is **not** part of the public API and must not be depended on. `Simulink.ID.getSID` exists but MathWorks documents it as **Not Recommended** in favor of handles/paths/objects. | [get_param](https://www.mathworks.com/help/simulink/slref/get_param.html), [Simulink.ID.getSID (Not Recommended)](https://www.mathworks.com/help/simulink/slref/simulink.id.getsid.html) |
| Whole-model checksum | `Simulink.BlockDiagram.getChecksum` | Documented | Returns a 128-bit checksum plus a `details.ContentsChecksumItems` list of contributing block paths/parameters/values — useful as a cheap "did anything semantically relevant change" pre-check before running a full extraction/diff. | [Simulink.BlockDiagram.getChecksum](https://www.mathworks.com/help/simulink/slref/simulink.blockdiagram.getchecksum.html) |
| Official comparison | `visdiff(file1, file2)` returning a comparison object; `publish(comparison, reportFile)` | Documented | Returns a programmatic result object (no GUI required) suitable for CI; can export HTML/PDF/Word reports. Screenshot-based report elements require a display unless the model uses text-only/no-screenshot report generation available starting **R2022b**. | [visdiff](https://www.mathworks.com/help/matlab/ref/visdiff.html), [Compare and Merge Simulink Models](https://in.mathworks.com/help/simulink/slref/compare-and-merge-simulink-models.html) |
| Official GitHub PR comparison reference implementation | `mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests` | Official MathWorks sample repo | Provides ready `.yml`/`.m` files for both self-hosted (MATLAB pre-installed) and GitHub-hosted (batch-licensed) runners; directly informs our own workflow design. | [GitHub repo](https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests) |
| CI/CD MATLAB execution | `matlab-actions/setup-matlab@v3`, `matlab-actions/run-build@v3`, `matlab-actions/run-tests@v3`, `matlab-actions/run-command@v3` | Documented, official | `setup-matlab` supports GitHub-hosted (Linux/Windows/macOS) and self-hosted UNIX runners, MATLAB **R2021a or later**; `run-build` requires **R2022b+**. | [Use MATLAB with GitHub Actions](https://github.com/matlab-actions/.github) |
| CI licensing on GitHub-hosted runners | MATLAB Batch Licensing Executable (`matlab-batch`) / `MATLAB_BATCH_TOKEN` | **Pilot program, not GA** | Requires enrollment via the [Batch Licensing Pilot Eligibility form](https://www.mathworks.com/support/batch-tokens.html); batch tokens cannot drive the MATLAB Engine API — only non-interactive `-batch`-style invocation. Self-hosted runners with a standard network/individual license remain the only fully supported path today for Engine-API-style integration. | [MATLAB Batch Licensing Executable](https://github.com/mathworks-ref-arch/matlab-dockerfile/blob/main/alternates/non-interactive/MATLAB-BATCH.md), [Matlab licensing for GitHub Actions (MathWorks Answers)](https://www.mathworks.com/matlabcentral/answers/2175279-matlab-licensing-for-github-actions/) |
| Release compatibility / model upgrade | `Simulink.exportToVersion`, Upgrade Advisor, Project Upgrade Tool | Documented | Newer-format models are not directly openable in older releases; export to an explicit target release replaces unsupported blocks with masked placeholders — extraction must detect and report such placeholders rather than treating them as semantically equivalent originals. | [Simulink.exportToVersion](https://www.mathworks.com/help/simulink/slref/simulink.exporttoversion.html), [Upgrade Models Using Upgrade Advisor](https://www.mathworks.com/help/simulink/ug/consult-the-upgrade-advisor.html) |
| Untrusted callbacks/custom code risk | — | Documented risk guidance | MathWorks explicitly documents that untrusted custom code, custom targets, and callbacks can modify designs, exfiltrate IP/data, or corrupt models; recommends reviewing/limiting such code before execution and using model protection features for sensitive exchange. | [Untrusted Custom Code, Custom Targets, and Callbacks](https://www.mathworks.com/help/rtw/ug/use-of-untrusted-custom-code-custom-targets-and-callbacks.html), [Model Protection](https://www.mathworks.com/help/rtw/model-protection.html) |

## 2. Recommended implementation sequence

1. **Pre-flight, no MATLAB execution.** Validate SLX package integrity (OPC/zip structure), inventory parts, and hash the artifact — this is what `extract/opc.py` already targets and requires no callback execution.
2. **Controlled load.** `load_system` (not `open_system`, no Editor/display needed) inside an isolated runner. Before or immediately after load, read and, where the untrusted-input policy requires, clear `PreLoadFcn`/`PostLoadFcn`/`InitFcn`/`StopFcn`/`CloseFcn` via `get_param`/`set_param`, and record their pre-clear text as an unresolved/diagnostic artifact rather than executing it blindly.
3. **Static structural extraction.** `find_system` (with `'FindAll','on'` for ports/lines) plus `get_param` for documented block, port, line, and model-configuration parameters. Enumerate available parameters per object via `get_param(obj,'ObjectParameters')` rather than a hardcoded list, to stay resilient across releases.
4. **Top-level interface extraction.** Depth-1 `Inport`/`Outport` blocks; capture declared `DataType`, `PortDimensions`, `SampleTime`, `Unit`. Mark values as `declared` vs. requiring compilation.
5. **Optional compiled-attribute pass (higher trust tier).** Only for trusted/first-party models or hardened runners: bracket `model([],[],[],'compile')` / `'term'` (always in a `try/finally`-equivalent) to read `CompiledPortDataTypes`/`CompiledPortDimensions`/`CompiledSampleTime`. Document this as a distinct, higher-risk extraction phase, since compiling can execute more model logic than a static load.
6. **Reference resolution.** `find_mdlrefs` for model references, `Simulink.findLibraryLinks` for library links, `Simulink.data.dictionary.open`/`getSection`/`DataSources` for data dictionaries — each recursively, each under the same load/callback controls, and each reporting unresolved references explicitly.
7. **Stateflow extraction (if licensed/present).** `sfroot` → `Stateflow.Machine` for the model → recursive `find`/traversal of charts, states, transitions, data.
8. **Requirements links (if Requirements Toolbox licensed/present).** `slreq.find`/link APIs; treat absence of the product as `unsupported`, not a failure.
9. **Identity assignment.** Use `SID` plus path/block-type/port-signature/neighbor heuristics for matching; never depend on undocumented `SIDHighWatermark`, and prefer documented handles/paths over `Simulink.ID.getSID`.
10. **Optional whole-model checksum pre-check.** `Simulink.BlockDiagram.getChecksum` as a cheap gate before full extraction/diff on large batches.
11. **Optional supporting evidence.** `visdiff` between two model files, exported to a report, attached as supplementary (non-authoritative) evidence per `docs/architecture.md`.
12. **Close.** `close_system(model, 0)` (discard) in all paths, including error paths, for every model and referenced model loaded.

## 3. Documented limitations to design around

- **`InitFcn` never runs on load/open** — only on simulate or update-diagram — so any semantics that depend on `InitFcn`-set workspace variables are unavailable to a load-only extractor without an explicit, controlled update/compile step.
- **Compiled attributes require entering/exiting compiled mode**, which is a strictly more invasive operation than a static parse and must be opt-in and always terminated, including on exceptions.
- **No supported "disable all callbacks on load" switch.** Each callback parameter is inspected/cleared individually; recursively loaded model references and libraries carry their own callbacks that need the same treatment.
- **SID is not guaranteed permanently stable** across all editing operations, and the internal watermark mechanism is undocumented; identity matching must be resilient to SID churn.
- **Stateflow and Requirements Toolbox access require separate product licenses**; their absence must degrade extraction status to `unsupported` for the relevant elements, not fail the whole run.
- **Screenshot-based comparison reports need a display** (or Xvfb) prior to R2022b's no-screenshot report option; CI runners without a display must budget for this.
- **GitHub-hosted MATLAB batch licensing is a pilot program**, not general availability, and batch tokens cannot drive Engine-API-style automation — only self-hosted runners with conventional licenses are fully supported for that path today.
- **`Simulink.exportToVersion` replaces unsupported blocks with masked placeholders** when downgrading release format; an extractor must detect placeholder/masked substitutions rather than reporting them as the original semantics.
- **`visdiff`/comparison-object internals (e.g., any `Simulink.compare.internal.*` class) are not officially documented for external use** — only `visdiff` and its returned comparison object's documented methods should be relied upon.

## 4. Security controls implied by the documentation (mapped to `docs/security.md`)

- MathWorks documents real risk from **untrusted custom code, custom targets, and callbacks**: unauthorized data access/exfiltration, unintended design modification, and data destruction. This directly supports `docs/security.md`'s isolated, disposable, minimum-credential runner requirement for any model coming from an untrusted PR.
- Because callback suppression is per-parameter and not a single documented switch, the runner must implement (and be able to prove) a deny-by-default callback policy: read the callback text, decide per policy whether to execute, and record any callback body left un-executed as a diagnostic — matching `docs/security.md`'s "deny-by-default callback and dependency policy... document that fact and raise the isolation level rather than silently executing them."
- Recursive model-reference/library/data-dictionary loading multiplies the untrusted-code surface area; the same controls (deny-by-default callbacks, network egress restriction, bounded execution time) must apply transitively, not just to the top model.
- MathWorks' own model-protection guidance (encrypted/protected model packaging, restricting recipient capabilities) is relevant if this project ever needs to safely accept protected/proprietary third-party models rather than only plain-text SLX.
- Batch-licensing tokens and self-hosted-runner license servers are secrets equivalent to production credentials; per `docs/security.md`, they must not be exposed to fork-PR workflows without the same secret-isolation treatment as any other credential.

## 5. GitHub Actions / CI reference points

- Official MathWorks sample workflow (`mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests`) ships both a self-hosted-runner path (MATLAB pre-installed, keeps repo private) and a GitHub-hosted-runner path (requires batch licensing) — a strong template for our own comparison/report-attachment workflow: https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests
- `matlab-actions/setup-matlab@v3` supports GitHub-hosted Linux/Windows/macOS and self-hosted UNIX runners, MATLAB R2021a+: https://github.com/matlab-actions/.github
- `matlab-actions/run-build@v3` requires MATLAB R2022b+.
- Batch licensing pilot signup and `matlab-batch` executable: https://github.com/mathworks-ref-arch/matlab-dockerfile/blob/main/alternates/non-interactive/MATLAB-BATCH.md and https://www.mathworks.com/support/batch-tokens.html

## 6. Source links (primary references)

MathWorks official documentation:
- https://www.mathworks.com/help/simulink/slref/load_system.html
- https://www.mathworks.com/help/simulink/slref/open_system.html
- https://www.mathworks.com/help/simulink/slref/close_system.html
- https://www.mathworks.com/help/simulink/ug/model-callbacks.html
- https://www.mathworks.com/help/simulink/callback-functions.html
- https://www.mathworks.com/help/simulink/slref/find_system.html
- https://www.mathworks.com/help/simulink/ug/find-models-and-model-elements-programmatically.html
- https://www.mathworks.com/help/simulink/slref/get_param.html
- https://www.mathworks.com/help/simulink/ug/programmatic-specification.html
- https://www.mathworks.com/help/simulink/slref/find_mdlrefs.html
- https://www.mathworks.com/help/simulink/slref/visualizing-model-reference-architectures.html
- https://www.mathworks.com/help/simulink/slref/pathstoreferencedmodel.html
- https://www.mathworks.com/help/simulink/slref/simulink.findlibrarylinks.html
- https://www.mathworks.com/help/simulink/slref/simulink.data.dictionary.html
- https://www.mathworks.com/help/simulink/ug/store-data-in-dictionary-programmatically.html
- https://www.mathworks.com/help/slrequirements/gs/author-import-link-and-justify-requirements-programmatically.html
- https://www.mathworks.com/help/slrequirements/create-links.html
- https://www.mathworks.com/help/stateflow/programmatic-interface.html
- https://www.mathworks.com/help/stateflow/ug/overview-of-stateflow-objects.html
- https://www.mathworks.com/help/simulink/slref/simulink.id.getsid.html
- https://www.mathworks.com/help/simulink/slref/simulink.blockdiagram.getchecksum.html
- https://www.mathworks.com/help/matlab/ref/visdiff.html
- https://in.mathworks.com/help/simulink/slref/compare-and-merge-simulink-models.html
- https://www.mathworks.com/help/simulink/slref/simulink.exporttoversion.html
- https://www.mathworks.com/help/simulink/ug/consult-the-upgrade-advisor.html
- https://www.mathworks.com/help/rtw/ug/use-of-untrusted-custom-code-custom-targets-and-callbacks.html
- https://www.mathworks.com/help/rtw/model-protection.html

MathWorks official GitHub / CI resources:
- https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests
- https://github.com/matlab-actions/.github
- https://github.com/matlab-actions/setup-matlab
- https://github.com/matlab-actions/run-build
- https://github.com/matlab-actions/run-tests
- https://github.com/matlab-actions/run-command
- https://github.com/mathworks-ref-arch/matlab-dockerfile/blob/main/alternates/non-interactive/MATLAB-BATCH.md
- https://www.mathworks.com/support/batch-tokens.html

MathWorks community/answers (supporting, non-authoritative but corroborating):
- https://www.mathworks.com/matlabcentral/answers/2175279-matlab-licensing-for-github-actions/
- https://www.mathworks.com/matlabcentral/answers/1943404-where-can-i-find-simulink-block-element-identifier

## 7. Notes and open items

- Direct `www.mathworks.com/help/...` fetches from this environment returned HTTP 403 (bot protection); all citations above were corroborated through search-engine-indexed summaries of the same official pages plus direct fetches of the official MathWorks GitHub repositories (`mathworks/*`, `matlab-actions/*`, `mathworks-ref-arch/*`), which fetched successfully and are equally authoritative (MathWorks-owned organizations). A follow-up pass with authenticated/allow-listed access to `mathworks.com/help` would let the exact per-release argument tables be quoted verbatim.
- One secondary search surfaced a claim about a "Digital Thread URI" persistent-identifier API supposedly introduced in a recent Simulink release; this could not be independently verified against a directly fetched MathWorks page in this session, so it is **omitted from the capability matrix** and should be re-verified against the current release notes before being relied upon.
- Exact per-release argument/parameter tables (e.g., which `get_param` parameters exist in which MATLAB release) should be pinned to the specific supported-release matrix chosen in `context/reference.md` §12.3, and re-validated against that release's own help pages once a runner with real MATLAB/Simulink access is available for compatibility testing.
