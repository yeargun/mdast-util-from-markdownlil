import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"
import { fromMarkdown as upstreamFromMarkdown } from "mdast-util-from-markdown"
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

  it("keeps reference links and resource images", () => {
    const tree = fromMarkdown("[x][id]\n\n![y](https://img.test/a.png \"cap\")\n\n[id]: https://ok.com \"T\"")
    assert.equal(tree.children[0].children[0].type, "linkReference")
    assert.equal(tree.children[0].children[0].identifier, "id")
    assert.equal(tree.children[0].children[0].referenceType, "full")
    assert.equal(tree.children[1].children[0].type, "image")
    assert.equal(tree.children[1].children[0].url, "https://img.test/a.png")
    assert.equal(tree.children[1].children[0].alt, "y")
    assert.equal(tree.children[2].type, "definition")
    assert.equal(tree.children[2].url, "https://ok.com")
  })

  it("leaves GFM tables as text without extensions", () => {
    const tree = fromMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |")
    assert.equal(tree.children[0].type, "paragraph")
  })

  it("leaves task markers as text without extensions", () => {
    const tree = fromMarkdown("- [ ] open\n- [x] done")
    const list = tree.children[0]
    assert.equal(list.type, "list")
    assert.equal(list.children[0].checked, null)
    assert.equal(list.children[0].children[0].children[0].value.includes("[ ]"), true)
  })

  it("leaves strikethrough markers as text without extensions", () => {
    const tree = fromMarkdown("~~gone~~")
    assert.equal(tree.children[0].children[0].type, "text")
    assert.equal(tree.children[0].children[0].value, "~~gone~~")
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

  it("matches upstream property insertion order", () => {
    const tree = fromMarkdown("# heading\n\n[link](url)\n\n- item")

    assert.deepEqual(Object.keys(tree.children[0]), ["type", "depth", "children", "position"])
    assert.deepEqual(Object.keys(tree.children[1].children[0]), [
      "type",
      "title",
      "url",
      "children",
      "position",
    ])
    assert.deepEqual(Object.keys(tree.children[2]), [
      "type",
      "ordered",
      "start",
      "spread",
      "children",
      "position",
    ])
    assert.deepEqual(Object.keys(tree.children[2].children[0]), [
      "type",
      "spread",
      "checked",
      "children",
      "position",
    ])
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
  it("keeps host-visible keys in the library artifact", () => {
    const src = readFileSync(resolve(root, "dist/from-markdown.esm.js"), "utf8")
    assert.match(src, /mdastExtensions/)
    assert.match(src, /extensions/)
    assert.match(src, / as fromMarkdown/)
  })
})

describe("large lists", () => {
  it("parses a wide list", () => {
    const wideCount = 1000
    const tree = fromMarkdown("- a\n".repeat(wideCount))

    assert.equal(tree.children[0].type, "list")
    assert.equal(tree.children[0].children.length, wideCount)
    assert.equal(tree.children[0].children[wideCount - 1].position.start.line, wideCount)
  })

  it("matches upstream for wide tight lists", () => {
    const markdown = "- a\n".repeat(1000)
    assert.deepEqual(fromMarkdown(markdown), upstreamFromMarkdown(markdown))
  })

  it("matches upstream for wide loose lists", () => {
    const markdown = "- a\n\n".repeat(1000)
    assert.deepEqual(fromMarkdown(markdown), upstreamFromMarkdown(markdown))
  })
})
