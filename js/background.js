//listeners
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  console.log("request background", request.action);
  switch (request.action) {
    case "startAction":
      sendResponse({ received: "success" });
      injectScript();
      break;
    case "successToJoin":
      sendResponse({ received: "success" });
      chrome.alarms.clear("start");
      sendNotificationSuccess();
      break;
    case "groupFull":
      sendResponse({ received: "success" });
      chrome.alarms.create("startAction", { delayInMinutes: 0.1 }); //TODO:
      break;
    case "alreadyJoined":
      sendResponse({ received: "success" });
      chrome.alarms.clear("start");
      break;
    default:
      console.log("default");
      break;
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("alarm", alarm);
    if (alarm === "startAction") {
      injectScript();
    }
  });
});

//actions
const injectScript = async () => {
  const id = await hasTab;
  if (id) updateTabEndExact(id);
  else createTabEndExact();
};
const createTabEndExact = () => {
  chrome.tabs.create({ url, active: false }, (tab) => {
    exact(tab.id);
  });
};

const updateTabEndExact = async (tabId) => {
  const res = await ensureSendMessage(tabId, "checkIsUserWriting");
  if (!res.isWrite) {
    chrome.tabs.update(tabId, { url, active: false }, (tab) => {
      exact(tab.id);
    });
  } else {
    chrome.alarms.create("startAction", { delayInMinutes: 3 });
  }
};

const exact = (tabId) => {
  setTimeout(() => ensureSendMessage(tabId, "openGroupLink"), 2000);
  setTimeout(() => ensureSendMessage(tabId, "tryToJoin"), 6000);
};

const hasTab = new Promise((resolve) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const a = tabs.find(
      (tab) =>
        tab.url.startsWith("https://web.whatsapp.com/") ||
        tab.url.startsWith("https://chat.whatsapp.com/")
    );
    resolve(a?.id);
  });
});

// "https://chat.whatsapp.com/BCr1VYo6dnREoY5ohs3UgJ"
// const url = "https://chat.whatsapp.com/CbhfW7KWFBiJKqaGbEKptY"; //full
const url = "https://chat.whatsapp.com/JYOs0EohqM1LNmtcnTMTfn"; //new full
// const url = "https://chat.whatsapp.com/KHguvidFlNKA40tTMjzzbP";

//utilities
const sendNotificationSuccess = () => {
  chrome.notifications.create("successToJoin", {
    type: "basic",
    iconUrl: "images/icon.png",
    title: "success to join",
    message: "You have successfully joined the group!",
  });
};

const ensureSendMessage = (tabId, message) =>
  new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { ping: true }, (response) => {
      if (response && response.pong) {
        // Content script ready
        chrome.tabs.sendMessage(tabId, { action: message }, (response) => {
          resolve(response);
        });
      } else {
        // No listener on the other end
        console.log("executeScript again");
        chrome.tabs.executeScript(tabId, { file: "js/contact-script.js" }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            throw Error(`Unable to inject script into tab ${tabId}`);
          }
          // OK, now it's injected and ready
          chrome.tabs.sendMessage(tabId, { action: message }, (response) => {
            resolve(response);
          });
        });
      }
    });
  });
