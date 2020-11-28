//listeners
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "startAction":
      sendResponse({ received: "success" });
      startAction();
      break;
    case "successToJoin":
      sendResponse({ received: "success" });
      chrome.alarms.clear("start");
      sendNotificationSuccess();
      break;
    case "groupFull":
      sendResponse({ received: "success" });
      chrome.alarms.create("startAction", { delayInMinutes: 15 });
      break;
    case "alreadyJoined":
      sendResponse({ received: "success" });
      chrome.alarms.clear("start");
      break;
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm === "startAction") {
      startAction();
    }
  });
});

//actions
const startAction = async () => {
  const url = await getFromLocal("URLGroup");
  const id = await hasTab;
  if (id) updateTabEndExact(id, url);
  else createTabEndExact(url);
};

const createTabEndExact = (url) => {
  chrome.tabs.create({ url, active: false }, (tab) => {
    exact(tab.id);
  });
};

const getFromLocal = (key) =>
  new Promise(function (resolve, reject) {
    chrome.storage.sync.get([key], function (options) {
      resolve(options[key]);
    });
  });

const updateTabEndExact = async (tabId, url) => {
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
        chrome.tabs.executeScript(
          tabId,
          { file: "js/contact-script.js" },
          () => {
            if (chrome.runtime.lastError) {
              throw Error(`Unable to inject script into tab ${tabId}`);
            }
            // OK, now it's injected and ready
            chrome.tabs.sendMessage(tabId, { action: message }, (response) => {
              resolve(response);
            });
          }
        );
      }
    });
  });
