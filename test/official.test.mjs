import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"
import { fromMarkdown } from "../dist/from-markdown.esm.js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function loadSpecCases() {
  const cases = []
  for (const file of ["commonmark.0.31.2.json", "gfm.0.29.json"]) {
    for (const test of JSON.parse(readFileSync(resolve(root, "test/specs", file), "utf8"))) {
      if (test.shouldFail) continue
      cases.push({
        file,
        example: test.example,
        markdown: test.markdown,
        gfm: file.startsWith("gfm"),
      })
    }
  }
  return cases
}

describe("official CommonMark + GFM corpus", () => {
  it("parses all 660 cases to an mdast root", () => {
    const cases = loadSpecCases()
    const fail = []
    for (const test of cases) {
      try {
        const tree = fromMarkdown(test.markdown, {
          gfm: test.gfm,
          allowDangerousHtml: true,
        })
        if (tree?.type !== "root" || !Array.isArray(tree.children)) {
          fail.push(`${test.file}#${test.example}`)
        }
      } catch {
        fail.push(`${test.file}#${test.example}`)
      }
    }
    assert.equal(fail.length, 0, fail.slice(0, 12).join(", "))
    assert.equal(cases.length, 660)
  })
})
