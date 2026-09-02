# Upstream source map

The implementation is audited against `mdast-util-from-markdown@2.0.3`
(`f9ef1b396227466c4d54ffbd581dfc702dac0cf6`) and the dependency versions
resolved in that pinned checkout.

| LilScript source | Upstream source |
| --- | --- |
| `src/entry.lil` | `mdast-util-from-markdown@2.0.3/dev/index.js` |
| `src/from-markdown.lil` | `mdast-util-from-markdown@2.0.3/dev/lib/index.js` |
| `src/to-string.lil` | `mdast-util-to-string@4.0.0/lib/index.js` |
| `src/stringify-position.lil` | `unist-util-stringify-position@4.0.0/lib/index.js` |
| `src/micromark/character-entities.lil` | `character-entities@2.0.2` |
| `src/micromark/decode-named.lil` | `decode-named-character-reference@1.3.0` |
| `src/micromark/constructs.lil`, `create-tokenizer.lil`, `parse.lil`, `postprocess.lil`, `preprocess.lil`, `initialize/**` | `micromark@4.0.2` |
| `src/micromark/core/**` | `micromark-core-commonmark@2.0.3` |
| `src/micromark/factory-destination.lil` | `micromark-factory-destination@2.0.1` |
| `src/micromark/factory-label.lil` | `micromark-factory-label@2.0.1` |
| `src/micromark/factory-space.lil` | `micromark-factory-space@2.0.1` |
| `src/micromark/factory-title.lil` | `micromark-factory-title@2.0.1` |
| `src/micromark/factory-whitespace.lil` | `micromark-factory-whitespace@2.0.1` |
| `src/micromark/splice-buffer.lil`, `util-subtokenize.lil` | `micromark-util-subtokenize@2.1.0` |
| `src/micromark/symbol/**` | `micromark-util-symbol@2.0.1` |
| `src/micromark/util-character.lil` | `micromark-util-character@2.1.1` |
| `src/micromark/util-chunked.lil` | `micromark-util-chunked@2.0.1` |
| `src/micromark/util-classify-character.lil` | `micromark-util-classify-character@2.0.1` |
| `src/micromark/util-combine-extensions.lil` | `micromark-util-combine-extensions@2.0.1` |
| `src/micromark/util-decode-numeric.lil` | `micromark-util-decode-numeric-character-reference@2.0.2` |
| `src/micromark/util-decode-string.lil` | `micromark-util-decode-string@2.0.1` |
| `src/micromark/util-html-tag-name.lil` | `micromark-util-html-tag-name@2.0.1` |
| `src/micromark/util-normalize-identifier.lil` | `micromark-util-normalize-identifier@2.0.1` |
| `src/micromark/util-resolve-all.lil` | `micromark-util-resolve-all@2.0.1` |
| `src/micromark/host.lil` | LilScript host interop used by the ports above |

`src/from-markdown.lil` preserves upstream's list-event splice order and index
updates.
