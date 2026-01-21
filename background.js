// Declare the chrome variable
const chrome = window.chrome

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggle" })
})

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "toggle-overlay") {
    chrome.tabs.sendMessage(tab.id, { action: "toggle" })
  }
})
