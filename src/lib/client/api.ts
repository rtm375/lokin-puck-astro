export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends RequestInit {
  data?: any;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    method: RequestMethod,
    options: RequestOptions = {},
  ): Promise<T> {
    const { data, headers, ...customConfig } = options;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...customConfig,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(endpoint, config);

      if (!response.ok) {
        // Global Error Handling Trigger
        if (
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404
        ) {
          window.dispatchEvent(new CustomEvent("app:reset"));
          throw new Error("Unauthorized or Data Not Found");
        }
        const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`,
        );
      }

      // Handle empty responses (e.g. 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "GET", options);
  }

  post<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "POST", { ...options, data });
  }

  put<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "PUT", { ...options, data });
  }

  patch<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, "PATCH", { ...options, data });
  }

  /**
   * Upload file using FormData
   * @param endpoint - API endpoint
   * @param formData - FormData object containing file(s)
   * @param options - Additional request options
   * @returns Promise with upload result
   */
  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T> {
    const { headers, ...customConfig } = options;

    const config: RequestInit = {
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...headers,
      },
      body: formData,
      ...customConfig,
    };

    try {
      const response = await fetch(endpoint, config);

      if (!response.ok) {
        // Global Error Handling Trigger
        if (
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404
        ) {
          window.dispatchEvent(new CustomEvent("app:reset"));
          throw new Error("Unauthorized or Data Not Found");
        }

        const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
        throw new Error(
          errorData.error || `Upload failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "DELETE", options);
  }
}

export const api = new ApiClient();
