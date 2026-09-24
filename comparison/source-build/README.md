# Source-build measurements

Measured 2026-09-24T04:22:43Z on this port's release host (Azure Standard_B8als_v2, 8 vCPUs, Node v24.11.1) using LilScript `aa2052f081ca8184666ca280ee9b91d476e46cfc` (binary SHA-256 `13cb49a93fb3e376a5978484835322c84adea692b69ae4720775291377cf18f9`) and the upstream Git revision recorded in `job.json`.

`result.json` records the commands, wall time, CPU time, machine and exit codes, and every compiler invocation of each LilScript build. `esm.json` records the production ESM assembly of the original and its exact input graph; it resolves the browser graph (`decode-named-character-reference/index.dom.js`), which ships no entity table. The lockfiles record dependency resolution. The public page uses `site/source-build.json` for the consolidated record.

The protocol is comparison/page-refresh/source-build-worker.py of the LilScript repository, run on this host instead of the retired build pool: three clean builds per lane in alternating order, dependency installation excluded. Build output scope differs between the repositories; no build speedup is inferred. The host is burstable and other sessions compiled on it during the run.

The previous records (2026-09-10, compiler `4dc4e33`, Azure Standard_D16als_v7) are in the Git history of this directory.
