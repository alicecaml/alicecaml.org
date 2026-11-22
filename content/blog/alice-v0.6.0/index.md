+++
title = "Alice v0.6.0"
date = 2026-11-21
slug = "alice-v0.6.0"

[taxonomies]
tags = ["release"]
+++

Announcing the release of [Alice v0.6.0](https://github.com/alicecaml/alice/releases/tag/0.6.0)!

This change introduces several new features needed to build a small collection
of packages from the Opam repository which I've been manually porting to
Alice's package format in [alice-ports](https://github.com/alicecaml/alice-ports).

## New Features

### Access built-in modules from the standard library

Alice packages may now refer to modules from the standard library which are
excluded from the prelude, such as `Unix` and `Str`. A new `builtins` section
in `Alice.kdl` can be used to list the built-in modules a package can access:
```kdl
package {
  name foo
  version "0.1.0"

  builtins {
    unix
  }
}
```

### Mixing C code with OCaml

Packages may include C source files in their `src` directory. All C files will
be compiled and linked into the resulting executable when building a project.
The ability to compile C code raises the question of how to pass custom linker
arguments to the C compiler, and this is addressed with another new feature:
config scripts.

### Config Scripts

A package may include a config script in a file named `config.ml` file in the
package's root directory (next to `Alice.kdl`). The `config.ml` file is
compiled and executed as the first step of building a package, and any lines in
its standard output beginning with `alice:` are interpreted by Alice as
directives that can influence the build. Currently the only supported
directives are `alice:print_endline` which prints a message, and
`alice:add_c_linker_args` which adds C linker arguments.

Config scripts can depend on other packages, and also access built-in modules
from the standard library. This can be configured in `Alice.kdl`:
```kdl
package {
  name bar
  version "0.1.0"

  config_script {
    dependencies {
      foo path="../foo"
    }

    builtins {
      str
    }
  }
}
```

Config scripts are expected to be run only once each time they are compiled
because their output can be trivially cached in the build directory. For this
reason it's faster to compile config scripts with the bytecode compiler rather
than the native compiler, and of course this means compiling all their
dependencies with the bytecode compiler too.

### Packages can be built with the bytecode compiler

This was a necessary feature for allowing config scripts to be built with the
bytecode compiler, but it might also be something people find useful to
integrate into their workflow, since the bytecode compiler backend is generally
faster than the native backend (but of course the executables it produces are
generally slower to run).

Commands that compile code (e.g. `alice build`, `alice run`) now take a
`--backend` argument which can be passed `native` or `bytecode`. The default is
`native`.

## Install Alice v0.6.0

On all platforms that support [opam](https://github.com/ocaml/opam), install Alice v0.5.0 with:
<div class="code-with-copy-button code-with-prompt">

```bash
opam update && opam install alice.0.6.0
```
</div>

On Windows, Alice v0.6.0 can be installed with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
<div class="code-with-copy-button code-with-prompt-windows">

```powershell
winget install OCaml.Alice --version 0.6.0
```
</div>


On macOS and Linux, the latest version of Alice can be installed with [Homebrew](https://brew.sh):
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


Alternatively, on macOS and Linux, Alice v0.6.0 can be installed by running the [install script](@/install.md#install-script):
<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh -s -- 0.6.0
```
</div>

On NixOS, Alice v0.6.0 can be installed via the flake
`github:alicecaml/alice#alice_0_6_0.default`, e.g.:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice#alice_0_6_0.default
```
</div>

Read more about installing Alice [here](@/install.md).


## Release Notes

### Added

- Add `--bin` flag as an alias for `--exe` in arguments to `alice new`.
- Build output includes duration.
- Add support for config scripts. If a package has a `config.ml` file at its
  top level, Alice will build and run that file before compiling the package
  and parse directives from its stdout that can affect how the package is
  built. Currently this mechanism can be used to print messages and to add c
  linker args.
- Add "--backend" argument to for choosing the compiler backend. Alice builds
  with the native backend by defdault, but now supports the bytecode backend
  too if `--backend bytecode` is passed.
- Add a `builtins` field to manifests for listing the modules from the standard
  library to make available to the project. By default new projects will
  specify `unix` and `str` here.
- Basic support for packages including C code. All .c files in the src
  directory will be compiled and linked into the  library or executable defined
  in the project.
