import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { refModelExt, scanModelStructure } from "data-explorer-core";

const SCANNER_VERSION = "0.1.0";
const SUPPORTED = new Set([".slx", ".mdl", ".sldd", ".mat"]);
const MAX_FILES = 10_000;
const MAX_FILE_BYTES = 512 * 1024 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

function normalizePath(value) {
    return value.replaceAll("\\", "/").replace(/^\.\/+/, "");
}

function kindFor(path) {
    const extension = extname(path).toLowerCase();
    if (extension === ".slx" || extension === ".mdl") return "model";
    if (extension === ".sldd") return "data-dictionary";
    if (extension === ".mat") return "mat-file";
    return "unknown";
}

function arrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

async function filesUnder(root, directory = root) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...await filesUnder(root, path));
        } else if (entry.isFile() && SUPPORTED.has(extname(entry.name).toLowerCase())) {
            files.push({ absolute: path, relative: normalizePath(relative(root, path)) });
        }
    }
    return files;
}

function modelEdges(path, structure) {
    const edges = [];
    const extension = refModelExt(path);
    for (const reference of structure.modelReferences ?? []) {
        const name = reference?.modelName;
        if (typeof name !== "string" || !name) continue;
        edges.push({
            source: path,
            target: extname(name) ? name : `${name}${extension}`,
            type: "model-reference",
        });
    }
    if (typeof structure.dataDictionary === "string" && structure.dataDictionary) {
        edges.push({
            source: path,
            target: structure.dataDictionary,
            type: "data-dictionary",
        });
    }
    for (const source of structure.externalDataSources ?? []) {
        if (typeof source !== "string" || !source) continue;
        edges.push({
            source: path,
            target: source,
            type: extname(source).toLowerCase() === ".sldd"
                ? "data-dictionary"
                : "external-data",
        });
    }
    return edges;
}

export async function scan(root) {
    const nodes = [];
    const edges = [];
    const errors = [];
    const files = await filesUnder(root);
    if (files.length > MAX_FILES) {
        throw new Error(`Workspace contains ${files.length} supported files; limit is ${MAX_FILES}.`);
    }
    let totalBytes = 0;
    for (const file of files) {
        nodes.push({ path: file.relative, kind: kindFor(file.relative) });
        if (kindFor(file.relative) !== "model") continue;
        try {
            const info = await stat(file.absolute);
            totalBytes += info.size;
            if (info.size > MAX_FILE_BYTES) {
                throw new Error("Model exceeds the 512 MiB structural scan limit.");
            }
            if (totalBytes > MAX_TOTAL_BYTES) {
                throw new Error("Models exceed the 1 GiB total structural scan limit.");
            }
            const bytes = await readFile(file.absolute);
            const structure = scanModelStructure(arrayBuffer(bytes), file.relative);
            edges.push(...modelEdges(file.relative, structure));
        } catch (error) {
            errors.push({
                path: file.relative,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    nodes.sort((left, right) => left.path.localeCompare(right.path));
    edges.sort((left, right) =>
        `${left.source}\0${left.type}\0${left.target}`.localeCompare(
            `${right.source}\0${right.type}\0${right.target}`,
        ),
    );
    errors.sort((left, right) => left.path.localeCompare(right.path));
    return {
        schemaVersion: "0.1.0",
        scanner: {
            name: "data-explorer-core",
            version: "1.32.0",
            wrapperVersion: SCANNER_VERSION,
            trust: "structural-non-semantic",
        },
        status: errors.length ? "partial" : "complete",
        nodes,
        edges,
        errors,
    };
}

async function main() {
    if (process.argv.includes("--help")) {
        process.stdout.write("Usage: scanner.mjs --root <directory>\n");
        return;
    }
    const rootIndex = process.argv.indexOf("--root");
    if (rootIndex < 0 || !process.argv[rootIndex + 1]) {
        throw new Error("--root is required");
    }
    process.stdout.write(`${JSON.stringify(await scan(process.argv[rootIndex + 1]))}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    });
}
