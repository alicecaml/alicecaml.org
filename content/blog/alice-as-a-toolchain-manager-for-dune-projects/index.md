+++
title = "Alice as a Toolchain Manager for Dune Projects"
date = 2025-09-26
slug = "alice-as-a-toolchain-manager-for-dune-projects"

[taxonomies]
tags = ["tutorial"]
+++

Alice is my experimental work-in-progress build system and package manager for OCaml.
To help users get started writing OCaml as smoothly as possible, Alice provides
a mechanism for installing the pre-built versions of the OCaml compiler and other tools.
This post is about using this feature of Alice to simplify setting up an OCaml
environment for developing a project with [Dune Package Management](https://dune.readthedocs.io/en/stable/tutorials/dune-package-management/).

In the Opam ecosystem (which is the package ecosystem accessible to Dune), the OCaml compiler is considered to be a mostly
regular package, which all other packages must list in their dependencies
(assuming they are written in OCaml). Opam is mostly a source-based package
ecosystem, so when building a project (including its transitive dependencies)
the first thing that usually needs to happen is the OCaml compiler needs to be
bootstrapped (it is itself written in OCaml) and compiled, which often takes
several minutes.

When using [ocaml-lsp-server](https://github.com/ocaml/ocaml-lsp) to analyze
OCaml code in a text editor, that code needs to have been compiled using the
same version of the OCaml compiler as the LSP server executable in order for the LSP
server to understand the code. This is fairly easy
to ensure when using Opam, but installing the LSP server with Opam requires building the LSP server from source which adds another
couple of minutes delay to getting started working on a new project. It's
tempting to speed this up by distributing a pre-compiled executable of the LSP
server but this is tricky because somehow we'd need to make sure the executable
that gets installed was compiled by the same version of the compiler as was used
for the project.

Another common OCaml development tool is the de-facto standard code formatter
[ocamlformat](https://github.com/ocaml-ppx/ocamlformat). It doesn't have the
same compiler version constraint as the LSP server and is lighter in its
dependencies and therefore faster to compile. The LSP server requires that
the executables `ocamlformat` and `ocamlformat-rpc` are runnable as commands
(ie. they are in one of the directories in your `PATH` variable) when using
running the LSP command to format a file.

Alice simplifies getting started on a new OCaml project by providing
pre-compiled binary versions of the compiler, the LSP server, and the code
formatter. The binary version of the LSP server was compiled with the binary
version of the compiler, so the LSP server can analyze code compiled with the
compiler.

You can use `alice` to install the tools with:
<div class="code-with-copy-button code-with-prompt">

```bash
alice tools install
```
</div>

...or you can install both Alice and a set of tools with:
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh
```
</div>

Read more about installing development tools
[here](@/install.md#development-tools).

The remainder of this post will go through a minimal example of setting up a fresh
machine with Alice and its binary versions of development tools, and then
developing a Dune project using these tools. For the sake of ease of following
along at home and reproducing my results, I'll build up a docker image with the
tools and then do all development inside a container.

Here's the `Dockerfile` I'll be using. It installs Alice, the OCaml tools, and
Dune system-wide, all without compiling any code.

<div class="code-with-copy-button">

```dockerfile
FROM ubuntu

# Install packages necessary to install Alice and Dune and the
# low-level build tools needed by the OCaml compiler.
RUN apt-get update && apt-get install -y build-essential curl git

# Install Alice and the OCaml development tools.
RUN curl -fsSL https://alicecaml.org/install.sh | sh -s -- \
  --global /usr --no-prompt --install-tools --no-update-shell-config

# Install Dune from its binary distribution.
RUN curl -fsSL https://github.com/ocaml-dune/dune-bin-install/releases/download/v3/install.sh | sh -s -- \
  3.20.2 --install-root /usr --no-update-shell-config

# Install an editor to show off LSP. I'm using an unstable
# version of neovim here as it comes with an experimental
# built-in plugin manager which will make it easy to set up
# the lspconfig plugin which knows how to run the OCaml LSP
# server which Alice installed.
RUN apt-get install -y software-properties-common && \
  add-apt-repository ppa:neovim-ppa/unstable && \
  apt-get update && \
  apt-get install -y neovim

# Add a non-root user.
RUN useradd -m user
USER user
WORKDIR /home/user

# Minimal neovim config which installs the lspconfig plugin.
RUN mkdir -p ~/.config/nvim && \
  printf 'vim.pack.add({ "https://github.com/neovim/nvim-lspconfig" })\nvim.lsp.enable("ocamllsp")' > ~/.config/nvim/init.lua
```
</div>

Now from within a container running an image built from that
Dockerfile, let's make a new Dune project!

```bash
$ dune init project foo
Entering directory '/home/user/foo'
Success: initialized project component named foo
$ cd foo
$ dune exec foo
Hello, World!
```

That indicates that Dune and the OCaml compiler both work.

To test the LSP server, open an OCaml file in an editor like
`bin/main.ml` whose contents is:

<div class="code-with-copy-button">

```ocaml
let () = print_endline "Hello, World!"
```
</div>

Move the editor's cursor over the `print_endline` function
and run the LSP command to jump to definition. In Neovim
this is:

<div class="code-with-copy-button">

```vim
:lua vim.lsp.buf.definition()
```
</div>

This should take you to the file `/usr/lib/ocaml/stdlib.ml`
where `print_endline` is defined like:
```ocaml
...
  let print_endline s =
    output_string stdout s; output_char stdout '\n'; flush stdout
...
```

Now let's test `ocamlformat`. Make an empty file in the project's
root directory named `.ocamlformat` to enable `ocamlformat`:
<div class="code-with-copy-button code-with-prompt">

```bash
touch .ocamlformat
```
</div>

Then open `bin/main.ml` back up in your editor and mess with
its formatting a bit. Maybe something like:
<div class="code-with-copy-button">

```ocaml
let () =


print_endline "Hello, World!"
```
</div>

Then run the LSP command to format the file. In Neovim it's:
<div class="code-with-copy-button">

```vim
:lua vim.lsp.buf.format()
```
</div>

...and the code should now be formatted correctly again:
<div class="code-with-copy-button">

```ocaml
let () = print_endline "Hello, World!"
```
</div>

Now let's use Dune Package Management to add a dependency.
Make a lock directory:
```
$ dune pkg lock
Solution for dune.lock:
- ocaml.5.3.0
- ocaml-base-compiler.5.3.0
- ocaml-compiler.5.3.0
- ocaml-config.3
```

That doesn't look right, because our OCaml version should be
`5.3.1+relocatable` (confirm this by running):
```
$ ocaml --version
The OCaml toplevel, version 5.3.1+relocatable
```

By default Dune uses the regular Opam repository which
doesn't have an entry for the patched relocatable compiler
installed by Alice. Also Dune prefers to install the
compiler by building it from source rather than taking the
compiler from the system. To change both of these
behaviours, create a `dune-workspace` file in the project
root with contents:
<div class="code-with-copy-button">

```dune
(lang dune 3.20)

(repository
 (name alice)
 (url
  git+https://github.com/alicecaml/alice-opam-repo))

(lock_dir
 (constraints
  (ocaml-system
   (= 5.3.1+relocatable)))
 (repositories upstream overlay alice)
 (solver_env
  (sys-ocaml-version 5.3.1+relocatable)))
```
</div>

This tells Dune to use Alice's Opam repository (which just contains an
`ocaml-system` package for the patched relocatable compiler) and to add the
package solver constraint that the solution must include the package
`ocaml-system.5.3.1+relocatable`. Lock the project again:
```
$ dune pkg lock
Solution for dune.lock:
- ocaml.5.3.1+relocatable
- ocaml-config.3
- ocaml-system.5.3.1+relocatable
```

Better. Check that it still builds:
```
$ dune clean && dune exec foo
Hello, World!
```

We know that Dune is using the right compiler here because the only compiler installed
on the system is the one installed by Alice. For Dune to have installed a
different compiler it would have needed to build it from source, which we would
notice because doing so takes several minutes.

Now add a dependency! I'm going to add a dependency on the package `climate` by
adding it to the `depends` field in `dune-project`. After this change, the
entire `dune-project` file looks like:
<div class="code-with-copy-button">

```dune
(lang dune 3.20)

(name foo)

(generate_opam_files true)

(source
 (github username/reponame))

(authors "Author Name <author@example.com>")

(maintainers "Maintainer Name <maintainer@example.com>")

(license LICENSE)

(documentation https://url/to/documentation)

(package
 (name foo)
 (synopsis "A short synopsis")
 (description "A longer description")
 (depends ocaml climate) ; <------------ I modified this line
 (tags
  ("add topics" "to describe" your project)))

; See the complete stanza docs at https://dune.readthedocs.io/en/stable/reference/dune-project/index.html
```
</div>

Lock the project again to make the new dependency available:
```bash
$ dune pkg lock
Solution for dune.lock:
- climate.0.8.4
- ocaml.5.3.1+relocatable
- ocaml-config.3
- ocaml-system.5.3.1+relocatable
```

To use the new dependency, add `climate` to the `libraries` field in
`bin/dune`:
<div class="code-with-copy-button">

```dune
(executable
 (public_name foo)
 (name main)
 (libraries foo climate))
```
</div>

Now use the new dependency to implement a CLI in `bin/main.ml`:
<div class="code-with-copy-button">

```ocaml
open Climate

let () =
  let open Command in
  run @@ singleton
  @@
  let open Arg_parser in
  let+ name = pos_req 0 string ~value_name:"NAME" in
  Printf.printf "Hello, %s!\n" name
```
</div>

Try it out:
```
$ dune exec foo -- --help
Usage: /home/user/foo/_build/install/default/bin/foo [OPTION]… <NAME>

Arguments:
  <NAME>

Options:
  -h, --help  Show this help message.

$ dune exec foo -- Alice
Hello, Alice!
```

This shows how Alice can help setup an OCaml environment made up entirely
of binary distributions of tools. Along with the binary release of Dune, this
makes it possible to develop OCaml projects where the only code you need to
compile is from your project and the libraries it depends on. Using pre-compiled
binaries of the compiler and development tools speeds up getting started on a
new project, and also speeds up CI builds by removing the costly first step of
compiling the OCaml compiler. Indeed Alice is itself a Dune project which
uses Alice to manage its development and CI OCaml environments.
