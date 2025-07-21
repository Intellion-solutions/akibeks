/**
 * Kenyan Currency Utilities
 * Handles KES currency formatting, conversion, and localization
 */

export interface CurrencyConfig {
  currency: 'KES';
  locale: 'en-KE' | 'sw-KE';
  symbol: 'KES' | 'Ksh';
}

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  currency: 'KES',
  locale: 'en-KE',
  symbol: 'KES'
};

/**
 * Format amount to Kenyan Shillings
 */
export function formatKES(
  amount: number, 
  options: Partial<CurrencyConfig> = {}
): string {
  const config = { ...DEFAULT_CURRENCY_CONFIG, ...options };
  
  // Handle negative amounts
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with proper Kenyan number formatting
  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  let formatted = formatter.format(absAmount);
  
  // Replace KES with preferred symbol if needed
  if (config.symbol === 'Ksh') {
    formatted = formatted.replace('KES', 'Ksh');
  }
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format amount for Swahili locale
 */
export function formatKESSwahili(amount: number): string {
  const formatted = formatKES(amount, { locale: 'sw-KE', symbol: 'Ksh' });
  return formatted;
}

/**
 * Parse KES string to number
 */
export function parseKES(kesString: string): number {
  // Remove currency symbols and spaces
  const cleaned = kesString
    .replace(/KES|Ksh|KSh/gi, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format amount as compact notation for large numbers
 */
export function formatKESCompact(amount: number): string {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  
  let result: string;
  
  if (absAmount >= 1000000) {
    // Millions
    result = `KES ${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    // Thousands
    result = `KES ${(absAmount / 1000).toFixed(1)}K`;
  } else {
    result = formatKES(absAmount);
  }
  
  return isNegative ? `-${result}` : result;
}

/**
 * Get exchange rate suggestions for common currencies to KES
 */
export function getExchangeRateInfo(): { [key: string]: number } {
  // These would typically come from an API, but here are approximate rates
  return {
    USD: 150, // 1 USD = 150 KES (approximate)
    EUR: 165, // 1 EUR = 165 KES (approximate)
    GBP: 190, // 1 GBP = 190 KES (approximate)
    UGX: 0.04, // 1 UGX = 0.04 KES (approximate)
    TZS: 0.065, // 1 TZS = 0.065 KES (approximate)
  };
}

/**
 * Convert from foreign currency to KES
 */
export function convertToKES(amount: number, fromCurrency: string): number {
  const rates = getExchangeRateInfo();
  const rate = rates[fromCurrency.toUpperCase()];
  
  if (!rate) {
    throw new Error(`Exchange rate not available for ${fromCurrency}`);
  }
  
  return amount * rate;
}

/**
 * Validate KES amount
 */
export function validateKESAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (amount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }
  
  if (amount > 999999999) {
    return { isValid: false, error: 'Amount too large (max: KES 999,999,999)' };
  }
  
  return { isValid: true };
}

/**
 * Format amount for invoices and quotations
 */
export function formatInvoiceAmount(amount: number): string {
  return formatKES(amount, { symbol: 'KES' });
}

/**
 * Format amount for display in tables and lists
 */
export function formatDisplayAmount(amount: number): string {
  return formatKES(amount, { symbol: 'Ksh' });
}

/**
 * Get Kenyan tax rates and calculations
 */
export function getKenyanTaxRates(): {
  vat: number;
  withholding: number;
  service: number;
} {
  return {
    vat: 0.16, // 16% VAT
    withholding: 0.05, // 5% Withholding tax
    service: 0.025 // 2.5% Service charge (hospitality)
  };
}

/**
 * Calculate VAT for Kenyan amounts
 */
export function calculateVAT(amount: number): {
  exclusive: number;
  vat: number;
  inclusive: number;
} {
  const vatRate = getKenyanTaxRates().vat;
  const exclusive = amount;
  const vat = amount * vatRate;
  const inclusive = amount + vat;
  
  return {
    exclusive,
    vat,
    inclusive
  };
}

/**
 * Calculate VAT inclusive amount from exclusive amount
 */
export function addVAT(exclusiveAmount: number): number {
  const vatRate = getKenyanTaxRates().vat;
  return exclusiveAmount * (1 + vatRate);
}

/**
 * Calculate VAT exclusive amount from inclusive amount
 */
export function removeVAT(inclusiveAmount: number): number {
  const vatRate = getKenyanTaxRates().vat;
  return inclusiveAmount / (1 + vatRate);
}

/**
 * Format amount with VAT breakdown
 */
export function formatWithVAT(amount: number, includeVAT: boolean = true): string {
  const calc = calculateVAT(amount);
  
  if (includeVAT) {
    return `${formatKES(calc.inclusive)} (incl. VAT ${formatKES(calc.vat)})`;
  } else {
    return `${formatKES(calc.exclusive)} + VAT ${formatKES(calc.vat)}`;
  }
}

/**
 * Get common Kenyan amount presets for forms
 */
export function getKenyanAmountPresets(): Array<{
  label: string;
  amount: number;
  category: string;
}> {
  return [
    { label: 'KES 10,000', amount: 10000, category: 'Small Project' },
    { label: 'KES 50,000', amount: 50000, category: 'Medium Project' },
    { label: 'KES 100,000', amount: 100000, category: 'Large Project' },
    { label: 'KES 500,000', amount: 500000, category: 'Major Project' },
    { label: 'KES 1,000,000', amount: 1000000, category: 'Enterprise Project' },
    { label: 'KES 5,000,000', amount: 5000000, category: 'Mega Project' },
  ];
}

/**
 * Format for Kenyan mobile money (M-Pesa, Airtel Money)
 */
export function formatMobileMoney(amount: number): string {
  // Mobile money typically doesn't use decimals for small amounts
  if (amount < 1000) {
    return `Ksh ${Math.round(amount)}`;
  }
  return formatKES(amount, { symbol: 'Ksh' });
}

/**
 * Validate M-Pesa transaction limits
 */
export function validateMpesaAmount(amount: number): {
  isValid: boolean;
  error?: string;
  suggestion?: string;
} {
  const mpesaLimits = {
    min: 1,
    maxPerTransaction: 300000,
    maxPerDay: 300000,
    maxPerMonth: 3000000
  };
  
  if (amount < mpesaLimits.min) {
    return { 
      isValid: false, 
      error: `Minimum M-Pesa amount is ${formatKES(mpesaLimits.min)}` 
    };
  }
  
  if (amount > mpesaLimits.maxPerTransaction) {
    return { 
      isValid: false, 
      error: `Maximum M-Pesa transaction is ${formatKES(mpesaLimits.maxPerTransaction)}`,
      suggestion: 'Consider splitting into multiple transactions or use bank transfer'
    };
  }
  
  return { isValid: true };
}

export default {
  formatKES,
  formatKESSwahili,
  parseKES,
  formatKESCompact,
  formatInvoiceAmount,
  formatDisplayAmount,
  formatWithVAT,
  formatMobileMoney,
  calculateVAT,
  addVAT,
  removeVAT,
  validateKESAmount,
  validateMpesaAmount,
  getKenyanTaxRates,
  getKenyanAmountPresets,
  convertToKES,
  getExchangeRateInfo
};