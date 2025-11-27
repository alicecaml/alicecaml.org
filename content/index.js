document.addEventListener('DOMContentLoaded', function() {
  // Add a button that copies the contents of the associated code element to the clipboard.
  for (const codeDiv of document.querySelectorAll('.code-with-copy-button')) {
    const codeText = codeDiv.querySelector('code').innerText.trimEnd();
    const copyButton = document.createElement('button');
    copyButton.classList.add('code-copy-button');
    copyButton.onclick = () => {
      navigator.clipboard.writeText(codeText);
      console.log('Copied to clipboard: ', codeText);
    };
    codeDiv.appendChild(copyButton);
  }
  populate_os_picker();
  show_os(detect_os());
});

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
