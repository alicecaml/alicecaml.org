+++
title = "Buzz"
date = 2025-11-27
slug = "buzz"

[taxonomies]
tags = ["community"]
+++

People are talking about Alice online.

[Here](https://discuss.ocaml.org/t/announcing-the-first-release-of-alice-a-radical-ocaml-build-system/17472/15)'s
my announcement post on the OCaml discuss forum where the project received a
fair amount of praise as well as some helpful feedback.

The project has almost 100 Github stars (98 at the time of writing). I'd been
checking the number of stars each day because one of Homebrew's
[requirements](https://docs.brew.sh/Acceptable-Formulae) for acceptable
packages in `homebrew-core` is "notability", which can be measured in stars,
and you need 75. Another requirement is someone other than me has to use the
project which I don't qualify for yet. As far as I know there's a
[single](https://github.com/gridbugs/climate) Alice package out there, and it's
mine.

One day the number of stars shot up by about 15 which surprised me until I
tracked down [this
post](https://lobste.rs/s/ttsydj/alice_new_build_system_for_ocaml) on Lobsters.
I love when someone else posts about one of my projects. It's happened with
Alice several times now but this is the only one to generate any discussion.

Homebrew may not allow niche projects into their core repository but
[WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/) -
the inbuilt CLI package manager for Windows - has no such requirement.
I just published an Alice package to WinGet's repo, and now Windows users can install Alice by running:
<div class="code-with-copy-button code-with-prompt-windows">

```
winget install OCaml.Alice
```
</div>
