import axios from './axios';

export interface MediaResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes?: number;
  width?: number;
  height?: number;
  folder: string;
  uploadedAt: string;
  originalFilename: string;
}

export interface UploadResponse {
  file?: MediaResponse;
  files?: MediaResponse[];
  message: string;
  success: boolean;
}

class MediaService {
  private baseUrl = '/api/v1/media';

  /**
   * Upload single file to Cloudinary
   * @param file File to upload
   * @param folder Folder path in Cloudinary (e.g., 'assignments', 'avatars', 'lessons')
   * @param quality Optional quality setting (1-100 integer)
   */
  async uploadFile(
    file: File,
    folder: string = 'general',
    quality?: number
  ): Promise<MediaResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (quality) {
      formData.append('quality', quality.toString());
    }

    const response = await axios.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data.result || response.data;
    return result.file;
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(
    files: File[],
    folder: string = 'general',
    quality?: number
  ): Promise<MediaResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);
    if (quality) {
      formData.append('quality', quality.toString());
    }

    const response = await axios.post(`${this.baseUrl}/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data.result || response.data;
    return result.files || [];
  }

  /**
   * Get file information by public ID
   */
  async getFileInfo(publicId: string): Promise<MediaResponse | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/info/${publicId}`);
      return response.data.result || response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Delete file by public ID
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${publicId}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get all files in a folder
   */
  async getFilesByFolder(folder: string): Promise<MediaResponse[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/folder/${folder}`);
      return response.data.result || response.data;
    } catch (error) {
      console.error('Error getting files from folder:', error);
      return [];
    }
  }

  /**
   * Helper: Upload avatar image
   */
  async uploadAvatar(file: File): Promise<MediaResponse> {
    return this.uploadFile(file, 'avatars', 80);
  }

  /**
   * Helper: Upload assignment submission files
   */
  async uploadAssignmentFiles(files: File[]): Promise<MediaResponse[]> {
    return this.uploadMultipleFiles(files, 'assignments');
  }

  /**
   * Helper: Upload lesson attachments
   */
  async uploadLessonFiles(files: File[]): Promise<MediaResponse[]> {
    return this.uploadMultipleFiles(files, 'lessons');
  }
}

export const mediaService = new MediaService();
export default mediaService;
