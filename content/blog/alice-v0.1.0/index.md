+++
title = "Alice v0.1.0"
date = 2025-11-08
slug = "alice-v0.1.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of Alice v0.1.0. This is the first official release of
Alice, so in lieu of a changelog, here's a summary of the capabilities of Alice
thus far:

- Multi-file packages with dependencies specified within the local filesystem
  can be built and incrementally rebuilt.
- Dependency and build graphs can be visualized with graphviz.
- The OCaml toolchain and some development tools can be installed user-wide.

Pre-compiled binaries of Alice v0.1.0 can be downloaded from the its [release
page](https://github.com/alicecaml/alice/releases/tag/0.1.0) on Github.

On Linux and macOS, Alice v0.1.0 can be installed by running its install script:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.1.0
```
</div>

On NixOS, Alice v0.1.0 can be installed via the flake
`github:alicecaml/alice/0.1.0`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.1.0
```
</div>

