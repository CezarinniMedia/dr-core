import { describe, it, expect } from "vitest";
import {
  classifyCsv,
  processCsv,
  detectDelimiter,
  extractDomain,
  filterCsvData,
  getDefaultExcludedColumns,
  type CsvType,
} from "@/shared/lib/csvClassifier";

// ─── Helper: build CSV string from rows ───
function buildCsv(headers: string[], rows: string[][], delimiter = ","): string {
  const lines = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))];
  return lines.join("\n");
}

// ─── detectDelimiter ───
describe("detectDelimiter", () => {
  it("detecta virgula como delimitador padrao", () => {
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
  });

  it("detecta ponto-e-virgula (Semrush BR)", () => {
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
  });

  it("detecta tab", () => {
    expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("\t");
  });

  it("detecta pipe", () => {
    expect(detectDelimiter("a|b|c\n1|2|3")).toBe("|");
  });

  it("retorna virgula para texto sem delimitador", () => {
    expect(detectDelimiter("abc")).toBe(",");
  });
});

// ─── extractDomain ───
describe("extractDomain", () => {
  it("extrai dominio de URL com https", () => {
    expect(extractDomain("https://www.example.com/path/page")).toBe("www.example.com");
  });

  it("extrai dominio de URL com http", () => {
    expect(extractDomain("http://example.com/page")).toBe("example.com");
  });

  it("remove porta", () => {
    expect(extractDomain("example.com:8080")).toBe("example.com");
  });

  it("limpa aspas e espacos", () => {
    expect(extractDomain('"  example.com  "')).toBe("example.com");
  });

  it("converte para lowercase", () => {
    expect(extractDomain("Example.COM")).toBe("example.com");
  });
});

