import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, type RenderHookOptions } from "@testing-library/react";

/**
 * Creates a fresh QueryClient for each test (no retries, no cache).
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Wraps renderHook with QueryClientProvider for testing React Query hooks.
 */
export function renderHookWithQuery<TResult>(
  hook: () => TResult,
  options?: Omit<RenderHookOptions<unknown>, "wrapper">
) {
  const queryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(hook, { wrapper, ...options }),
    queryClient,
  };
}

/**
 * Helper to build standard supabase mock chain.
 */
export function createSupabaseMock() {
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockRange = vi.fn();
  const mockOr = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockRpc = vi.fn();

  // Build chainable mock
  const chain = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    or: mockOr,
    order: mockOrder,
    range: mockRange,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };

  // Each method returns the chain
  for (const fn of Object.values(chain)) {
    fn.mockReturnValue(chain);
  }

  const mockFrom = vi.fn(() => chain);
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: "test-user-id" } },
  });

  return {
    supabase: {
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    },
    chain,
    mockFrom,
    mockGetUser,
    mockRpc,
  };
}
