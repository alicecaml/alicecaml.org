+++
title = "Alice the Caml"
+++

# Alice the Caml

Alice is a radical, experimental [OCaml](https://ocaml.org/) build system and
package manager. Its goal is to allow anyone to
program in OCaml with as little friction as possible.

## Install

<div id="install">

<div class="os-picker">
</div>

<div id="windows" class="os">
<p>Install on Windows with:</p>
<div class="code-with-copy-button code-with-prompt">

```bash
winget install OCaml.Alice
```
</div>
</div>

<div id="macos" class="os">
<p>Install on macOS with:</p>
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh
```
</div>
</div>

<div id="linux" class="os">
<p>Install on Linux with:</p>
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh
```
</div>
</div>

<div id="other" class="os">
<p>Install on any platform supported by <a href="https://opam.ocaml.org">opam</a> by installing Alice's opam package:</p>
<div class="code-with-copy-button code-with-prompt">

```bash
opam install alice
```
</div>
</div>

</div>

See more installation options [here](@/install.md).

## First Steps

Here's how to run your first OCaml program on a computer with no pre-installed
OCaml tools (you will need a C compiler though!):
```bash
$ alice tools install
$ alice new hello
$ cd hello
$ alice run

Hello, World!
```

That first line downloads an OCaml compiler toolchain and a couple of
development tools (`ocamllsp` and `ocamlformat`). Skip it if you already have
an existing installation of OCaml. Alice runs the OCaml compiler
(`ocamlopt.opt`) searching the directories in your `PATH` variable and only
uses its own installation of the tools (installed by `alice tools install`) as
a fallback.

This project is exploring alternative approaches to OCaml packaging than those
chosen by [Opam](https://github.com/ocaml/opam) and alternative approaches to
building projects than those chosen by [Dune](https://github.com/ocaml/dune).