// ─── classifyCsv: Classificacao dos 10 tipos ───
describe("classifyCsv - classificacao de tipos", () => {
  it("classifica PublicWWW (sem header, dominio + numero)", () => {
    const csv = "https://example.com;1234;script src=cdn.tracker.com\nhttps://other.com;5678;script src=cdn.tracker.com";
    const result = classifyCsv(csv, "publicwww_results.csv");
    expect(result.type).toBe("publicwww");
    expect(result.label).toBe("PublicWWW");
  });

  it("classifica Semrush Bulk (Target + target_type + Visits)", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits", "Unique Visitors", "Bounce Rate"],
      [["example.com", "root_domain", "15000", "8000", "45%"]]
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_bulk");
    expect(result.label).toBe("Semrush: Bulk Analysis");
  });

  it("classifica Semrush Bulk com headers PT-BR", () => {
    const csv = buildCsv(
      ["Destino", "Tipo de destino", "Visitas"],
      [["example.com", "dominio_raiz", "15000"]],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_bulk");
  });

  it("classifica Semrush Geo (Destino + Pais + Proporcao de trafego)", () => {
    const csv = buildCsv(
      ["Destino", "País", "Proporção de tráfego", "Todos os dispositivos"],
      [
        ["example.com", "Brasil", "65%", "50000"],
        ["", "Estados Unidos", "20%", "15000"],
      ],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_geo");
    expect(result.label).toBe("Semrush: Geodistribuição");
  });

  it("classifica Semrush Pages (Pagina + Proporcao de trafego)", () => {
    const csv = buildCsv(
      ["Destino", "Página", "Proporção de tráfego", "Visitas"],
      [["example.com", "example.com/landing", "45%", "8000"]],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_pages");
    expect(result.label).toBe("Semrush: Páginas");
  });

  it("classifica Semrush Subdomains (Subdominio + Visitas)", () => {
    const csv = buildCsv(
      ["Destino", "Subdomínio", "Visitas"],
      [["example.com", "app.example.com", "5000"]],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_subdomains");
    expect(result.label).toBe("Semrush: Subdomínios");
  });

  it("classifica Semrush Subfolders (Subpasta)", () => {
    const csv = buildCsv(
      ["Destino", "Subpasta", "Visitas"],
      [["example.com", "example.com/blog", "3000"]],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_subfolders");
    expect(result.label).toBe("Semrush: Subpastas");
  });

  it("classifica Semrush Traffic Trend (Data na col1 + dominios)", () => {
    const csv = buildCsv(
      ["Data", "example.com", "other.com"],
      [
        ["ago. de 2025", "12000", "8000"],
        ["set. de 2025", "15000", "9000"],
      ],
      ";"
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_traffic_trend");
    expect(result.label).toBe("Semrush: Tendência de Tráfego");
  });

  it("classifica Semrush Bulk Historical (dominio + date headers)", () => {
    const csv = buildCsv(
      ["Domain", "2025-08", "2025-09", "2025-10"],
      [["example.com", "12000", "15000", "18000"]]
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_bulk_historical");
    expect(result.label).toBe("Semrush: Bulk Histórico");
  });

  it("classifica SimilarWeb (domain + estimatedMonthlyVisits/*)", () => {
    const csv = buildCsv(
      ["domain", "bounceRate", "pagesPerVisit", "timeOnSite", "estimatedMonthlyVisits/2025-10-01"],
      [["example.com", "0.45", "3.2", "120", "50000"]]
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("similarweb");
    expect(result.label).toBe("SimilarWeb");
  });

  it("retorna unknown para CSV nao reconhecido", () => {
    const csv = buildCsv(["Name", "Age", "City"], [["John", "30", "NYC"]]);
    const result = classifyCsv(csv);
    expect(result.type).toBe("unknown");
  });
});

// ─── classifyCsv: Casos especiais ───
describe("classifyCsv - casos especiais", () => {
  it("CSV vazio retorna unknown com arrays vazios", () => {
    const result = classifyCsv("");
    expect(result.type).toBe("unknown");
    expect(result.headers).toEqual([]);
    expect(result.previewRows).toEqual([]);
  });

  it("CSV com BOM (UTF-8) e tratado corretamente", () => {
    const bom = "\uFEFF";
    const csv = bom + buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "15000"]]
    );
    const result = classifyCsv(csv);
    expect(result.type).toBe("semrush_bulk");
  });

  it("extrai periodDate do filename (ISO format)", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "15000"]]
    );
    const result = classifyCsv(csv, "bulk_2026-01.csv");
    expect(result.periodDate).toBe("2026-01-01");
    expect(result.periodLabel).toBe("Jan 2026");
  });

  it("extrai periodDate do filename (nome do mes PT)", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "15000"]]
    );
    const result = classifyCsv(csv, "export ago. de 2025.csv");
    expect(result.periodDate).toBe("2025-08-01");
  });

  it("filename com underscore entre mes e ano nao extrai periodo", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "15000"]]
    );
    const result = classifyCsv(csv, "export_ago_2025.csv");
    // Regex atual nao suporta _ entre mes e ano
    expect(result.periodDate).toBeUndefined();
  });

  it("extrai discoveryQuery de PublicWWW", () => {
    const csv = "https://example.com;1234;script src=\\https://cdn.utmify.com.br/scripts/utms/latest\nhttps://other.com;5678;script src=\\https://cdn.utmify.com.br/scripts/utms/latest";
    const result = classifyCsv(csv);
    expect(result.type).toBe("publicwww");
    expect(result.discoveryQuery).toBe("cdn.utmify.com.br");
  });

  it("delimitador ; (Semrush BR) funciona", () => {
    const csv = "Destino;Tipo de destino;Visitas\nexample.com;dominio_raiz;15000";
    const result = classifyCsv(csv);
    expect(result.delimiter).toBe(";");
    expect(result.type).toBe("semrush_bulk");
  });

  it("previewRows contem ate 5 linhas", () => {
    const rows = Array.from({ length: 10 }, (_, i) => [`domain${i}.com`, "root_domain", `${i * 1000}`]);
    const csv = buildCsv(["Target", "target_type", "Visits"], rows);
    const result = classifyCsv(csv);
    expect(result.previewRows.length).toBe(5);
  });
});

