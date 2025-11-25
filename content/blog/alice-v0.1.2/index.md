+++
title = "Alice v0.1.2"
date = 2025-11-25
slug = "alice-v0.1.2"

[taxonomies]
tags = ["release"]
+++

Announcing the release of Alice v0.1.2. This is a patch release though it
doesn't make any visible changes. The purpose of the release is to add a [zip
archive containing the Windows
executable](https://github.com/alicecaml/alice/releases/download/0.1.2/alice-0.1.2-x86_64-windows.zip).
This is intended to make it possible to release Alice on the Winget package
manager.

## Release Notes

### Added

- Release a zip archive on windows with just alice.exe


Pre-compiled binaries of Alice v0.1.2 can be downloaded from the its [release
page](https://github.com/alicecaml/alice/releases/tag/0.1.2) on Github.


On Linux and macOS, Alice v0.1.2 can be installed by running its install script:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.1.2
```
</div>

On NixOS, Alice v0.1.2 can be installed via the flake
`github:alicecaml/alice/0.1.2`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.1.2
```
</div>
