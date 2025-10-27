// Address-related DTOs for Vietnam address system

/**
 * Province (Tỉnh/Thành phố)
 */
export interface Province {
  code: string;
  name: string;
  type: string;
}

/**
 * District (Quận/Huyện)
 */
export interface District {
  code: string;
  name: string;
  type: string;
  province_code: string;
}

/**
 * Ward (Phường/Xã)
 */
export interface Ward {
  code: string;
  name: string;
  type: string;
  district_code: string;
  province_code: string;
}

/**
 * API Response structure from address API
 */
export interface AddressApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}
