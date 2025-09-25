+++
title = "Alice the Caml"
description = "A radical, experimental OCaml build system and package manager"
+++

# Alice the Caml

Alice is a radical, experimental [OCaml](https://ocaml.org/) build system and
package manager for Windows, MacOS, and Linux. Its goal is to allow anyone to
program in OCaml with as little friction as possible.

Install Alice by running the following command:
<div class="code-with-copy-button">
<pre><code>curl -fsSL https://alicecaml.org/install.sh | sh</code></pre>
</div>

Here's how to run your first OCaml program on a computer with no pre-installed
OCaml tools (you will need a C compiler though!):
```bash
$ alice tools get
$ alice new hello
$ cd hello
$ alice run

Hello, World!
```

That first line downloads an OCaml compiler toolchain and a couple of
development tools (`ocamllsp` and `ocamlformat`). Skip it if you already have an
existing installation of OCaml. Alice runs the OCaml compiler (`ocamlopt.opt`)
and a few other programs from the compiler toolchain by searching the
directories in your `PATH` variable and only uses its own installation of the
tools (installed by `alice tools get`) as a fallback.

This project is exploring alternative approaches to OCaml packaging than those
chosen by [Opam](https://github.com/ocaml/opam) and alternative approaches to
building projects than those chosen by [Dune](https://github.com/ocaml/dune).
