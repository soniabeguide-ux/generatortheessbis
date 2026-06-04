const API_ENDPOINT = "/.netlify/functions/claude";

export async function callClaude(systemPrompt, userContent, maxTokens = 1500) {
  const payload = {
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: userContent }],
  };
  if (systemPrompt) payload.system = systemPrompt;

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Erreur API");
  return data.content[0].text;
}
