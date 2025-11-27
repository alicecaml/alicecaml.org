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

<script>
function populate_os_picker() {
  function make_button(name, title) {
    const button = document.createElement("button");
    button.id = name + "-button";
    button.classList.add("os-button");
    button.onclick = () => show_os(name);
    button.innerText = title;
    return button;
  }
  function make_button_li(name, title) {
    const li = document.createElement("li");
    li.appendChild(make_button(name, title));
    return li;
  }
  for (let os_picker of document.getElementsByClassName("os-picker")) {
    const ul = document.createElement("ul");
    os_picker.appendChild(ul);
    ul.appendChild(make_button_li("windows", "Windows"));
    ul.appendChild(make_button_li("macos", "macOS"));
    ul.appendChild(make_button_li("linux", "Linux"));
    ul.appendChild(make_button_li("other", "Other"));
  }
}

function detect_os() {
  const platform = navigator.platform;
  if (platform === "Win32") {
    return "windows";
  }
  const platform_parts = platform.split(/ +/);
  if (platform_parts[0] === "Linux") {
    return "linux";
  } else if (platform.slice(0, 3) === "Mac") {
    return "macos"
  }
  return "other";
}

function show_os(os) {
  for (os_element of document.getElementsByClassName("os")) {
    os_element.style.display = "none";
  }
  for (os_element of document.getElementsByClassName("os-button")) {
    os_element.classList.remove("selected");
  }
  document.getElementById(os).style.display = "block";
  document.getElementById(os + "-button").classList.add("selected");
}

populate_os_picker();
show_os(detect_os());
</script>
