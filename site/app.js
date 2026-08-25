function $(id) { return document.getElementById(id) }
function copyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy)
      button.textContent = "copied"
      setTimeout(() => { button.textContent = "copy" }, 1200)
    })
  }
}
function samples(items, apply) {
  const root = $("samples")
  for (const item of items) {
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = item.label
    button.addEventListener("click", () => apply(item.value))
    root.append(button)
  }
}
function showText(value) {
  $("output").hidden = false
  $("output").textContent = value
  $("preview").hidden = true
  $("frame").hidden = true
}
function showHtml(html) {
  $("output").hidden = false
  $("output").textContent = html
  $("preview").hidden = true
  $("frame").hidden = false
  $("frame").srcdoc = `<!doctype html><style>body{font:16px/1.55 system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px 8px}blockquote{border-left:3px solid #e3b341;padding-left:12px;color:#555}</style>${html}`
}
function showPreview(html) {
  $("output").hidden = false
  $("preview").hidden = false
  $("frame").hidden = true
  $("preview").innerHTML = html
}
copyButtons()

import { fromMarkdown } from "./from-markdown.js"
const input = $("input")
const gfm = Object.assign(document.createElement("label"), { innerHTML: '<input type="checkbox" id="gfm" checked> gfm' })
$("toggles").append(gfm)
samples([
  { label: "heading", value: "# Hello\n\nA paragraph with **bold** and *em*." },
  { label: "table", value: "| a | b |\n| --- | --- |\n| 1 | 2 |" },
  { label: "refs", value: "[x][id]\n\n[id]: https://ok.com \"T\"" },
], (value) => { input.value = value; render() })
input.value = "# from-markdown\n\n- [x] task\n- item\n\n[site](https://yeargun.github.io/mdast-util-from-markdownlil/)\n"
function render() {
  try {
    showText(JSON.stringify(fromMarkdown(input.value, { gfm: $("gfm").checked }), null, 2))
  } catch (error) {
    showText(String(error))
  }
}
input.addEventListener("input", render)
$("gfm").addEventListener("change", render)
render()
