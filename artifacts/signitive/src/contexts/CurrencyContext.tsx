import { createContext, useContext, useState } from "react";

type Currency = "PKR" | "USD";

interface CurrencyContextValue {
  currency: Currency;
  toggle: () => void;
  format: (pkr: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const USD_RATE = 280;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("PKR");

  const toggle = () => setCurrency(c => c === "PKR" ? "USD" : "PKR");

  const format = (pkr: number) => {
    if (currency === "USD") {
      const usd = pkr / USD_RATE;
      return `$${usd.toFixed(2)}`;
    }
    return `PKR ${pkr.toLocaleString()}`;
  };

  const symbol = currency === "USD" ? "$" : "PKR";

  return (
    <CurrencyContext.Provider value={{ currency, toggle, format, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
