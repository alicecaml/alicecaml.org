+++
title = "Alice v0.2.0"
date = 2025-12-01
slug = "alice-v0.2.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.2.0](https://github.com/alicecaml/alice/releases/tag/0.2.0)!

This release adds support for LSP by generating .cmt files and a .merlin file at the project's root,
as well as adding an additional development tool `dot-merlin-reader` which is
necessary for using `ocamllsp` in non-Dune projects. There's a new [LSP](@/lsp/index.md) page on
this site with instructions for setting up your environment and editor to use LSP in Alice projects.

## Release Notes

### Added

- Generate files necessary to support ocamllsp.

### Changed

- Switch to github for hosting tool archives.
- Display progress bar while downloading tools.