// ─── processCsv: Processamento de dados ───
describe("processCsv", () => {
  it("processa PublicWWW - retorna dominios sem trafego", () => {
    const csv = "https://example.com;1234;footprint\nhttps://other.com;5678;footprint";
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.domains.length).toBe(2);
    expect(result.trafficRecords.length).toBe(0);
    expect(result.domains[0].discovery_source).toBe("publicwww");
    expect(result.domains[0].domain_type).toBe("landing_page");
  });

  it("processa PublicWWW - deduplica dominios", () => {
    const csv = "https://example.com;1234;fp\nhttps://example.com;5678;fp\nhttps://other.com;9012;fp";
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.domains.length).toBe(2);
  });

  it("processa Semrush Bulk - retorna trafego e dominios", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits", "Unique Visitors", "Bounce Rate", "Pages / Visits", "Avg. Visit Duration"],
      [
        ["example.com", "root_domain", "15000", "8000", "45%", "3.2", "02:30"],
        ["other.com", "root_domain", "5000", "3000", "60%", "2.1", "01:15"],
      ]
    );
    const classified = classifyCsv(csv, "bulk_2026-01.csv");
    const result = processCsv(classified);
    expect(result.trafficRecords.length).toBe(2);
    expect(result.domains.length).toBe(2);
    expect(result.trafficRecords[0].visits).toBe(15000);
    expect(result.trafficRecords[0].source).toBe("semrush_bulk");
    expect(result.trafficRecords[0].period_date).toBe("2026-01-01");
    expect(result.trafficRecords[0].avg_visit_duration).toBe(150); // 2*60+30
    expect(result.trafficRecords[0].bounce_rate).toBe(45);
  });

  it("processa Semrush Bulk - N/A tratado como 0 visitas", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "N/A"]]
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords[0].visits).toBe(0);
  });

  it("processa Semrush Traffic Trend - multiplos periodos", () => {
    const csv = buildCsv(
      ["Data", "example.com", "other.com"],
      [
        ["ago. de 2025", "12000", "8000"],
        ["set. de 2025", "15000", "9000"],
      ],
      ";"
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    // 2 domains x 2 periods = 4 records
    expect(result.trafficRecords.length).toBe(4);
    expect(result.trafficRecords[0].period_date).toBe("2025-08-01");
    expect(result.trafficRecords[0].source).toBe("semrush_trend");
  });

  it("processa Semrush Geo - extrai paises e mainGeo", () => {
    const csv = buildCsv(
      ["Destino", "País", "Proporção de tráfego", "Todos os dispositivos"],
      [
        ["example.com", "Brasil", "65,50%", "50000"],
        ["", "Estados Unidos", "20,30%", "15000"],
        ["", "Portugal", "5,20%", "4000"],
      ],
      ";"
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.geoData.length).toBe(1);
    expect(result.geoData[0].mainGeo).toBe("BR");
    expect(result.geoData[0].countries.length).toBe(3);
    expect(result.geoData[0].secondaryGeos).toContain("US");
  });

  it("processa Semrush Bulk Historical - date headers como periodos", () => {
    const csv = buildCsv(
      ["Domain", "2025-08", "2025-09", "2025-10"],
      [["example.com", "12000", "15000", "18000"]]
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords.length).toBe(3);
    expect(result.trafficRecords[0].period_date).toBe("2025-08-01");
    expect(result.trafficRecords[2].visits).toBe(18000);
  });

  it("processa SimilarWeb - trafego + geo + offerUpdates", () => {
    const csv = buildCsv(
      [
        "domain", "bounceRate", "pagesPerVisit", "timeOnSite",
        "estimatedMonthlyVisits/2025-10-01", "estimatedMonthlyVisits/2025-11-01",
        "topCountryShares/0/CountryCode", "topCountryShares/0/Value",
        "topCountryShares/1/CountryCode", "topCountryShares/1/Value",
        "title", "description",
      ],
      [[
        "example.com", "0.45", "3.2", "120",
        "50000", "60000",
        "BR", "0.65",
        "US", "0.20",
        "My Title", "My Description",
      ]]
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords.length).toBe(2);
    expect(result.trafficRecords[0].source).toBe("similarweb");
    expect(result.trafficRecords[0].bounce_rate).toBe(45); // 0.45 * 100
    expect(result.domains.length).toBe(1);
    expect(result.geoData.length).toBe(1);
    expect(result.geoData[0].mainGeo).toBe("BR");
    expect(result.offerUpdates.length).toBe(1);
    expect(result.offerUpdates[0].notes_appendix).toContain("My Title");
  });

  it("processa Semrush Pages - infere domain_type", () => {
    const csv = buildCsv(
      ["Destino", "Página", "Proporção de tráfego", "Visitas"],
      [
        ["example.com", "example.com/checkout/pay", "45%", "8000"],
        ["", "example.com/landing-page", "30%", "5000"],
      ],
      ";"
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.domains.length).toBe(2);
    expect(result.domains[0].domain_type).toBe("checkout");
    expect(result.domains[1].domain_type).toBe("landing_page");
  });

  it("processa Semrush Subdomains - registra subdominios", () => {
    const csv = buildCsv(
      ["Destino", "Subdomínio", "Visitas"],
      [
        ["example.com", "app.example.com", "5000"],
        ["", "blog.example.com", "3000"],
      ],
      ";"
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.domains.length).toBe(2);
    expect(result.domains[0].domain).toBe("app.example.com");
    expect(result.domains[0].discovery_source).toBe("semrush_subdomains");
  });

  it("processa unknown retorna resultado vazio", () => {
    const csv = buildCsv(["Name", "Age"], [["John", "30"]]);
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords).toEqual([]);
    expect(result.domains).toEqual([]);
    expect(result.summary.totalDomains).toBe(0);
  });

  it("Semrush Bulk - numeros com formato BR (15.000) parseados corretamente", () => {
    const csv = "Destino;Tipo de destino;Visitas\nexample.com;dominio_raiz;15.000";
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords[0].visits).toBe(15000);
  });

  it("Semrush Bulk - cap visits to PostgreSQL integer max", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "9999999999"]]
    );
    const classified = classifyCsv(csv);
    const result = processCsv(classified);
    expect(result.trafficRecords[0].visits).toBe(2147483647);
  });
});

