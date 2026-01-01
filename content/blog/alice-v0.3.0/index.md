+++
title = "Alice v0.3.0"
date = 2025-12-30
slug = "alice-v0.3.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.3.0](https://github.com/alicecaml/alice/releases/tag/0.3.0)!

This release starts following the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/).
This means there is no longer a `~/.alice` directory. Tools are installed to `~/.local/share/alice/current/bin`, and Alice's executable
is installed to `~/.local/bin` if using the install script.

This is a breaking change.

## Migrating from earlier versions

- Delete `~/.alice`.
- If you have a block in your shell config starting with `# BEGIN configuration from Alice installer`, remove that block.
- If you installed Alice with the installation script then run the script again.
- If you used Alice to install OCaml tools, you'll need to reinstall those tools (run `alice tools install`).
- If you've configured a custom sandbox template with Visual Studio Code for any Alice projects,
  change the template based on the new LSP instructions for Visual Studio Code [here](@/lsp/index.md#visual-studio-code).

## Install Alice v0.3.0

On all platforms that support [Opam](https://github.com/ocaml/opam), install Alice v0.3.0 with:
<div class="code-with-copy-button code-with-prompt">

```bash
opam update && opam install alice.0.3.0
```
</div>


On Windows, Alice v0.3.0 can be installed with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
<div class="code-with-copy-button code-with-prompt-windows">

```bash
winget install OCaml.Alice --version 0.3.0
```
</div>


On macOS and Linux, the latest version of Alice can be installed with [Homebrew](https://brew.sh):
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


Alternatively, on macOS and Linux, Alice v0.3.0 can be installed by running the [install script](@/install.md#install-script):
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.3.0
```
</div>

On NixOS, Alice v0.3.0 can be installed via the flake
`github:alicecaml/alice/0.3.0`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice/0.3.0
```
</div>

Read more about installing Alice [here](@/install.md).

## Release Notes

### Changed

- Follow the XDG convention when installing tools.

### Fixed

- Update dot-merlin-reader on windows to fix crash on launch.
- Fix issue running `alice tools exec` on windows in CMD.exe.
