chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-grafz",
    title: "Save to Grafz Memory",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-grafz") {
    const content = info.selectionText;
    const url = tab.url;

    fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        source: url,
        tags: ["extension", "context-menu"]
      })
    })
    .then(res => res.json())
    .then(data => console.log("Saved to Grafz:", data))
    .catch(err => console.error("Grafz save error:", err));
  }
});
