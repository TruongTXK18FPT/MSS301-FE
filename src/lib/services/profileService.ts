import { profileApi } from './axios';
import { ApiResponse } from '@/lib/dto/common';
import { 
  StudentProfileRequest, 
  StudentProfileResponse, 
  ProfileCompletionStatusResponse
} from '../dto';
import { 
  GuardianProfileResponse, 
  GuardianProfileWithStudents, 
  StudentGuardianResponse 
} from '../dto/guardian';

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
      // Log detailed error information
      console.error('[ProfileService] Update profile error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'Phiên đăng nhập đã hết hạn';
        console.error('[ProfileService] Unauthorized - token may be expired or invalid');
        throw new Error(`${errorMessage}. Vui lòng đăng nhập lại.`);
      }
      
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

  // Guardian Profile Methods
  /**
   * Lấy thông tin guardian profile hiện tại
   */
  async getGuardianProfile(): Promise<GuardianProfileResponse> {
    try {
      const response = await profileApi.get<ApiResponse<GuardianProfileResponse>>('/guardian/me');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin guardian profile');
    }
  }

  /**
   * Lấy guardian profile với danh sách học sinh
   */
  async getGuardianProfileWithStudents(): Promise<GuardianProfileWithStudents> {
    try {
      const response = await profileApi.get<ApiResponse<GuardianProfileWithStudents>>('/guardian/me/students');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin guardian với học sinh');
    }
  }

  /**
   * Lấy danh sách học sinh của guardian theo ID
   */
  async getStudentsByGuardian(guardianId: string): Promise<StudentGuardianResponse[]> {
    try {
      const response = await profileApi.get<ApiResponse<StudentGuardianResponse[]>>(`/guardian/${guardianId}/students`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách học sinh');
    }
  }

  /**
   * Kiểm tra mối quan hệ giữa guardian và student
   */
  async checkGuardianStudentRelationship(guardianEmail: string, studentEmail: string): Promise<boolean> {
    try {
      const response = await profileApi.get<ApiResponse<boolean>>(
        `/guardian/check-relationship?guardianEmail=${encodeURIComponent(guardianEmail)}&studentEmail=${encodeURIComponent(studentEmail)}`
      );
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể kiểm tra mối quan hệ');
    }
  }

  /**
   * Guardian thêm student vào danh sách quản lý
   */
  async addStudentToGuardian(studentEmail: string, relationship: string): Promise<void> {
    try {
      await profileApi.post<ApiResponse<void>>(
        `/guardian/add-student?studentEmail=${encodeURIComponent(studentEmail)}&relationship=${encodeURIComponent(relationship)}`
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể thêm học sinh');
    }
  }

  /**
   * Student xác nhận quan hệ với Guardian bằng mã OTP
   */
  async verifyStudentRelationship(studentEmail: string, verificationCode: string): Promise<void> {
    try {
      await profileApi.post<ApiResponse<void>>(
        `/guardian/verify-student?studentEmail=${encodeURIComponent(studentEmail)}&verificationCode=${encodeURIComponent(verificationCode)}`
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xác nhận quan hệ');
    }
  }

  /**
   * Gửi lại mã xác nhận Guardian
   */
  async resendGuardianVerification(studentEmail: string): Promise<void> {
    try {
      await profileApi.post<ApiResponse<void>>(
        `/guardian/resend-verification?studentEmail=${encodeURIComponent(studentEmail)}`
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể gửi lại mã xác nhận');
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
