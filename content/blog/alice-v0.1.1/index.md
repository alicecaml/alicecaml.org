+++
title = "Alice v0.1.1"
date = 2025-11-13
slug = "alice-v0.1.1"

[taxonomies]
tags = ["release"]
+++

Announcing the release of Alice v0.1.1. This is a patch release with several
minor fixes. It also introduces a "hermetic source archive" (the
[alice-0.1.1-hermetic-source.tar.gz](https://github.com/alicecaml/alice/releases/download/0.1.1/alice-0.1.1-hermetic-source.tar.gz)
file on the [release page](https://github.com/alicecaml/alice/releases/tag/0.1.1))
which can be built with Dune package management without needing to install the OCaml toolchain with Alice.
The lock directory checked into the main branch of Alice specifies the compiler
be installed externally from Dune allowing Alice to dogfood its own toolchain
management logic, however if you just want to build Alice from source it's more
convenient to have a codebase where running `dune build` is all that's
necessary. The hermetic source archive is created by deleting `dune-workspace`
and running `dune pkg lock`.

## Release Notes

### Fixed

- External commands are run in an environment containing the OCaml toolchain if
  Alice has installed an OCaml toolchain. This fixes an issue where the OCaml
  compiler couldn't find flexlink on Windows unless the current Alice root was
  in the PATH variable. (#2, fixes #1)
- Fixed compile error on 32-bit machines due to unrepresentable integer literal.
- Wrap text in help messages.


Pre-compiled binaries of Alice v0.1.1 can be downloaded from the its [release
page](https://github.com/alicecaml/alice/releases/tag/0.1.1) on Github.

On Linux and macOS, Alice v0.1.1 can be installed by running its install script:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.1.1
```
</div>

On NixOS, Alice v0.1.1 can be installed via the flake
`github:alicecaml/alice/0.1.1`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.1.1
```
</div>

