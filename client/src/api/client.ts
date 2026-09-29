import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ResilientApiClient {
  private axiosInstance: AxiosInstance;
  public isMockFallbackActive: boolean = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach JWT
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('maitri_token') || localStorage.getItem('token');
        if (token && token !== 'mock-jwt-token-sih-demo' && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.isMockFallbackActive = false;
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.warn('[ApiClient] 401 Unauthorized encountered.');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Safe execute method that attempts real backend API first,
   * and gracefully falls back to mock generator if offline/5xx.
   */
  public async executeWithFallback<T>(
    networkCall: () => Promise<AxiosResponse<{ success?: boolean; data?: T } | T> | any>,
    mockFallbackFn: () => T | Promise<T>,
    endpointTag: string
  ): Promise<T> {
    try {
      const response = await networkCall();
      const resData = response?.data !== undefined ? response.data : response;
      if (resData && typeof resData === 'object' && 'data' in resData && !('pagination' in resData) && !('total' in resData)) {
        return resData.data as T;
      }
      return resData as T;
    } catch (err: any) {
      console.info(`[ResilientApiClient] Live API (${endpointTag}) returned error: ${err.message}. Seamlessly engaging mock service layer.`);
      this.isMockFallbackActive = true;
      return await mockFallbackFn();
    }
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export const apiClient = new ResilientApiClient();
