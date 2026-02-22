/**
 * React hook that manages the CSV processor Web Worker.
 * Provides async wrappers for classify, reprocess, and filter operations.
 * All heavy CSV parsing runs off the main thread.
 */
import { useRef, useEffect, useCallback } from "react";
import type { ClassifiedCsv, ProcessedCsvResult } from "@/shared/lib/csvClassifier";
import type { WorkerRequest, WorkerResponse } from "./csv-processor.worker";

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  onProgress?: (percent: number, message: string) => void;
}

interface ClassifyResult {
  classified: ClassifiedCsv;
  processed: ProcessedCsvResult;
  excludedColumns: number[];
}

interface FilterResult {
  classified: ClassifiedCsv;
  processed: ProcessedCsvResult;
}

let idCounter = 0;
function nextId(): string {
  return `csv-${++idCounter}-${Date.now()}`;
}

export function useCSVWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());

  useEffect(() => {
    const worker = new Worker(
      new URL("./csv-processor.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      const pending = pendingRef.current.get(msg.id);
      if (!pending) return;

      switch (msg.type) {
        case "progress":
          pending.onProgress?.(msg.percent, msg.message);
          break;
        case "classify-result":
          pendingRef.current.delete(msg.id);
          pending.resolve({
            classified: msg.classified,
            processed: msg.processed,
            excludedColumns: msg.excludedColumns,
          } satisfies ClassifyResult);
          break;
        case "reprocess-result":
          pendingRef.current.delete(msg.id);
          pending.resolve(msg.processed);
          break;
        case "filter-result":
          pendingRef.current.delete(msg.id);
          pending.resolve({
            classified: msg.classified,
            processed: msg.processed,
          } satisfies FilterResult);
          break;
        case "error":
          pendingRef.current.delete(msg.id);
          pending.reject(new Error(msg.message));
          break;
      }
    };

    worker.onerror = (err) => {
      // Reject all pending requests
      for (const [id, pending] of pendingRef.current) {
        pending.reject(new Error(err.message || "Worker error"));
        pendingRef.current.delete(id);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const sendMessage = useCallback(
    <T>(request: Omit<WorkerRequest, "id">, onProgress?: (percent: number, message: string) => void): Promise<T> => {
      return new Promise((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error("Worker not initialized"));
          return;
        }
        const id = nextId();
        pendingRef.current.set(id, { resolve, reject, onProgress });
        worker.postMessage({ ...request, id } as WorkerRequest);
      });
    },
    []
  );

  const classifyFile = useCallback(
    (
      text: string,
      fileName?: string,
      delimiter?: string,
      onProgress?: (percent: number, message: string) => void
    ): Promise<ClassifyResult> => {
      return sendMessage<ClassifyResult>(
        { type: "classify", text, fileName, delimiter },
        onProgress
      );
    },
    [sendMessage]
  );

  const reprocessFile = useCallback(
    (
      classified: ClassifiedCsv,
      onProgress?: (percent: number, message: string) => void
    ): Promise<ProcessedCsvResult> => {
      return sendMessage<ProcessedCsvResult>(
        { type: "reprocess", classified },
        onProgress
      );
    },
    [sendMessage]
  );

  const filterFile = useCallback(
    (
      classified: ClassifiedCsv,
      excludedColumns: number[],
      excludedRows: number[],
      onProgress?: (percent: number, message: string) => void
    ): Promise<FilterResult> => {
      return sendMessage<FilterResult>(
        { type: "filter", classified, excludedColumns: [...excludedColumns], excludedRows: [...excludedRows] },
        onProgress
      );
    },
    [sendMessage]
  );

  return { classifyFile, reprocessFile, filterFile };
}
