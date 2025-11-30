import { handleSupabaseError } from "@/pages/api/utils";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  data?: any;
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

        const errorData = await response.json().catch(() => ({}));
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

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, "DELETE", options);
  }
}

export const api = new ApiClient();
