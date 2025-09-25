+++
title = "Install"
template = "page.html"
+++

# Install

Install Alice by running the following command:
<div class="code-with-copy-button">
<pre><code>curl -fsSL https://alicecaml.org/install.sh | sh</code></pre>
</div>

You'll need `curl` and `git` to be installed in order to run the script.
After completing the installation the `alice` command will be available in
new terminal sessions. Currently this works on macOS and x86_64 Linux.
Window users can still install Alice [manually](#manual-installation).

For most users this should be sufficient for install
Alice. Read on to learn more about different options for installing Alice.

The installer will create a `~/.alice` directory containing the `alice`
executable, environment scripts which can be sourced in your shell config file
to allow running `alice` as a command, and a shell completion script (currently
just for bash). The installer will offer to automatically modify your shell
config to add `alice` to your `$PATH` variable and install its shell
completions. If you'd rather load Alice into your shell manually,
source the script from `~/.alice/env` appropriate to your shell.

## Installation Options

By default the installer is interactive, however all the interactions can be
skipped by passing command-line arguments. Command-line arguments can be passed
to the installer like:
```
$ curl -fsSL https://alicecaml.org/install.sh | sh -s -- arg1 arg2 ...
```

To see a list of accepted arguments, run:
<div class="code-with-copy-button">
<pre><code>curl -fsSL https://alicecaml.org/install.sh | sh -s -- --help</code></pre>
</div>

An example command which installs Alice non-interactively is:
<div class="code-with-copy-button">
<pre><code>curl -fsSL https://alicecaml.org/install.sh | sh -s -- \
    --no-prompt --install-tools --no-update-shell-config</code></pre>
</div>

This might be handy when installing Alice in an environment where interactivity
is not an option, such as when building a docker image.

## Manual Installation

Pre-compiled executables of Alice can be found on its [Github release
page](https://github.com/alicecaml/alice/releases). Download and extract the
archive appropriate to your system, and copy the file `bin/alice` to one of the directories
in your `PATH` variable.

## Env and Completion Script

The `~/.alice/env` directory is created by the installer by invoking the `alice`
executable. If you installed Alice by other means than the install script, you
can create `~/.alice/env` and install shell completions by running:

<div class="code-with-copy-button">
<pre><code>alice internal setup</code></pre>
</div>

If you want extra control over the shell completion script, `alice` has a
command which generates prints the completion script allowing for some customization:

<div class="code-with-copy-button">
<pre><code>alice internal completions bash</code></pre>
</div>

That command accepts a variety of arguments to customize the script such as
minification. To see the available options check out its help message:
<div class="code-with-copy-button">
<pre><code>alice internal completions bash --help</code></pre>
</div>

## Development Tools

Alice can play the role of a language version manager similar to
[rustup](https://rustup.rs/), [nvm](https://github.com/nvm-sh/nvm), and
[rvm](https://rvm.io/). By default the installer prompts to install an OCaml compiler,
ocamllsp and ocamlformat from Alice's repository of pre-compiled development
tools. These tools can also be installed by running the command:

<div class="code-with-copy-button">
<pre><code>alice tools get</code></pre>
</div>

If you just want to install the compiler and not other tools (e.g. when setting
up an OCaml environment in a github action), run:
<div class="code-with-copy-button">
<pre><code>alice tools get --compiler-only</code></pre>
</div>

All development tools are installed to `~/.alice/current/bin`. The
`~/.alice/current` directory is actually a symlink to a directory like
`~/.alice/roots/5.3.1+relocatable`. Alice organizes tools into what it calls
"roots" which are directory structures resembling a Unix root file-system (with a
"/bin" and "/share" directory for example) containing a set of
mutually-compatible OCaml development tools.

When installing development tools you can specify which version you'd like to
install with the `--root` argument, e.g.:

<div class="code-with-copy-button">
<pre><code>alice tools get --root=5.3.1+relocatable</code></pre>
</div>

Roots are named after the version of the OCaml compiler they contain. Each root
contains a single version of ocamllsp and ocamlformat (often the latest version
of each which is compatible with that compiler version). There is no way to
change the version of ocamllsp and ocamlformat in a particular root.

You can theoretically have multiple different roots installed at the same time
(though at the time of writing only one is available). The "active" root is the
one symlinked to `~/.env/current`. Change the active root with the `alice tools
change` command, e.g.:
<div class="code-with-copy-button">
<pre><code>alice tools change 5.3.1+relocatable</code></pre>
</div>

Each root contains a set of OCaml tools which are mutually compatible.
Compatibility is particularly important because ocamllsp needs to have been
compiled with the same compiler as will be used to compile the code which it
analyses.

Sourcing the script in `~/.alice/env` appropriate for your shell will add a pair
of directories to your `$PATH` variable: `~/.alice/alice/bin` which contains the
`alice` executable, and `~/.alice/current/bin` which contains all the
development tools in your current root.
