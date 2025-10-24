export const API_BASE_URL = "http://localhost:8080/api/v1";

export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T | null;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json()) as ApiResponse<T>;
  return data;
}



