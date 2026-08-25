import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"
import { fromMarkdown } from "../dist/from-markdown.esm.js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

describe("fromMarkdown", () => {
  it("parses headings", () => {
    const tree = fromMarkdown("# Hello")
    assert.equal(tree.type, "root")
    assert.equal(tree.children[0].type, "heading")
    assert.equal(tree.children[0].depth, 1)
    assert.equal(tree.children[0].children[0].type, "text")
    assert.equal(tree.children[0].children[0].value, "Hello")
  })

  it("parses lists", () => {
    const tree = fromMarkdown("- one\n- two")
    assert.equal(tree.children[0].type, "list")
    assert.equal(tree.children[0].ordered, false)
    assert.equal(tree.children[0].children.length, 2)
    assert.equal(tree.children[0].children[0].type, "listItem")
  })

  it("parses fenced code", () => {
    const tree = fromMarkdown("```js\nfoo()\n```")
    assert.equal(tree.children[0].type, "code")
    assert.equal(tree.children[0].lang, "js")
    assert.equal(tree.children[0].value, "foo()")
  })

  it("parses links", () => {
    const tree = fromMarkdown("[hi](https://example.com \"t\")")
    const para = tree.children[0]
    assert.equal(para.type, "paragraph")
    assert.equal(para.children[0].type, "link")
    assert.equal(para.children[0].url, "https://example.com")
    assert.equal(para.children[0].title, "t")
    assert.equal(para.children[0].children[0].value, "hi")
  })

  it("resolves reference links and images", () => {
    const tree = fromMarkdown("[x][id]\n\n![y](https://img.test/a.png \"cap\")\n\n[id]: https://ok.com \"T\"")
    assert.equal(tree.children[0].children[0].type, "link")
    assert.equal(tree.children[0].children[0].url, "https://ok.com")
    assert.equal(tree.children[0].children[0].title, "T")
    assert.equal(tree.children[1].children[0].type, "image")
    assert.equal(tree.children[1].children[0].url, "https://img.test/a.png")
    assert.equal(tree.children[1].children[0].alt, "y")
    assert.equal(tree.children[2].type, "definition")
  })

  it("parses gfm tables", () => {
    const tree = fromMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |", { gfm: true })
    assert.equal(tree.children[0].type, "table")
    assert.equal(tree.children[0].children[0].type, "tableRow")
    assert.equal(tree.children[0].children[0].children[0].type, "tableCell")
  })

  it("parses task list items", () => {
    const tree = fromMarkdown("- [ ] open\n- [x] done", { gfm: true })
    const list = tree.children[0]
    assert.equal(list.type, "list")
    assert.equal(list.children[0].checked, false)
    assert.equal(list.children[1].checked, true)
  })

  it("parses strikethrough", () => {
    const tree = fromMarkdown("~~gone~~", { gfm: true })
    assert.equal(tree.children[0].children[0].type, "delete")
    assert.equal(tree.children[0].children[0].children[0].value, "gone")
  })

  it("leaves dollar math as text for remark-math to split", () => {
    const inline = fromMarkdown("has $a+b$")
    const text = inline.children[0].children.map((node) => node.value ?? "").join("")
    assert.match(text, /\$a\+b\$/)
  })

  it("keeps link urls in the tree (sanitize later, at HTML time)", () => {
    const tree = fromMarkdown("[x](javascript:alert(1))")
    assert.equal(tree.children[0].children[0].type, "link")
    assert.equal(tree.children[0].children[0].url, "javascript:alert(1)")
  })
})

describe("closed", () => {
  it("exists and still returns a root", async () => {
    assert.equal(existsSync(resolve(root, "dist/from-markdown.closed.js")), true)
    const closed = await import("../dist/from-markdown.closed.js")
    assert.equal(closed.fromMarkdown("# x").type, "root")
  })
})

describe("pins", () => {
  it("keeps option keys in the library artifact", () => {
    const src = readFileSync(resolve(root, "dist/from-markdown.esm.js"), "utf8")
    assert.match(src, /gfm/)
    assert.match(src, /breaks/)
    assert.match(src, /allowDangerousHtml/)
    assert.match(src, / as fromMarkdown/)
  })
})
