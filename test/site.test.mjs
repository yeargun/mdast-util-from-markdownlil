import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

describe("site", () => {
  it("has a markedlil-style lab with receipts", () => {
    assert.equal(existsSync(resolve(root, "site/index.html")), true)
    assert.equal(existsSync(resolve(root, "site/app.js")), true)
    assert.equal(existsSync(resolve(root, "site/results.json")), true)
    const html = readFileSync(resolve(root, "site/index.html"), "utf8")
    const results = JSON.parse(readFileSync(resolve(root, "site/results.json"), "utf8"))
    const library = results.size.find(({ id }) => id === "itslil")
    assert.match(html, /scoreboard/)
    assert.match(html, /#evidence/)
    assert.match(html, /#lab/)
    assert.match(html, /id="compiler"/)
    assert.equal(library.raw, readFileSync(resolve(root, "dist/from-markdown.esm.js")).byteLength)
  })

  it("records the compiler run it shows", () => {
    const data = JSON.parse(readFileSync(resolve(root, "site/results.json"), "utf8"))
    assert.match(data.compiler.revision, /^[0-9a-f]{7,40}$/)
    assert.match(data.compiler.binarySha256, /^[0-9a-f]{64}$/)
    assert.equal(data.compiler.compileWallMs.length >= 3, true)
    for (const sample of [...data.compiler.compileWallMs, ...data.compiler.buildCompileWallMs]) {
      assert.equal(Number.isFinite(sample) && sample > 0, true)
    }
  })

  it("shows the sizes of the files that ship", () => {
    const data = JSON.parse(readFileSync(resolve(root, "site/results.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"))
    const shipped = manifest.files.filter((path) => /^dist\/.*\.(c?js)$/.test(path)).sort()
    assert.deepEqual(data.delivered.map((file) => file.path).sort(), shipped)
    for (const file of data.delivered) {
      assert.equal(file.writtenBy, "compiler", file.path)
      // The recorded sizes are of the committed files, not of an earlier build.
      assert.equal(statSync(resolve(root, file.path)).size, file.raw, file.path)
    }
    const esm = data.delivered.find((file) => file.path === "dist/from-markdown.esm.js")
    const lane = data.size.find((row) => row.id === "itslil")
    assert.deepEqual([lane.raw, lane.gzip9, lane.brotli11], [esm.raw, esm.gzip9, esm.brotli11])
    const closed = data.delivered.find((file) => file.path === "dist/from-markdown.closed.js")
    const closedLane = data.size.find((row) => row.id === "itslil-closed")
    assert.deepEqual([closedLane.raw, closedLane.gzip9, closedLane.brotli11], [closed.raw, closed.gzip9, closed.brotli11])
    // The comparison page measures the file that ships.
    assert.equal(
      readFileSync(resolve(root, "site/esm-comparison/lilscript.js")).equals(readFileSync(resolve(root, "dist/from-markdown.esm.js"))),
      true,
    )
  })
})
