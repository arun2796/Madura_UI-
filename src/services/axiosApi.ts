import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// API Configuration
const API_BASE_URL = "http://localhost:3002";

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`❌ API Error ${status}:`, data);

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden");
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Server error
          console.error("Internal server error");
          break;
        default:
          console.error("API Error:", error.message);
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
    } else {
      // Other error
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API Error class
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic CRUD service class using Axios
export class AxiosCrudService<T extends { id: string }> {
  constructor(private endpoint: string) {}

  async getAll(): Promise<T[]> {
    try {
      const response = await axiosInstance.get<T[]>(this.endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(data: Omit<T, "id">): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(this.endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await axiosInstance.patch<T>(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await axiosInstance.patch<T>(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async search(params: Record<string, any>): Promise<T[]> {
    try {
      const response = await axiosInstance.get<T[]>(this.endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkCreate(data: Omit<T, "id">[]): Promise<T[]> {
    try {
      const promises = data.map((item) => this.create(item));
      return await Promise.all(promises);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<T[]> {
    try {
      const promises = updates.map(({ id, data }) => this.update(id, data));
      return await Promise.all(promises);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      const promises = ids.map((id) => this.delete(id));
      await Promise.all(promises);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      const data = error.response?.data;
      return new ApiError(message, status, data);
    }

    return new ApiError(error.message || "An unexpected error occurred");
  }
}

// Utility function to handle API errors in components
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Export axios instance for custom requests
export { axiosInstance };

// Export types
export type { AxiosResponse, AxiosError };
