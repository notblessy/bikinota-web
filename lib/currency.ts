/**
 * Format a number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted string in Rupiah format (e.g., "Rp 1.000.000")
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as Indonesian Rupiah currency with decimals
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string in Rupiah format with decimals (e.g., "Rp 1.000.000,00")
 */
export function formatRupiahWithDecimals(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

