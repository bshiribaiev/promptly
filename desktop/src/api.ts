const API_URL = "https://api.promptpolish.ai";

export async function scorePrompt(prompt: string) {
  const res = await fetch(`${API_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

export async function improvePrompt(prompt: string) {
  const res = await fetch(`${API_URL}/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

export async function compareOutputs(original: string, improved: string) {
  const res = await fetch(`${API_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original, improved }),
  });
  return res.json();
}
