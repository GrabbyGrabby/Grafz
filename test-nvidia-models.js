const apiKey = "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";
async function test() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const data = await res.json();
  console.log("Models:", data.data.slice(0, 10).map(m => m.id));
}
test();
