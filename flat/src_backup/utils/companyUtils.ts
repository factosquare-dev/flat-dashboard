/**
 * Company-related Utilities
 */

// Simplify company name by removing common prefixes/suffixes (Korean only)
export function simplifyCompanyName(name: string | null | undefined): string {
  if (!name) return '';
  
  // Remove common Korean company prefixes and suffixes
  return name
    .replace(/^주식회사\s*/g, '') // Remove 주식회사 at the beginning
    .replace(/\s*주식회사$/g, '') // Remove 주식회사 at the end
    .replace(/^\(주\)\s*/g, '') // Remove (주) at the beginning
    .replace(/\s*\(주\)$/g, '') // Remove (주) at the end
    .replace(/^\㈜\s*/g, '') // Remove ㈜ at the beginning
    .replace(/\s*\㈜$/g, '') // Remove ㈜ at the end
    .trim();
}

// Display format for company names - removes common company suffixes for cleaner UI (Korean and English)
export function formatCompanyNameForDisplay(name: string | null | undefined): string {
  if (!name) return '';
  
  // Remove common company type indicators (Korean and English)
  return name
    .replace(/^주식회사\s*/gi, '') // Remove 주식회사 at the beginning
    .replace(/\s*주식회사$/gi, '') // Remove 주식회사 at the end
    .replace(/^\(주\)\s*/gi, '') // Remove (주) at the beginning  
    .replace(/\s*\(주\)$/gi, '') // Remove (주) at the end
    .replace(/^\㈜\s*/gi, '') // Remove ㈜ at the beginning
    .replace(/\s*\㈜$/gi, '') // Remove ㈜ at the end
    .replace(/\s*Co\.,?\s*Ltd\.?$/gi, '') // Remove Co., Ltd. at the end
    .replace(/\s*Co\.?$/gi, '') // Remove Co. at the end
    .replace(/\s*Ltd\.?$/gi, '') // Remove Ltd. at the end
    .replace(/\s*Corporation$/gi, '') // Remove Corporation at the end
    .replace(/\s*Corp\.?$/gi, '') // Remove Corp. at the end
    .replace(/\s*Inc\.?$/gi, '') // Remove Inc. at the end
    .replace(/\s*Company$/gi, '') // Remove Company at the end
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
}

// Alias for backward compatibility
export const formatManufacturerDisplay = formatCompanyNameForDisplay;