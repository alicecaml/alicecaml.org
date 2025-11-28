+++
title = "Alice v0.1.3"
date = 2025-11-28
slug = "alice-v0.1.3"

[taxonomies]
tags = ["release"]
+++

Announcing the release of
[Alice v0.1.3](https://github.com/alicecaml/alice/releases/tag/0.1.3).
This is a patch release though it
doesn't make any visible changes. The purpose of the release is to add a
[patch](https://github.com/alicecaml/alice/blob/0.1.3/packaging/replace-compiler-version-with-template-in-lockdir.patch)
which replaces the OCaml compiler version number in all lockfiles with a template
placeholder. This makes it possible to change the version of the compiler that
Dune expects to see in the environment when building the project. This is
simplifies packaging Alice for Homebrew, and possibly for other package managers
in the future.

Alice builds with Dune Package Management, however Dune (by way of it using
Opam's packaging conventions) requires that the OCaml compiler either be built
as a dependency of the project or be installed system-wide with that compiler's
version stored in the lock directory. The first option is not desirable as it
would make Alice very slow to install, since compiling the OCaml compiler can
take a long time. The second option isn't possible in Homebrew, since the
`ocaml` package will be updated independently of Alice, meaning that whatever
compiler version the project is configured to expect, it will see an unexpected
version each time the `ocaml` package is update

[Alice's Homebrew
formula](https://github.com/alicecaml/homebrew-tap/blob/main/Formula/alice.rb)
uses a hybrid of both approaches. Its lock directory expects a compiler to be
installed system-wide of some arbitrary version, and before compilation the
install script replaces this version with whatever version of the OCaml compiler
brew decided to install as a dependency of Alice. This way Alice's Homebrew package can
be installed relatively quickly and will continue to work as the OCaml compiler
in Homebrew's repository gets updated.

For all Alice's other dependencies
(besides the compiler), Dune installs them with its internal package management
mechanism. A potential alternative to this would be to rely entirely on Homebrew
to install Alice's dependencies. This is how Alice's Opma and Nix packages work -
rely on the foreign (i.e. non-Dune) package manager to do _all_ the package
management. Currently this isn't an option for Homebrew because most of the
OCaml libraries it uses aren't in Homebrew's repository.

Install Alice with Homebrew by running:
<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>


## Release Notes

### Added

- Add a patch that replaces the locked compiler version with a template string to simplify packaging
