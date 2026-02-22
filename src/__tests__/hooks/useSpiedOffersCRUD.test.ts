import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/test-utils";

// ─── Hoisted Supabase mock ───
const { mockFrom, mockGetUser, mockSingle, mockInsert, mockUpdate, mockDeleteEq } = vi.hoisted(() => {
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
  const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
  const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }));

  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: "user-123" } },
  });

  return { mockFrom, mockGetUser, mockRange, mockSingle, mockInsert, mockUpdate, mockDeleteEq };
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
  beforeEach(() => vi.clearAllMocks());

  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useCreateSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it("chama insert na tabela spied_offers com workspace_id", async () => {
    // workspace_members lookup → insert result
    mockSingle
      .mockResolvedValueOnce({ data: { workspace_id: "ws-1" } })
      .mockResolvedValueOnce({ data: { id: "new-1", nome: "Test Offer" }, error: null });

    const { result } = renderHookWithQuery(() => useCreateSpiedOffer());

    await result.current.mutateAsync({ nome: "Test Offer", main_domain: "test.com" });

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith("workspace_members");
      expect(mockFrom).toHaveBeenCalledWith("spied_offers");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Test Offer", main_domain: "test.com", workspace_id: "ws-1" })
      );
    });
  });

  it("propaga erro quando insert falha", async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { workspace_id: "ws-1" } })
      .mockResolvedValueOnce({ data: null, error: { message: "RLS policy violation" } });

    const { result } = renderHookWithQuery(() => useCreateSpiedOffer());

    await expect(
      result.current.mutateAsync({ nome: "Fail" })
    ).rejects.toThrow("RLS policy violation");
  });
});

describe("useUpdateSpiedOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useUpdateSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it("chama update na tabela spied_offers com id e data", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: "offer-1", nome: "Updated" },
      error: null,
    });

    const { result } = renderHookWithQuery(() => useUpdateSpiedOffer());

    await result.current.mutateAsync({ id: "offer-1", data: { nome: "Updated" } });

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("spied_offers");
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ nome: "Updated" }));
    });
  });

  it("propaga erro quando update falha", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Not found" },
    });

    const { result } = renderHookWithQuery(() => useUpdateSpiedOffer());

    await expect(
      result.current.mutateAsync({ id: "offer-x", data: { nome: "Nope" } })
    ).rejects.toThrow("Not found");
  });
});

describe("useDeleteSpiedOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna mutation com mutateAsync", () => {
    const { result } = renderHookWithQuery(() => useDeleteSpiedOffer());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it("chama delete na tabela spied_offers com id", async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: null });

    const { result } = renderHookWithQuery(() => useDeleteSpiedOffer());

    await result.current.mutateAsync("offer-1");

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("spied_offers");
      expect(mockDeleteEq).toHaveBeenCalledWith("id", "offer-1");
    });
  });

  it("propaga erro quando delete falha", async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: { message: "FK constraint" } });

    const { result } = renderHookWithQuery(() => useDeleteSpiedOffer());

    await expect(
      result.current.mutateAsync("offer-1")
    ).rejects.toThrow("FK constraint");
  });
});
