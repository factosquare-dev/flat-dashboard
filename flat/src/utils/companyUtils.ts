/**
 * Company-related Utilities
 */

// Simplify company name by removing common prefixes/suffixes
export function simplifyCompanyName(name: string | null | undefined): string {
  if (!name) return '';
  
  // Remove common company prefixes and suffixes
  return name
    .replace(/^주식회사\s*/g, '') // Remove 주식회사 at the beginning
    .replace(/\s*주식회사$/g, '') // Remove 주식회사 at the end
    .replace(/^\(주\)\s*/g, '') // Remove (주) at the beginning
    .replace(/\s*\(주\)$/g, '') // Remove (주) at the end
    .replace(/^\㈜\s*/g, '') // Remove ㈜ at the beginning
    .replace(/\s*\㈜$/g, '') // Remove ㈜ at the end
    .trim();
}