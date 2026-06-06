import "server-only";

const TIMEOUT_MS = 4000;
const MAX_CONTENT = 1900;

export type DiscordPayload = { content?: string; embeds?: unknown[] };

export async function notifyDiscord(payload: string | DiscordPayload): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const body =
    typeof payload === "string" ? { content: payload.slice(0, MAX_CONTENT) } : payload;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return;
  }
}
