import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  LayoutDashboard,
  Package,
  Users,
  Palette,
  Upload,
  Plus,
  Settings,
  Search,
  Bookmark,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/shared/components/ui/command";
import { useSpiedOffers } from "@/features/spy/hooks/useSpiedOffers";
import { useSavedViews } from "@/features/spy/hooks/useSavedViews";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavAction {
  label: string;
  icon: React.ElementType;
  path: string;
  shortcut?: string;
}

const navigationActions: NavAction[] = [
  { label: "Spy Radar", icon: Radar, path: "/spy", shortcut: "R" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", shortcut: "D" },
  { label: "Ofertas", icon: Package, path: "/ofertas" },
  { label: "Avatar & Research", icon: Users, path: "/avatar" },
  { label: "Criativos", icon: Palette, path: "/criativos" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const quickActions: NavAction[] = [
  { label: "Nova oferta (quick add)", icon: Plus, path: "/spy?action=quick-add" },
  { label: "Importar CSV", icon: Upload, path: "/spy?action=import" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: offersResult } = useSpiedOffers({ search: search?.length >= 2 ? search : undefined, pageSize: 8 });
  const { data: savedViews = [] } = useSavedViews("spy");

  const filteredOffers = (offersResult?.data ?? [])
    .filter((o: any) => {
      if (!search || search.length < 2) return false;
      const q = search.toLowerCase();
      return (
        o.nome?.toLowerCase().includes(q) ||
        o.main_domain?.toLowerCase().includes(q)
      );
    })
    .slice(0, 8);

  const filteredViews = savedViews.filter((v) => {
    if (!search || search.length < 1) return true;
    return v.name.toLowerCase().includes(search.toLowerCase());
  }).slice(0, 5);

  const runAction = useCallback(
    (path: string) => {
      onOpenChange(false);
      setSearch("");
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar ofertas, ações, páginas..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {filteredOffers.length > 0 && (
          <CommandGroup heading="Ofertas">
            {filteredOffers.map((offer) => (
              <CommandItem
                key={offer.id}
                value={`offer-${offer.nome}-${offer.main_domain}`}
                onSelect={() => runAction(`/spy/${offer.id}`)}
              >
                <Search className="mr-2 h-4 w-4 text-[var(--text-muted)]" />
                <span className="flex-1 truncate">{offer.nome}</span>
                {offer.main_domain && (
                  <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[200px]">
                    {offer.main_domain}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navegação">
          {navigationActions.map((action) => (
            <CommandItem
              key={action.path}
              value={action.label}
              onSelect={() => runAction(action.path)}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
              {action.shortcut && (
                <CommandShortcut>Cmd+{action.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        {filteredViews.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Views salvas">
              {filteredViews.map((view) => (
                <CommandItem
                  key={view.id}
                  value={`view-${view.name}`}
                  onSelect={() => runAction(`/spy?view=${view.id}`)}
                >
                  <Bookmark className="mr-2 h-4 w-4 text-[var(--accent-amber)]" />
                  <span>{view.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Ações rápidas">
          {quickActions.map((action) => (
            <CommandItem
              key={action.label}
              value={action.label}
              onSelect={() => runAction(action.path)}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
