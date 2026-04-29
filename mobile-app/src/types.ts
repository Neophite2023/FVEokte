export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  batteryCapacityKwh: number;
  status: "active" | "inactive";
  createdAt: string;
};

export type BlockSummary = {
  label: string;
  range: string;
  action: "buy" | "sell" | "charge";
  price: number;
  period: string;
};

export type HourlyPoint = {
  period: string;
  priceEurMwh: number;
  fveKwh: number;
  block: number;
};

export type DailyResult = {
  id: string;
  clientId: string;
  date: string;
  block1Buy: string;
  priceBuy1: number;
  block2Sell: string;
  priceSell1: number;
  block3Buy: string;
  priceBuy2: number;
  block4Sell: string;
  priceSell2: number;
  totalProfit: number;
  fvePredictionText: string;
  zeroPriceIntervals: string;
  hourlyData: HourlyPoint[];
  createdAt: string;
};

export type AnalysisInput = {
  client: Client;
  date: string;
  okteRows?: OkteRow[];
};

export type OkteRow = {
  period: string;
  priceEurMwh: number;
};
