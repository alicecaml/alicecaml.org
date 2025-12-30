+++
title = "Install"
template = "page.html"
+++

# Install Alice

{{ os_picker() }}

## Setup LSP

Refer to [this guide](@/lsp/index.md) for configuring your editor to support the
Language Server Protocol with [`ocamllsp`](https://github.com/ocaml/ocaml-lsp)
in Alice projects.

## Install Script

The install script will install the `alice` executable to `$HOME/.local/bin`.
To run the `alice` command from your shell, the `$HOME/.local` directory must be added to your `$PATH` variable.

The install script will also offer to install some OCaml tools including the compiler and LSP server.
These tools are installed to a location of Alice's choosing. The location may differ between systems
but the path to an installed tool is printed by the `alice tools which <tool>`
command, for example `alice tools which ocamlc`.

The install script will offer to update your shell config file (e.g. `.bashrc`) to add directories to `$PATH`
to allow Alice and the OCaml tools to be run as commands, and also to install shell completions for Alice's commands.

For most users this should be sufficient to install
Alice. Read on to learn more about different installation options.

### Install Script Options

By default the installer is interactive, however all the interactions can be
skipped by passing command-line arguments. Command-line arguments can be passed
to the installer like:
```bash
$ curl -fsSL https://alicecaml.org/install.sh | sh -s -- arg1 arg2 ...
```

To see a list of accepted arguments, run:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- --help
```
</div>


An example command which installs Alice non-interactively is:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- \
    --no-prompt --install-tools --no-update-shell-config
```
</div>

This might be handy when installing Alice in an environment where interactivity
is not an option, such as when building a docker image.

Here's a minimal example `Dockerfile` which makes Alice and a set of OCaml
development tools globally available (all the executables end up in
`/usr/bin`):
<div class="code-with-copy-button">

```dockerfile
FROM alpine
RUN apk add curl git build-base
RUN curl -fsSL https://alicecaml.org/install.sh | sh -s -- \
  --global /usr --no-prompt --install-tools --no-update-shell-config
```
</div>

Read more about the `--global` argument [below](#global-installation).


## Manual Installation

Pre-compiled executables of Alice can be found on its [Github release
page](https://github.com/alicecaml/alice/releases). Download and extract the
`.tar.gz` archive appropriate to your system, and copy the file `bin/alice` to one of the directories
in your `PATH` variable.

To manually install OCaml development tools to a specific location such as `/usr/local`, run:
<div class="code-with-copy-button code-with-prompt">

```bash
alice tools install --global=/usr/local
```
</div>

Executables will be placed in a `bin` directory under the path passed to
`--global`, so make sure not to include the `bin` directory in that path.
Read more about the `--global` argument [below](#global-installation).


## Global Installation

By default Alice and all the tools it manages are installed inside the current user's home directory.
This allows Alice to be installed as a regular (non-root) user
however a drawback is
that you need to modify your environment (namely the `$PATH` variable)
in order to run Alice or its tools as commands.

Alice's install script and the `alice tools install` command both accept an
argument `--global PATH` which installs files under a given directory. For
example if you run:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- --global /usr/local
```
</div>

...then the `alice` executable will be
installed to `/usr/local/bin/alice` and the OCaml compiler will be installed to
`/usr/local/bin/ocamlopt.opt`. That command will probably need to be run as root
since `/usr/local` is not always writeable by regular users. The benefit of
installing Alice and OCaml tools globally is that you can install the
executables to a location already in your `PATH` variable, so commands work
without needing to modify shell configs to prepend additional directories to
`PATH`.
