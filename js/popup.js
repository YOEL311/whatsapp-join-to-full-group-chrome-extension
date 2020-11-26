chrome.storage.sync.clear();
const button = document.getElementById("button");
const validation = document.getElementById("validation");

// adding listener to your button in popup window
button.addEventListener("click", () => {
  const URLGroup = document.getElementById("URLGroup").value;
  if (!URLGroup) {
    validation.innerHTML = "pleases enter url for group";
  } else if (!URLGroup.startsWith("https://chat.whatsapp.com")) {
    console.log("no valid");
    validation.innerHTML = "URL not valid";
  }
  // else if

  chrome.extension.sendMessage({ action: "startAction" }, (response) => {
    const success = response.received;
    console.log("startAction", success);
  });

  chrome.storage.sync.set({ URLGroup });
  // chrome.storage.sync.set({  });
});
