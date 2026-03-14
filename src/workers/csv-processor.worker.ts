/**
 * CSV Processor Web Worker
 * Offloads heavy CSV parsing/classification to a background thread.
 * Main thread never blocks during 14k+ row imports.
 */
import {
  classifyCsv,
  processCsv,
  filterCsvData,
  getDefaultExcludedColumns,
  type ClassifiedCsv,
  type CsvType,
  type ProcessedCsvResult,
} from "@/shared/lib/csvClassifier";

// ── Message types ──

export type WorkerRequest =
  | {
      type: "classify";
      id: string;
      text: string;
      fileName?: string;
      delimiter?: string;
    }
  | {
      type: "reprocess";
      id: string;
      classified: ClassifiedCsv;
    }
  | {
      type: "filter";
      id: string;
      classified: ClassifiedCsv;
      excludedColumns: number[];
      excludedRows: number[];
    };

export type WorkerResponse =
  | {
      type: "progress";
      id: string;
      percent: number;
      message: string;
    }
  | {
      type: "classify-result";
      id: string;
      classified: ClassifiedCsv;
      processed: ProcessedCsvResult;
      excludedColumns: number[];
    }
  | {
      type: "reprocess-result";
      id: string;
      processed: ProcessedCsvResult;
    }
  | {
      type: "filter-result";
      id: string;
      classified: ClassifiedCsv;
      processed: ProcessedCsvResult;
    }
  | {
      type: "error";
      id: string;
      message: string;
    };

function sendProgress(id: string, percent: number, message: string) {
  const resp: WorkerResponse = { type: "progress", id, percent, message };
  self.postMessage(resp);
}

function handleClassify(id: string, text: string, fileName?: string, delimiter?: string) {
  try {
    sendProgress(id, 10, "Detectando tipo de CSV...");
    const classified = classifyCsv(text, fileName, delimiter);

    sendProgress(id, 40, `Tipo: ${classified.label}. Calculando exclusões...`);
    const autoExcluded = getDefaultExcludedColumns(classified.type, classified.headers);
    const filtered = autoExcluded.size > 0 ? filterCsvData(classified, autoExcluded, new Set()) : classified;

    sendProgress(id, 60, "Processando dados...");
    const processed = processCsv(filtered);

    sendProgress(id, 100, "Concluído");
    const resp: WorkerResponse = {
      type: "classify-result",
      id,
      classified,
      processed,
      excludedColumns: [...autoExcluded],
    };
    self.postMessage(resp);
  } catch (err: any) {
    const resp: WorkerResponse = { type: "error", id, message: err.message || "Erro ao classificar CSV" };
    self.postMessage(resp);
  }
}

function handleReprocess(id: string, classified: ClassifiedCsv) {
  try {
    sendProgress(id, 30, "Reprocessando...");
    const processed = processCsv(classified);
    sendProgress(id, 100, "Concluído");
    const resp: WorkerResponse = { type: "reprocess-result", id, processed };
    self.postMessage(resp);
  } catch (err: any) {
    const resp: WorkerResponse = { type: "error", id, message: err.message || "Erro ao reprocessar" };
    self.postMessage(resp);
  }
}

function handleFilter(id: string, classified: ClassifiedCsv, excludedColumns: number[], excludedRows: number[]) {
  try {
    sendProgress(id, 20, "Filtrando dados...");
    const filtered = filterCsvData(classified, new Set(excludedColumns), new Set(excludedRows));
    sendProgress(id, 60, "Processando filtrado...");
    const processed = processCsv(filtered);
    sendProgress(id, 100, "Concluído");
    const resp: WorkerResponse = { type: "filter-result", id, classified: filtered, processed };
    self.postMessage(resp);
  } catch (err: any) {
    const resp: WorkerResponse = { type: "error", id, message: err.message || "Erro ao filtrar" };
    self.postMessage(resp);
  }
}

// ── Main listener ──

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  switch (msg.type) {
    case "classify":
      handleClassify(msg.id, msg.text, msg.fileName, msg.delimiter);
      break;
    case "reprocess":
      handleReprocess(msg.id, msg.classified);
      break;
    case "filter":
      handleFilter(msg.id, msg.classified, msg.excludedColumns, msg.excludedRows);
      break;
  }
};
