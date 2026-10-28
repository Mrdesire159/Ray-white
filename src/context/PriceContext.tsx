import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Property } from '../types/property';
import { PROPERTIES } from '../data/properties';

interface PriceContextType {
  globalReductionPercent: number;
  setGlobalReductionPercent: (percent: number) => void;
  customReductions: Record<string, number>;
  reducePropertyPrice: (propertyId: string, reductionAmount: number) => void;
  resetPropertyPrice: (propertyId: string) => void;
  resetAllReductions: () => void;
  getSyncedProperty: (property: Property) => Property;
  syncedProperties: Property[];
  totalPortfolioSavings: number;
  isRealTimeSyncActive: boolean;
  setIsRealTimeSyncActive: (active: boolean) => void;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const STORAGE_PRICE_KEY = 'raywhite_realtime_price_sync';

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 15% reduction to fulfill "reduce the price and make the price be equal in real time"
  const [globalReductionPercent, setGlobalReductionPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRICE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.percent === 'number') return parsed.percent;
      }
    } catch {
      // ignore
    }
    return 15; // 15% active price reduction by default
  });

  const [customReductions, setCustomReductions] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRICE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.custom && typeof parsed.custom === 'object') return parsed.custom;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [isRealTimeSyncActive, setIsRealTimeSyncActive] = useState<boolean>(true);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PRICE_KEY,
        JSON.stringify({
          percent: globalReductionPercent,
          custom: customReductions,
          active: isRealTimeSyncActive,
        })
      );
    } catch {
      // ignore
    }
  }, [globalReductionPercent, customReductions, isRealTimeSyncActive]);

  // Reduce single property price
  const reducePropertyPrice = (propertyId: string, reductionAmount: number) => {
    setCustomReductions((prev) => ({
      ...prev,
      [propertyId]: (prev[propertyId] || 0) + reductionAmount,
    }));
  };

  const resetPropertyPrice = (propertyId: string) => {
    setCustomReductions((prev) => {
      const next = { ...prev };
      delete next[propertyId];
      return next;
    });
  };

  const resetAllReductions = () => {
    setGlobalReductionPercent(0);
    setCustomReductions({});
  };

  // Pure function to calculate real-time equal price
  const getSyncedProperty = useMemo(() => {
    return (prop: Property): Property => {
      if (!isRealTimeSyncActive && Object.keys(customReductions).length === 0) {
        return prop;
      }

      const isSale = prop.status === 'sale';
      const basePrice = prop.price;
      const baseSellingPrice = prop.sellingPrice || (isSale ? basePrice : basePrice * 2000);
      const customReduction = customReductions[prop.id] || 0;

      // Calculate reduction
      const percentageReduction = isRealTimeSyncActive
        ? Math.round(basePrice * (globalReductionPercent / 100))
        : 0;
      const totalReduction = percentageReduction + customReduction;

      // Protect against dropping below zero or minimum threshold
      const minFloor = isSale ? 100000 : 200;
      const reducedPrice = Math.max(minFloor, Math.round(basePrice - totalReduction));
      const reducedSellingPrice = Math.max(
        minFloor,
        Math.round(baseSellingPrice - (isRealTimeSyncActive ? baseSellingPrice * (globalReductionPercent / 100) : 0) - customReduction)
      );

      const actualSavings = basePrice - reducedPrice;
      const isActuallyReduced = actualSavings > 0;

      // Format clean display strings
      let priceDisplay = '';
      if (isSale) {
        priceDisplay = `$${reducedPrice.toLocaleString()}`;
      } else {
        priceDisplay = `$${reducedPrice.toLocaleString()} / week`;
      }

      let originalPriceDisplay = '';
      if (isSale) {
        originalPriceDisplay = `$${basePrice.toLocaleString()}`;
      } else {
        originalPriceDisplay = `$${basePrice.toLocaleString()} / week`;
      }

      // Rentage weekly & monthly calculations to stay 100% equal in real time
      const rentageWeekly = isSale
        ? prop.rentagePricePerWeek
          ? Math.max(200, Math.round(prop.rentagePricePerWeek * (1 - globalReductionPercent / 100)))
          : Math.round(reducedSellingPrice * 0.00045)
        : reducedPrice;

      const rentageMonthly = rentageWeekly ? Math.round((rentageWeekly * 52) / 12) : prop.rentagePricePerMonth;

      // Yield calculation
      const grossYield =
        reducedSellingPrice > 0 && rentageWeekly
          ? (((rentageWeekly * 52) / reducedSellingPrice) * 100).toFixed(1) + '%'
          : prop.grossYield;

      return {
        ...prop,
        price: reducedPrice,
        priceDisplay,
        sellingPrice: reducedSellingPrice,
        rentagePricePerWeek: rentageWeekly,
        rentagePricePerMonth: rentageMonthly,
        grossYield,
        originalPrice: basePrice,
        originalPriceDisplay,
        priceReduced: isActuallyReduced,
        savingsAmount: actualSavings,
      };
    };
  }, [globalReductionPercent, customReductions, isRealTimeSyncActive]);

  // Real-time synced array of all properties
  const syncedProperties = useMemo(() => {
    return PROPERTIES.map((p) => getSyncedProperty(p));
  }, [getSyncedProperty]);

  // Total savings across the portfolio
  const totalPortfolioSavings = useMemo(() => {
    return syncedProperties.reduce((acc, p) => acc + (p.savingsAmount || 0), 0);
  }, [syncedProperties]);

  return (
    <PriceContext.Provider
      value={{
        globalReductionPercent,
        setGlobalReductionPercent,
        customReductions,
        reducePropertyPrice,
        resetPropertyPrice,
        resetAllReductions,
        getSyncedProperty,
        syncedProperties,
        totalPortfolioSavings,
        isRealTimeSyncActive,
        setIsRealTimeSyncActive,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
};
