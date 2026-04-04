export const CONFIG = {
  themes: {
    Semiconductors: [
      // US NASDAQ/NYSE only (Finnhub free tier limitation)
      { ticker: "AMKR",    name: "Amkor Technology",      exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "KLAC",    name: "KLA Corp",              exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "AIP",     name: "Arteris",               exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "ASML",    name: "ASML",                  exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "RMBS",    name: "Rambus",                exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "AVGO",    name: "Broadcom",              exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "LSCC",    name: "Lattice Semiconductor", exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "ARM",     name: "Arm Holdings",          exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "CDNS",    name: "Cadence Design Systems",exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "MRVL",    name: "Marvell Technology",    exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "NXPI",    name: "NXP Semiconductors",    exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "SNPS",    name: "Synopsys",              exchange: "US / NASDAQ",          subSector: "", source: "" },
      { ticker: "QCOM",    name: "Qualcomm",              exchange: "US / NASDAQ",          subSector: "", source: "" },
    ],
    Energy:          [],
    Commodities:     [],
    Infrastructure:  [],
    Chemicals:       [],
    "Optical Fiber": [],
    "Whole Rack":    [],
    Other:           [],
  },
  benchmarks: {
    SOXX: "iShares Semiconductor ETF",
    VOO:  "Vanguard S&P 500 ETF",
  },
  portfolio: [],
  finnhubApiKey: "d784fopr01qsamsiun6gd784fopr01qsamsiun70",
}
