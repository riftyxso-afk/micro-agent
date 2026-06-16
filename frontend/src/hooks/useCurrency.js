import { useState, useEffect } from "react";

// Currency configs: code, symbol, rate vs USD, formatFn
const CURRENCIES = {
  ID: { code: "IDR", symbol: "Rp", rate: 16200, locale: "id-ID" },
  MY: { code: "MYR", symbol: "RM", rate: 4.7,  locale: "ms-MY" },
  SG: { code: "SGD", symbol: "S$", rate: 1.35, locale: "en-SG" },
  IN: { code: "INR", symbol: "₹",  rate: 83,   locale: "en-IN" },
  GB: { code: "GBP", symbol: "£",  rate: 0.79, locale: "en-GB" },
  EU: { code: "EUR", symbol: "€",  rate: 0.92, locale: "de-DE" },
  AU: { code: "AUD", symbol: "A$", rate: 1.54, locale: "en-AU" },
  JP: { code: "JPY", symbol: "¥",  rate: 149,  locale: "ja-JP" },
  KR: { code: "KRW", symbol: "₩",  rate: 1330, locale: "ko-KR" },
  BR: { code: "BRL", symbol: "R$", rate: 4.95, locale: "pt-BR" },
  PH: { code: "PHP", symbol: "₱",  rate: 56,   locale: "en-PH" },
  TH: { code: "THB", symbol: "฿",  rate: 35,   locale: "th-TH" },
  VN: { code: "VND", symbol: "₫",  rate: 24500,locale: "vi-VN" },
  US: { code: "USD", symbol: "$",  rate: 1,    locale: "en-US" },
};

// EU countries
const EU_COUNTRIES = ["DE","FR","IT","ES","NL","BE","AT","SE","DK","FI","PL","PT","CZ","RO","HU","GR","IE"];

const USD = { code: "USD", symbol: "$", rate: 1, locale: "en-US" };

export function useCurrency() {
  const [currency, setCurrency] = useState(USD);
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cached first
    try {
      const cached = localStorage.getItem("ma_currency");
      if (cached) {
        const { currency: c, country: co, ts } = JSON.parse(cached);
        if (Date.now() - ts < 86400000) { // 24h cache
          setCurrency(c);
          setCountry(co);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const cc = data.country_code || "US";
        let cur;
        if (cc in CURRENCIES) {
          cur = CURRENCIES[cc];
        } else if (EU_COUNTRIES.includes(cc)) {
          cur = CURRENCIES.EU;
        } else {
          cur = USD;
        }
        setCurrency(cur);
        setCountry(cc);
        try {
          localStorage.setItem("ma_currency", JSON.stringify({ currency: cur, country: cc, ts: Date.now() }));
        } catch {}
      })
      .catch(() => { setCurrency(USD); setCountry("US"); })
      .finally(() => setLoading(false));
  }, []);

  const format = (usdPrice) => {
    if (usdPrice === 0) return `${currency.symbol}0`;
    const local = Math.round(usdPrice * currency.rate);
    // IDR/JPY/KRW/VND: no decimals, use thousand separators
    if (["IDR","JPY","KRW","VND"].includes(currency.code)) {
      return `${currency.symbol}${local.toLocaleString(currency.locale)}`;
    }
    // Others: 2 decimal places
    return `${currency.symbol}${local.toLocaleString(currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return { currency, country, loading, format };
}
