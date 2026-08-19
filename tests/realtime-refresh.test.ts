// @vitest-environment jsdom

import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const refresh = vi.fn();
  const on = vi.fn();
  const subscribe = vi.fn();
  const channel = { on, subscribe };
  const channelFactory = vi.fn(() => channel);
  const removeChannel = vi.fn();
  return { refresh, on, subscribe, channel, channelFactory, removeChannel };
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ channel: mocks.channelFactory, removeChannel: mocks.removeChannel }),
}));

import { RealtimeRefresh } from "@/components/realtime-refresh";

describe("RealtimeRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.on.mockReturnValue(mocks.channel);
  });

  it("subscribes to every project table and debounces route refreshes", () => {
    const view = render(createElement(RealtimeRefresh));
    expect(mocks.on).toHaveBeenCalledTimes(8);
    expect(mocks.subscribe).toHaveBeenCalledOnce();

    const onChange = mocks.on.mock.calls[0][2] as (payload: { eventType?: string }) => void;
    act(() => {
      onChange({});
      onChange({ eventType: "UPDATE" });
      onChange({ eventType: "UPDATE" });
      vi.advanceTimersByTime(150);
    });

    expect(mocks.refresh).toHaveBeenCalledOnce();

    view.rerender(createElement(RealtimeRefresh));
    expect(mocks.on).toHaveBeenCalledTimes(8);
    expect(mocks.subscribe).toHaveBeenCalledOnce();

    view.unmount();
    expect(mocks.removeChannel).toHaveBeenCalledWith(mocks.channel);
  });
});
