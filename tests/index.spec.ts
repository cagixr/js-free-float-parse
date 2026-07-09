import { describe, it, expect } from "vitest"

import jsFreeFloatParse from "../src/index"

describe("jsFreeFloatParse", () => {
  it("parses empty string", () => {
    expect(jsFreeFloatParse("")).toEqual(["0", 0])
  })

  it("parses short exceptions", () => {
    expect(jsFreeFloatParse(",")).toEqual(["0,", 0])
    expect(jsFreeFloatParse(".")).toEqual(["0,", 0])
    expect(jsFreeFloatParse("0,")).toEqual(["0,", 0])
    expect(jsFreeFloatParse("0.")).toEqual(["0,", 0])
    expect(jsFreeFloatParse("-")).toEqual(["-", 0])
    expect(jsFreeFloatParse("-0")).toEqual(["-0", 0])
    expect(jsFreeFloatParse("-0,")).toEqual(["-0,", 0])
    expect(jsFreeFloatParse("-0.")).toEqual(["-0,", 0])
    expect(jsFreeFloatParse("0.0")).toEqual(["0,0", 0])
    expect(jsFreeFloatParse("0,0")).toEqual(["0,0", 0])

    expect(jsFreeFloatParse("123,")).toEqual(["123,", 123])
    expect(jsFreeFloatParse("123.")).toEqual(["123,", 123])
    expect(jsFreeFloatParse("1230,")).toEqual(["1230,", 1230])
    expect(jsFreeFloatParse("1230.")).toEqual(["1230,", 1230])
    expect(jsFreeFloatParse("-123")).toEqual(["-123", -123])
    expect(jsFreeFloatParse("-1230")).toEqual(["-1230", -1230])
    expect(jsFreeFloatParse("-1230,")).toEqual(["-1230,", -1230])
    expect(jsFreeFloatParse("-1230.")).toEqual(["-1230,", -1230])
    expect(jsFreeFloatParse("1230.0")).toEqual(["1230,0", 1230])
    expect(jsFreeFloatParse("1230,0")).toEqual(["1230,0", 1230])
  })

  it("parses E values", () => {
    expect(jsFreeFloatParse("5e-8")).toEqual(["0,00000005", 5e-8])
    expect(jsFreeFloatParse("10e+8")).toEqual(["1000000000", 1000000000])

    // Negative coefficients — the sign must not end up inside the digits
    expect(jsFreeFloatParse("-1.5e-3")).toEqual(["-0,0015", -0.0015])
    expect(jsFreeFloatParse("-1.5e-3", { dot: true })).toEqual(["-0.0015", -0.0015])
    expect(jsFreeFloatParse("-5e-8")).toEqual(["-0,00000005", -5e-8])
    expect(jsFreeFloatParse("-1.3e+8")).toEqual(["-130000000", -130000000])

    // Multi-digit coefficients with negative exponents
    expect(jsFreeFloatParse("15e-3")).toEqual(["0,015", 0.015])
    expect(jsFreeFloatParse("1234e-2", { dot: true })).toEqual(["12.34", 12.34])
    expect(jsFreeFloatParse("12.5e-1", { dot: true })).toEqual(["1.25", 1.25])

    // Bare and uppercase exponents
    expect(jsFreeFloatParse("1e5")).toEqual(["100000", 100000])
    expect(jsFreeFloatParse("1E+5")).toEqual(["100000", 100000])
    expect(jsFreeFloatParse("1.5E-3", { dot: true })).toEqual(["0.0015", 0.0015])

    // Zero exponent
    expect(jsFreeFloatParse("5e+0")).toEqual(["5", 5])
    expect(jsFreeFloatParse("5e-0")).toEqual(["5", 5])
    expect(jsFreeFloatParse("5.5e0")).toEqual(["5,5", 5.5])

    // Absurd exponents are treated like input without digits
    expect(jsFreeFloatParse("1e+999999999")).toEqual(["0", 0])
    expect(jsFreeFloatParse("1e-999999999", { keepEmpty: true })).toEqual(["", 0])

    expect(jsFreeFloatParse("5.1e-8")).toEqual(["0,000000051", 5.1e-8])
    expect(jsFreeFloatParse("1.3e+8")).toEqual(["130000000", 130000000])

    expect(jsFreeFloatParse("5e-41")).toEqual(["0,00000000000000000000000000000000000000005", 5e-41])
    // eslint-disable-next-line
    expect(jsFreeFloatParse("1e+41")).toEqual(["100000000000000000000000000000000000000000", 1e+41])

    expect(jsFreeFloatParse("5.1e-8", { dot: true })).toEqual(["0.000000051", 5.1e-8])
  })

  it("ignores invalid characters", () => {
    expect(jsFreeFloatParse("  23  ")).toEqual(["23", 23])
    expect(jsFreeFloatParse("12a3")).toEqual(["123", 123])
    expect(jsFreeFloatParse("==12a3")).toEqual(["123", 123])
    expect(jsFreeFloatParse("-12a3==")).toEqual(["-123", -123])
    expect(jsFreeFloatParse("123=123")).toEqual(["123123", 123123])
    expect(jsFreeFloatParse("..2,2,,")).toEqual(["2,2", 2.2])
    expect(jsFreeFloatParse("...2,2,,.")).toEqual(["2,2", 2.2])
    expect(jsFreeFloatParse("0.2.,...")).toEqual(["0,2", 0.2])
    expect(jsFreeFloatParse("0,2,.")).toEqual(["0,2", 0.2])
    expect(jsFreeFloatParse("0,2,..")).toEqual(["0,2", 0.2])
  })

  it("join many dots between numbers", () => {
    expect(jsFreeFloatParse("0..2")).toEqual(["0,2", 0.2])
    expect(jsFreeFloatParse("0...2")).toEqual(["0,2", 0.2])
    expect(jsFreeFloatParse("0.....2")).toEqual(["0,2", 0.2])
    expect(jsFreeFloatParse("2..2")).toEqual(["2,2", 2.2])
    expect(jsFreeFloatParse("2...2")).toEqual(["2,2", 2.2])
    expect(jsFreeFloatParse("2.....2")).toEqual(["2,2", 2.2])
  })

  it("parses basic integers correctly", () => {
    expect(jsFreeFloatParse("123")).toEqual(["123", 123])
  })

  it("parses decimal numbers correctly", () => {
    expect(jsFreeFloatParse("123.45")).toEqual(["123,45", 123.45])
    expect(jsFreeFloatParse("123,45")).toEqual(["123,45", 123.45])
  })

  it("handles zeros", () => {
    expect(jsFreeFloatParse("00123")).toEqual(["123", 123])
    expect(jsFreeFloatParse("01023")).toEqual(["1023", 1023])
    expect(jsFreeFloatParse("-00123")).toEqual(["-123", -123])
    expect(jsFreeFloatParse("-01023")).toEqual(["-1023", -1023])
    expect(jsFreeFloatParse("0012300")).toEqual(["12300", 12300])
    expect(jsFreeFloatParse("020202")).toEqual(["20202", 20202])
    expect(jsFreeFloatParse("02")).toEqual(["2", 2])
    expect(jsFreeFloatParse("02.001")).toEqual(["2,001", 2.001])
  })

  it("handles single dot or comma", () => {
    expect(jsFreeFloatParse(".")).toEqual(["0,", 0])
    expect(jsFreeFloatParse(",")).toEqual(["0,", 0])
  })

  it("handles multiple decimal points by ignoring subsequent ones", () => {
    expect(jsFreeFloatParse("123.45.67")).toEqual(["123,4567", 123.4567])
    expect(jsFreeFloatParse("0,0123,123,12")).toEqual(["0,012312312", 0.012312312])
    expect(jsFreeFloatParse("0,0123.123.12")).toEqual(["0,012312312", 0.012312312])
  })

  it("handles input with just a negative sign", () => {
    expect(jsFreeFloatParse("-0.1")).toEqual(["-0,1", -0.1])
  })

  it("handles negative numbers", () => {
    expect(jsFreeFloatParse("-123")).toEqual(["-123", -123])
  })

  it("handles leading negative signs", () => {
    expect(jsFreeFloatParse("--123")).toEqual(["-123", -123])
    expect(jsFreeFloatParse("--123--")).toEqual(["-123", -123])
  })

  it("handles middle negative signs", () => {
    expect(jsFreeFloatParse("-123---")).toEqual(["-123", -123])
  })

  it("handles letters", () => {
    expect(jsFreeFloatParse("-123ad12")).toEqual(["-12312", -12312])
  })

  it("handles input without digits", () => {
    expect(jsFreeFloatParse("abc")).toEqual(["0", 0])
    expect(jsFreeFloatParse("abc", { min: 5 })).toEqual(["5", 5])
    expect(jsFreeFloatParse("-abc")).toEqual(["-", 0])
    expect(jsFreeFloatParse("-,")).toEqual(["-", 0])
    expect(jsFreeFloatParse(".,.")).toEqual(["0", 0])
    expect(jsFreeFloatParse("  ")).toEqual(["0", 0])
  })

  it("handles zero followed by dot or comma", () => {
    expect(jsFreeFloatParse("0.")).toEqual(["0,", 0])
    expect(jsFreeFloatParse("0,")).toEqual(["0,", 0])
  })

  it("handles value with comma", () => {
    expect(jsFreeFloatParse("0,123")).toEqual(["0,123", 0.123])
  })

  describe("handles options", () => {
    it("Handles 0 decimals", () => {
      expect(jsFreeFloatParse("6926140.944375441", { dot: true, decimals: 0 })).toEqual(["6926140", 6926140])
    })

    it("decimals correctly with small numbers", () => {
      const input = "0,12345678901234567890"

      expect(jsFreeFloatParse(input, { decimals: 1 })).toEqual(["0,1", 0.1])
      expect(jsFreeFloatParse(input, { decimals: 2 })).toEqual(["0,12", 0.12])
      expect(jsFreeFloatParse(input, { decimals: 10 })).toEqual(["0,1234567890", 0.123456789])

      expect(jsFreeFloatParse(input, { dot: true, decimals: 3 })).toEqual(["0.123", 0.123])
      expect(jsFreeFloatParse(input, { dot: true, decimals: 4 })).toEqual(["0.1234", 0.1234])
      expect(jsFreeFloatParse(input, { dot: true, decimals: 5 })).toEqual(["0.12345", 0.12345])
      expect(jsFreeFloatParse(input, { dot: true, decimals: 10 })).toEqual(["0.1234567890", 0.123456789])
      expect(jsFreeFloatParse(input, { dot: true, decimals: 16 })).toEqual([
        "0.1234567890123456",
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        0.1234567890123456,
      ])
      expect(jsFreeFloatParse(input, { dot: true, decimals: 40 })).toEqual([
        "0.12345678901234567890",
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        0.1234567890123456789,
      ])
    })

    it("decimals correctly with big numbers", () => {
      expect(jsFreeFloatParse("864.1724952396711", { decimals: 6 })).toEqual(["864,172495", 864.172495])
      expect(jsFreeFloatParse("864.1724952396711", { dot: true, decimals: 7 })).toEqual(["864.1724952", 864.1724952])

      expect(jsFreeFloatParse("864.1", { dot: true, decimals: 2 })).toEqual(["864.1", 864.1])
      expect(jsFreeFloatParse("0.01", { dot: true, decimals: 2 })).toEqual(["0.01", 0.01])
      expect(jsFreeFloatParse("863.0", { dot: true, decimals: 2 })).toEqual(["863.0", 863])
      expect(jsFreeFloatParse("863.", { dot: true, decimals: 2 })).toEqual(["863.", 863])
      expect(jsFreeFloatParse("863.^7.12", { dot: true, decimals: 2 })).toEqual(["863.71", 863.71])
    })

    it("decimals correctly with a lot of zeros", () => {
      expect(jsFreeFloatParse("0.10000000000000000001", { dot: true, decimals: 8 })).toEqual(["0.10000000", 0.1])

      expect(jsFreeFloatParse("0.10000001000000000001", { dot: true, decimals: 8 })).toEqual(["0.10000001", 0.10000001])

      expect(jsFreeFloatParse("0.10000000100000000001", { dot: true, decimals: 8 })).toEqual(["0.10000000", 0.1])

      expect(jsFreeFloatParse("0.000000001", { dot: true, decimals: 8 })).toEqual(["0.00000000", 0])
      expect(jsFreeFloatParse("0.00000001", { dot: true, decimals: 8 })).toEqual(["0.00000001", 1e-8])
    })

    it("decimals correctly and trims decimals", () => {
      expect(jsFreeFloatParse("5e-8", { decimals: 4 })).toEqual(["0,0000", 0])
      expect(jsFreeFloatParse("5e-8", { decimals: 7 })).toEqual(["0,0000000", 0])
      expect(jsFreeFloatParse("5e-8", { decimals: 8 })).toEqual(["0,00000005", 5e-8])
      expect(jsFreeFloatParse("5.1e-8", { decimals: 4 })).toEqual(["0,0000", 0])
      expect(jsFreeFloatParse("5.1e-8", { decimals: 8 })).toEqual(["0,00000005", 5e-8])
      expect(jsFreeFloatParse("5.1e-8", { decimals: 9 })).toEqual(["0,000000051", 5.1e-8])
      expect(jsFreeFloatParse("10e+8", { decimals: 4 })).toEqual(["1000000000", 1000000000])
    })

    it("min/max correctly with E values", () => {
      expect(jsFreeFloatParse("5e-8", { min: 1 })).toEqual(["1", 1])
      expect(jsFreeFloatParse("5e+8", { max: 100 })).toEqual(["100", 100])
    })

    it("keepEmpty correctly", () => {
      expect(jsFreeFloatParse("", { keepEmpty: true })).toEqual(["", 0])
      expect(jsFreeFloatParse("", { keepEmpty: true, min: 20 })).toEqual(["", 0])
      expect(jsFreeFloatParse("abc", { keepEmpty: true })).toEqual(["", 0])
      expect(jsFreeFloatParse("123", { keepEmpty: true })).toEqual(["123", 123])
    })

    it("clamp correctly", () => {
      expect(jsFreeFloatParse("2", { min: 10, clamp: false })).toEqual(["2", 2])
      expect(jsFreeFloatParse("100", { max: 90, clamp: false })).toEqual(["100", 100])
      expect(jsFreeFloatParse("2", { min: 10 })).toEqual(["10", 10])
      // min still acts as the default for empty input
      expect(jsFreeFloatParse("", { min: 10, clamp: false })).toEqual(["10", 10])
    })

    it("groupSeparators correctly", () => {
      const options = { dot: true, groupSeparators: true }
      expect(jsFreeFloatParse("1,234.56", options)).toEqual(["1234.56", 1234.56])
      expect(jsFreeFloatParse("1,234,567", options)).toEqual(["1234567", 1234567])
      expect(jsFreeFloatParse("1,234,567.89", options)).toEqual(["1234567.89", 1234567.89])
      expect(jsFreeFloatParse("1,234", options)).toEqual(["1234", 1234])
      // Comma followed by 1-2 or 4+ digits is still a decimal separator
      expect(jsFreeFloatParse("1,23", options)).toEqual(["1.23", 1.23])
      expect(jsFreeFloatParse("12,3456", options)).toEqual(["12.3456", 12.3456])
      expect(jsFreeFloatParse("1,23", { groupSeparators: true })).toEqual(["1,23", 1.23])
      // Off by default
      expect(jsFreeFloatParse("1,234.56")).toEqual(["1,23456", 1.23456])
    })

    it("min correctly", () => {
      expect(jsFreeFloatParse("100", { min: 110 })).toEqual(["110", 110])
      expect(jsFreeFloatParse("100.15", { min: 100.23 })).toEqual(["100,23", 100.23])
      expect(jsFreeFloatParse("-0.35", { min: -0.25 })).toEqual(["-0,25", -0.25])
    })

    it("decimals correctly with min", () => {
      expect(jsFreeFloatParse("0.00000004", { dot: true, min: 0.00000003, decimals: 8 })).toEqual(["0.00000004", 4e-8])
    })

    it("max correctly", () => {
      expect(jsFreeFloatParse("100", { max: 90 })).toEqual(["90", 90])
      expect(jsFreeFloatParse("100.15", { max: 100.14 })).toEqual(["100,14", 100.14])
      expect(jsFreeFloatParse("-0.15", { max: -0.25 })).toEqual(["-0,25", -0.25])
    })

    it("decimals correctly with max", () => {
      expect(jsFreeFloatParse("0.00999999999999999", { dot: true, max: 0.009999999999999998, decimals: 12 })).toEqual([
        "0.009999999999",
        0.009999999999,
      ])

      expect(jsFreeFloatParse("0.00000004", { dot: true, max: 0.00000003, decimals: 8 })).toEqual(["0.00000003", 3e-8])
    })

    it("min with empty string correctly", () => {
      expect(jsFreeFloatParse("", { min: 20 })).toEqual(["20", 20])
    })

    it("min with 0.0 string correctly", () => {
      expect(jsFreeFloatParse("0.0", { min: 0 })).toEqual(["0,0", 0])
    })

    it("dot correctly", () => {
      const options = { dot: true }
      /* Common cases */
      expect(jsFreeFloatParse("0,0123,123,12", options)).toEqual(["0.012312312", 0.012312312])
      expect(jsFreeFloatParse("0.....2", options)).toEqual(["0.2", 0.2])
      expect(jsFreeFloatParse("...2,2,,.", options)).toEqual(["2.2", 2.2])
      expect(jsFreeFloatParse("100.15", options)).toEqual(["100.15", 100.15])
      expect(jsFreeFloatParse("-0.35", options)).toEqual(["-0.35", -0.35])
      /* Short exceptions */
      expect(jsFreeFloatParse(",", options)).toEqual(["0.", 0])
      expect(jsFreeFloatParse(".", options)).toEqual(["0.", 0])
      expect(jsFreeFloatParse("0,", options)).toEqual(["0.", 0])
      expect(jsFreeFloatParse("0.", options)).toEqual(["0.", 0])
      expect(jsFreeFloatParse("-", options)).toEqual(["-", 0])
      expect(jsFreeFloatParse("-0", options)).toEqual(["-0", 0])
      expect(jsFreeFloatParse("-0,", options)).toEqual(["-0.", 0])
      expect(jsFreeFloatParse("-0.", options)).toEqual(["-0.", 0])
      expect(jsFreeFloatParse("0.0", options)).toEqual(["0.0", 0])
      expect(jsFreeFloatParse("0,0", options)).toEqual(["0.0", 0])
    })
  })
})
