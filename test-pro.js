const apiKey = "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";
async function test() {
  console.time("ResponseTime");
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "deepseek-ai/deepseek-v4-pro-0813", messages: [{ role: "user", content: "hello" }], max_tokens: 10 })
  });
  console.timeEnd("ResponseTime");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();
