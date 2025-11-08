import axios, { AxiosInstance } from "axios";

// Use Gateway URL instead of direct service URLs to avoid CORS issues
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
const API_BASE_URL = `${GATEWAY_URL}/api/v1`;
const AUTH_API_URL = `${API_BASE_URL}/authenticate`;
const CLASSROOM_API_URL = `${API_BASE_URL}/classrooms`;

interface UserResponse {
  id: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roleId: number;
  tenantId: string;
}

interface ClassroomResponse {
  id: number;
  name: string;
  description: string;
  owner: string;
  subject: string;
  grade: string;
  isPublic: boolean;
  status: "ACTIVE" | "INACTIVE";
  maxStudents: number;
  currentStudents: number;
  joinCode: string;
  createdAt: string;
}

interface ApiResponse<T> {
  result: T;
  message: string;
  code?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class AdminService {
  private api: AxiosInstance;
  private classroomApi: AxiosInstance;

  constructor() {
    // For auth/admin endpoints
    this.api = axios.create({
      baseURL: AUTH_API_URL,
      timeout: 10000,
    });

    // For classroom endpoints
    this.classroomApi = axios.create({
      baseURL: CLASSROOM_API_URL,
      timeout: 10000,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.classroomApi.interceptors.request.use((config) => {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ========== USER MANAGEMENT ==========

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDirection: string = "DESC"
  ): Promise<PaginatedResponse<UserResponse>> {
    try {
      const response = await this.api.get<ApiResponse<any>>(
        `/admin/users`,
        {
          params: { page, size, sortBy, sortDirection },
        }
      );

      const data = response.data.result;
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await this.api.get<ApiResponse<UserResponse>>(
        `/admin/users/${userId}`
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    password: string;
    role: string;
  }): Promise<UserResponse> {
    try {
      const response = await this.api.post<ApiResponse<UserResponse>>(
        `/admin/users`,
        userData
      );
      return response.data.result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.api.delete(`/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle user status
   */
  async updateUserStatus(
    userId: string,
    newStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  ): Promise<UserResponse> {
    try {
      const isActive = newStatus === "ACTIVE";
      const response = await this.api.patch<ApiResponse<UserResponse>>(
        `/users/${userId}/status`,
        { active: isActive }
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error updating user status ${userId}:`, error);
      throw error;
    }
  }

  // ========== CLASSROOM MANAGEMENT ==========

  /**
   * Get all classrooms with pagination
   */
  async getAllClassrooms(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ClassroomResponse>> {
    try {
      const response = await this.classroomApi.get<ApiResponse<any>>(
        ``,
        {
          params: { page, size },
        }
      );

      const data = response.data.result;
      if (Array.isArray(data)) {
        // If response is an array, convert to paginated format
        return {
          content: data,
          totalElements: data.length,
          totalPages: Math.ceil(data.length / size),
          currentPage: page,
          pageSize: size,
        };
      }

      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
      };
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      throw error;
    }
  }

  /**
   * Get single classroom by ID
   */
  async getClassroomById(classroomId: number): Promise<ClassroomResponse> {
    try {
      const response = await this.classroomApi.get<ApiResponse<ClassroomResponse>>(
        `/${classroomId}`
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching classroom ${classroomId}:`, error);
      throw error;
    }
  }

  /**
   * Create new classroom
   */
  async createClassroom(classroomData: any): Promise<ClassroomResponse> {
    try {
      const response = await this.classroomApi.post<ApiResponse<ClassroomResponse>>(
        ``,
        classroomData
      );
      return response.data.result;
    } catch (error) {
      console.error("Error creating classroom:", error);
      throw error;
    }
  }

  /**
   * Update classroom
   */
  async updateClassroom(
    classroomId: number,
    classroomData: any
  ): Promise<ClassroomResponse> {
    try {
      const response = await this.classroomApi.put<ApiResponse<ClassroomResponse>>(
        `/${classroomId}`,
        classroomData
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error updating classroom ${classroomId}:`, error);
      throw error;
    }
  }

  /**
   * Delete classroom
   */
  async deleteClassroom(classroomId: number): Promise<void> {
    try {
      await this.classroomApi.delete(`/${classroomId}`);
    } catch (error) {
      console.error(`Error deleting classroom ${classroomId}:`, error);
      throw error;
    }
  }

  // ========== ANALYTICS ==========

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalClassrooms: number;
    activeClassrooms: number;
    totalTeachers: number;
  }> {
    try {
      const [usersRes, classroomsRes] = await Promise.all([
        this.getAllUsers(0, 1),
        this.getAllClassrooms(0, 1),
      ]);

      return {
        totalUsers: usersRes.totalElements,
        totalClassrooms: classroomsRes.totalElements,
        activeClassrooms: classroomsRes.content.filter(
          (c) => c.status === "ACTIVE"
        ).length,
        totalTeachers: 0, // Would need separate endpoint
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get user growth data (mock for now)
   */
  async getUserGrowthData(): Promise<
    Array<{
      month: string;
      users: number;
      teachers: number;
      students: number;
    }>
  > {
    try {
      // This would call a real endpoint if available
      // For now, return mock data
      return [
        { month: "Jun", users: 200, teachers: 20, students: 180 },
        { month: "Jul", users: 350, teachers: 35, students: 315 },
        { month: "Aug", users: 520, teachers: 52, students: 468 },
        { month: "Sep", users: 780, teachers: 78, students: 702 },
        { month: "Oct", users: 1150, teachers: 115, students: 1035 },
        { month: "Nov", users: 1600, teachers: 160, students: 1440 },
      ];
    } catch (error) {
      console.error("Error fetching user growth data:", error);
      throw error;
    }
  }

  /**
   * Get traffic data (mock for now)
   */
  async getTrafficData(): Promise<
    Array<{
      time: string;
      visitors: number;
      pageViews: number;
    }>
  > {
    try {
      // This would call a real endpoint if available
      return [
        { time: "00:00", visitors: 45, pageViews: 120 },
        { time: "04:00", visitors: 52, pageViews: 140 },
        { time: "08:00", visitors: 120, pageViews: 350 },
        { time: "12:00", visitors: 280, pageViews: 800 },
        { time: "16:00", visitors: 350, pageViews: 920 },
        { time: "20:00", visitors: 450, pageViews: 1200 },
      ];
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export type { UserResponse, ClassroomResponse, ApiResponse, PaginatedResponse };