// ─── filterCsvData ───
describe("filterCsvData", () => {
  it("retorna original quando nenhuma exclusao", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [["example.com", "root_domain", "15000"]]
    );
    const classified = classifyCsv(csv);
    const result = filterCsvData(classified, new Set(), new Set());
    expect(result).toBe(classified); // same reference
  });

  it("remove colunas excluidas", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits", "Extra"],
      [["example.com", "root_domain", "15000", "ignore"]]
    );
    const classified = classifyCsv(csv);
    const result = filterCsvData(classified, new Set([3]), new Set());
    expect(result.headers.length).toBe(3);
    expect(result.headers).not.toContain("Extra");
  });

  it("remove linhas excluidas", () => {
    const csv = buildCsv(
      ["Target", "target_type", "Visits"],
      [
        ["example.com", "root_domain", "15000"],
        ["remove.com", "root_domain", "5000"],
        ["keep.com", "root_domain", "8000"],
      ]
    );
    const classified = classifyCsv(csv);
    const result = filterCsvData(classified, new Set(), new Set([1])); // remove row index 1
    expect(result.previewRows.length).toBe(2);
  });
});

// ─── getDefaultExcludedColumns ───
describe("getDefaultExcludedColumns", () => {
  it("retorna set vazio para tipo sem regras", () => {
    const excluded = getDefaultExcludedColumns("publicwww", ["URL", "Count", "Snippet"]);
    expect(excluded.size).toBe(0);
  });

  it("exclui colunas irrelevantes para semrush_bulk", () => {
    const headers = ["Target", "target_type", "Visits", "Desktop Traffic Share", "Mobile Traffic Share"];
    const excluded = getDefaultExcludedColumns("semrush_bulk", headers);
    expect(excluded.has(0)).toBe(false); // Target = relevante
    expect(excluded.has(1)).toBe(false); // target_type = relevante
    expect(excluded.has(2)).toBe(false); // Visits = relevante
    expect(excluded.has(3)).toBe(true);  // Desktop Traffic Share = irrelevante
    expect(excluded.has(4)).toBe(true);  // Mobile Traffic Share = irrelevante
  });

  it("retorna set vazio para headers vazios", () => {
    const excluded = getDefaultExcludedColumns("semrush_bulk", []);
    expect(excluded.size).toBe(0);
  });
});
