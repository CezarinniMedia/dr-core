import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatNumber, formatDate, slugify, truncate } from "@/shared/lib/utils";

// ─── cn (className merge) ───
describe("cn", () => {
  it("combina classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolve conflitos Tailwind (ultimo vence)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("ignora valores falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("suporta condicionais", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("retorna string vazia sem argumentos", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatCurrency ───
describe("formatCurrency", () => {
  it("formata BRL por padrao", () => {
    const result = formatCurrency(1500);
    expect(result).toContain("1.500");
    expect(result).toContain("R$");
  });

  it("formata USD quando especificado", () => {
    const result = formatCurrency(1500, "USD");
    expect(result).toContain("1.500");
    expect(result).toContain("US$");
  });

  it("formata centavos", () => {
    const result = formatCurrency(99.99);
    expect(result).toContain("99,99");
  });

  it("formata zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
  });

  it("formata valores negativos", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
  });
});

// ─── formatNumber ───
describe("formatNumber", () => {
  it("formata milhoes com M", () => {
    expect(formatNumber(1_500_000)).toBe("1.5M");
  });

  it("formata milhares com K", () => {
    expect(formatNumber(15_000)).toBe("15.0K");
  });

  it("retorna numero simples abaixo de 1000", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("formata exatamente 1000 como K", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });

  it("formata exatamente 1_000_000 como M", () => {
    expect(formatNumber(1_000_000)).toBe("1.0M");
  });

  it("formata zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

// ─── formatDate ───
describe("formatDate", () => {
  it("formata data absoluta em pt-BR", () => {
    // Use Date object to avoid UTC vs local timezone issues
    const result = formatDate(new Date(2025, 7, 15)); // Aug 15, 2025
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("aceita Date object", () => {
    const result = formatDate(new Date(2025, 7, 15)); // Aug 15, 2025
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("relative: retorna 'agora' para momento atual", () => {
    const now = new Date();
    expect(formatDate(now, true)).toBe("agora");
  });

  it("relative: retorna minutos atras", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatDate(fiveMinAgo, true)).toBe("5m atrás");
  });

  it("relative: retorna horas atras", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(formatDate(threeHoursAgo, true)).toBe("3h atrás");
  });

  it("relative: retorna dias atras", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    expect(formatDate(twoDaysAgo, true)).toBe("2d atrás");
  });

  it("relative: apos 7 dias mostra data absoluta", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400 * 1000);
    const result = formatDate(tenDaysAgo, true);
    // Should not contain "d atrás", should be absolute
    expect(result).not.toContain("d atrás");
    expect(result).toContain("2");
  });
});

// ─── slugify ───
describe("slugify", () => {
  it("converte para lowercase e substitui espacos", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("remove acentos", () => {
    expect(slugify("Oferta Elétrica")).toBe("oferta-eletrica");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("test@#$%&")).toBe("test");
  });

  it("remove hifens no inicio e final", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("colapsa multiplos hifens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("lida com string vazia", () => {
    expect(slugify("")).toBe("");
  });

  it("preserva numeros", () => {
    expect(slugify("Oferta 123")).toBe("oferta-123");
  });
});

// ─── truncate ───
describe("truncate", () => {
  it("nao trunca se texto menor que limite", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("nao trunca se texto igual ao limite", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("trunca e adiciona ... se maior", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("trunca em 0 retorna ...", () => {
    expect(truncate("hello", 0)).toBe("...");
  });
});
