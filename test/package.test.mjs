import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import { describe, it } from "node:test"
import { fromMarkdown } from "@itslil/mdast-util-from-markdown"

const require = createRequire(import.meta.url)

describe("package artifacts", () => {
  it("loads the ESM and CommonJS exports", () => {
    const commonjs = require("@itslil/mdast-util-from-markdown")

    assert.equal(typeof fromMarkdown, "function")
    assert.equal(typeof commonjs.fromMarkdown, "function")
    assert.deepEqual(commonjs.fromMarkdown("# cjs"), fromMarkdown("# cjs"))
  })

  it("loads the closed export", async () => {
    const closed = await import("@itslil/mdast-util-from-markdown/closed")

    assert.equal(typeof closed.fromMarkdown, "function")
    assert.deepEqual(closed.fromMarkdown("# closed"), fromMarkdown("# closed"))
  })

  it("exposes a callable UMD global", () => {
    const context = { TextDecoder }
    const source = readFileSync(new URL("../dist/from-markdown.umd.js", import.meta.url), "utf8")

    runInNewContext(source, context)
    assert.equal(typeof context.fromMarkdown, "function")
    assert.equal(context.fromMarkdown("# umd").children[0].type, "heading")
  })
})
