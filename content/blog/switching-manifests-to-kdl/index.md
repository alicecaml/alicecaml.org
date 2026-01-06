+++
title = "Switching Manifests to KDL"
date = 2026-01-01
slug = "switching-manifests-to-kdl"

[taxonomies]
tags = ["implementation"]
+++

Starting with the upcoming release of Alice v0.4.0, package manifests will change from TOML to
[KDL](https://kdl.dev). The main reason is to avoid issues with nesting tables.

Manifests are currently very simple but as Alice gains more features the
manifest format will need to be extended, and I don't want the syntactic
difficulty of nesting tables in TOML to get in the way. There's already an
example of this in the TOML manifest format:
```toml
[package]
name = "foo"
version = "0.1.0"

[dependencies]
bar = { path = "../bar" }
baz = { path = "../baz" }
```

Note how the "dependencies" table isn't actually inside the "package" table, but
rather they are adjacent in the document hierarchy. I implemented it this way
initially because I wanted to quickly get something working, and when in doubt
about UX I just copied whatever cargo does because I generally like its UX.

However this metadata format doesn't capture the fact that dependencies are _part of_ a package.

This fact is reflected in Alice's implementation of packages:
```ocaml
type t =
  { id : Package_id.t
    (** The name and version of the package. *)
  ; dependencies : Dependencies.t option
    (** This is an [_ option] so that a manifest with an empty dependencies
        list and a manifest with no dependencies list can both round trip via
        this type. *)
  }
```

And ideally it would also be reflected in package metadata, which means writing
something like:
```toml
[package]
name = "foo"
version = "0.1.0"

[package.dependencies]
bar = { path = "../bar" }
baz = { path = "../baz" }
```

...but I don't like that because it repeats the word "package".

I believe that a tool's UI should teach users how to think about the tool,
and so the representation of a package's metadata in its manifest should
reflect a working mental model of packages. A package _has_ dependencies just
like it _has_ a name and version. The representation of dependencies in package
metadata should be _inside_ the package instead of next to it.

Considering alternative popular formats, I find that XML is too verbose, JSON
requires quotes on keys and some versions don't support trailing commas or
comments, and I always make mistakes with indentation when writing YAML. TOML was still the best
option I was aware of, especially considering I expect users to modify these
files manually.

Then somebody on the OCaml forum suggested trying out KDL and I really like it.
Package metadata would look like:
```alice-kdl
package {
  name foo
  version "0.1.0"
  dependencies {
    bar path="../bar"
    baz path="../baz"
  }
}
```

I like this because the structure of the metadata matches the intuition for what a package is; dependencies are _part of_ a package.

KDL also lets us avoid writing `bar = { path = "../bar" }` when describing a dependency, which I find a little
awkward because of the two `=` appearing on that line. KDL distinguishes between _nodes_ and _properties_.
The entire dependency description `bar path="../bar"` is a node named "bar", and `path="../bar"` is a
property of that node. You only need to write `=` when assigning values to properties, and not when defining nodes.

There are some other nice properties of KDL, such as "slashdash comments" which
allow commenting-out entire nodes, which I expect to come in handy when
manually editing package metadata during debugging and development.

Fortunately Alice is still simple enough that migrating existing manifests from TOML to KDL is easy.
The example manifest on this page showcases the entire manifest syntax so should serve as a migration guide.
