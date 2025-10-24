import { profileApi } from './axios';
import { 
  StudentProfileRequest, 
  StudentProfileResponse, 
  ProfileCompletionStatusResponse
} from '../dto';

// Define ApiResponse locally
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T | null;
}

class ProfileService {
  /**
   * Lấy thông tin profile hiện tại
   */
  async getCurrentProfile(): Promise<StudentProfileResponse> {
    try {
      const response = await profileApi.get<ApiResponse<StudentProfileResponse>>('/me');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  }

  /**
   * Lấy thông tin profile hiện tại (alias for getCurrentProfile)
   */
  async getCurrentUserProfile(): Promise<StudentProfileResponse> {
    try {
      const response = await profileApi.get<ApiResponse<StudentProfileResponse>>('/me');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  }

  /**
   * Cập nhật profile hiện tại
   */
  async updateCurrentProfile(profileData: StudentProfileRequest): Promise<StudentProfileResponse> {
    try {
      const response = await profileApi.put<ApiResponse<StudentProfileResponse>>('/me', profileData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật profile thất bại');
    }
  }

  /**
   * Lấy trạng thái hoàn thành profile
   */
  async getProfileCompletionStatus(): Promise<ProfileCompletionStatusResponse> {
    try {
      const response = await profileApi.get<ApiResponse<ProfileCompletionStatusResponse>>('/completion-status');
      if (!response.data.result) {
        // Return default values if no profile exists
        return {
          profileCompleted: false,
          userType: "STUDENT",
          email: ""
        };
      }
      return response.data.result;
    } catch (error: any) {
      console.error('Profile completion status error:', error);
      // Return default values on error
      return {
        profileCompleted: false,
        userType: "STUDENT", 
        email: ""
      };
    }
  }

  /**
   * Lấy profile theo ID (admin)
   */
  async getProfileById(profileId: number): Promise<StudentProfileResponse> {
    try {
      const response = await profileApi.get<ApiResponse<StudentProfileResponse>>(`/profile/${profileId}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  }

  /**
   * Cập nhật profile theo ID (admin)
   */
  async updateProfileById(profileId: number, profileData: StudentProfileRequest): Promise<StudentProfileResponse> {
    try {
      const response = await profileApi.put<ApiResponse<StudentProfileResponse>>(`/profile/${profileId}`, profileData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật profile thất bại');
    }
  }

  /**
   * Xóa profile theo ID (admin)
   */
  async deleteProfileById(profileId: number): Promise<void> {
    try {
      await profileApi.delete(`/profile/${profileId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa profile thất bại');
    }
  }

  /**
   * Lấy danh sách tất cả profiles (admin)
   */
  async getAllProfiles(page: number = 0, size: number = 10): Promise<{
    content: StudentProfileResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await profileApi.get<ApiResponse<{
        content: StudentProfileResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
      }>>(`/profile/all?page=${page}&size=${size}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách profiles');
    }
  }

  /**
   * Tìm kiếm profiles
   */
  async searchProfiles(query: string, page: number = 0, size: number = 10): Promise<{
    content: StudentProfileResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await profileApi.get<ApiResponse<{
        content: StudentProfileResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
      }>>(`/profile/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tìm kiếm profiles thất bại');
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await profileApi.post<ApiResponse<{ avatarUrl: string }>>('/profile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upload avatar thất bại');
    }
  }

  /**
   * Xóa avatar
   */
  async deleteAvatar(): Promise<void> {
    try {
      await profileApi.delete('/profile/avatar');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa avatar thất bại');
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
