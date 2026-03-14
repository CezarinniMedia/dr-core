// spy-radar/SpyOffersTable.tsx — Main offers table with row rendering (BD-2.1, BD-2.3)
import { useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Eye, Trash2, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, Radar, Zap,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  STATUS_OPTIONS, STATUS_BADGE, VERTICAL_BADGE, TREND_ICON, PAGE_SIZE_OPTIONS,
  formatCurrency, stripMarkdown, getCount,
} from "./constants";
import { ScreenshotLightbox } from "./ScreenshotLightbox";

interface SpyOffersTableProps {
  offers: any[] | undefined;
  isLoading: boolean;
  visibleColumns: Set<string>;
  trafficDataSource: "similarweb" | "semrush";
  latestTrafficMap: Map<string, number> | undefined;
  // Selection
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  // Pagination
  pageSize: string;
  setPageSize: (v: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  // Actions
  onInlineStatusChange: (offerId: string, newStatus: string) => void;
  onNotesUpdate: (offerId: string, notes: string) => void;
  onDeleteSingle: (id: string) => void;
  onShowQuickAdd: () => void;
}

export function SpyOffersTable({
  offers, isLoading, visibleColumns, trafficDataSource, latestTrafficMap,
  selectedIds, setSelectedIds,
  pageSize, setPageSize, currentPage, setCurrentPage,
  onInlineStatusChange, onNotesUpdate, onDeleteSingle, onShowQuickAdd,
}: SpyOffersTableProps) {
  const navigate = useNavigate();
  const lastClickedIndex = useRef<number | null>(null);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [hoverScreenshotId, setHoverScreenshotId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notes inline edit
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  // Pagination
  const totalOffers = offers?.length ?? 0;
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? totalOffers : parseInt(pageSize);
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(totalOffers / pageSizeNum));
  const visibleOffers = isInfinite
    ? (offers ?? [])
    : (offers ?? []).slice(currentPage * pageSizeNum, (currentPage + 1) * pageSizeNum);

  // Virtualização — ativa apenas quando lista > 100 rows (ex: modo "all" com 12k+ registros)
  const VIRTUALIZE_THRESHOLD = 100;
  const shouldVirtualize = visibleOffers.length > VIRTUALIZE_THRESHOLD;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = 48; // altura estimada de cada row em px

  const virtualizer = useVirtualizer({
    count: visibleOffers.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    enabled: shouldVirtualize,
  });

  const allPageChecked = visibleOffers.length > 0 && visibleOffers.every(o => selectedIds.has(o.id));
  const somePageChecked = visibleOffers.some(o => selectedIds.has(o.id));

  const handleSelectPage = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = visibleOffers.every(o => next.has(o.id));
      if (allSelected) {
        visibleOffers.forEach(o => next.delete(o.id));
      } else {
        visibleOffers.forEach(o => next.add(o.id));
      }
      return next;
    });
  }, [visibleOffers, setSelectedIds]);

  const handleRowSelect = useCallback((offerId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (e.shiftKey && lastClickedIndex.current !== null && offers) {
        const start = Math.min(lastClickedIndex.current, index);
        const end = Math.max(lastClickedIndex.current, index);
        const globalStart = currentPage * pageSizeNum + start;
        const globalEnd = currentPage * pageSizeNum + end;
        for (let i = globalStart; i <= globalEnd; i++) {
          if (offers[i]) next.add(offers[i].id);
        }
      } else if (e.metaKey || e.ctrlKey) {
        if (next.has(offerId)) next.delete(offerId); else next.add(offerId);
      } else {
        if (next.size === 1 && next.has(offerId)) { next.clear(); } else { next.clear(); next.add(offerId); }
      }
      lastClickedIndex.current = index;
      return next;
    });
  }, [offers, currentPage, pageSizeNum, setSelectedIds]);

  // Computa lista de items a renderizar — virtual ou normal
  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : null;
  const itemsToRender = virtualItems
    ? virtualItems.map(vItem => ({
        offer: visibleOffers[vItem.index] as any,
        visibleIdx: vItem.index,
        rowStyle: {
          position: "absolute" as const,
          top: 0,
          left: 0,
          width: "100%",
          height: `${vItem.size}px`,
          transform: `translateY(${vItem.start}px)`,
        },
      }))
    : visibleOffers.map((offer: any, idx: number) => ({
        offer,
        visibleIdx: idx,
        rowStyle: undefined,
      }));

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
        <Radar className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">Nenhuma oferta no radar ainda.</p>
        <p className="text-sm text-muted-foreground">Comece adicionando ofertas que você encontrou espionando.</p>
        <Button onClick={onShowQuickAdd}><Zap className="h-4 w-4 mr-2" /> Quick Add</Button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="border rounded-lg overflow-hidden"
        style={shouldVirtualize ? { overflowY: "auto", maxHeight: "70vh" } : undefined}
      >
        <Table style={shouldVirtualize ? { tableLayout: "fixed" } : undefined}>
          <TableHeader className={shouldVirtualize ? "sticky top-0 z-10 bg-background" : ""}>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allPageChecked}
                  ref={(el) => {
                    if (el) {
                      const input = el as unknown as HTMLButtonElement;
                      if (somePageChecked && !allPageChecked) { input.dataset.state = "indeterminate"; }
                    }
                  }}
                  onCheckedChange={handleSelectPage}
                  aria-label="Selecionar pagina"
                />
              </TableHead>
              {visibleColumns.has("status") && <TableHead className="w-[90px]">Status</TableHead>}
              {visibleColumns.has("nome") && <TableHead className="w-[200px]">Nome</TableHead>}
              {visibleColumns.has("notas") && <TableHead className="w-[200px]">Notas</TableHead>}
              {visibleColumns.has("priority") && <TableHead className="w-[70px] text-center">Prior.</TableHead>}
              {visibleColumns.has("vertical") && <TableHead className="w-[80px]">Vertical</TableHead>}
              {visibleColumns.has("subnicho") && <TableHead className="w-[90px]">Subnicho</TableHead>}
              {visibleColumns.has("product_name") && <TableHead className="w-[140px]">Produto</TableHead>}
              {visibleColumns.has("product_promise") && <TableHead className="w-[160px]">Promessa</TableHead>}
              {visibleColumns.has("ticket") && <TableHead className="w-[80px]">Ticket</TableHead>}
              {visibleColumns.has("geo") && <TableHead className="w-[60px]">Geo</TableHead>}
              {visibleColumns.has("trafego") && (
                <TableHead className="w-[120px]">
                  Tráfego
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                    ({trafficDataSource === 'similarweb' ? 'SW' : 'SR'})
                  </span>
                </TableHead>
              )}
              {visibleColumns.has("traffic_trend") && <TableHead className="w-[70px]">Tend.</TableHead>}
              {visibleColumns.has("estimated_revenue") && <TableHead className="w-[100px]">Receita</TableHead>}
              {visibleColumns.has("operator") && <TableHead className="w-[100px]">Operador</TableHead>}
              {visibleColumns.has("checkout") && <TableHead className="w-[90px]">Checkout</TableHead>}
              {visibleColumns.has("vsl") && <TableHead className="w-[60px]">VSL</TableHead>}
              {visibleColumns.has("fonte") && <TableHead className="w-[100px]">Fonte</TableHead>}
              {visibleColumns.has("discovery_query") && <TableHead className="w-[120px]">Query</TableHead>}
              {visibleColumns.has("dom") && <TableHead className="w-[60px] text-center">Dom.</TableHead>}
              {visibleColumns.has("ads") && <TableHead className="w-[60px] text-center">Ads</TableHead>}
              {visibleColumns.has("funil") && <TableHead className="w-[60px] text-center">Funil</TableHead>}
              {visibleColumns.has("discovered") && <TableHead className="w-[90px]">Descoberto</TableHead>}
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            style={shouldVirtualize ? { height: `${virtualizer.getTotalSize()}px`, position: "relative" } : undefined}
          >
            {itemsToRender.map(({ offer, visibleIdx, rowStyle }) => {
              const sb = STATUS_BADGE[offer.status] || STATUS_BADGE.RADAR;
              const domainsCount = getCount(offer, "offer_domains");
              const adsCount = getCount(offer, "ad_creatives");
              const funnelCount = getCount(offer, "offer_funnel_steps");
              const isSelected = selectedIds.has(offer.id);

              return (
                <TableRow
                  key={offer.id}
                  style={rowStyle}
                  className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) {
                      handleRowSelect(offer.id, visibleIdx, e);
                    } else if (selectedIds.size > 0) {
                      handleRowSelect(offer.id, visibleIdx, e);
                    } else {
                      navigate(`/spy/${offer.id}`);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (next.has(offer.id)) next.delete(offer.id); else next.add(offer.id);
                          return next;
                        });
                      }}
                      aria-label={`Selecionar ${offer.nome}`}
                    />
                  </TableCell>

                  {/* Status */}
                  {visibleColumns.has("status") && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <DropdownMenu modal={true}>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <button className="cursor-pointer">
                                <Badge variant="outline" className={`${sb.className} whitespace-nowrap`}>{sb.label}</Badge>
                              </button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            {STATUS_OPTIONS.map(s => (
                              <DropdownMenuItem key={s.value} onClick={() => onInlineStatusChange(offer.id, s.value)}>
                                {s.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent side="right" className="text-xs max-w-[200px]">{sb.tip}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Nome */}
                  {visibleColumns.has("nome") && (
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="font-medium text-sm truncate max-w-[190px]">{offer.nome}</p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs">{offer.nome}</TooltipContent>
                      </Tooltip>
                      {offer.main_domain && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground truncate max-w-[190px]">{offer.main_domain}</p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">{offer.main_domain}</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}

                  {/* Notas */}
                  {visibleColumns.has("notas") && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start gap-1 group max-w-[190px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground line-clamp-2 flex-1 min-w-0">
                              {offer.notas
                                ? stripMarkdown(offer.notas).slice(0, 120)
                                : <span className="text-muted-foreground/30">—</span>
                              }
                            </p>
                          </TooltipTrigger>
                          {offer.notas && (
                            <TooltipContent className="max-w-xs text-xs whitespace-pre-wrap" side="top">
                              {stripMarkdown(offer.notas).slice(0, 500)}
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <Popover
                          open={editingNotesId === offer.id}
                          onOpenChange={(open) => {
                            if (open) { setEditingNotesId(offer.id); setNotesValue(offer.notas || ""); }
                            else { setEditingNotesId(null); }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" title="Editar notas">
                              <FileText className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-3" side="right" align="start">
                            <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" /> Notas — {offer.nome}
                            </p>
                            <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} className="text-xs min-h-[120px] resize-y" placeholder="Escreva notas em markdown..." />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingNotesId(null)}>Cancelar</Button>
                              <Button size="sm" className="h-7 text-xs" onClick={() => { onNotesUpdate(offer.id, notesValue); setEditingNotesId(null); }}>Salvar</Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  )}

                  {/* Priority */}
                  {visibleColumns.has("priority") && (
                    <TableCell className="text-sm text-center text-muted-foreground">{offer.priority ?? "—"}</TableCell>
                  )}

                  {/* Vertical */}
                  {visibleColumns.has("vertical") && (
                    <TableCell>
                      {offer.vertical && (
                        <Badge variant="outline" className={`${VERTICAL_BADGE[offer.vertical] || ""} whitespace-nowrap`}>{offer.vertical}</Badge>
                      )}
                    </TableCell>
                  )}

                  {/* Subnicho */}
                  {visibleColumns.has("subnicho") && (
                    <TableCell className="text-xs text-muted-foreground max-w-[80px]">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate">{offer.subnicho || "—"}</span></TooltipTrigger>
                        {offer.subnicho && <TooltipContent side="top" className="text-xs">{offer.subnicho}</TooltipContent>}
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Product name */}
                  {visibleColumns.has("product_name") && (
                    <TableCell className="text-xs max-w-[130px]">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate">{offer.product_name || "—"}</span></TooltipTrigger>
                        {offer.product_name && <TooltipContent side="top" className="text-xs">{offer.product_name}</TooltipContent>}
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Product promise */}
                  {visibleColumns.has("product_promise") && (
                    <TableCell>
                      {offer.product_promise ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[150px]">{offer.product_promise}</p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs" side="top">{offer.product_promise}</TooltipContent>
                        </Tooltip>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                  )}

                  {/* Ticket */}
                  {visibleColumns.has("ticket") && <TableCell className="text-sm">{formatCurrency(offer.product_ticket)}</TableCell>}

                  {/* Geo */}
                  {visibleColumns.has("geo") && <TableCell className="text-xs text-muted-foreground">{offer.geo || "—"}</TableCell>}

                  {/* Tráfego */}
                  {visibleColumns.has("trafego") && (
                    <TableCell className="text-sm">
                      {(() => {
                        const trafficVal = latestTrafficMap?.get(offer.id) ?? offer.estimated_monthly_traffic;
                        return trafficVal ? `${(trafficVal / 1000).toFixed(0)}k` : "—";
                      })()}
                      {offer.traffic_trend && <span className="ml-1">{TREND_ICON[offer.traffic_trend] || ""}</span>}
                    </TableCell>
                  )}

                  {/* Traffic trend */}
                  {visibleColumns.has("traffic_trend") && (
                    <TableCell className="text-sm">
                      {offer.traffic_trend ? (TREND_ICON[offer.traffic_trend] || offer.traffic_trend) : "—"}
                    </TableCell>
                  )}

                  {/* Estimated revenue */}
                  {visibleColumns.has("estimated_revenue") && <TableCell className="text-sm">{formatCurrency(offer.estimated_monthly_revenue)}</TableCell>}

                  {/* Operator */}
                  {visibleColumns.has("operator") && (
                    <TableCell className="text-xs text-muted-foreground max-w-[90px]">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate">{offer.operator_name || "—"}</span></TooltipTrigger>
                        {offer.operator_name && <TooltipContent side="top" className="text-xs">{offer.operator_name}</TooltipContent>}
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Checkout */}
                  {visibleColumns.has("checkout") && (
                    <TableCell className="text-xs text-muted-foreground max-w-[80px]">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate">{offer.checkout_provider || "—"}</span></TooltipTrigger>
                        {offer.checkout_provider && <TooltipContent side="top" className="text-xs">{offer.checkout_provider}</TooltipContent>}
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* VSL */}
                  {visibleColumns.has("vsl") && <TableCell className="text-xs text-muted-foreground">{offer.vsl_player ? "Sim" : "—"}</TableCell>}

                  {/* Fonte */}
                  {visibleColumns.has("fonte") && (
                    <TableCell className="text-xs text-muted-foreground max-w-[90px]">
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate">{offer.discovery_source || "—"}</span></TooltipTrigger>
                        {offer.discovery_source && <TooltipContent side="top" className="text-xs">{offer.discovery_source}</TooltipContent>}
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Discovery query */}
                  {visibleColumns.has("discovery_query") && (
                    <TableCell>
                      {offer.discovery_query ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground truncate max-w-[110px]">{offer.discovery_query}</p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs" side="top">{offer.discovery_query}</TooltipContent>
                        </Tooltip>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                  )}

                  {/* Counts */}
                  {visibleColumns.has("dom") && <TableCell className="text-center text-sm">{domainsCount}</TableCell>}
                  {visibleColumns.has("ads") && <TableCell className="text-center text-sm">{adsCount}</TableCell>}
                  {visibleColumns.has("funil") && <TableCell className="text-center text-sm">{funnelCount > 0 ? "OK" : "—"}</TableCell>}

                  {/* Discovered */}
                  {visibleColumns.has("discovered") && (
                    <TableCell className="text-xs text-muted-foreground">
                      {offer.discovered_at ? format(new Date(offer.discovered_at), "dd MMM", { locale: ptBR }) : "—"}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-0.5 items-center">
                      {offer.screenshot_url && (
                        <div
                          onMouseEnter={() => {
                            if (hoverTimer.current) clearTimeout(hoverTimer.current);
                            hoverTimer.current = setTimeout(() => setHoverScreenshotId(offer.id), 120);
                          }}
                          onMouseLeave={() => {
                            if (hoverTimer.current) clearTimeout(hoverTimer.current);
                            hoverTimer.current = setTimeout(() => setHoverScreenshotId(null), 80);
                          }}
                        >
                          <Popover open={hoverScreenshotId === offer.id}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setHoverScreenshotId(null); setLightboxUrl(offer.screenshot_url); }}>
                                <ImageIcon className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-56 p-1.5" side="left"
                              onMouseEnter={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setHoverScreenshotId(offer.id); }}
                              onMouseLeave={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setHoverScreenshotId(null); }}
                              onInteractOutside={(e) => e.preventDefault()}
                            >
                              <img src={offer.screenshot_url} alt="Preview" className="w-full rounded" style={{ maxHeight: 140, objectFit: "cover" }} />
                              <p className="text-[10px] text-muted-foreground text-center mt-1">Clique para abrir em tela cheia</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/spy/${offer.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">Abrir oferta</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteSingle(offer.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">Deletar oferta</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setCurrentPage(0); }}>
            <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{totalOffers} oferta(s)</span>
        </div>
        {!isInfinite && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{currentPage + 1} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Screenshot lightbox */}
      {lightboxUrl && <ScreenshotLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </>
  );
}
