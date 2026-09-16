document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const contentInput = document.getElementById('content');
  const statusDiv = document.getElementById('status');

  // Try to pre-fill with selected text on the active page
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: () => window.getSelection().toString()
    }).then((results) => {
      if (results && results[0] && results[0].result) {
        contentInput.value = results[0].result;
      }
    }).catch(() => {});
  });

  saveBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();
    if (!content) return;

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    statusDiv.textContent = '';
    statusDiv.className = 'status';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;

      // Make API call to localhost backend (in prod, use the hosted URL)
      const API_URL = 'http://localhost:3000/api/ingest';
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In a real extension, the user would login and provide an auth token.
          // For local testing, we hardcode the bypass or assume the API handles session.
          // Since our API currently demands SUPABASE_SERVICE_ROLE_KEY, we will pass it 
          // (NEVER DO THIS IN A REAL EXTENSION, use a proper Auth token).
          // For now, we will omit the auth header and let the user handle it, 
          // or just assume we removed the strict auth in development.
        },
        body: JSON.stringify({
          content,
          source: url,
          tags: ["extension"]
        })
      });

      if (!res.ok) throw new Error('Failed to save');

      statusDiv.textContent = 'Saved to Grafz!';
      statusDiv.className = 'status success';
      contentInput.value = '';
      
      setTimeout(() => {
        window.close();
      }, 1500);

    } catch (err) {
      statusDiv.textContent = 'Error: Make sure Grafz server is running.';
      statusDiv.className = 'status error';
      console.error(err);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save to Memory';
    }
  });
});
