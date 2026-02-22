import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/test-utils";

// ─── Hoisted Supabase mock ───
const { mockFrom, mockGetUser, mockOrder3 } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder3 = vi.fn();
  const mockOrder2 = vi.fn(() => ({ order: mockOrder3 }));
  const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect, order: mockOrder2 }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder2, single: mockSingle }));
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

  return { mockFrom, mockGetUser, mockOrder3 };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import {
  useSavedViews,
  useCreateSavedView,
  useUpdateSavedView,
  useDeleteSavedView,
} from "@/features/spy/hooks/useSavedViews";

describe("useSavedViews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca saved views do modulo spy por padrao", async () => {
    mockOrder3.mockResolvedValue({ data: [], error: null });

    renderHookWithQuery(() => useSavedViews());

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("saved_views");
    });
  });

  it("normaliza filters com defaults quando incompletos", async () => {
    const rawViews = [
      {
        id: "v1",
        name: "Partial",
        module: "spy",
        filters: { search: "test" },
        sort_config: {},
        visible_columns: [],
        is_pinned: false,
        is_default: false,
      },
    ];
    mockOrder3.mockResolvedValue({ data: rawViews, error: null });

    const { result } = renderHookWithQuery(() => useSavedViews());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data!.length).toBeGreaterThan(0);
    });

    const view = result.current.data![0];
    expect(view.filters.trafficDataSource).toBe("similarweb");
    expect(view.filters.showArchived).toBe(false);
    expect(view.filters.search).toBe("test");
  });

  it("normaliza filters null para defaults", async () => {
    const rawViews = [
      {
        id: "v2",
        name: "No filters",
        module: "spy",
        filters: null,
        sort_config: null,
        visible_columns: null,
        is_pinned: false,
        is_default: false,
      },
    ];
    mockOrder3.mockResolvedValue({ data: rawViews, error: null });

    const { result } = renderHookWithQuery(() => useSavedViews());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data!.length).toBeGreaterThan(0);
    });

    const view = result.current.data![0];
    expect(view.filters.statusFilter).toEqual([]);
    expect(view.filters.vertical).toBe("");
    expect(view.sort_config).toEqual({});
    expect(view.visible_columns).toEqual([]);
  });
});

describe("useCreateSavedView", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useCreateSavedView());
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});

describe("useUpdateSavedView", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useUpdateSavedView());
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useDeleteSavedView", () => {
  it("retorna mutation function", () => {
    const { result } = renderHookWithQuery(() => useDeleteSavedView());
    expect(result.current.mutateAsync).toBeDefined();
  });
});
