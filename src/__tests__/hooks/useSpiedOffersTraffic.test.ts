import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/test-utils";

// ─── Hoisted Supabase mock ───
const { mockFrom, mockGetUser, mockRpc, mockOrder, mockMaybeSingle } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle, select: mockSelect, order: mockOrder }));
  const mockOrder = vi.fn(() => ({ eq: mockEq }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockDelete = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
  const mockRpc = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }));
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: "user-123" } },
  });

  return { mockFrom, mockGetUser, mockRpc, mockOrder, mockMaybeSingle, mockEq, mockSelect };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  },
}));

vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import {
  useOfferTrafficData,
  useBulkInsertTrafficData,
  useLatestTrafficPerOffer,
  useUpdateTrafficData,
  useDeleteTrafficData,
  useOfferTrafficSummary,
} from "@/features/spy/hooks/useSpiedOffersTraffic";

describe("useOfferTrafficData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca dados de trafego por offerId", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useOfferTrafficData("offer-1"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("offer_traffic_data");
    });
  });

  it("nao executa sem offerId", () => {
    const { result } = renderHookWithQuery(() => useOfferTrafficData(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useLatestTrafficPerOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca trafego para similarweb", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useLatestTrafficPerOffer("similarweb"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("offer_traffic_data");
    });
  });

  it("busca trafego para semrush", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useLatestTrafficPerOffer("semrush"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("offer_traffic_data");
    });
  });
});

describe("useOfferTrafficSummary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca summary da materialized view", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { spied_offer_id: "offer-1", domain_count: 3, total_visits: 50000 },
      error: null,
    });

    renderHookWithQuery(() => useOfferTrafficSummary("offer-1"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("mv_offer_traffic_summary");
    });
  });

  it("nao executa sem offerId", () => {
    const { result } = renderHookWithQuery(() => useOfferTrafficSummary(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useBulkInsertTrafficData", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useBulkInsertTrafficData());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});

describe("useUpdateTrafficData", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useUpdateTrafficData());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useDeleteTrafficData", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useDeleteTrafficData());
    expect(result.current.mutateAsync).toBeDefined();
  });
});
