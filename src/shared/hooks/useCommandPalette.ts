import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecentItem {
  id: string;
  label: string;
  subtitle?: string;
  path: string;
  type: "navigation" | "action" | "offer" | "domain" | "creative" | "avatar";
  timestamp: number;
}

export interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  path: string;
  type: "offer" | "own-offer" | "domain" | "creative" | "avatar";
}

export type RouteContext =
  | "spy"
  | "spy-detail"
  | "dashboard"
  | "ofertas"
  | "criativos"
  | "avatares"
  | "arsenal"
  | "other";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_KEY = "dr_cmd_palette_recents";
const MAX_RECENTS = 5;
const SEARCH_DEBOUNCE_MS = 200;
const SEARCH_MIN_CHARS = 2;

// ---------------------------------------------------------------------------
// Recents (localStorage)
// ---------------------------------------------------------------------------

function loadRecents(): RecentItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return parsed.slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function saveRecents(items: RecentItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_RECENTS)));
}

// ---------------------------------------------------------------------------
// Route context detection
// ---------------------------------------------------------------------------

function detectRouteContext(pathname: string): RouteContext {
  if (/^\/spy\/[^/]+/.test(pathname)) return "spy-detail";
  if (pathname.startsWith("/spy")) return "spy";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/ofertas")) return "ofertas";
  if (pathname.startsWith("/criativos")) return "criativos";
  if (pathname.startsWith("/avatar")) return "avatares";
  if (pathname.startsWith("/arsenal")) return "arsenal";
  return "other";
}

// ---------------------------------------------------------------------------
// Global search (Supabase)
// ---------------------------------------------------------------------------

async function globalSearch(term: string): Promise<SearchResult[]> {
  const pattern = `%${term}%`;
  const results: SearchResult[] = [];

  const [offersRes, ownOffersRes, domainsRes, creativesRes, avatarsRes] = await Promise.all([
    supabase
      .from("spied_offers")
      .select("id, nome, main_domain, vertical, geo")
      .or(`nome.ilike.${pattern},main_domain.ilike.${pattern}`)
      .limit(3),
    supabase
      .from("offers")
      .select("id, nome, vertical")
      .ilike("nome", pattern)
      .limit(3),
    supabase
      .from("offer_domains")
      .select("id, domain, offer_id, spied_offers(nome)")
      .ilike("domain", pattern)
      .limit(3),
    supabase
      .from("ad_creatives")
      .select("id, nome, angulo")
      .ilike("nome", pattern)
      .limit(3),
    supabase
      .from("avatars")
      .select("id, nome")
      .ilike("nome", pattern)
      .limit(3),
  ]);

  if (offersRes.data) {
    for (const o of offersRes.data) {
      const parts = [o.vertical, o.geo].filter(Boolean);
      results.push({
        id: o.id,
        label: o.nome ?? o.main_domain ?? "Sem nome",
        subtitle: parts.length > 0 ? `Oferta espionada | ${parts.join(" | ")}` : "Oferta espionada",
        path: `/spy/${o.id}`,
        type: "offer",
      });
    }
  }

  if (ownOffersRes.data) {
    for (const o of ownOffersRes.data) {
      results.push({
        id: o.id,
        label: o.nome ?? "Sem nome",
        subtitle: o.vertical ? `Oferta propria | ${o.vertical}` : "Oferta propria",
        path: `/ofertas/${o.id}`,
        type: "own-offer",
      });
    }
  }

  if (domainsRes.data) {
    for (const d of domainsRes.data) {
      const offerName = (d as any).spied_offers?.nome;
      results.push({
        id: d.id,
        label: d.domain ?? "Dominio",
        subtitle: offerName ? `Dominio de ${offerName}` : "Dominio",
        path: `/spy/${d.offer_id}`,
        type: "domain",
      });
    }
  }

  if (creativesRes.data) {
    for (const c of creativesRes.data) {
      results.push({
        id: c.id,
        label: c.nome ?? "Criativo",
        subtitle: c.angulo ? `Criativo | ${c.angulo}` : "Criativo",
        path: `/criativos`,
        type: "creative",
      });
    }
  }

  if (avatarsRes.data) {
    for (const a of avatarsRes.data) {
      results.push({
        id: a.id,
        label: a.nome ?? "Avatar",
        subtitle: "Avatar",
        path: `/avatar/${a.id}`,
        type: "avatar",
      });
    }
  }

  return results.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCommandPalette() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>(loadRecents);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Route context
  const routeContext = useMemo(
    () => detectRouteContext(location.pathname),
    [location.pathname]
  );

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.length >= SEARCH_MIN_CHARS ? search : "");
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Global search query
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useQuery({
    queryKey: ["command-palette-search", debouncedSearch],
    queryFn: () => globalSearch(debouncedSearch),
    enabled: debouncedSearch.length >= SEARCH_MIN_CHARS,
    staleTime: 30_000,
  });

  const isSearchActive = search.length >= SEARCH_MIN_CHARS;

  // Add recent item
  const addRecent = useCallback((item: Omit<RecentItem, "timestamp">) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.id !== item.id && r.path !== item.path);
      const next = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
      saveRecents(next);
      return next;
    });
  }, []);

  // Reset search on close
  const resetSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
  }, []);

  return {
    search,
    setSearch,
    isSearchActive,
    isSearching,
    searchResults,
    recents,
    addRecent,
    routeContext,
    resetSearch,
  };
}
