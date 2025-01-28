// Function to format the date
function formatDate(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  
  return `${day} ${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// Handle click on the extension icon
chrome.action.onClicked.addListener(async function() {
  // Search if a tab with the extension page already exists
  const tabs = await chrome.tabs.query({});
  const extensionUrl = chrome.runtime.getURL('tabs.html');
  
  const existingTab = tabs.find(tab => 
    tab.url && tab.url === extensionUrl
  );
  
  if (existingTab) {
    // If it exists, activate that tab
    await chrome.tabs.update(existingTab.id, { active: true });
    // If the tab is in another window, focus that window
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    // If it doesn't exist, create new tab
    chrome.tabs.create({
      url: 'tabs.html'
    });
  }
});