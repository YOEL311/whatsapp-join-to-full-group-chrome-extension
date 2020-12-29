chrome.storage.sync.clear();
const button = document.getElementById("button");
const validation = document.getElementById("validation");
sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// adding listener to your button in popup window
button.addEventListener("click", async () => {
  const URLGroup = document.getElementById("URLGroup").value;
  if (!URLGroup) {
    validation.innerHTML = "pleases enter url for group";
    validation.className = "show";
    await sleep(3000);
    validation.className = validation.className.replace("show", "");
  } else if (!URLGroup.startsWith("https://chat.whatsapp.com")) {
    validation.innerHTML = "URL not valid";
    validation.className = "show";
    await sleep(3000);
    validation.className = validation.className.replace("show", "");
  } else {
    chrome.storage.sync.set({ URLGroup });
    chrome.extension.sendMessage({ action: "startAction" });
    validation.innerHTML = "I'm going to work for you";
    validation.className = "show";
    await sleep(3000);
    validation.className = validation.className.replace("show", "");
    window.close();
  }
});
