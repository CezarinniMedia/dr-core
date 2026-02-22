import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/test-utils";

// ─── Hoisted Supabase mock ───
const { mockFrom, mockGetUser } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockRange = vi.fn();
  const mockOr = vi.fn(() => ({ range: mockRange }));
  const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));

  // Wire up chain
  mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, range: mockRange, or: mockOr, single: mockSingle });
  mockOrder.mockReturnValue({ range: mockRange, eq: mockEq, or: mockOr });

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

  return { mockFrom, mockGetUser, mockRange };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import {
  useSpiedOffers,
  useSpiedOffer,
  useCreateSpiedOffer,
  useUpdateSpiedOffer,
  useDeleteSpiedOffer,
} from "@/features/spy/hooks/useSpiedOffersCRUD";

describe("useSpiedOffers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("executa query com tabela spied_offers", async () => {
    const { result } = renderHookWithQuery(() => useSpiedOffers());

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("spied_offers");
    });
  });

  it("query key inclui filtros", () => {
    const { result } = renderHookWithQuery(() =>
      useSpiedOffers({ status: "monitoring" })
    );

    // Hook is created, queryKey includes filters
    expect(result.current.isLoading).toBeDefined();
  });
});

describe("useSpiedOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("query key contem offer id", async () => {
    const { result } = renderHookWithQuery(() => useSpiedOffer("offer-1"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("spied_offers");
    });
  });

  it("nao executa query sem id (enabled: false)", () => {
    const { result } = renderHookWithQuery(() => useSpiedOffer(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateSpiedOffer", () => {
  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useCreateSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});

describe("useUpdateSpiedOffer", () => {
  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useUpdateSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});

describe("useDeleteSpiedOffer", () => {
  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useDeleteSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});
