chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({
      url: 'tabs.html'
    });
  });