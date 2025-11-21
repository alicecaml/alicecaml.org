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
Graph (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph) where the nodes
are packages and edges represent the dependency relationship between two packages.

A package's _immediate dependencies_ are those packages which it directly
depends on; exactly those packages listed in the `[dependencies]` section of the
package's manifest.

The _dependency closure_ of a package is that package's immediate
dependencies, plus the immediate dependencies of all of its immediate
dependencies, and so on.

The first graph below highlights in cyan the immediate dependencies of `a` and
the second graph highlights `a`'s dependency closure.

<div style="display:flex">

![A DAG where the immediate dependencies of node "a" are highlighted](immediate-dependencies.png)

![A DAG where the dependency closure of node "a" are highlighted](dependency-closure.png)

</div>

## Package Hygiene

I'll introduce the concept of _package hygiene_ which refers to how much of the code from a package's
dependency closure is inaccessible by that package.
Let's call a package management system _hygienic_ if code in one
package only has access to code from the _public interfaces_ of its
_immediate dependencies_.

Let's break this definition down into two properties:
1. The only _package modules_ that can be accessed by code in a package are those of its
   _immediate dependencies_. It is a compile error for a package to refer to a
   _package module_ from packages in its _dependendcy closure_ other than
   those of its _immediate dependencies_.
