// Simple AI service abstraction.
// Currently implemented as a local mock that simulates latency.
// You can later replace `callMockAI` with a real fetch to your backend.

const AI_LATENCY_MS = 900;

function formatMockResponse(prompt) {
  const trimmed = (prompt || "").trim();
  if (!trimmed) {
    return [
      "No prompt provided.",
      "",
      "Type a question or task in the prompt area,",
      "then press \"Run AI\" to see a mocked response.",
    ].join("\n");
  }

  return [
    "Mock AI Response",
    "────────────────",
    `Prompt: ${trimmed}`,
    "",
    "This is a simulated AI answer. Wire this",
    "service to your real API when ready.",
  ].join("\n");
}

export async function callMockAI(prompt) {
  await new Promise((resolve) => setTimeout(resolve, AI_LATENCY_MS));
  return formatMockResponse(prompt);
}

// Example of how you might later swap this for a real API call:
// export async function callRealAI(prompt) {
//   const res = await fetch('https://your-api.example.com/ai', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt }),
//   });
//
//   if (!res.ok) {
//     throw new Error(`AI request failed with ${res.status}`);
//   }
//
//   const data = await res.json();
//   return data.result ?? '';
// }

