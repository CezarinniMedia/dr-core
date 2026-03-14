import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert, mockFrom, mockGetUser } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: "user-123" } },
  });
  return { mockInsert, mockFrom, mockGetUser };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { analytics } from "@/shared/lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it("track() insere evento com user_id", async () => {
    await analytics.track({ event: "OFERTA_CREATED", properties: { name: "test" } });

    expect(mockFrom).toHaveBeenCalledWith("analytics_events");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      workspace_id: null,
      event_name: "OFERTA_CREATED",
      properties: { name: "test" },
    });
  });

  it("track() com workspace_id", async () => {
    await analytics.track({
      event: "CREATIVE_UPLOADED",
      workspaceId: "ws-456",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        workspace_id: "ws-456",
        event_name: "CREATIVE_UPLOADED",
        properties: null,
      })
    );
  });

  it("track() com user nao autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    await analytics.track({ event: "OFERTA_DELETED" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null })
    );
  });

  it("track() nao lanca erro quando insert falha", async () => {
    mockInsert.mockRejectedValueOnce(new Error("db error"));

    await expect(
      analytics.track({ event: "OFERTA_UPDATED" })
    ).resolves.toBeUndefined();
  });

  it("track() sem properties envia null", async () => {
    await analytics.track({ event: "COMPETITOR_ADDED" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ properties: null })
    );
  });
});
