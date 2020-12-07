chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.ping) {
    sendResponse({ pong: true });
  }
  switch (request.action) {
    case "openGroupLink":
      openGroupLink(sendResponse);
      break;
    case "tryToJoin":
      sendResponse({ received: "success" });
      tryToJoin();
      break;
    case "checkIsUserWriting":
      checkIsUserWriting(sendResponse);
      break;
  }
});

const openGroupLink = async (sendResponse) => {
  await clickOnElement(document.querySelector("#action-button"), "click");
  await clickOnElement(document.querySelector("[href*=accept]"), "click");
  sendResponse({ received: "success" });

  const element = await awaitToElement(querySelectorBtn);
  clickOnElement(element);
};

const tryToJoin = async () => {
  const querySelector = buttonToJoinSelector;

  const buttonJoin = await awaitToElement(querySelector);

  if (!buttonJoin) {
    sendMassage("alreadyJoined");
    return;
  }

  clickOnElement(buttonJoin);
  const massageBox = await awaitToElement(messageBoxSelector);
  if (massageBox) {
    sendMassage("successToJoin");
    return;
  }

  const finishButtonSelector = document.querySelector(querySelectorBtn);

  if (finishButtonSelector) {
    sendMassage("groupFull");
    clickOnElement(finishButtonSelector);
    return;
  }
};

const checkIsUserWriting = (sendResponse) => {
  const messageBox = document.querySelector(messageBoxSelector);

  if (messageBox?.innerHTML) sendResponse({ isWrite: true });
  else sendResponse({ isWrite: false });
};

const clickOnElement = async (MyElement) => {
  const MyEvent = document.createEvent("MouseEvents");
  // prettier-ignore
  MyEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  MyElement?.dispatchEvent(MyEvent);
};

const awaitToElement = async (selector) => {
  for (let i = 0; i < 5; i++) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await sleep(100);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buttonToJoinSelector =
  "[data-animate-modal-body=true] div[role='button']:nth-child(2)";
const messageBoxSelector = "[contenteditable='true'][spellcheck='true']";
const querySelectorBtn = "[data-animate-modal-body=true] div [role='button']";

const sendMassage = (massage) => {
  chrome.extension.sendMessage({ action: massage });
};
