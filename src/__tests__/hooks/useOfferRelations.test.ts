import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/test-utils";

// ─── Hoisted Supabase mock ───
const { mockFrom, mockGetUser, mockOrder } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
  const mockOrder = vi.fn(() => ({ eq: mockEq }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));
  const mockDelete = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }));
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: "user-123" } },
  });

  return { mockFrom, mockGetUser, mockOrder };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import {
  useOfferAdLibraries,
  useCreateOfferAdLibrary,
  useDeleteOfferAdLibrary,
  useUpdateOfferAdLibrary,
  useOfferFunnelSteps,
  useCreateFunnelStep,
  useUpdateFunnelStep,
  useDeleteFunnelStep,
} from "@/features/spy/hooks/useOfferRelations";

// ─── Ad Libraries ───
describe("useOfferAdLibraries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca ad libraries por offerId", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useOfferAdLibraries("offer-1"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("offer_ad_libraries");
    });
  });

  it("nao executa sem offerId", () => {
    const { result } = renderHookWithQuery(() => useOfferAdLibraries(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateOfferAdLibrary", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useCreateOfferAdLibrary());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useDeleteOfferAdLibrary", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useDeleteOfferAdLibrary());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useUpdateOfferAdLibrary", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useUpdateOfferAdLibrary());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

// ─── Funnel Steps ───
describe("useOfferFunnelSteps", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca funnel steps por offerId", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useOfferFunnelSteps("offer-1"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("offer_funnel_steps");
    });
  });

  it("nao executa sem offerId", () => {
    const { result } = renderHookWithQuery(() => useOfferFunnelSteps(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateFunnelStep", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useCreateFunnelStep());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useUpdateFunnelStep", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useUpdateFunnelStep());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useDeleteFunnelStep", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useDeleteFunnelStep());
    expect(result.current.mutateAsync).toBeDefined();
  });
});
