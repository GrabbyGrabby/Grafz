const apiKey = "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";

async function test() {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "jinaai/jina-embeddings-v2-base-en",
      input: ["Hello world"]
    })
  });

  const text = await response.text();
  console.log("NVIDIA response:", response.status, text.substring(0, 100));
}

test();
