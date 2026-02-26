+++
title = "Alice v0.5.0"
date = 2026-02-25
slug = "alice-v0.5.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.5.0](https://github.com/alicecaml/alice/releases/tag/0.5.0)!

This change introduces [parallel builds](@/blog/parallel-alice-without-eio/index.md) of packages.

## Install Alice v0.5.0

On all platforms that support [opam](https://github.com/ocaml/opam), install Alice v0.5.0 with:
<div class="code-with-copy-button code-with-prompt">

```bash
opam update && opam install alice.0.5.0
```
</div>

On Windows, Alice v0.5.0 can be installed with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
<div class="code-with-copy-button code-with-prompt-windows">

```bash
winget install OCaml.Alice --version 0.5.0
```
</div>

On macOS and Linux, the latest version of Alice can be installed with [Homebrew](https://brew.sh):
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


Alternatively, on macOS and Linux, Alice v0.5.0 can be installed by running the [install script](@/install.md#install-script):
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.5.0
```
</div>

On NixOS, Alice v0.5.0 can be installed via the flake
`github:alicecaml/alice#alice_0_5_0.default`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice#alice_0_5_0.default
```
</div>

Read more about installing Alice [here](@/install.md).


## Release Notes

### Changed

- Parallel builds
