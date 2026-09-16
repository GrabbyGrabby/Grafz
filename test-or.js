const apiKey = "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";

async function test() {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Grafz Memory Assistant",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [{ role: "user", content: "hello" }],
    })
  });

  const text = await response.text();
  console.log("OpenRouter response:", response.status, text);
}

test();
