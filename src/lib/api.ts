export const API_BASE_URL = "http://localhost:8080/api/v1";

// Global token tracking for debugging
if (typeof window !== "undefined") {
  let lastToken = localStorage.getItem("authToken");
  
  // Monitor localStorage changes
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  
  localStorage.setItem = function(key: string, value: string) {
    if (key === "authToken") {
      console.log(`[TOKEN TRACKER] Token set: ${value.substring(0, 20)}...`);
    }
    return originalSetItem.call(this, key, value);
  };
  
  localStorage.removeItem = function(key: string) {
    if (key === "authToken") {
      console.log(`[TOKEN TRACKER] Token removed!`);
      console.log(`[TOKEN TRACKER] Stack trace:`, new Error().stack);
    }
    return originalRemoveItem.call(this, key);
  };
}

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

  console.log(`[API] Making request to: ${API_BASE_URL}${path}`);
  console.log(`[API] Token present: ${!!token}`);
  if (token) {
    console.log(`[API] Token preview: ${token.substring(0, 20)}...`);
  }
  
  // Log current token state before request
  const currentToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  console.log(`[API] Current token in localStorage: ${currentToken ? 'present' : 'none'}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  console.log(`[API] Response status: ${res.status}`);
  
  // Log token state after response
  const tokenAfterResponse = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  console.log(`[API] Token after response: ${tokenAfterResponse ? 'present' : 'none'}`);

  // Handle 401 Unauthorized
  if (res.status === 401) {
    console.error(`[API] 401 Unauthorized for ${path}`);
    console.error(`[API] Token was: ${token ? token.substring(0, 20) + '...' : 'none'}`);
    console.error(`[API] Token after 401: ${tokenAfterResponse ? 'present' : 'none'}`);
    
    // Check if token was cleared by something else
    if (token && !tokenAfterResponse) {
      console.error(`[API] CRITICAL: Token was cleared by something else during the request!`);
      console.error(`[API] Stack trace:`, new Error().stack);
    }
    
    // Only clear token if it's actually invalid
    // Don't clear token immediately - let the calling code decide
    throw new Error("Authentication failed. Please login again.");
  }

  // Handle 400 Bad Request
  if (res.status === 400) {
    console.error(`[API] 400 Bad Request for ${path}`);
    try {
      const errorData = await res.json();
      console.error(`[API] Error response:`, errorData);
      console.error(`[API] Error message:`, errorData.message);
      // Throw error with message from backend
      throw new Error(errorData.message || "Bad Request");
    } catch (parseError) {
      // Only catch JSON parsing errors, not our thrown errors
      if (parseError instanceof SyntaxError) {
        console.error(`[API] JSON Parse error:`, parseError);
        throw new Error("Bad Request");
      } else {
        // Re-throw our custom error
        throw parseError;
      }
    }
  }

  const data = (await res.json()) as ApiResponse<T>;
  return data;
}



