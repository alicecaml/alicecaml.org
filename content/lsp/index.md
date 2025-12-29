+++
title = "LSP"
template = "page.html"
+++

# Alice and the Language Server Protocol

The [Language Server Protocol
(LSP)](https://microsoft.github.io/language-server-protocol/) allows editors to
communicate with language servers to implement features such as code completion
and navigation. The de facto standard LSP server for OCaml is
[OCaml-LSP](https://github.com/ocaml/ocaml-lsp) (aka. ocamllsp and
ocaml-lsp-server). This page is a guide for using OCaml-LSP while editing OCaml code
in Alice projects.

Note that to use OCaml-LSP in an Alice project you'll need to be using Alice
v0.3.0 or later.

## Table of Contents

- [Terminology](#terminology)
- [Install OCaml-LSP and dot-merlin-reader](#install-ocaml-lsp-and-dot-merlin-reader)
  - [Option 1: Use Alice](#option-1-use-alice)
  - [Option 2: Use Opam](#option-2-use-opam)
  - [Option 3: Use Nix](#option-3-use-nix)
- [Confirm that the tools are installed correctly](#confirm-that-the-tools-are-installed-correctly)
- [Configure your Editor](#configure-your-editor)
  - [Visual Studio Code](#visual-studio-code)
  - [Neovim](#neovim)
- [Formatting your code with OCamlFormat](#formatting-your-code-with-ocamlformat)

## Terminology

An _editor_ is a program like Visual Studio Code, Neovim or Emacs that you use
to edit code. An _LSP Client_ is part of an editor, either built into the editor
directly or installed as a plugin, and implements IDE features such as displaying
documentation when hovering over a term or navigating a codebase, without
knowledge of any specific language syntax or semantics. An _LSP Server_ is a program that runs in the
background and analyzes
code in a particular language, responding to queries made by the LSP Client such
as "What's the type of this expression?" or "Where is this function defined?".
LSP Clients are usually responsible for launching the appropriate LSP Server
when an editor first starts editing code in a particular language.

There's often a way to configure your editor to run a particular command to
start the LSP Server for a given language, or at least to customize the
arguments passed to the LSP Server on launch. This is important because the
default configuration for OCaml-LSP only works for [Dune](https://dune.build)
projects, and an extra argument (`--fallback-read-dot-merlin`) needs to be passed to the OCaml LSP Server in
order to use it for Alice projects. More on this
[below](#configure-your-editor).

## Install OCaml-LSP and dot-merlin-reader

In addition to the OCaml LSP Server you'll need a tool called
`dot-merlin-reader` which will allow OCaml-LSP to parse a `.merlin` file which
Alice will create and maintain at the root of your project. As explained above, OCaml-LSP only
works for Dune projects in its default configuration, and non-Dune projects
need to place a `.merlin` file at their root so OCaml-LSP can identify the
project's boundary within the file system.
Don't check this file into version control, as some paths might not be portable between different computers.
[Merlin](https://github.com/ocaml/merlin) is the OCaml editor service used
internally by OCaml-LSP, hence the name `.merlin`.
Read more about the `.merlin` file [here](https://github.com/ocaml/merlin/wiki/project-configuration#the-merlin-file).

You'll need to install the executables `ocamllsp`
(from the OCaml-LSP project) and `dot-merlin-reader`. There are several ways to
go about this. The main consideration is that the `ocamllsp` executable that your
LSP Client launches needs to have been compiled with the same compiler that Alice
will run when building your project (which is also the one that runs when you type
`ocamlopt.opt` in your terminal - Alice respects your `PATH` variable!). As long as you get OCaml-LSP and the OCaml
compiler from the same place then everything should work.

Here are some options for installing the necessary tools:

### Option 1: Use Alice

On Windows, macOS and Linux, Alice can install pre-compiled development tools with the following command:

<div class="code-with-copy-button code-with-prompt">

```bash
alice tools install
```
</div>

This includes `ocamllsp`, `dot-merlin-reader`, and the OCaml compiler that was
used to compile them both. All tools are installed to
`$HOME/.alice/current/bin` so make sure that directory is in your `PATH`
variable and appears earlier than any other directory that might contain OCaml
tools (e.g. the `bin` directory from an opam switch).

### Option 2: Use Opam

Install all the necessary tools to the current opam switch by running:

<div class="code-with-copy-button code-with-prompt">

```bash
opam install ocaml-lsp-server dot-merlin-reader
```
</div>

Since opam will build these packages from source using the OCaml compiler from
your current switch, you'll end up with an LSP Server that's compatible with
your compiler.

### Option 3: Use Nix

Users of the [Nix](https://nixos.org) package manager can install the `ocaml`,
`ocamlPackages.ocaml-lsp`, and `ocamlPackages.dot-merlin-reader` packages from
the [nixpkgs](https://github.com/NixOS/nixpkgs) repo. Alternatively, install the `github:alicecaml/alice` flake
which contains all 3 packages as well as Alice and `ocamlformat`, or
`github:alicecaml/alice#tools` which is the same but lacks Alice itself.

## Confirm that the tools are installed correctly

First verify that you have all the requisite tools by running:
```
$ which ocamlopt.opt
$ which ocamllsp
$ which dot-merlin-config
```
...on Unix-like systems, or:
```
> Get-Command ocamlopt.opt
> Get-Command ocamllsp
> Get-Command dot-merlin-config
```
...on Windows (in PowerShell).

## Configure your Editor

You need to make it so that when your editor or LSP Client launches the
`ocamllsp` executable, that it passes the argument `--fallback-read-dot-merlin`.
That is, it runs the command:

<div class="code-with-copy-button code-with-prompt">

```
ocamllsp --fallback-read-dot-merlin
```
</div>

The specific configuration depends on your editor:

### Visual Studio Code

Use the [OCaml
Platform](https://marketplace.visualstudio.com/items?itemName=ocamllabs.ocaml-platform)
plugin, which will automatically launch `ocamllsp` when you start editing an
OCaml project. On the settings page for the OCaml Platform plugin, find the
section labeled "Ocaml > Server: Args", with description "Extra arguments to
pass to ocamllsp."

![The Ocaml > Server: Args setting from Visual Studio Code](vscode-ocaml-server-args.png)

Click "Edit in settings.json", and add the following:

<div class="code-with-copy-button">

```json
{
  "ocaml.server.args": [
    "--fallback-read-dot-merlin"
  ]
}
```
</div>

Visual Studio Code also needs to be told how to launch `ocamllsp` and other tools.
The OCaml Platform plugin has a concept of a "Sandbox" which is a collection of OCaml tools,
and every project must be configured with a particular sandbox in order for the OCaml Platform plugin
to provide editor support. To select the sandbox for a project, select the OCaml Platform plugin on the left side of the VSCode window
and click on "Select a Sandbox" under "COMMANDS":

![VSCode UI OCaml Platform COMMANDS list, with "Select a Sandbox" selected](select-a-sandbox.png)

That will display the following drop-down menu:

![VSCode UI drop-down menu for selecting a sandbox](sandbox-drop-down.png)

The appropriate sandbox for Alice projects depends on how you installed the OCaml
LSP Server and other development tools.

If you installed tools with Opam then select the sandbox which corresponds to the
Opam Switch in which the tools were installed.

Otherwise, select "Custom". You'll be prompted to enter a command template with
placeholder values for the program and its arguments (`$prog` and `$args`
respectively):

![VSCode UI for writing a template for launching commands](custom-sandbox.png)

Fill in the template with a command that launches the appropriate instance of each tool. For example when the OCaml Platform plugin wants
to launch the OCaml LSP Server it will run this command with `$prog`
substituted with `ocamllsp` and `$args` substituted with
`--fallback-read-dot-merlin`. If you installed tools with the `alice tools install` command
then a suitable template for Unix-like systems is:

<div class="code-with-copy-button">

```sh
alice tools exec -- $prog $args
```
</div>

On Windows a suitable template is:

<div class="code-with-copy-button">

```cmd
set "PATH=C:\msys64\mingw64\bin;%PATH%" && alice tools exec -- $prog $args
```
</div>

Note that on Windows the template must use CMD.EXE syntax rather than PowerShell.
The example above for Windows assumes you use `mingw64` as your C compiler,
installed with [msys2](https://www.msys2.org) with its default install location. You'll need to change this to
match your setup.

Read more about OCaml Platform sandboxes [here](https://github.com/ocamllabs/vscode-ocaml-platform?tab=readme-ov-file#sandbox).

### Neovim

Using the [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) plugin,
enable running the `ocamllsp` server and configure its startup command with:
<div class="code-with-copy-button">

```lua
vim.lsp.enable('ocamllsp')
vim.lsp.config('ocamllsp', {
  cmd = { 'ocamllsp', '--fallback-read-dot-merlin' },
})
```
</div>

Make sure your `PATH` variable is set correctly such that the instances of the
OCaml tools you installed above are launched by Neovim.

On Unix-like systems it's recommended to use [direnv](https://direnv.net)
to manage project-specific environment variables.

If you installed tools with `alice tools install` then your project's `.envrc` file should be:

<div class="code-with-copy-button">

```sh
eval $(alice tools env)
```
</div>

If you installed tools with Opam, use:

<div class="code-with-copy-button">

```sh
eval $(opam env --switch=SWITCH)
```
</div>

...replacing `SWITCH` with the name of the switch which you installed the tools into.

## Formatting your code with [OCamlFormat](https://github.com/ocaml-ppx/ocamlformat)

If you have `ocamlformat` and `ocamlformat-rpc` installed, OCaml-LSP can use
them to format your code from your editor (e.g. in Visual Studio Code,
right-click inside the editing window and select "Format Document"). These tools are installed
when you run `alice tools install`, and can alternatively be installed with opam
by installing the `ocamlformat` package. By default auto-formatting is disabled for
new projects, but a project can enable auto-formatting by creating an empty file named
`.ocamlformat` at their root (i.e. next to `Alice.toml`).  Check this file into
version control so all collaborators on a project share the same code style.
Read more about OCamlFormat in its
[manual](https://ocaml.org/p/ocamlformat/latest/doc/index.html).
