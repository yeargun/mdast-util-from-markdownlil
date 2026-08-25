# @itslil/mdast-util-from-markdown

mdast-util-from-markdown reimplemented in LilScript. This is **not** the official [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown) package.

**Site:** [yeargun.github.io/mdast-util-from-markdownlil/](https://yeargun.github.io/mdast-util-from-markdownlil/)

```sh
npm install @itslil/mdast-util-from-markdown
```

Two compiles ship from the same `.lil` source:

| Lane | Config | Meaning |
| --- | --- | --- |
| **library** (npm) | `lilscript.toml` · `--target js-module` | reusable ESM. Export names and `extern class` keys stay. |
| **closed** | `lilscript.closed.toml` · `--target js-module` | closed LilScript world. `extern class` keys may mangle. ESM export names stay so the lane is testable. |

You publish the library lane. The closed artifact is `dist/from-markdown.closed.js`.

The LilScript compiler lives next door at `../lilscript`.
