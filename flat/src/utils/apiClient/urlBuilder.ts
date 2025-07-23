export class UrlBuilder {
  static build(endpoint: string, baseURL: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }
}