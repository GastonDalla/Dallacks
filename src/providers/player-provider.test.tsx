import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import messages from "../../messages/es.json";

vi.mock("@/i18n/navigation", () => ({ usePathname: () => "/track/test" }));

import { PlayerProvider, usePlayer, type PlayingTrack } from "./player-provider";

const A: PlayingTrack = { videoId: "aaaaaaaaaaa", title: "Track A", artist: "Artist A" };
const B: PlayingTrack = { videoId: "bbbbbbbbbbb", title: "Track B", artist: "Artist B" };

function Harness() {
  const p = usePlayer();
  return (
    <div>
      <span data-testid="current">{p.current ? p.current.title : "none"}</span>
      <button onClick={() => p.playQueue([A, B], 0)}>queue</button>
      <button onClick={() => p.play(A)}>single</button>
      <button onClick={() => p.next()}>next</button>
      <button onClick={() => p.previous()}>prev</button>
      <button onClick={() => p.close()}>close</button>
    </div>
  );
}

function setup() {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <PlayerProvider>
        <Harness />
      </PlayerProvider>
    </NextIntlClientProvider>,
  );
}

const current = () => screen.getByTestId("current").textContent;

describe("PlayerProvider queue logic", () => {
  it("plays a single track", async () => {
    setup();
    await userEvent.click(screen.getByText("single"));
    expect(current()).toBe("Track A");
  });

  it("plays a queue and steps next/previous through it", async () => {
    setup();
    await userEvent.click(screen.getByText("queue"));
    expect(current()).toBe("Track A");

    await userEvent.click(screen.getByText("next"));
    expect(current()).toBe("Track B");

    await userEvent.click(screen.getByText("prev"));
    expect(current()).toBe("Track A");
  });

  it("stops after the last track and closes", async () => {
    setup();
    await userEvent.click(screen.getByText("queue"));
    await userEvent.click(screen.getByText("next"));
    await userEvent.click(screen.getByText("next"));
    expect(current()).toBe("none");
  });

  it("close stops playback", async () => {
    setup();
    await userEvent.click(screen.getByText("queue"));
    await userEvent.click(screen.getByText("close"));
    expect(current()).toBe("none");
  });
});

describe("PlayerProvider auto-advance", () => {
  let stateHandler: ((e: { data: number; target: unknown }) => void) | null = null;

  beforeEach(() => {
    stateHandler = null;
    (window as unknown as { YT: unknown }).YT = {
      PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 },
      Player: class {
        constructor(_el: unknown, opts: { events?: { onReady?: (e: { target: unknown }) => void; onStateChange?: (e: { data: number; target: unknown }) => void } }) {
          stateHandler = opts.events?.onStateChange ?? null;
          opts.events?.onReady?.({ target: this });
        }
        playVideo() {}
        loadVideoById() {}
        destroy() {}
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as { YT?: unknown }).YT;
  });

  it("advances to the next track when the current one ends", async () => {
    setup();
    await userEvent.click(screen.getByText("queue"));
    expect(current()).toBe("Track A");

    await waitFor(() => expect(stateHandler).toBeTruthy());

    await act(async () => {
      stateHandler!({ data: 0, target: {} });
    });

    expect(current()).toBe("Track B");
  });
});
