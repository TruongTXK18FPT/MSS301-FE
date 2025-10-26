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
    console.log(`[API] Authorization header: Bearer ${token.substring(0, 20)}...`);
  }

  console.log(`[API] Making request to: ${API_BASE_URL}${path}`);
  console.log(`[API] Token present: ${!!token}`);
  if (token) {
    console.log(`[API] Token preview: ${token.substring(0, 20)}...`);
  }
  console.log(`[API] Headers being sent:`, headers);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  console.log(`[API] Response status: ${res.status}`);

  // Handle 401 Unauthorized
  if (res.status === 401) {
    console.error(`[API] 401 Unauthorized for ${path}`);
    console.error(`[API] Token may be expired or invalid`);
    
    // For change password, don't remove token - let user retry
    if (path.includes('change-password')) {
      throw new Error("Token may be expired. Please login again and try changing password.");
    }
    
    // For other endpoints, remove token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      // Redirect to login page
      window.location.href = '/auth/login';
    }
    throw new Error("Authentication failed. Please login again.");
  }

  const data = (await res.json()) as ApiResponse<T>;
  return data;
}



