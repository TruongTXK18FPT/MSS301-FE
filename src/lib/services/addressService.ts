// Service để gọi API địa chỉ trực tiếp từ third-party
import { Province, District, Ward, AddressApiResponse } from '@/lib/dto/address';

const API_BASE_URL = 'https://tinhthanhpho.com/api/v1';
const API_KEY = 'hvn_MKPhhlMk6P7QLdEhiTUqEj0aSfxxuLDL'; // API key từ Backend config

class AddressService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AddressApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      return data.data;
    } catch (error) {
      console.error('Address API error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tỉnh/thành phố (Cấu trúc mới sau 1/7/2025)
   */
  async getProvinces(): Promise<Province[]> {
    try {
      return await this.makeRequest<Province[]>('/new-provinces?limit=100');
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Return fallback data on error
      return [
        { code: '01', name: 'Hà Nội', type: 'Thành phố' },
        { code: '02', name: 'TP. Hồ Chí Minh', type: 'Thành phố' },
        { code: '03', name: 'Đà Nẵng', type: 'Thành phố' },
        { code: '04', name: 'Hải Phòng', type: 'Thành phố' },
        { code: '05', name: 'Cần Thơ', type: 'Thành phố' }
      ];
    }
  }

  /**
   * Lấy danh sách phường/xã theo tỉnh (Cấu trúc mới sau 1/7/2025)
   */
  async getWardsByProvince(provinceCode: string): Promise<Ward[]> {
    try {
      return await this.makeRequest<Ward[]>(`/new-provinces/${provinceCode}/wards?limit=100`);
    } catch (error) {
      console.error('Error fetching wards by province:', error);
      // Return fallback data based on province
      const fallbackWards: Record<string, Ward[]> = {
        '01': [
          { code: '00070', name: 'Hoàn Kiếm', type: 'Phường', district_code: '', province_code: '01' },
          { code: '00071', name: 'Ba Đình', type: 'Phường', district_code: '', province_code: '01' },
          { code: '00072', name: 'Tây Hồ', type: 'Phường', district_code: '', province_code: '01' }
        ],
        '02': [
          { code: '00001', name: 'Quận 1', type: 'Phường', district_code: '', province_code: '02' },
          { code: '00002', name: 'Quận 2', type: 'Phường', district_code: '', province_code: '02' },
          { code: '00003', name: 'Quận 3', type: 'Phường', district_code: '', province_code: '02' }
        ]
      };
      return fallbackWards[provinceCode] || [];
    }
  }

  /**
   * Lấy danh sách phường/xã theo quận/huyện
   */
  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      return await this.makeRequest<Ward[]>(`/districts/${districtCode}/wards?limit=100`);
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Return fallback data based on district
      const fallbackWards: Record<string, Ward[]> = {
        '001': [
          { code: '00001', name: 'Phúc Xá', type: 'Phường', district_code: '001', province_code: '01' },
          { code: '00002', name: 'Trúc Bạch', type: 'Phường', district_code: '001', province_code: '01' }
        ],
        '002': [
          { code: '00001', name: 'Phúc Tân', type: 'Phường', district_code: '002', province_code: '01' },
          { code: '00002', name: 'Đồng Xuân', type: 'Phường', district_code: '002', province_code: '01' }
        ]
      };
      return fallbackWards[districtCode] || [];
    }
  }

  /**
   * Chuyển đổi địa chỉ từ cấu trúc cũ sang mới
   */
  async convertAddress(addressData: {
    provinceCode: string;
    districtCode?: string;
    wardCode?: string;
    streetAddress?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/convert/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      return data.data;
    } catch (error) {
      console.error('Error converting address:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm địa chỉ (Cấu trúc mới)
   */
  async searchAddress(keyword: string): Promise<any[]> {
    try {
      return await this.makeRequest(`/search-new-address?keyword=${encodeURIComponent(keyword)}&limit=20`);
    } catch (error) {
      console.error('Error searching address:', error);
      return [];
    }
  }
}

export const addressService = new AddressService();
export default addressService;
