import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  LayoutDashboard,
  Package,
  Users,
  Palette,
  Shield,
  Briefcase,
  Settings,
  Upload,
  Plus,
  Bookmark,
  RefreshCw,
  Download,
  Clock,
  Globe,
  Image,
  User,
  Search,
  SearchX,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Star,
  ArrowLeft,
  ArrowRight,
  Trophy,
  X,
} from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";
import { useCommandPalette, type SearchResult, type RouteContext } from "@/shared/hooks/useCommandPalette";
import { useModalContext, type ModalId } from "@/shared/hooks/useModalContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  shortcut?: string;
}

interface ActionItem {
  label: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  condition?: (ctx: RouteContext) => boolean;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const navigationItems: NavItem[] = [
  { label: "Spy Radar", icon: Radar, path: "/spy", shortcut: "Alt+1" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", shortcut: "Alt+2" },
  { label: "Ofertas Proprias", icon: Package, path: "/ofertas", shortcut: "Alt+3" },
  { label: "Criativos", icon: Palette, path: "/criativos", shortcut: "Alt+4" },
  { label: "Avatares", icon: Users, path: "/avatar", shortcut: "Alt+5" },
  { label: "Arsenal", icon: Shield, path: "/arsenal", shortcut: "Alt+6" },
  { label: "Daily Briefing", icon: Briefcase, path: "/briefing", shortcut: "Alt+0" },
  { label: "Configuracoes", icon: Settings, path: "/settings", shortcut: "Alt+," },
];

const searchTypeIcons: Record<SearchResult["type"], React.ElementType> = {
  offer: Radar,
  "own-offer": Package,
  domain: Globe,
  creative: Image,
  avatar: User,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KbdBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="ml-auto shrink-0 text-[11px] font-mono leading-none
        bg-[var(--bg-subtle)] border border-[var(--border-default)]
        rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[var(--text-muted)]"
    >
      {children}
    </kbd>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] font-semibold uppercase tracking-[0.05em]
        text-[var(--text-muted)] px-4 pt-2 pb-1"
    >
      {children}
    </div>
  );
}

