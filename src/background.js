chrome.browserAction.onClicked.addListener((tab) => {
  const { windowId } = tab;
  chrome.tabs.create({ url: 'index.html', windowId: windowId });
});
