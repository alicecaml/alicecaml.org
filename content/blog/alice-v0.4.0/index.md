+++
title = "Alice v0.4.0"
date = 2026-01-05
slug = "alice-v0.4.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.4.0](https://github.com/alicecaml/alice/releases/tag/0.4.0)!

The main change in this version is switching the manifest format from TOML to [KDL](https://kdl.dev/).
Read [this page](@/blog/switching-manifests-to-kdl/index.md) for the reasoning
behind this change.

## Migrating from earlier versions

This example demonstrates how all the features of package manifests are
represented in the old TOML format and the new KDL format.

`Alice.toml`:
```toml
[package]
name = "foo"
version = "0.1.0"

[dependencies]
bar = { path = "../bar" }
baz = { path = "../baz" }
```

`Alice.kdl`:
```alice-kdl
package {
  name foo
  version "0.1.0"
  dependencies {
    bar path="../bar"
    baz path="../baz"
  }
}
```

## Install Alice v0.4.0

On all platforms that support [opam](https://github.com/ocaml/opam), install Alice v0.4.0 with:
<div class="code-with-copy-button code-with-prompt">

```bash
opam update && opam install alice.0.4.0
```
</div>

On Windows, Alice v0.4.0 can be installed with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
<div class="code-with-copy-button code-with-prompt-windows">

```bash
winget install OCaml.Alice --version 0.4.0
```
</div>


On macOS and Linux, the latest version of Alice can be installed with [Homebrew](https://brew.sh):
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


Alternatively, on macOS and Linux, Alice v0.4.0 can be installed by running the [install script](@/install.md#install-script):
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.4.0
```
</div>

On NixOS, Alice v0.4.0 can be installed via the flake
`github:alicecaml/alice/0.4.0`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.4.0
```
</div>

Read more about installing Alice [here](@/install.md).


## Release Notes

### Changed

- Use [kdl](https://kdl.dev) rather than toml for manifests. More info [here](@/install.md).

### Fixed

- Replace panics with user exceptions in some cases
- Detect case when the name of a dependency doesn't match the name of the specified package
