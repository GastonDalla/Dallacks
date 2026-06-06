import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyDiscord } from "./discord";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.DISCORD_WEBHOOK_URL;
});

describe("notifyDiscord", () => {
  it("posts the content to the configured webhook", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.test/webhook";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await notifyDiscord("hello world");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://discord.test/webhook");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({ content: "hello world" });
  });

  it("sends an embeds payload unchanged", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.test/webhook";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await notifyDiscord({ embeds: [{ title: "x" }] });

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      embeds: [{ title: "x" }],
    });
  });

  it("does nothing when no webhook is configured", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await notifyDiscord("anything");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the webhook request fails", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.test/webhook";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    await expect(notifyDiscord("x")).resolves.toBeUndefined();
  });
});
