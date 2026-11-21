<div id="install">

<div class="os-picker">
</div>

<div id="windows" class="os">

Install on Windows with [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/):

<div class="code-with-copy-button code-with-prompt-windows">

```bash
winget install OCaml.Alice
```

</div>

Alternatively you can install Alice from its <a href="https://opam.ocaml.org">opam</a> package:

<div class="code-with-copy-button code-with-prompt-windows">

```bash
opam install alice
```
</div>

Additionally, you'll need a C compiler to use Alice on Windows. It's recommended to install [msys2](https://www.msys2.org)
and add the path to the directory containing `cc.exe` to your `PATH` variable. For example assuming the default install
location for msys2, in PowerShell run:

<div class="code-with-copy-button code-with-prompt-windows">

```powershell
$env:PATH += ";C:\msys64\mingw64\bin"
```
</div>

...or in CMD.EXE run:

<div class="code-with-copy-button code-with-prompt-windows">

```cmd
set PATH=%PATH%;C:\msys64\mingw64\bin
```
</div>

</div>

<div id="macos" class="os">

Install on macOS with [Homebrew](https://brew.sh):

<div class="code-with-copy-button code-with-prompt">

```bash
brew install alicecaml/homebrew-tap/alice
```
</div>

...or run the install script:

<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh
```
</div>

You'll need `curl` and `git` to be installed in order to run the script.
After completing the installation the `alice` command will be available in
new terminal sessions.

Alternatively you can install Alice from its <a href="https://opam.ocaml.org">opam</a> package:

<div class="code-with-copy-button code-with-prompt">

```bash
opam install alice
```
</div>
</div>

<div id="linux" class="os">

Install on Linux with the install script:

<div class="code-with-copy-button code-with-prompt">

```bash
curl -fsSL https://alicecaml.org/install.sh | sh
```
</div>

You'll need `curl` and `git` to be installed in order to run the script.
After completing the installation the `alice` command will be available in
new terminal sessions.

Alternatively you can install Alice from its <a href="https://opam.ocaml.org">opam</a> package:

<div class="code-with-copy-button code-with-prompt">

```bash
opam install alice
```
</div>

On NixOS you can instead use the flake `github:alicecaml/alice`, for example:
<div class="code-with-copy-button code-with-prompt">

```bash
nix shell github:alicecaml/alice
```

</div>


</div>

<div id="other" class="os">

Install on any platform supported by <a href="https://opam.ocaml.org">opam</a> by installing Alice's opam package:

<div class="code-with-copy-button code-with-prompt">

```bash
opam install alice
```
</div>
</div>
</div>
<script src="{{ config.base_url | safe }}/os-picker.js"></script>
<script>
populate_os_picker();
show_os(detect_os());
</script>
