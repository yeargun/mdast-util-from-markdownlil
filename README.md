# @itslil/mdast-util-from-markdown

Official [`mdast-util-from-markdown@2.0.3`](https://github.com/syntax-tree/mdast-util-from-markdown) algorithms rewritten in LilScript. Official test suite 740/740. Not affiliated with upstream.

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
