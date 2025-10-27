import axios from 'axios';

// Cấu hình biến môi trường
const isLocal = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// Gateway URL - Frontend chỉ gọi đến Gateway
const GATEWAY_URL = isLocal ? 'http://localhost:8080' : process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';

// API Prefix từ Gateway
const API_PREFIX = '/api/v1';

// Service paths qua Gateway
const AUTH_SERVICE_PATH = '/authenticate';
const PROFILE_SERVICE_PATH = '/profile';
const MINDMAP_SERVICE_PATH = '/mindmap';
const CLASSROOM_SERVICE_PATH = '/classroom';
const DOCUMENT_SERVICE_PATH = '/document';
const RETRIEVAL_SERVICE_PATH = '/retrieval';
const RAG_SERVICE_PATH = '/rag';
// Tạo axios instance chung cho Gateway
const apiClient = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config) => {
    if (!isServer) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('[Axios] 401 Unauthorized - not clearing token immediately');
      // Don't clear token immediately - let the calling code decide
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('access_token');
      // localStorage.removeItem('refresh_token');
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Tạo các axios instance cho từng service qua Gateway
export const authApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${AUTH_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profileApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${PROFILE_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mindmapApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${MINDMAP_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const classroomApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${CLASSROOM_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${DOCUMENT_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const retrievalApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${RETRIEVAL_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ragApi = axios.create({
  baseURL: `${GATEWAY_URL}${API_PREFIX}${RAG_SERVICE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gatewayApi = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptors cho tất cả các instance
[authApi, profileApi, mindmapApi, classroomApi, documentApi, retrievalApi, ragApi, gatewayApi].forEach(api => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      if (!isServer) {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[Axios] Request interceptor - token added:', {
            url: config.url,
            method: config.method,
            tokenPreview: `${token.substring(0, 20)}...`
          });
        } else {
          console.warn('[Axios] Request interceptor - no token found:', {
            url: config.url,
            method: config.method
          });
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        const token = typeof globalThis.window !== 'undefined' ? localStorage.getItem('authToken') : null;
        console.error('[Axios] 401 Unauthorized error:', {
          url: error.config?.url,
          method: error.config?.method,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null,
          errorMessage: error.response?.data?.message,
          responseData: error.response?.data
        });
        // Don't clear token immediately - let the calling code decide
        // localStorage.removeItem('authToken');
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('refresh_token');
        // window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );
});

export default apiClient;
