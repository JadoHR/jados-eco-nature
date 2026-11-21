import { describe, expect, it } from "vitest";
import { formatMoney, minorToInput, parseMoneyInput } from "@/lib/money";

describe("money", () => {
  it("formats RWF (no decimals) with thousands separators", () => {
    expect(formatMoney(5000, "RWF")).toBe("RWF 5,000");
    expect(formatMoney(1234567, "RWF")).toBe("RWF 1,234,567");
    expect(formatMoney(0, "RWF")).toBe("RWF 0");
  });

  it("formats 2-decimal currencies from minor units", () => {
    expect(formatMoney(1050, "USD")).toBe("USD 10.50");
    expect(formatMoney(5, "KES")).toBe("KES 0.05");
  });

  it("rejects non-integer amounts", () => {
    expect(() => formatMoney(10.5, "RWF")).toThrow();
  });

  it("parses user input into minor units without floating point errors", () => {
    expect(parseMoneyInput("5,000", "RWF")).toBe(5000);
    expect(parseMoneyInput("5000.5", "RWF")).toBeNull();
    expect(parseMoneyInput("0.1", "USD")).toBe(10);
    expect(parseMoneyInput("19.99", "USD")).toBe(1999);
    expect(parseMoneyInput("1.005", "USD")).toBeNull();
    expect(parseMoneyInput("-5", "RWF")).toBeNull();
    expect(parseMoneyInput("abc", "RWF")).toBeNull();
  });

  it("round-trips admin inputs", () => {
    expect(minorToInput(1999, "USD")).toBe("19.99");
    expect(minorToInput(7000, "RWF")).toBe("7000");
  });
});
