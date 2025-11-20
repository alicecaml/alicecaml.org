+++
title = "Package Hygiene in Alice"
date = 2025-11-20
slug = "package-hygiene-in-alice"

[taxonomies]
tags = ["implementation"]
+++

Alice organizes code into packages. All the code for a package goes in OCaml
source files in the package's `src` directory. The presence of a `main.ml` file
indicates that the package is _executable_, and will be linked into a program
with the same name as the package. The presence of a `lib.ml` file indicates
that the package is a _library_, and the contents of the `lib.ml` file (or
`lib.mli` file if present) is the _public interface_ to the package. 

If a package is a library then other packages can depend on it, and access the
definitions from its public interface via a module named after the package (but
with the first letter capitalized to comply with OCaml's module naming rules).
Alice packages must be named such that capitalizing the first letter of their
name gives a valid OCaml module name.
I'll refer to this module as a _package module_. In Alice, the only way to refer to
definitions from a package other than the current package is via the other
package`s package module.

A package can also be both an executable _and_ a library.

Packages can depend on other packages, which themselves depend on more packages,
forming a [Directed Acyclic
Graph (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph).

A package's _immediate dependencies_ are those packages which it directly
depends on; exactly those packages listed in the `[dependencies]` section of the
package's manifest.

The _dependency closure_ of a package is that package's immediate
dependencies, plus the immediate dependencies of all of its immediate
dependencies, and so on.

In the two graphs below, the one on the left highlights in cyan the immediate
dependencies of `a`, whereas the one on the right highlights in cyan the
dependency closure of `a`.

<div style="display:flex">

![A DAG where the immediate dependencies of node "a" are highlighted](immediate-dependencies.png)

![A DAG where the dependency closure of node "a" are highlighted](dependency-closure.png)

</div>

## Package Hygiene

_Package hygiene_ refers to what code a package has access to from its
dependencies. Let's call a package management system _hygienic_ if code in one
package only has access to code from the _public interfaces_ of the package's
_immediate dependencies_.

Let's break this definition down into two properties:
- The only _package modules_ that can be accessed by code in a package are those of its
  _immediate dependencies_. It is a compile error for a package to refer to a
  _package module_ from other packages in its _dependendcy closure_ other than
  those of its _immediate dependencies_.
- The only definitions which can be accessed inside a _package module_ are those
  from the package's _public interface_. It's a compile error for a package to
  refer to a definition from a dependency which is not exposed in its _public
  interface_ (i.e. the package's `lib.ml` file).

## Package Hygiene in Dune?

It may come as a surprise to learn that in Dune violates both of the above
hygiene
properties. This can be demonstrated succinctly with a small project depending
on the [core](https://github.com/janestreet/core) package:
```dune
(lang dune 3.20)
; dune-project

(package
 (name leak)
 (depends
  ocaml
  (core
   (= v0.17.1))))
```
```dune
; dune

(executable
 (public_name main)
 (package leak)
 (libraries core))
```
```ocaml
let () = 
  let _ : unit Sexplib0__Sexp_conv_labeled_tuple.Fields.t =
    Sexplib0__Sexp_conv_labeled_tuple.Fields.Empty
  in
  ()
```

This code has access to a module `Sexplib0__Sexp_conv_labeled_tuple` which
corresponds to the `sexp_conv_labeled_tuple.ml` file from the package `sexplib0`,
which is a dependency of the package `sexplib`, which is a dependency of `core`.
Opam packages (which Dune uses) follow a convention of putting their public code
in a module named after the package, and under this convention the
`Sexp_conv_labeled_tuple` module referred to above isn't part of the public interface
to `sexplib0`.

So Dune allows code in a package to access private definitions from
non-immediate dependencies. Dune does have what we might call "soft" hygiene
since it does rename the module to something which is unlikely to be referred to
by accident, but someone determined to intentionally violate package hygiene can
do so.

Note that Dune might be about to get true package hygiene in an upcoming
release thanks to [this PR](https://github.com/ocaml/dune/pull/12666).
This uses a newish flag to the OCaml compiler `-H`, which had I been aware of
while doing the work described below, may have simplified things greatly! Still,
I've come up with a solution that will work with older compiler versions, and
employs what I think are some interesting techniques to work around the fact
that until the recent addition of `-H`, for reasons I'll explain below,
the OCaml compile did not make it easy to implement hygienic package management.


## Package Hygiene in Alice

One of Alice's goals is to explore what's possible in the build system and
package management space if the conventions set by Opam are lifted.
