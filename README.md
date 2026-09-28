# @itslil/mdast-util-from-markdown

Official [`mdast-util-from-markdown@2.0.3`](https://github.com/syntax-tree/mdast-util-from-markdown) algorithms rewritten in LilScript. Official test suite 724/724. Not affiliated with upstream.

**Site:** [yeargun.github.io/mdast-util-from-markdownlil/](https://yeargun.github.io/mdast-util-from-markdownlil/)

```sh
npm install @itslil/mdast-util-from-markdown
```

Two compiles ship from the same `.lil` source:

| Lane | Config | Meaning |
| --- | --- | --- |
| **library** (npm) | `lilscript.toml` · `--target js-module` | reusable ESM. Export names and `extern class` keys stay. |
| **closed** | `lilscript.closed.toml` · `--target js-module` | closed LilScript world. This compiler renames no properties, so `extern class` keys stay here too; the lane differs in its optimizer settings. ESM export names stay so the lane is testable. |

You publish the library lane. The closed artifact is `dist/from-markdown.closed.js`.

## Size and compile time

Every delivered file is written by the LilScript compiler (revision `aa2052f0`, one
compiler); the build adds a license banner and, for CommonJS and the browser script, a
module wrapper. No minifier runs after the compiler. Measured with `lilscript-codec`
(Brotli-11 / gzip-9 / raw); the bars are the official `mdast-util-from-markdown@2.0.3`
runtime graph (micromark 4.0.3, as a fresh install resolves it) bundled by esbuild, then minified. The Node graph is the like-for-like bar:
it decodes named character references from an entity table, as this port does. Upstream's
browser graph decodes them through the DOM and ships no table; against it this port loses.

| File | Brotli-11 | gzip-9 | Raw |
| --- | ---: | ---: | ---: |
| `dist/from-markdown.esm.js` (npm) | **22,653** | 26,694 | 72,106 |
| `dist/from-markdown.closed.js` | 22,658 | 26,836 | 74,384 |
| Official Node graph, Terser (mangle on) | 23,436 | 27,170 | 84,774 |
| Official Node graph, esbuild minify | 24,605 | 28,399 | 93,149 |
| Official browser graph (no entity table), Terser | 13,672 | 15,329 | 56,143 |

Compiling `src/entry.lil` for the npm file takes about 2.4 s of wall time (2407.3 / 2413.5 / 2373.1
ms over three clean builds). `npm run record:release` re-measures all of this into
`site/results.json`.

The LilScript compiler lives next door at `../lilscript`.
