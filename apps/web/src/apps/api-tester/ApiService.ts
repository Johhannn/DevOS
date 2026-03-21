import axios, { AxiosRequestConfig, Method } from 'axios';

export interface APIRequest {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  data?: any;
}

export interface APIResponse {
  status?: number;
  statusText?: string;
  data?: any;
  headers?: any;
  duration?: number;
  size?: number;
  error?: string;
}

export const ApiService = {
  async sendRequest(req: APIRequest): Promise<APIResponse> {
    const startTime = performance.now();
    try {
      const config: AxiosRequestConfig = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        data: req.data,
        validateStatus: () => true // Resolve promise for all HTTP status codes
      };

      const res = await axios(config);
      const endTime = performance.now();

      // Rough size estimation
      let strData = '';
      if (typeof res.data === 'string') strData = res.data;
      else if (typeof res.data === 'object') strData = JSON.stringify(res.data);

      const size = new TextEncoder().encode(strData).length;

      return {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        headers: res.headers,
        duration: Math.round(endTime - startTime),
        size
      };
    } catch (err: any) {
      return {
        error: err.message || 'Network error occurred'
      };
    }
  }
};
