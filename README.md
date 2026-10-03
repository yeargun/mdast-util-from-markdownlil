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
| **closed** | `lilscript.closed.toml` · `--target js-module` | closed LilScript world. Declared public and extern field names are preserved. ESM export names stay so the lane is testable. |

You publish the library lane. The closed artifact is `dist/from-markdown.closed.js`.

## Comparison with the original

See [COMPARISON.md](COMPARISON.md) for current raw-, gzip- and Brotli-objective builds, minified upstream comparisons, build times and validation.

[Download the checked repository package](https://yeargun.github.io/mdast-util-from-markdownlil/downloads/package.tgz) · [Package files, hashes and validation](https://yeargun.github.io/mdast-util-from-markdownlil/package-build.json). npm publication is independent.
