import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/shared/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  classifyCsv, processCsv, filterCsvData, getDefaultExcludedColumns,
  type CsvType,
} from "@/shared/lib/csvClassifier";
import { useCSVWorker } from "@/workers/useCSVWorker";
import { useCreateImportJob, useUpdateImportJob } from "@/features/spy/hooks/useImportHistory";
import {
  type FileEntry, type DomainMatchInfo, type ImportResult,
  ALL_TYPES, extractPeriodFromFilename, groupBy, findOfferForSubdomain,
} from "./types";

export function useImportWorkflow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { classifyFile, reprocessFile, filterFile } = useCSVWorker();
  const createJob = useCreateImportJob();
  const updateJob = useUpdateImportJob();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [pasteDelimiter, setPasteDelimiter] = useState("auto");
  const [footprintQuery, setFootprintQuery] = useState("");
  const [domainMatches, setDomainMatches] = useState<DomainMatchInfo[]>([]);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [matching, setMatching] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    let loaded = 0;
    const total = acceptedFiles.length;

    for (const file of acceptedFiles) {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round(((loaded + e.loaded / e.total) / total) * 100));
        }
      };
      reader.onload = async (e) => {
        loaded++;
        setUploadProgress(Math.round((loaded / total) * 100));
        const text = e.target?.result as string || "";

        try {
          // Heavy CSV parsing runs in Web Worker (off main thread)
          const result = await classifyFile(text, file.name, undefined, (pct, msg) => {
            setProgressLabel(msg);
          });
          setFiles(prev => [...prev, {
            name: file.name, text, classified: result.classified, processed: result.processed,
            excludedColumns: result.excludedColumns.length > 0 ? new Set(result.excludedColumns) : undefined,
          }]);
          if (result.classified.discoveryQuery && !footprintQuery) {
            setFootprintQuery(result.classified.discoveryQuery);
          }
        } catch {
          // Fallback to main thread if worker fails
          const classified = classifyCsv(text, file.name);
          const autoExcluded = getDefaultExcludedColumns(classified.type, classified.headers);
          const filtered = autoExcluded.size > 0 ? filterCsvData(classified, autoExcluded, new Set()) : classified;
          const processed = processCsv(filtered);
          setFiles(prev => [...prev, {
            name: file.name, text, classified, processed,
            excludedColumns: autoExcluded.size > 0 ? autoExcluded : undefined,
          }]);
          if (classified.discoveryQuery && !footprintQuery) {
            setFootprintQuery(classified.discoveryQuery);
          }
        }

        if (loaded === total) {
          setUploading(false);
          setProgressLabel("");
        }
      };
      reader.onerror = () => {
        loaded++;
        if (loaded === total) setUploading(false);
      };
      reader.readAsText(file);
    }
  }, [footprintQuery, classifyFile]);

  const dropzone = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    multiple: true,
  });

  const handleAddPaste = async () => {
    if (!pasteText.trim()) return;
    const delim = pasteDelimiter === "auto" ? undefined : pasteDelimiter;

    try {
      const result = await classifyFile(pasteText, undefined, delim);
      setFiles(prev => [...prev, { name: "Colado", text: pasteText, classified: result.classified, processed: result.processed }]);
      if (result.classified.discoveryQuery && !footprintQuery) {
        setFootprintQuery(result.classified.discoveryQuery);
      }
    } catch {
      // Fallback to main thread
      const classified = classifyCsv(pasteText, undefined, delim);
      const processed = processCsv(classified);
      setFiles(prev => [...prev, { name: "Colado", text: pasteText, classified, processed }]);
      if (classified.discoveryQuery && !footprintQuery) {
        setFootprintQuery(classified.discoveryQuery);
      }
    }
    setPasteText("");
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFileType = async (idx: number, newType: CsvType) => {
    // Build reclassified BEFORE setState to avoid stale closure reads
    const f = files[idx];
    if (!f) return;
    const reclassified = { ...f.classified, type: newType, label: ALL_TYPES.find(t => t.value === newType)?.label || newType };
    if (f.name && f.name !== "Colado") {
      const periodInfo = extractPeriodFromFilename(f.name);
      if (periodInfo) {
        reclassified.periodDate = periodInfo.date;
        reclassified.periodLabel = periodInfo.label;
      }
    }
    // Update classified immediately, then reprocess in worker
    setFiles(prev => prev.map((file, i) => i === idx ? { ...file, classified: reclassified } : file));
    try {
      const processed = await reprocessFile(reclassified);
      setFiles(prev => prev.map((file, i) => i === idx ? { ...file, processed } : file));
    } catch {
      const processed = processCsv(reclassified);
      setFiles(prev => prev.map((file, i) => i === idx ? { ...file, processed } : file));
    }
  };

  const updateFilePeriod = async (idx: number, period: string) => {
    const f = files[idx];
    if (!f) return;
    const updated = { ...f.classified, periodDate: period };
    setFiles(prev => prev.map((file, i) => i === idx ? { ...file, classified: updated } : file));
    try {
      const processed = await reprocessFile(updated);
      setFiles(prev => prev.map((file, i) => i === idx ? { ...file, processed } : file));
    } catch {
      const processed = processCsv(updated);
      setFiles(prev => prev.map((file, i) => i === idx ? { ...file, processed } : file));
    }
  };

  const toggleColumn = async (fileIdx: number, colIdx: number) => {
    const f = files[fileIdx];
    if (!f) return;
    const exc = new Set(f.excludedColumns || []);
    if (exc.has(colIdx)) exc.delete(colIdx); else exc.add(colIdx);
    setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, excludedColumns: exc } : file));
    try {
      const result = await filterFile(f.classified, [...exc], [...(f.excludedRows || [])]);
      setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, processed: result.processed } : file));
    } catch {
      const filtered = filterCsvData(f.classified, exc, f.excludedRows || new Set());
      setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, processed: processCsv(filtered) } : file));
    }
  };

  const toggleRow = async (fileIdx: number, rowIdx: number) => {
    const f = files[fileIdx];
    if (!f) return;
    const exc = new Set(f.excludedRows || []);
    if (exc.has(rowIdx)) exc.delete(rowIdx); else exc.add(rowIdx);
    setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, excludedRows: exc } : file));
    try {
      const result = await filterFile(f.classified, [...(f.excludedColumns || [])], [...exc]);
      setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, processed: result.processed } : file));
    } catch {
      const filtered = filterCsvData(f.classified, f.excludedColumns || new Set(), exc);
      setFiles(prev => prev.map((file, i) => i === fileIdx ? { ...file, processed: processCsv(filtered) } : file));
    }
  };

  const applyTypeToAll = async (newType: CsvType) => {
    const updatedFiles = files.map(f => {
      const reclassified = { ...f.classified, type: newType, label: ALL_TYPES.find(t => t.value === newType)?.label || newType };
      if (f.name && f.name !== "Colado") {
        const periodInfo = extractPeriodFromFilename(f.name);
        if (periodInfo) {
          reclassified.periodDate = periodInfo.date;
          reclassified.periodLabel = periodInfo.label;
        }
      }
      return { ...f, classified: reclassified };
    });
    setFiles(updatedFiles);
    // Reprocess all in worker (parallel)
    const results = await Promise.all(
      updatedFiles.map(async (f) => {
        try {
          return await reprocessFile(f.classified);
        } catch {
          return processCsv(f.classified);
        }
      })
    );
    setFiles(prev => prev.map((f, i) => ({ ...f, processed: results[i] })));
  };

  const applyPeriodToAll = async (period: string) => {
    const updatedFiles = files.map(f => ({ ...f, classified: { ...f.classified, periodDate: period } }));
    setFiles(updatedFiles);
    const results = await Promise.all(
      updatedFiles.map(async (f) => {
        try {
          return await reprocessFile(f.classified);
        } catch {
          return processCsv(f.classified);
        }
      })
    );
    setFiles(prev => prev.map((f, i) => ({ ...f, processed: results[i] })));
  };

  const handleMatchDomains = async () => {
    setMatching(true);
    setProgressLabel("Analisando domínios...");

    try {
      const allDomains = new Map<string, { csvTypes: Set<string>; trafficRecords: number; newDomains: number }>();

      for (const file of files) {
        const p = file.processed;
        for (const d of p.domains) {
          if (!allDomains.has(d.domain)) allDomains.set(d.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
          allDomains.get(d.domain)!.csvTypes.add(file.classified.label);
          allDomains.get(d.domain)!.newDomains++;
        }
        for (const t of p.trafficRecords) {
          if (!allDomains.has(t.domain)) allDomains.set(t.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
          allDomains.get(t.domain)!.csvTypes.add(file.classified.label);
          allDomains.get(t.domain)!.trafficRecords++;
        }
        for (const g of p.geoData) {
          if (!allDomains.has(g.domain)) allDomains.set(g.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
          allDomains.get(g.domain)!.csvTypes.add(file.classified.label);
        }
      }

      const domainList = [...allDomains.keys()];
      const allLookupDomains = new Set(domainList);
      for (const domain of domainList) {
        const parts = domain.split(".");
        for (let i = 1; i < parts.length - 1; i++) {
          allLookupDomains.add(parts.slice(i).join("."));
        }
      }
      const lookupArray = [...allLookupDomains];

      setProgressLabel(`Buscando ${lookupArray.length} domínios no radar...`);

      const offersByMainDomain = new Map<string, { id: string; nome: string }>();
      for (let i = 0; i < lookupArray.length; i += 100) {
        const chunk = lookupArray.slice(i, i + 100);
        const { data } = await supabase
          .from("spied_offers")
          .select("id, nome, main_domain")
          .in("main_domain", chunk);
        for (const offer of data || []) {
          offersByMainDomain.set(offer.main_domain, { id: offer.id, nome: offer.nome });
        }
      }

      const offerDomainLookup = new Map<string, string>();
      for (let i = 0; i < lookupArray.length; i += 100) {
        const chunk = lookupArray.slice(i, i + 100);
        const { data } = await supabase
          .from("offer_domains")
          .select("domain, spied_offer_id")
          .in("domain", chunk);
        for (const od of data || []) {
          offerDomainLookup.set(od.domain, od.spied_offer_id);
        }
      }

      const offersById = new Map<string, { id: string; nome: string }>();
      for (const o of offersByMainDomain.values()) offersById.set(o.id, o);

      const missingIds = [...new Set(offerDomainLookup.values())].filter(id => !offersById.has(id));
      for (let i = 0; i < missingIds.length; i += 100) {
        const chunk = missingIds.slice(i, i + 100);
        const { data } = await supabase
          .from("spied_offers")
          .select("id, nome")
          .in("id", chunk);
        for (const offer of data || []) {
          offersById.set(offer.id, { id: offer.id, nome: offer.nome });
        }
      }

      setProgressLabel("Fazendo matching...");
      const matches: DomainMatchInfo[] = [];
      for (const [domain, info] of allDomains) {
        const match: DomainMatchInfo = {
          domain, matched: false, action: "Criar nova oferta",
          csvTypes: [...info.csvTypes], trafficRecords: info.trafficRecords, newDomains: info.newDomains,
        };

        const offerMatch = offersByMainDomain.get(domain);
        if (offerMatch) {
          match.matched = true;
          match.offerId = offerMatch.id;
          match.offerName = offerMatch.nome;
          match.action = "Atualizar existente";
        }

        if (!match.matched) {
          const offerId = offerDomainLookup.get(domain);
          if (offerId) {
            const offer = offersById.get(offerId);
            if (offer) {
              match.matched = true;
              match.offerId = offer.id;
              match.offerName = offer.nome;
              match.action = "Atualizar existente";
            }
          }
        }

        if (!match.matched) {
          const parts = domain.split(".");
          for (let i = 1; i < parts.length - 1; i++) {
            const parentDomain = parts.slice(i).join(".");
            const parentOffer = offersByMainDomain.get(parentDomain);
            if (parentOffer) {
              match.matched = true;
              match.offerId = parentOffer.id;
              match.offerName = parentOffer.nome;
              match.action = "Atualizar existente";
              break;
            }
            const parentOfferId = offerDomainLookup.get(parentDomain);
            if (parentOfferId) {
              const offer = offersById.get(parentOfferId);
              if (offer) {
                match.matched = true;
                match.offerId = offer.id;
                match.offerName = offer.nome;
                match.action = "Atualizar existente";
                break;
              }
            }
          }
        }

        matches.push(match);
      }

      setDomainMatches(matches);
      setStep(3);
    } finally {
      setMatching(false);
      setProgressLabel("");
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setProgressLabel("Preparando importação...");
    let newOffers = 0;
    let updated = 0;
    let trafficCount = 0;
    const BATCH = 1000;
    const PARALLEL = 3;
    let jobId: string | null = null;

    try {
      // Track import job
      const totalLines = files.reduce((s, f) => s + (f.processed.trafficRecords.length + f.processed.domains.length), 0);
      const csvTypes = [...new Set(files.map(f => f.classified.type))].join(", ");
      try {
        jobId = await createJob.mutateAsync({
          tipo: csvTypes || "unknown",
          arquivo_nome: files.map(f => f.name).join(", "),
          total_linhas: totalLines,
          config: {
            fileCount: files.length,
            footprintQuery: footprintQuery || null,
            csvTypes: files.map(f => ({ name: f.name, type: f.classified.type })),
          },
        });
      } catch {
        // Non-blocking: import continues even if job tracking fails
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user?.id ?? "")
        .single();
      const workspaceId = member?.workspace_id;
      if (!workspaceId) throw new Error("Workspace não encontrado");

      const offerIdMap = new Map<string, string>();

      // Phase 1: Batch create offers
      const existingMatches = domainMatches.filter(m => m.matched && m.offerId);
      const newMatches = domainMatches.filter(m => !m.matched || !m.offerId);

      for (const m of existingMatches) offerIdMap.set(m.domain, m.offerId!);
      updated = existingMatches.length;

      if (newMatches.length > 0) {
        // Pre-check: find domains that already exist in DB (dedup against UNIQUE INDEX)
        setProgressLabel("Verificando duplicatas...");
        const newDomainsList = newMatches.map(m => m.domain.toLowerCase());
        const alreadyExisting = new Map<string, string>();

        for (let i = 0; i < newDomainsList.length; i += 100) {
          const chunk = newDomainsList.slice(i, i + 100);
          const { data } = await supabase
            .from("spied_offers")
            .select("id, main_domain")
            .eq("workspace_id", workspaceId)
            .in("main_domain", chunk);
          for (const offer of data || []) {
            alreadyExisting.set(offer.main_domain.toLowerCase(), offer.id);
          }
        }

        // Map existing domains to offerIdMap instead of creating duplicates
        const trulyNew: typeof newMatches = [];
        for (const m of newMatches) {
          const existingId = alreadyExisting.get(m.domain.toLowerCase());
          if (existingId) {
            offerIdMap.set(m.domain, existingId);
            updated++;
          } else {
            trulyNew.push(m);
          }
        }

        if (trulyNew.length > 0) {
          setProgressLabel(`Criando ${trulyNew.length} ofertas...`);
          const offersToCreate = trulyNew.map(m => ({
            nome: m.domain,
            main_domain: m.domain.toLowerCase(),
            status: "RADAR",
            workspace_id: workspaceId,
            discovery_source: files[0]?.classified.type || "manual",
            discovery_query: footprintQuery || null,
          }));

          for (let i = 0; i < offersToCreate.length; i += BATCH) {
            const chunk = offersToCreate.slice(i, i + BATCH);
            const { data, error } = await supabase.from("spied_offers").insert(chunk as any[]).select("id, main_domain");
            if (error) throw error;
            for (const offer of data || []) offerIdMap.set(offer.main_domain, offer.id);
            newOffers += chunk.length;
            const done = Math.min(i + BATCH, offersToCreate.length);
            setProgress(Math.round((done / offersToCreate.length) * 20));
            setProgressLabel(`Criando ofertas... ${done}/${offersToCreate.length}`);
          }
        }
      }

      // Phase 2: Pre-fetch existing domains for dedup
      setProgressLabel("Verificando domínios existentes...");
      setProgress(20);

      const domainStringsToCheck = [...new Set(files.flatMap(f => f.processed.domains.map(d => d.domain)))];
      const existingDomainsMap = new Map<string, { id: string; url: string | null; first_seen: string | null }[]>();

      for (let i = 0; i < domainStringsToCheck.length; i += 100) {
        const chunk = domainStringsToCheck.slice(i, i + 100);
        const { data } = await supabase.from("offer_domains").select("id, spied_offer_id, domain, url, first_seen").in("domain", chunk);
        for (const d of data || []) {
          const key = `${d.spied_offer_id}:${d.domain}`;
          if (!existingDomainsMap.has(key)) existingDomainsMap.set(key, []);
          existingDomainsMap.get(key)!.push({ id: d.id, url: d.url, first_seen: d.first_seen });
        }
      }

      // Phase 3: Batch insert domains
      setProgressLabel("Processando domínios...");
      setProgress(30);

      const domainsToInsert: any[] = [];
      const domainsToUpdateFirstSeen: { id: string; first_seen: string }[] = [];

      for (const file of files) {
        for (const d of file.processed.domains) {
          const offerId = offerIdMap.get(d.domain) || findOfferForSubdomain(d.domain, offerIdMap);
          if (!offerId) continue;

          const key = `${offerId}:${d.domain}`;
          const existing = existingDomainsMap.get(key);

          if (!existing) {
            domainsToInsert.push({
              spied_offer_id: offerId, workspace_id: workspaceId, domain: d.domain, domain_type: d.domain_type,
              url: d.url || null, discovery_source: d.discovery_source, discovery_query: d.discovery_query || footprintQuery || null,
              first_seen: d.first_seen || null, notas: d.notas || null,
            });
            existingDomainsMap.set(key, [{ id: "pending", url: d.url || null, first_seen: d.first_seen || null }]);
          } else if (d.url) {
            const urlExists = existing.some(e => e.url === d.url);
            if (!urlExists) {
              domainsToInsert.push({
                spied_offer_id: offerId, workspace_id: workspaceId, domain: d.domain, domain_type: d.domain_type,
                url: d.url, discovery_source: d.discovery_source, discovery_query: d.discovery_query || footprintQuery || null,
                first_seen: d.first_seen || null, notas: d.notas || null,
              });
              existing.push({ id: "pending", url: d.url, first_seen: d.first_seen || null });
            }
          } else {
            const mainEntry = existing.find(e => !e.url) || existing[0];
            if (d.first_seen && mainEntry.first_seen && d.first_seen < mainEntry.first_seen) {
              domainsToUpdateFirstSeen.push({ id: mainEntry.id, first_seen: d.first_seen });
            }
          }
        }
      }

      if (domainsToInsert.length > 0) {
        const domChunks: any[][] = [];
        for (let i = 0; i < domainsToInsert.length; i += BATCH) domChunks.push(domainsToInsert.slice(i, i + BATCH));

        let domChunksCompleted = 0;
        for (let i = 0; i < domChunks.length; i += PARALLEL) {
          const batch = domChunks.slice(i, i + PARALLEL);
          const results = await Promise.all(batch.map(chunk => supabase.from("offer_domains").insert(chunk)));
          for (const { error } of results) { if (error) throw error; }
          domChunksCompleted += batch.length;
          const done = Math.min(domChunksCompleted * BATCH, domainsToInsert.length);
          setProgress(30 + Math.round((done / domainsToInsert.length) * 15));
          setProgressLabel(`Inserindo domínios... ${done.toLocaleString("pt-BR")}/${domainsToInsert.length.toLocaleString("pt-BR")}`);
        }
      }

      for (const upd of domainsToUpdateFirstSeen) {
        if (upd.id !== "pending") {
          await supabase.from("offer_domains").update({ first_seen: upd.first_seen } as any).eq("id", upd.id);
        }
      }

      // Phase 4: Batch insert traffic data
      setProgress(45);
      setProgressLabel("Importando dados de tráfego...");

      const allTrafficRecords: any[] = [];
      for (const file of files) {
        for (const [domain, records] of groupBy(file.processed.trafficRecords, r => r.domain)) {
          const offerId = offerIdMap.get(domain) || findOfferForSubdomain(domain, offerIdMap);
          if (!offerId) continue;
          for (const r of records) {
            const isSimilarWeb = r.source === "similarweb";
            allTrafficRecords.push({
              spied_offer_id: offerId, workspace_id: workspaceId, domain: r.domain,
              period_type: isSimilarWeb ? "monthly_sw" : "monthly", period_date: r.period_date,
              visits: r.visits, unique_visitors: r.unique_visitors, pages_per_visit: r.pages_per_visit,
              avg_visit_duration: r.avg_visit_duration, bounce_rate: r.bounce_rate, source: r.source || "semrush_csv",
            });
          }
        }
      }

      if (allTrafficRecords.length > 0) {
        const chunks: any[][] = [];
        for (let i = 0; i < allTrafficRecords.length; i += BATCH) chunks.push(allTrafficRecords.slice(i, i + BATCH));

        let chunksCompleted = 0;
        for (let i = 0; i < chunks.length; i += PARALLEL) {
          const batch = chunks.slice(i, i + PARALLEL);
          const results = await Promise.all(
            batch.map(chunk => supabase.rpc("bulk_upsert_traffic_data", { p_records: chunk as unknown as Json }))
          );
          for (const { data, error } of results) {
            if (error) throw error;
            trafficCount += (data as number) ?? 0;
          }
          chunksCompleted += batch.length;
          const done = Math.min(chunksCompleted * BATCH, allTrafficRecords.length);
          setProgress(45 + Math.round((done / allTrafficRecords.length) * 40));
          setProgressLabel(`Importando tráfego... ${done.toLocaleString("pt-BR")}/${allTrafficRecords.length.toLocaleString("pt-BR")}`);
        }
      }

      // Phase 5: Geo data
      setProgress(85);
      setProgressLabel("Atualizando geodistribuição...");

      for (const file of files) {
        for (const geo of file.processed.geoData) {
          const offerId = offerIdMap.get(geo.domain);
          if (!offerId || !geo.mainGeo) continue;

          const geoValue = geo.secondaryGeos && geo.secondaryGeos.length > 0
            ? `${geo.mainGeo}, ${geo.secondaryGeos.join(", ")}`
            : geo.mainGeo;

          const { data: currentOffer } = await supabase.from("spied_offers").select("notas").eq("id", offerId).maybeSingle();
          const existingNotes = (currentOffer as any)?.notas || "";
          const newNotes = existingNotes ? `${existingNotes}\n\n${geo.geoNotes || ""}` : geo.geoNotes || "";

          await supabase.from("spied_offers").update({ geo: geoValue, notas: newNotes.trim() } as any).eq("id", offerId);
        }
      }

      // Phase 6: SimilarWeb offer updates
      setProgress(90);
      setProgressLabel("Aplicando dados SimilarWeb...");

      for (const file of files) {
        if (file.classified.type !== "similarweb") continue;
        for (const upd of file.processed.offerUpdates) {
          const offerId = offerIdMap.get(upd.domain) || findOfferForSubdomain(upd.domain, offerIdMap);
          if (!offerId) continue;

          const updatePayload: Record<string, unknown> = {};
          const { data: existingOffer } = await supabase
            .from("spied_offers")
            .select("screenshot_url, notas, geo")
            .eq("id", offerId)
            .maybeSingle();
          const existing = existingOffer as any;

          if (upd.screenshot_url && !existing?.screenshot_url) {
            updatePayload.screenshot_url = upd.screenshot_url;
          }
          if (upd.notes_appendix) {
            const existingNotes = existing?.notas || "";
            updatePayload.notas = existingNotes ? `${existingNotes}\n\n${upd.notes_appendix}` : upd.notes_appendix;
          }
          if (upd.geo && !existing?.geo) {
            updatePayload.geo = upd.geo;
          }

          if (Object.keys(updatePayload).length > 0) {
            await supabase.from("spied_offers").update(updatePayload as any).eq("id", offerId);
          }
        }
      }

      setProgress(100);
      setProgressLabel("Concluído!");
      setImportResult({ newOffers, updated, trafficRecords: trafficCount });
      queryClient.invalidateQueries({ queryKey: ["spied-offers"] });
      setStep(4);
      toast({ title: "Importação concluída" });

      // Update job as completed
      if (jobId) {
        try {
          await updateJob.mutateAsync({
            id: jobId,
            status: "completed",
            linhas_processadas: totalLines,
            linhas_importadas: trafficCount,
            ofertas_novas_criadas: newOffers,
            ofertas_existentes_atualizadas: updated,
            dominios_novos: domainMatches.filter(m => !m.matched).length,
            completed_at: new Date().toISOString(),
          });
        } catch {
          // Non-blocking
        }
      }
    } catch (err: any) {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
      // Update job as failed
      if (jobId) {
        try {
          await updateJob.mutateAsync({
            id: jobId,
            status: "failed",
            erro_mensagem: err.message,
            completed_at: new Date().toISOString(),
          });
        } catch {
          // Non-blocking
        }
      }
    } finally {
      setImporting(false);
      setProgressLabel("");
    }
  };

  const handleReset = () => {
    setStep(1);
    setFiles([]);
    setPasteText("");
    setPasteDelimiter("auto");
    setFootprintQuery("");
    setDomainMatches([]);
    setImportResult(null);
    setProgress(0);
    setProgressLabel("");
    setMatching(false);
  };

  const totalDomains = domainMatches.length;
  const matchedDomains = domainMatches.filter(m => m.matched).length;
  const newDomains = totalDomains - matchedDomains;
  const totalTraffic = domainMatches.reduce((s, m) => s + m.trafficRecords, 0);

  return {
    step, setStep,
    files, pasteText, setPasteText, pasteDelimiter, setPasteDelimiter,
    footprintQuery, setFootprintQuery,
    domainMatches, importing, uploading, uploadProgress,
    progress, progressLabel, matching, importResult,
    dropzone,
    handleAddPaste, removeFile, updateFileType, updateFilePeriod,
    toggleColumn, toggleRow, applyTypeToAll, applyPeriodToAll,
    handleMatchDomains, handleImport, handleReset,
    totalDomains, matchedDomains, newDomains, totalTraffic,
  };
}
