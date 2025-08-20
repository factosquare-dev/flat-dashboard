export class UrlBuilder {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  build(endpoint: string): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Handle relative URLs
    const base = this.baseURL.endsWith('/') 
      ? this.baseURL.slice(0, -1)
      : this.baseURL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${base}${cleanEndpoint}`;
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}