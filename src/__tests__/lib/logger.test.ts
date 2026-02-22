import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mocks (available inside vi.mock factory)
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

import { logger } from "@/shared/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it("info() loga com level INFO", async () => {
    logger.info("test message", { key: "value" });
    await vi.waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("app_logs");
    });
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "INFO",
        message: "test message",
        metadata: { key: "value" },
        user_id: "user-123",
      })
    );
  });

  it("warn() loga com level WARN", async () => {
    logger.warn("warning message");
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message: "warning message",
        })
      );
    });
  });

  it("error() loga com level ERROR e stack trace", async () => {
    const error = new Error("test error");
    logger.error("error occurred", error);
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "error occurred",
          stack_trace: expect.stringContaining("test error"),
        })
      );
    });
  });

  it("error() funciona sem Error object", async () => {
    logger.error("simple error");
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "simple error",
          stack_trace: null,
        })
      );
    });
  });

  it("loga user_id null quando nao autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    logger.info("no user");
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: null })
      );
    });
  });

  it("nao lanca erro quando insert falha", async () => {
    mockInsert.mockRejectedValueOnce(new Error("db error"));
    expect(() => logger.info("test")).not.toThrow();
  });

  it("metadata null quando nao fornecida", async () => {
    logger.info("no metadata");
    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: null })
      );
    });
  });
});
