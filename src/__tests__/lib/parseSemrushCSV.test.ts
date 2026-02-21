import { describe, it, expect } from "vitest";
import {
  parseSemrushCSV,
  detectDelimiter,
  extractDomainsFromText,
} from "@/lib/parseSemrushCSV";

// ─── parseSemrushCSV: Formato Semrush com headers ───
describe("parseSemrushCSV - formato Semrush", () => {
  it("parseia CSV com date headers ISO (2024-10)", () => {
    const csv = "Domain,2024-10,2024-11,2024-12\nexample.com,12000,15000,18000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(3);
    expect(rows[0].domain).toBe("example.com");
    expect(rows[0].period_date).toBe("2024-10-01");
    expect(rows[0].visits).toBe(12000);
    expect(rows[0].period_type).toBe("monthly");
  });

  it("parseia CSV com date headers slash (10/2024)", () => {
    const csv = "Domain,10/2024,11/2024\nexample.com,12000,15000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].period_date).toBe("2024-10-01");
    expect(rows[1].period_date).toBe("2024-11-01");
  });

  it("parseia CSV com date headers por extenso (Oct 2024)", () => {
    const csv = "Domain,Oct 2024,Nov 2024\nexample.com,12000,15000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].period_date).toBe("2024-10-01");
  });

  it("parseia CSV com meses em portugues (ago. 2025)", () => {
    const csv = "Domain;ago. 2025;set. 2025\nexample.com;12000;15000";
    const rows = parseSemrushCSV(csv, ";");
    expect(rows.length).toBe(2);
    expect(rows[0].period_date).toBe("2025-08-01");
    expect(rows[1].period_date).toBe("2025-09-01");
  });

  it("parseia CSV com anos curtos (oct-24)", () => {
    const csv = "Domain,oct-24,nov-24\nexample.com,12000,15000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].period_date).toBe("2024-10-01");
  });

  it("parseia multiplos dominios", () => {
    const csv = "Domain,2025-01\nexample.com,10000\nother.com,5000\nthird.com,8000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(3);
    const domains = rows.map((r) => r.domain);
    expect(domains).toContain("example.com");
    expect(domains).toContain("other.com");
    expect(domains).toContain("third.com");
  });

  it("ignora linhas com dominio vazio", () => {
    const csv = "Domain,2025-01\nexample.com,10000\n,5000";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(1);
  });

  it("trata numeros com formato BR (15.000)", () => {
    const csv = "Domain;2025-01\nexample.com;15.000";
    const rows = parseSemrushCSV(csv, ";");
    expect(rows[0].visits).toBe(15000);
  });
});

// ─── parseSemrushCSV: Formato headerless (PublicWWW) ───
describe("parseSemrushCSV - formato headerless (PublicWWW)", () => {
  it("parseia CSV sem header (dominio;visitas;footprint)", () => {
    const csv = "https://example.com;1234;script src=cdn.com\nhttps://other.com;5678;script src=cdn.com";
    const rows = parseSemrushCSV(csv, ";");
    expect(rows.length).toBe(2);
    expect(rows[0].domain).toBe("example.com");
    expect(rows[0].visits).toBe(1234);
  });

  it("parseia CSV sem header com virgula", () => {
    const csv = "example.com,1234\nother.com,5678";
    const rows = parseSemrushCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].domain).toBe("example.com");
  });

  it("ignora linhas sem dominio valido", () => {
    const csv = "notadomain;1234\nexample.com;5678";
    const rows = parseSemrushCSV(csv, ";");
    // "notadomain" has no dot, so should be filtered
    expect(rows.length).toBe(1);
    expect(rows[0].domain).toBe("example.com");
  });
});

// ─── parseSemrushCSV: Delimitadores ───
describe("parseSemrushCSV - delimitadores", () => {
  it("funciona com delimitador ; (Semrush BR)", () => {
    const csv = "Domain;2025-01\nexample.com;15000";
    const rows = parseSemrushCSV(csv, ";");
    expect(rows.length).toBe(1);
    expect(rows[0].visits).toBe(15000);
  });

  it("auto-detecta delimitador quando nao especificado", () => {
    const csv = "Domain;2025-01\nexample.com;15000";
    const rows = parseSemrushCSV(csv);
    // PapaParse auto-detects when delimiter is ""
    expect(rows.length).toBeGreaterThan(0);
  });
});

// ─── parseSemrushCSV: Casos edge ───
describe("parseSemrushCSV - edge cases", () => {
  it("retorna array vazio para CSV vazio", () => {
    const rows = parseSemrushCSV("");
    expect(rows).toEqual([]);
  });

  it("retorna array vazio para texto sem dominios", () => {
    const rows = parseSemrushCSV("just some random text\nwithout any domains");
    expect(rows).toEqual([]);
  });

  it("trata visits zero", () => {
    const csv = "Domain,2025-01\nexample.com,0";
    const rows = parseSemrushCSV(csv);
    expect(rows[0].visits).toBe(0);
  });
});

// ─── detectDelimiter ───
describe("detectDelimiter (parseSemrushCSV)", () => {
  it("detecta ; como delimitador", () => {
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
  });

  it("detecta , como delimitador", () => {
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
  });

  it("detecta tab como delimitador", () => {
    expect(detectDelimiter("a\tb\tc")).toBe("\t");
  });
});

// ─── extractDomainsFromText ───
describe("extractDomainsFromText", () => {
  it("extrai dominios de lista simples", () => {
    const text = "example.com\nother.com\nthird.com";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com", "third.com"]);
  });

  it("extrai dominios de URLs completas", () => {
    const text = "https://example.com/page\nhttp://other.com/path";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("remove duplicatas", () => {
    const text = "example.com\nexample.com\nother.com";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("ignora linhas vazias e sem dominio", () => {
    const text = "example.com\n\njust text\nother.com";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("limpa aspas", () => {
    const text = '"example.com"\n\'other.com\'';
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("remove portas", () => {
    const text = "example.com:8080\nother.com:3000";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("converte para lowercase", () => {
    const text = "Example.COM\nOTHER.com";
    const domains = extractDomainsFromText(text);
    expect(domains).toEqual(["example.com", "other.com"]);
  });

  it("retorna vazio para texto sem dominios", () => {
    const domains = extractDomainsFromText("hello world\n123");
    expect(domains).toEqual([]);
  });
});