1. The only definitions which can be accessed inside a _package module_ are those
   from the package's _public interface_. It's a compile error for a package to
   refer to a definition from a dependency which is not exposed in its _public
   interface_ (i.e. the package's `lib.ml` file).

Package hygiene is a useful property for software maintenance and safety.

The first property means that packages are forced to specify as dependencies, exactly the packages that
they need access to, and are only given direct access to those packages.
Without this property, packages can break due to the removal of
load-bearing transitive dependencies. If `a` depends on `b`, and `b`
depends on `c`, and `a` starts referring to `c` directly without
explicitly adding it as a dependency, then `a` could break if `b` ever
removes its dependency on `c`, or changes the version of `c` that it
depends on. The maintenance burden on a package ecosystem can be
reduced if the package manager doesn't let you get into this situation
in the first place.

The second property allows packages to make strong guarantees about correctness, since
the only way to interact with a package is through a specific
interface. The public interface to a package can be designed to
enforce invariants over the types defined in that package, and there's
no way for client code to circumvent the interface to bypass those
protections.

## Package Hygiene in Dune?

Dune lacks both of the above
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
Opam packages follow a convention of putting their public code
in a module named after the package, and under this convention the
`Sexp_conv_labeled_tuple` module referred to above isn't part of the public interface
to `sexplib0`.

So Dune allows code in a package to access private definitions from
non-immediate dependencies, violating both hygiene properties. Dune does have
what we might call "soft" hygiene since it renames modules so they are unlikely
to be referred to by accident, but someone determined to intentionally violate
package hygiene can do so.

Fortunately Dune might be about to get true package hygiene in an upcoming release
thanks to [this PR](https://github.com/ocaml/dune/pull/12666). This uses a
newish option to the OCaml compiler, `-H`:
```
 -H <dir>  Add <dir> to the list of "hidden" include directories
     (Like -I, but the program can not directly reference these dependencies)
```
Had I been aware of `-H` while doing
the work described below adding package hygiene to Alice, it would have simplified things greatly!
I didn't notice it because it's not in the compiler's man page, though clearly
I didn't look very hard because it is in the output of `-help`.
Still, I've come
up with a solution that will work with older compilers lacking this feature, and
employs what I think are some interesting techniques to work around the fact
that until the relatively recent addition of `-H`, the
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
passed to the compiler with the `-I` option.

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

This gives us the desired hygiene property, however some correct programs
won't compile with this policy due to _module aliases_. In OCaml a module
defined in one file may be aliased by another file, but when compiling code
that refers to the aliased module, even indirectly, the directory containing the
_original_ module definition must be passed with  `-I`. Suppose we have packages
`a`, `b`, and `c`, where `a` depends on `b` and `b` depends on `c`, and the
public interface to `b` has:
```ocaml
module C_alias = C
```
If package `a` refers to `B.C_alias`, then in order to build `a` we need to pass
the path to the directory containing `c`'s object files with `-I`.
However passing `c`'s object files with `-I` would make it possible for `a` to
refer to `c` _directly_, which violates the first hygiene property.

This is where the new `-H` option might save us. That option acts similarly to `-I`, in that
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
Alice. Instead I've come up with a packaging protocol that enforces both hygiene
properties using some other compiler features and a small amount of generated
code.

## Package Hygiene in Alice

In order to resolve module aliases, the object files from each package in the
dependency closure of the package being built must be made known to the compiler
by passing their containing directories with `-I`. Alice does this in a hygienic
way by generating modules which
[shadow](https://en.wikipedia.org/wiki/Variable_shadowing)
the modules that should be inaccessible.

### Compiler Features

Alice's packaging protocol depends on two compiler options I hadn't previously
encountered:
`-open` and `-pack`.

The `-open Some_module` option takes a module name `Some_module`, and when
compiling a file, acts as though the file began with a new line `open
Some_module`. (Read [this](https://ocaml.org/docs/modules#naming-and-scoping) to
learn more about what it means to open a module in OCaml.)
The `-open` option can be passed multiple times, resulting in the effect
of multiple `open <module>` lines being at the start of the compiled file, in the same
order as their corresponding `-open` options.

The `-pack` option creates an object file combining a given set of existing
object files, making each of their corresponding modules accessible as
sub-modules. For example:
```
ocamlopt.opt -pack foo.cmx bar.cmx baz.cmx -o qux.cmx
```
This creates a new module `Qux` with the object file `qux.cmx`. The modules
`Foo`, `Bar`, and `Baz` can now be accessed within `Qux` as `Qux.Foo`,
`Qux.Bar`, and `Qux.Baz` respectively. Importantly these are _not_ module
aliases. Code accessing the modules via `qux.cmx` can be compiled
_without_ access to `foo.cmx`, `bar.cmx`, or `baz.cmx`.

When compiling a file that will eventually be passed to
`ocamlopt.opt -pack foo.cmx`,
it's necessary to pass an additional option `-for-pack Foo`, specifying the name
of the module that the file will eventually be packed into as a sub-module.

### The Packaging Protocol

To build a package, first recursively apply the process I'm about to describe
to build the immediate dependencies of the package, which will result in the
package's dependency closure being built.

The result of building a package is stored across several different directories:
- The package's _private_ output directory contains the compiled artifacts
  corresponding to each source file of the project. There's a roughly one to one
  mapping between `.ml` source files and `.cmx` object files. All the object files go
  in this private output directory.
- The package's _public_ output directory contains a file named
  `internal_modules_of_<package>.cmx` (replacing `<package>` with the name of
  the package), which is the output of running `ocamlopt.opt -pack ...` on all the
  object files in the package's private directory. All top-level modules of the
  package, corresponding to source files, are accessible as sub-modules of the
  `Internal_modules_of_<package>` module. There's a second file in the public
  directory named `public_interface_to_open_of_<package>.cmx` which is the result of
  compiling a generated file. This file defines the module that will be
  `-open`ed when compiling code in packages depending on this package.
- The package's _generated_ output directory, containing the generated
  `public_interface_to_open_of_<package>.ml` file, that will be compiled to the
  `public_interface_to_open_of_<package>.cmx` file in the public directory.

Once all the dependencies of the package have been built, compile each source
file in the package. When compiling a source file, for each package in the
package's dependency closure, pass that package's public output directory with
`-I`. For each of the package's immediate dependencies, pass `-open
Public_interface_to_open_of_<dependency>`. The file needs to be compiled with the
`-for-pack` option since it will eventually be packed into a file
`internal_modules_of_<package>.cmx`. Store the output in the package's private
output directory.

For example, to compile a source file `a.ml` from a package named `foo`, whose
dependency closure is the packages `bar`, `baz`, and `qux`, and whose immediate
dependencies are `bar` and `qux`, compile it with:
```
ocamlopt.opt a.ml -c \
  -I path/to/bar/public \
  -I path/to/baz/public \
  -I path/to/qux/public \
  -open Public_interface_to_open_of_bar \
  -open Public_interface_to_open_of_qux \
  -for-pack Internal_modules_of_foo \
  -o path/to/foo/private/a.cmx
```

Once all the source files from the package have been compiled, create the
`internal_modules_of_<package>.cmx` file by running the compiler with `-pack`,
passing it all the object files from the package's private directory.
Store the result in the package's public output directory.

Continuing the example, assume the package has source files `a.ml`, `b.ml`,
`c.ml`, and `lib.ml` (remember `lib.ml` defines the public interface to the
package). Create the `internal_modules_of_foo.cmx` object file with the command:
```
ocamlopt.opt -pack \
  path/to/foo/private/a.cmx \
  path/to/foo/private/b.cmx \
  path/to/foo/private/c.cmx \
  path/to/foo/private/lib.cmx \
  -o path/to/foo/public/internal_modules_of_foo.cmx
```

It might seem odd to store the internal modules of a package in its public
output directory. This directory is public in the sense that all packages
depending on this package will have access to the public directory with `-I`,
however due to shadowing of the `Internal_modules_of_<package>` module name in
the `-open`ed `Public_interface_to_open_of_<package>` module, client code won't actually
have access to the package's internal modules.

Now generate a file in the package's generated output directory named
`public_interface_to_open_of_<package>.ml`. I'll illustrate this
generated file by continuing the example above:
```ocaml
(* public_interface_to_open_of_foo.ml *)

(* Recall that the public interface to a package is defined in a file
   named "lib.ml" which corresponds to a module named "Lib", which is
   among the modules packed into the "Internal_modules_of_<package>"
   module. Client code must be able to refer to the package by the
   package's name, so define a module alias here named after the package,
   aliasing the "Lib" module defined in the package. This will allow
   client code to refer to the public interface of the package with a
   module named after the package. *)
module Foo = Internal_modules_of_foo.Lib

(* Shadow the internal modules of this package. Since the
   "Public_interface_to_open_of_<package>" module will be opened by all
   client code, defining a new module here named the same as the packed
   module of internal modules will mean that if client code does try to
   access the internals of this package, instead they get an empty
   module. This enforces the second hygiene property, preventing client
   code from accessing the private internals of its immediate
   dependencies. If someone does try to refer to this shadowed module
   anyway, the deprecated annotation will mean they see a compiler
   warning. *)
module Internal_modules_of_foo = struct end
[@@deprecated "This module is for internal use only."]

(* Shadow the internal modules of the packages in the dependency
   closure of this package. The public output directory of each package in
   the dependency closure of this package is passed with -I when
   compiling files from packages that depend on this package. Shadowing
   the names of the packed internal modules of those packages prevents
   access to their internals by clients of this package. *)
module Internal_modules_of_bar = struct end
[@@deprecated "This module is for internal use only."]
module Internal_modules_of_baz = struct end
[@@deprecated "This module is for internal use only."]
module Internal_modules_of_qux = struct end
[@@deprecated "This module is for internal use only."]

(* Shadow the public interface to each of the packages in the
   dependency closure of this package, preventing client code from
   referring to packages outside their immediate dependencies. This
   enforces the first hygiene property. *)
module Public_interface_to_open_of_bar = struct end
[@@deprecated "This module is for internal use only."]
module Public_interface_to_open_of_baz = struct end
[@@deprecated "This module is for internal use only."]
module Public_interface_to_open_of_qux = struct end
[@@deprecated "This module is for internal use only."]
```

That final batch of module shadowing requires some care.
In the example, `foo` immediately depends on `bar` and `qux`.
But if `bar` also depended on `qux`, then inside
`Public_interface_to_open_of_bar`, we would find the line:
```ocaml
module Public_interface_to_open_of_qux = struct end
```
That is, `bar` would shadow the public interface to `qux`.
When compiling files in `foo`, if `Public_interface_to_bar`
is opened before `Public_interface_to_qux`, then due to module name shadowing,
`Public_interface_to_qux` will be the empty shadow rather than the
true public interface to the package `qux`.

To avoid this problem, it's necessary to sort the `-open` arguments to
the compiler such that if one dependency depends on another dependency, the
depended upon package comes before the depending package (`qux` must
come before `bar` in the example).

Once the `public_interface_to_open_of_<package>.ml` file is generated,
compile it, storing the result in the package's public output
directory. The package's public output directory must be passed with `-I` since
the generated code refers to `Internal_modules_of_<package>`.

```
ocamlopt.opt path/to/foo/generated/public_interface_to_open_of_foo.ml -c \
  -I path/to/foo/public \
  -o path/to/foo/public/public_interface_to_open_of_foo.cmx
```

And that's it! All the necessary files are now in the package's public
output directory where they can be consumed while building any additional
packages which depend on the current one.

One final note:
In order to link an executable that depends on packages, library
archives (`.cmxa` files) must be generated for those packages. To create a
`.cmxa` file for a package, Alice links the `.cmx` files in the
package's public directory. E.g.:
```
ocamlopt.opt \
  path/to/foo/public/public_interface_to_open_of_foo.cmx \
  path/to/foo/public/internal_modules_of_foo.cmx \
  -a -o path/to/foo/public/lib.cmxa
```

To learn more, try compiling some interdependent Alice packages. See
[here](https://github.com/alicecaml/alice?tab=readme-ov-file#tutorial) for
a brief tutorial on building packages with Alice. Run `alice build -vv` to see a
list of all the commands run by Alice, and inspect the contents of the `build`
directory to see the different output files created when building each package.
