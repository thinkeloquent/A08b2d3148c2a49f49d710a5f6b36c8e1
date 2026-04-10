const API_PREFIX = "/~/api/overview";

export async function fetchApps() {
  const res = await fetch(`${API_PREFIX}/apps`);
  if (!res.ok) throw new Error(`Failed to fetch apps: ${res.status}`);
  const data = await res.json();
  return data.apps;
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_PREFIX}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}
