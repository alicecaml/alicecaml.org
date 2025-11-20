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
A package can also be both an executable _and_ a library if it has both a
`main.ml` and a `lib.ml` file.

If a package is a library then other packages can depend on it, and access the
definitions from its public interface via a module named after the package (but
with the first letter capitalized to comply with OCaml's module naming rules).
Alice packages must be named such that capitalizing the first letter of their
name gives a valid OCaml module name.
I'll refer to this module as a _package module_. In Alice, the only way to refer to
definitions from a package other than the current package is via the other
package`s package module.

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
1. The only _package modules_ that can be accessed by code in a package are those of its
   _immediate dependencies_. It is a compile error for a package to refer to a
   _package module_ from other packages in its _dependendcy closure_ other than
   those of its _immediate dependencies_.
1. The only definitions which can be accessed inside a _package module_ are those
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
(* leak.ml *)

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
non-immediate dependencies, violating both hygiene properties. Dune does have
what we might call "soft" hygiene since it renames modules so they are unlikely
to be referred to by accident, but someone determined to intentionally violate
package hygiene can do so.

Note that Dune might be about to get true package hygiene in an upcoming release
thanks to [this PR](https://github.com/ocaml/dune/pull/12666). This uses a
newish flag to the OCaml compiler, `-H`, which had I been aware of while doing
the work described below, may have simplified things greatly! Still, I've come
up with a solution that will work with older compilers lacking this flag, and
employs what I think are some interesting techniques to work around the fact
that until the recent addition of `-H`, for reasons I'll explain below, the
OCaml compiler did not make it easy to implement hygienic package management.

## Why Hygienic Packages in OCaml is (was?) Hard

The compiler has no concept of packages. The compiler compiles OCaml source
files into object files, and links object files into executables or library
archives. Package managers for OCaml must implement packaging policies (such as
hygiene) on top of the primitives made available by the compiler.

OCaml source files may depend on each other. Each file implicitly defines a
module named after the file, and code in one file may refer to modules
corresponding to other files, provided there are no dependency cycles between
files. When compiling a file which refers to a module that isn't in scope, the
compiler will try to find an object file whose name indicates that it contains the
module in question. The compiler searches for this object file in the same
directory as the file it's currently compiling, and also in each directory
passed to the compiler with the `-I` flag.

Let's see how we might implement the first of my two hygiene properties,
that only the immediate dependencies of a package may be referred to by that
package. A reasonable approach to build a package with the first hygiene
property might be:
1. Build all the packages in the _dependency closure_ of the package (by
   recursively applying this strategy), storing the compiled object files in
   some directory corresponding to their package.
1. Build the package, passing with `-I` the directory containing object files
   for each _immediate dependency_ of the package only.

Since packages in the dependency closure but which aren't immediate dependencies
are excluded in step 2 above, hygiene is achieved since the package code being
compiled doesn't have access to them.

This gives us the desired hygiene property, however certain correct programs
won't compile with this policy due to _module aliases_. In OCaml a module
defined in one file may be aliased by another file, but when compiling code
that refers to the aliased module, even indirectly, the directory containing the
_original_ module definition must be passed with  `-I`. So if we have packages
`a`, `b`, and `c`, where `a` depends on `b` and `b` depends on `c`, and the
public interface to `b` has:
```ocaml
module C_alias = C
```
...and `a` refers to `B.C_alias`, then in order to build `a` we need to pass
the path to `c`'s object files with `-I`, because the compiler needs `c`'s object file to
compile `a`, which refers to `c` indirectly via a module alias in `b`.
However passing `c`'s object files with `-I` would make it possible for `a` to
refer to `c` _directly_, which violates the first hygiene property.

This is where `-H` comes in handy. That option acts similarly to `-I`, in that
it lets the compiler use modules defined in a directory when compiling code that
refers to them, however unlike `-I` it doesn't allow code to refer to these
modules _directly_. So a hygienic approach to building a package using `-H`
might be to pass the paths to directories containing compiled object files for
immediate dependencies with `-I`, and for other packages in the dependency
closure with `-H`, allowing their modules to be used during compilation but not
referred to directly.

Note that the approach above is only sufficient for the first hygiene property.
On its own it's not sufficient to enforce the second hygiene property, to
prevent packages from accessing private code from its immediate dependencies.

As I said earlier, I wasn't aware of `-H` when implementing hygienic packages in
Alice. Instead I've come up with a packaging protocol that gives both hygiene
properties using some other compiler features and a small amount of generated
code.

## Package Hygiene in Alice
