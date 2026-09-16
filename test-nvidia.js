const apiKey = "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";

async function test() {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: "hello" }],
      max_tokens: 100
    })
  });

  const text = await response.text();
  console.log("NVIDIA response:", response.status, text);
}

test();
