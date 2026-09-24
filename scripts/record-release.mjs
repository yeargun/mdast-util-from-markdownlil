// Records a release build for the site: the compiler's wall time, the sizes of
// every delivered file, the official suite and a throughput sample.
//
//   LILSCRIPT_COMPILER=... LILSCRIPT_CODEC=... \
//     node scripts/record-release.mjs --revision <compiler source revision>
//
// It builds `--samples` times (default 3) with a clean compile each time, checks
// that every build wrote the same bytes, and rewrites the measured fields of
// site/results.json. Fields it does not measure (the official bars, the previous
// release, the playground) are kept as they are.
import { createHash } from "node:crypto"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execFileSync, spawnSync } from "node:child_process"
import { performance } from "node:perf_hooks"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const resultsPath = resolve(root, "site", "results.json")

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? fallback : process.argv[index + 1]
}

const compiler = process.env.LILSCRIPT_COMPILER
const codec = process.env.LILSCRIPT_CODEC
const revision = argument("revision")
const samples = Number(argument("samples", "3"))
if (!compiler || !codec) throw new Error("set LILSCRIPT_COMPILER and LILSCRIPT_CODEC to the pinned binaries")
if (!revision) throw new Error("pass --revision: the compiler's source revision")

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex")

// Every file a consumer can load, with the export condition that selects it.
const delivered = [
  { path: "dist/from-markdown.esm.js", condition: "import", wrapper: "license banner" },
  { path: "dist/from-markdown.cjs", condition: "require", wrapper: "license banner, CommonJS export object" },
  { path: "dist/from-markdown.umd.js", condition: "browser script (unpkg, jsdelivr)", wrapper: "license banner, function scope, global `fromMarkdown`" },
  { path: "dist/from-markdown.closed.js", condition: "./closed", wrapper: "none" },
]

const scratch = mkdtempSync(join(tmpdir(), "mdast-util-from-markdownlil-record-"))
const builds = []
try {
  for (let sample = 0; sample < samples; sample++) {
    const log = join(scratch, `compile-${sample}.jsonl`)
    const built = spawnSync(process.execPath, [resolve(root, "scripts", "build.mjs"), "--compile"], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, LILSCRIPT_COMPILE_LOG: log },
    })
    if (built.status !== 0) throw new Error(`build ${sample + 1} failed`)
    const invocations = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line))
    const hashes = delivered.map(({ path }) => sha256(resolve(root, path)))
    builds.push({ invocations, hashes })
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
for (const build of builds) {
  if (build.hashes.join() !== builds[0].hashes.join()) {
    throw new Error("the builds wrote different bytes; compile output is not deterministic")
  }
}

const shippedCompile = (build) =>
  build.invocations.find((entry) => entry.source === "src/entry.lil" && entry.config === "lilscript.toml")
const round = (value) => Math.round(value * 10) / 10

const measured = JSON.parse(
  execFileSync(codec, ["--json", ...delivered.map(({ path }) => resolve(root, path))], { encoding: "utf8" }),
)
const sizes = measured.artifacts.map(({ raw, gzip9, brotli11 }) => ({ raw, gzip9, brotli11 }))

// The official suite, and the package's own checks (the site's receipt test
// reads this file, so it runs after it is written, under `npm test`).
function runTests(files) {
  const suite = spawnSync(process.execPath, ["--test", ...files], { cwd: root, encoding: "utf8" })
  const count = (label) => Number(new RegExp(`^(?:ℹ|#) ${label} (\\d+)$`, "m").exec(suite.stdout)?.[1])
  const result = { total: count("tests"), pass: count("pass") }
  if (suite.status !== 0 || result.pass !== result.total) {
    throw new Error(`node --test ${files.join(" ")}: ${result.pass}/${result.total}`)
  }
  return result
}
const spec = {
  ...runTests(["test/official/index.js"]),
  label: "official suite",
  checks: runTests(["test/from-markdown.test.mjs", "test/package.test.mjs"]),
}

// Throughput: the CommonMark spec's examples as one document, parsed to mdast by
// the shipped ESM and by upstream's graph (site/official.js), alternating.
const { commonmark } = await import("commonmark.json")
const documentText = commonmark.map((example) => example.markdown).join("\n")
const lil = (await import(pathToFileURL(resolve(root, "dist", "from-markdown.esm.js")).href)).fromMarkdown
const official = (await import(pathToFileURL(resolve(root, "site", "official.js")).href)).fromMarkdown
if (JSON.stringify(lil(documentText)) !== JSON.stringify(official(documentText))) {
  throw new Error("the lanes disagree on the throughput document")
}
// The order alternates every round so neither lane always runs after the other.
const warmup = 3
const rounds = 60
const timings = { lil: [], official: [] }
for (let index = 0; index < warmup + rounds; index++) {
  const lanes = [["lil", lil], ["official", official]]
  if (index % 2) lanes.reverse()
  for (const [lane, run] of lanes) {
    const started = performance.now()
    run(documentText)
    if (index >= warmup) timings[lane].push(performance.now() - started)
  }
}
const median = (values) => [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)]

const data = JSON.parse(readFileSync(resultsPath, "utf8"))
const byPath = Object.fromEntries(delivered.map(({ path }, index) => [path, sizes[index]]))
for (const lane of data.size) {
  if (lane.id === "itslil") Object.assign(lane, byPath["dist/from-markdown.esm.js"])
  if (lane.id === "itslil-closed") Object.assign(lane, byPath["dist/from-markdown.closed.js"])
}
data.delivered = delivered.map(({ path, condition, wrapper }, index) => ({
  path,
  condition,
  writtenBy: "compiler",
  wrapper,
  ...sizes[index],
}))
data.spec = spec
data.node = process.version
data.runtime = `Node ${process.version}`
data.throughput = [
  { id: "official", name: data.pin, documentMs: Math.round(median(timings.official) * 100) / 100 },
  { id: "itslil", name: data.package, documentMs: Math.round(median(timings.lil) * 100) / 100 },
]
data.throughputDocument = `the CommonMark spec's ${commonmark.length} examples as one document (${documentText.length} characters)`
data.warmupDiscard = warmup
data.compiler = {
  revision,
  binarySha256: sha256(compiler),
  codecSha256: sha256(codec),
  compileWallMs: builds.map((build) => round(shippedCompile(build).wallMs)),
  buildCompileWallMs: builds.map((build) => round(build.invocations.reduce((sum, entry) => sum + entry.wallMs, 0))),
  invocations: builds[0].invocations.map(({ source, config, output }) => ({ source, config, output })),
  compileScope: "wall time of the compiler process for src/entry.lil with lilscript.toml, the shipped ESM",
  buildScope: `wall time of all ${builds[0].invocations.length} compiler processes of one clean build`,
  date: new Date().toISOString().slice(0, 10),
}
writeFileSync(resultsPath, `${JSON.stringify(data, null, 2)}\n`)
console.log(
  `recorded: esm ${byPath["dist/from-markdown.esm.js"].brotli11} Brotli, compile ${data.compiler.compileWallMs.join("/")} ms, build ${data.compiler.buildCompileWallMs.join("/")} ms, official suite ${spec.pass}/${spec.total}, checks ${spec.checks.pass}/${spec.checks.total}, throughput ${data.throughput[1].documentMs} vs ${data.throughput[0].documentMs} ms`,
)
