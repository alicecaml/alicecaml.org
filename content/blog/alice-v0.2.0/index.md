+++
title = "Alice v0.2.0"
date = 2025-12-01
slug = "alice-v0.2.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.2.0](https://github.com/alicecaml/alice/releases/tag/0.2.0)!

This release adds support for LSP by generating .cmt files in the build directory and a .merlin file at the project's root,
as well as adding an additional development tool `dot-merlin-reader` which is
necessary for using `ocamllsp` in non-Dune projects. There's a new [LSP](@/lsp/index.md) page on
this site with instructions for setting up your environment and editor to use LSP in Alice projects.

## Install Alice v0.2.0

On all platforms that support [Opam](https://github.com/ocaml/opam), install Alice v0.2.0 with:
<div class="code-with-copy-button code-with-prompt">

```bash
opam update && opam install alice.0.2.0
```
</div>


On Windows, Alice v0.2.0 can be installed with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
<div class="code-with-copy-button code-with-prompt-windows">

```bash
winget install OCaml.Alice --version 0.2.0
```
</div>


On macOS and Linux, the latest version of Alice can be installed with [Homebrew](https://brew.sh):
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


Alternatively, on macOS and Linux, Alice v0.2.0 can be installed by running the [install script](@/install.md#install-script):
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.2.0
```
</div>

On NixOS, Alice v0.2.0 can be installed via the flake
`github:alicecaml/alice/0.2.0`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.2.0
```
</div>

Read more about installing Alice [here](@/install.md).

## Release Notes

### Added

- Generate files necessary to support ocamllsp.

### Changed

- Switch to github for hosting tool archives.
- Display progress bar while downloading tools.
