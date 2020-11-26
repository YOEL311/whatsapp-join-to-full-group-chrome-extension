chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  console.log("request contact file", request);
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

  const querySelector = () =>
    document.querySelectorAll(querySelectorButtonWhatsapp)[1];

  const element = await awaitToElement(querySelector);
  clickOnElement(element);
};

const tryToJoin = async () => {
  const querySelector = () =>
    document.querySelectorAll(querySelectorButtonWhatsapp)[1];
  const buttonJoin = await awaitToElement(querySelector);

  if (!buttonJoin) {
    sendMassage("alreadyJoined");
    return;
  }

  clickOnElement(buttonJoin);

  const massageBoxSelector = () =>
    document.querySelectorAll("[contenteditable='true']")[1];

  const massageBox = await awaitToElement(massageBoxSelector);

  if (massageBox) {
    sendMassage("successToJoin");
    return;
  }

  const finishButtonSelector = document.querySelector(
    querySelectorButtonWhatsapp
  );

  if (finishButtonSelector) {
    sendMassage("groupFull");
    clickOnElement(finishButtonSelector);
    return;
  }
};

const checkIsUserWriting = (sendResponse) => {
  const messageBox = document.querySelectorAll("[contenteditable='true']")[1];
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
  for (let i = 0; i < 10; i++) {
    const element = selector();
    if (element) {
      return element;
    }
    await sleep(500);
  }
};

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const querySelectorButtonWhatsapp =
  "[data-animate-modal-body=true] div [role='button']";

const sendMassage = (massage) => {
  chrome.extension.sendMessage({ action: massage });
};