function PaletteItem({
  icon: Icon,
  label,
  subtitle,
  shortcut,
  onSelect,
  value,
}: {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
  value: string;
}) {
  return (
    <CommandPrimitive.Item
      value={value}
      onSelect={onSelect}
      className="flex items-center gap-3 px-4 py-2 cursor-pointer
        text-[14px] text-[var(--text-primary)]
        data-[selected=true]:bg-[var(--bg-raised)]
        data-[selected=true]:border-l-2 data-[selected=true]:border-l-[var(--accent-primary)]
        data-[selected=true]:pl-[14px]
        data-[selected=true]:[&_svg:first-child]:text-[var(--accent-primary)]
        transition-colors duration-100"
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
      <div className="flex-1 min-w-0">
        <span className="block truncate">{label}</span>
        {subtitle && (
          <span className="block text-[11px] text-[var(--text-muted)] truncate">
            {subtitle}
          </span>
        )}
      </div>
      {shortcut && <KbdBadge>{shortcut}</KbdBadge>}
    </CommandPrimitive.Item>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openModal } = useModalContext();

  const {
    search,
    setSearch,
    isSearchActive,
    isSearching,
    searchResults,
    recents,
    addRecent,
    routeContext,
    resetSearch,
  } = useCommandPalette();

  // Reset search when palette closes
  useEffect(() => {
    if (!open) resetSearch();
  }, [open, resetSearch]);

  // Close palette + navigate
  const runNav = useCallback(
    (path: string, label: string, type: "navigation" | "offer" | "domain" | "creative" | "avatar" = "navigation") => {
      addRecent({ id: `nav-${path}`, label, path, type });
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange, addRecent]
  );

  // Close palette + open modal
  const runModal = useCallback(
    (modalId: ModalId, label: string) => {
      addRecent({ id: `action-${modalId}`, label, path: "", type: "action" });
      onOpenChange(false);
      openModal(modalId);
    },
    [onOpenChange, openModal, addRecent]
  );

  // Refresh pipeline RPC
  const handleRefreshPipeline = useCallback(async () => {
    onOpenChange(false);
    try {
      const { error } = await supabase.rpc("refresh_pipeline");
      if (error) throw error;
      toast({ title: "Pipeline refresh iniciado" });
    } catch {
      toast({ title: "Erro ao refreshar pipeline", variant: "destructive" });
    }
  }, [onOpenChange, toast]);

  // Build quick actions (some are contextual)
  const quickActions: ActionItem[] = [
    {
      label: "Importar CSV",
      icon: Upload,
      action: () => runModal("import", "Importar CSV"),
      shortcut: "Ctrl+I",
    },
    {
      label: "Quick Add Oferta",
      icon: Plus,
      action: () => runModal("quickAdd", "Quick Add Oferta"),
      shortcut: "Ctrl+N",
    },
    {
      label: "Saved Views",
      icon: Bookmark,
      action: () => runNav("/spy?action=saved-views", "Saved Views"),
    },
    {
      label: "Refresh Pipeline",
      icon: RefreshCw,
      action: handleRefreshPipeline,
    },
    {
      label: "Exportar Radar CSV",
      icon: Download,
      action: () => runModal("exportCsv", "Exportar Radar CSV"),
      shortcut: "Ctrl+E",
    },
  ];

  const visibleQuickActions = quickActions.filter(
    (a) => !a.condition || a.condition(routeContext)
  );

  // Contextual actions per route
  const contextualActions: ActionItem[] = getContextualActions(routeContext, navigate, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 gap-0 border-0 bg-transparent shadow-none
          fixed top-[20vh] left-1/2 -translate-x-1/2 translate-y-0
          w-[min(640px,90vw)] max-w-none
          max-sm:w-full max-sm:top-0 max-sm:rounded-none max-sm:h-full"
        style={{ transform: "translateX(-50%)" }}
        aria-label="Command palette"
      >
        <VisuallyHiddenPrimitive.Root>
          <DialogTitle>Command Palette</DialogTitle>
        </VisuallyHiddenPrimitive.Root>

        <CommandPrimitive
          className="flex flex-col overflow-hidden rounded-[var(--radius-xl)]
            bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
            max-h-[min(480px,70vh)]
            max-sm:rounded-none max-sm:max-h-full max-sm:h-full
            animate-fade-in"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.05),
              0 16px 64px rgba(0, 0, 0, 0.6),
              0 0 48px rgba(124, 58, 237, 0.04)
            `,
          }}
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]
              sticky top-0 z-10 bg-[var(--bg-elevated)]
              focus-within:border-b-2 focus-within:border-b-[var(--accent-primary)]
              focus-within:shadow-[0_1px_8px_rgba(124,58,237,0.15)]
              transition-all duration-100"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar ou executar..."
              className="flex-1 bg-transparent border-none outline-none
                text-[14px] text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                max-sm:h-12"
            />
            <KbdBadge>Esc</KbdBadge>
          </div>

          {/* Results area */}
          <CommandPrimitive.List
            className="overflow-y-auto overflow-x-hidden pb-2
              max-h-[calc(min(480px,70vh)-52px)]
              max-sm:max-h-[calc(100vh-64px)]"
          >
            {/* Empty state */}
            <CommandPrimitive.Empty className="py-10 flex flex-col items-center gap-2 text-center">
              <SearchX className="h-8 w-8 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">
                Nenhum resultado para "<span className="text-[var(--text-primary)]">{search}</span>"
              </p>
              <button
                type="button"
                onClick={() => runModal("quickAdd", "Quick Add Oferta")}
                className="text-xs text-[var(--accent-primary)] hover:underline mt-1"
              >
                Quick Add Oferta com esse nome
              </button>
            </CommandPrimitive.Empty>

            {/* Search results mode */}
            {isSearchActive ? (
              <CommandPrimitive.Group>
                <SectionHeading>
                  {isSearching ? "Buscando..." : "Resultados"}
                </SectionHeading>
                {searchResults.map((r) => (
                  <PaletteItem
                    key={`search-${r.id}`}
                    value={`search ${r.label} ${r.subtitle ?? ""}`}
                    icon={searchTypeIcons[r.type] ?? Radar}
                    label={r.label}
                    subtitle={r.subtitle}
                    onSelect={() => runNav(r.path, r.label, r.type)}
                  />
                ))}
              </CommandPrimitive.Group>
            ) : (
              <>
                {/* RECENTES */}
                {recents.length > 0 && (
                  <CommandPrimitive.Group>
                    <SectionHeading>Recentes</SectionHeading>
                    {recents.map((r) => (
                      <PaletteItem
                        key={`recent-${r.id}`}
                        value={`recent ${r.label}`}
                        icon={Clock}
                        label={r.label}
                        subtitle={r.subtitle}
                        shortcut="Enter"
                        onSelect={() => {
                          if (r.path) {
                            runNav(r.path, r.label, r.type === "action" ? "navigation" : r.type);
                          }
                        }}
                      />
                    ))}
                  </CommandPrimitive.Group>
                )}

                {/* NAVEGACAO */}
                <CommandPrimitive.Group>
                  <SectionHeading>Navegacao</SectionHeading>
                  {navigationItems.map((item) => (
                    <PaletteItem
                      key={item.path}
                      value={`nav ${item.label}`}
                      icon={item.icon}
                      label={item.label}
                      shortcut={item.shortcut}
                      onSelect={() => runNav(item.path, item.label)}
                    />
                  ))}
                </CommandPrimitive.Group>

                {/* ACOES RAPIDAS */}
                <CommandPrimitive.Group>
                  <SectionHeading>Acoes Rapidas</SectionHeading>
                  {visibleQuickActions.map((action) => (
                    <PaletteItem
                      key={action.label}
                      value={`action ${action.label}`}
                      icon={action.icon}
                      label={action.label}
                      shortcut={action.shortcut}
                      onSelect={action.action}
                    />
                  ))}
                </CommandPrimitive.Group>

                {/* CONTEXTUAL (per route) */}
                {contextualActions.length > 0 && (
                  <CommandPrimitive.Group>
                    <SectionHeading>Contexto</SectionHeading>
                    {contextualActions.map((action) => (
                      <PaletteItem
                        key={action.label}
                        value={`ctx ${action.label}`}
                        icon={action.icon}
                        label={action.label}
                        shortcut={action.shortcut}
                        onSelect={action.action}
                      />
                    ))}
                  </CommandPrimitive.Group>
                )}
              </>
            )}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Contextual actions per route (wireframe sec 7)
// ---------------------------------------------------------------------------

function getContextualActions(
  ctx: RouteContext,
  _navigate: ReturnType<typeof useNavigate>,
  onClose: (open: boolean) => void,
): ActionItem[] {
  const close = () => onClose(false);

  switch (ctx) {
    case "spy":
      return [
        { label: "Filtrar por status...", icon: Filter, action: close },
        { label: "Ordenar por trafego", icon: ArrowUpDown, action: close },
        { label: "Selecionar tudo", icon: CheckSquare, action: close },
      ];
    case "spy-detail":
      return [
        { label: "Marcar como Hot", icon: Star, action: close },
        { label: "Oferta anterior", icon: ArrowLeft, action: close },
        { label: "Proxima oferta", icon: ArrowRight, action: close },
      ];
    case "criativos":
      return [
        { label: "Novo Criativo", icon: Plus, action: close },
        { label: "Marcar WINNER", icon: Trophy, action: close },
        { label: "Marcar KILLED", icon: X, action: close },
      ];
    case "arsenal":
      return [
        { label: "Nova Footprint", icon: Plus, action: close },
        { label: "Nova Dork", icon: Plus, action: close },
      ];
    default:
      return [];
  }
}
