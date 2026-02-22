import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockUpload, mockRemove, mockCreateSignedUrl, mockList, mockGetPublicUrl,
  mockStorageFrom, mockSelectSingle, mockSelectEq, mockSelect, mockDbFrom, mockGetUser,
} = vi.hoisted(() => {
  const mockUpload = vi.fn();
  const mockRemove = vi.fn();
  const mockCreateSignedUrl = vi.fn();
  const mockList = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockStorageFrom = vi.fn(() => ({
    upload: mockUpload,
    remove: mockRemove,
    createSignedUrl: mockCreateSignedUrl,
    list: mockList,
    getPublicUrl: mockGetPublicUrl,
  }));
  const mockSelectSingle = vi.fn();
  const mockSelectEq = vi.fn(() => ({ single: mockSelectSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
  const mockDbFrom = vi.fn(() => ({ select: mockSelect }));
  const mockGetUser = vi.fn();

  return {
    mockUpload, mockRemove, mockCreateSignedUrl, mockList, mockGetPublicUrl,
    mockStorageFrom, mockSelectSingle, mockSelectEq, mockSelect, mockDbFrom, mockGetUser,
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockDbFrom,
    storage: { from: mockStorageFrom },
  },
}));

import { storage, getWorkspaceId } from "@/shared/lib/storage";

describe("getWorkspaceId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna workspace_id do usuario autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockSelectSingle.mockResolvedValue({
      data: { workspace_id: "ws-123" },
      error: null,
    });

    const result = await getWorkspaceId();
    expect(result).toBe("ws-123");
    expect(mockDbFrom).toHaveBeenCalledWith("workspace_members");
  });

  it("lanca erro quando nao autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    await expect(getWorkspaceId()).rejects.toThrow("Not authenticated");
  });

  it("lanca erro quando workspace nao encontrado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockSelectSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    await expect(getWorkspaceId()).rejects.toThrow("No workspace found");
  });
});

describe("StorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockSelectSingle.mockResolvedValue({
      data: { workspace_id: "ws-123" },
      error: null,
    });
  });

  describe("uploadFile", () => {
    it("faz upload com path prefixado pelo workspace_id", async () => {
      mockUpload.mockResolvedValue({ data: { path: "ws-123/offers/img.png" }, error: null });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example.com/ws-123/offers/img.png" } });

      const file = new File(["content"], "img.png", { type: "image/png" });
      const result = await storage.uploadFile("spy-assets", "offers/img.png", file);

      expect(mockStorageFrom).toHaveBeenCalledWith("spy-assets");
      expect(mockUpload).toHaveBeenCalledWith(
        "ws-123/offers/img.png",
        file,
        { cacheControl: "3600", upsert: false }
      );
      expect(result).toEqual({
        url: "https://cdn.example.com/ws-123/offers/img.png",
        path: "ws-123/offers/img.png",
      });
    });

    it("retorna erro quando upload falha", async () => {
      mockUpload.mockResolvedValue({ data: null, error: { message: "RLS policy violation" } });

      const file = new File(["content"], "img.png");
      const result = await storage.uploadFile("spy-assets", "test.png", file);
      expect(result).toEqual({ error: "RLS policy violation" });
    });

    it("retorna erro quando getWorkspaceId falha", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const file = new File(["content"], "img.png");
      const result = await storage.uploadFile("spy-assets", "test.png", file);
      expect(result).toEqual({ error: "Not authenticated" });
    });
  });

  describe("deleteFile", () => {
    it("remove arquivo do bucket", async () => {
      mockRemove.mockResolvedValue({ error: null });

      const result = await storage.deleteFile("spy-assets", "ws-123/offers/img.png");
      expect(mockStorageFrom).toHaveBeenCalledWith("spy-assets");
      expect(mockRemove).toHaveBeenCalledWith(["ws-123/offers/img.png"]);
      expect(result).toEqual({ success: true });
    });

    it("retorna erro quando delete falha", async () => {
      mockRemove.mockResolvedValue({ error: { message: "not found" } });

      const result = await storage.deleteFile("spy-assets", "nonexistent.png");
      expect(result).toEqual({ error: "not found" });
    });
  });

  describe("getSignedUrl", () => {
    it("retorna URL assinada com 1h de expiracao", async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://signed.example.com/file?token=abc" },
        error: null,
      });

      const result = await storage.getSignedUrl("documents", "ws-123/doc.pdf");
      expect(mockCreateSignedUrl).toHaveBeenCalledWith("ws-123/doc.pdf", 3600);
      expect(result).toEqual({ url: "https://signed.example.com/file?token=abc" });
    });

    it("retorna erro quando signed URL falha", async () => {
      mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "expired" } });

      const result = await storage.getSignedUrl("documents", "test.pdf");
      expect(result).toEqual({ error: "expired" });
    });
  });

  describe("listFiles", () => {
    it("lista arquivos de uma pasta", async () => {
      const files = [{ name: "file1.png" }, { name: "file2.png" }];
      mockList.mockResolvedValue({ data: files, error: null });

      const result = await storage.listFiles("spy-assets", "ws-123/offers");
      expect(mockList).toHaveBeenCalledWith("ws-123/offers");
      expect(result).toEqual({ files });
    });

    it("retorna erro quando list falha", async () => {
      mockList.mockResolvedValue({ data: null, error: { message: "access denied" } });

      const result = await storage.listFiles("spy-assets", "test");
      expect(result).toEqual({ error: "access denied" });
    });
  });
});
