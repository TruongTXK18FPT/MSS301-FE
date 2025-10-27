'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/auth-context';
import { AuthAPI } from '@/lib/services/auth.service';
import { profileService } from '@/lib/services/profileService';
import { addressService } from '@/lib/services/addressService';

export default function ProfileCompletePage() {
  const router = useRouter();
  const { email, username, role, loading: authLoading, checkProfileStatus, passwordSetupRequired, checkPasswordSetupRequired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    birthDate: '',
    school: '',
    grade: '',
    bio: '',
    address: '',
    province: '',
    ward: ''
  });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Search states
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState<any[]>([]);
  const [filteredWards, setFilteredWards] = useState<any[]>([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Re-check password setup status when component mounts
  useEffect(() => {
    if (email && !authLoading) {
      console.log('[ProfileComplete] Re-checking password setup status for:', email);
      checkPasswordSetupRequired();
    }
  }, [email, authLoading, checkPasswordSetupRequired]);

  // Filter provinces based on search
  useEffect(() => {
    if (provinceSearch.trim() === '') {
      setFilteredProvinces(provinces);
    } else {
      const filtered = provinces.filter(province => 
        province.name.toLowerCase().includes(provinceSearch.toLowerCase())
      );
      setFilteredProvinces(filtered);
    }
  }, [provinces, provinceSearch]);

  // Filter wards based on search
  useEffect(() => {
    if (wardSearch.trim() === '') {
      setFilteredWards(wards);
    } else {
      const filtered = wards.filter(ward => 
        ward.name.toLowerCase().includes(wardSearch.toLowerCase())
      );
      setFilteredWards(filtered);
    }
  }, [wards, wardSearch]);

  // Load user data and pre-fill form
  useEffect(() => {
    const loadUserData = async () => {
      // Check if we have a valid token
      const token = localStorage.getItem('authToken');
      console.log('[ProfileComplete] Token check:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
    if (!token) {
        console.log('No token found, skipping user data load');
        loadProvinces();
      return;
    }

      // Skip token expiration check - let the backend handle validation

      try {
        // First check if the user has completed their profile
        console.log('[ProfileComplete] Checking profile completion status...');
        const profileStatus = await profileService.getProfileCompletionStatus();
        console.log('[ProfileComplete] Profile status:', profileStatus);
        
        if (profileStatus.profileCompleted) {
          // User has completed profile, try to get existing data for pre-fill
          console.log('[ProfileComplete] Profile completed, fetching existing data...');
          const userData = await profileService.getCurrentUserProfile();
          console.log('[ProfileComplete] API response:', userData);
          
          if (userData) {
            console.log('[ProfileComplete] User data:', userData);
            setFormData(prev => ({
              ...prev,
              fullName: userData.fullName || '',
              grade: (userData as any).grade || ''
            }));
          }
        } else {
          console.log('[ProfileComplete] Profile not completed yet, skipping pre-fill (this is normal for new users)');
        }
      } catch (error: any) {
        console.error('[ProfileComplete] Error loading user data:', error);
        console.error('[ProfileComplete] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // This is expected for new users who haven't completed their profile yet
        // Just continue without pre-fill data
        console.log('[ProfileComplete] No existing profile found, continuing without pre-fill (this is normal for new users)');
      }
      
      // Always load provinces regardless of user data loading result
      loadProvinces();
    };

    loadUserData();
  }, [router]);

  // Load provinces from API
  const loadProvinces = async () => {
    console.log('[ProfileComplete] Loading provinces from third-party API...');
    
    try {
      // Load from third-party API (tinhthanhpho.com)
      const provincesData = await addressService.getProvinces();
      console.log('[ProfileComplete] Third-party API provinces:', provincesData);
      
      // Transform data to match our format
      const transformedProvinces = provincesData.map(province => ({
        id: province.code,
        name: province.name,
        type: province.type
      }));
      
      setProvinces(transformedProvinces);
      setFilteredProvinces(transformedProvinces);
      console.log('[ProfileComplete] Successfully loaded provinces from third-party API');
    } catch (error: any) {
      console.error('[ProfileComplete] Error loading provinces from third-party API:', error);
      
      // Fallback to hardcoded data
      const fallbackProvinces = [
        { id: '01', name: 'Hà Nội' }, { id: '02', name: 'TP. Hồ Chí Minh' }, { id: '03', name: 'Đà Nẵng' },
        { id: '04', name: 'Hải Phòng' }, { id: '05', name: 'Cần Thơ' }, { id: '06', name: 'An Giang' },
        { id: '07', name: 'Bà Rịa - Vũng Tàu' }, { id: '08', name: 'Bắc Giang' }, { id: '09', name: 'Bắc Kạn' },
        { id: '10', name: 'Bạc Liêu' }, { id: '11', name: 'Bắc Ninh' }, { id: '12', name: 'Bến Tre' },
        { id: '13', name: 'Bình Định' }, { id: '14', name: 'Bình Dương' }, { id: '15', name: 'Bình Phước' },
        { id: '16', name: 'Bình Thuận' }, { id: '17', name: 'Cà Mau' }, { id: '18', name: 'Cao Bằng' },
        { id: '19', name: 'Đắk Lắk' }, { id: '20', name: 'Đắk Nông' }
      ];
      setProvinces(fallbackProvinces);
      setFilteredProvinces(fallbackProvinces);
    }
  };

  // Load wards when province changes (Cấu trúc mới sau 1/7/2025)
  const loadWardsByProvince = async (provinceId: string) => {
    console.log('[ProfileComplete] Loading wards for province:', provinceId);
    
    try {
      // Load from third-party API (tinhthanhpho.com) - Cấu trúc mới
      const wardsData = await addressService.getWardsByProvince(provinceId);
      console.log('[ProfileComplete] Third-party API wards:', wardsData);
      
      // Transform data to match our format
      const transformedWards = wardsData.map(ward => ({
        id: ward.code,
        name: ward.name,
        type: ward.type
      }));
      
      setWards(transformedWards);
      setFilteredWards(transformedWards);
      console.log('[ProfileComplete] Successfully loaded wards from third-party API');
    } catch (error: any) {
      console.error('[ProfileComplete] Error loading wards from third-party API:', error);
      
      // Fallback to hardcoded data
      const fallbackWards = [
        { id: '00070', name: 'Hoàn Kiếm' },
        { id: '00071', name: 'Ba Đình' },
        { id: '00072', name: 'Tây Hồ' },
        { id: '00073', name: 'Long Biên' },
        { id: '00074', name: 'Cầu Giấy' }
      ];
      setWards(fallbackWards);
      setFilteredWards(fallbackWards);
    }
  };

  // Validate birth date format and grade compatibility
  const validateBirthDate = (birthDate: string, grade: string) => {
    if (!birthDate) return '';

    // Validate date format (dd/MM/yyyy)
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = birthDate.match(dateRegex);
    
    if (!match) {
      return 'Định dạng ngày sinh không đúng. Vui lòng nhập theo định dạng ../../....';
    }

    const [, day, month, year] = match;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validate date values
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
      return 'Ngày sinh không hợp lệ';
    }

    // Create Date object for validation
    const dateObj = new Date(yearNum, monthNum - 1, dayNum);
    if (dateObj.getDate() !== dayNum || dateObj.getMonth() !== monthNum - 1 || dateObj.getFullYear() !== yearNum) {
      return 'Ngày sinh không tồn tại';
    }

    const currentYear = new Date().getFullYear();

    // Check if year is not in the future
    if (yearNum > currentYear) {
      return 'Năm sinh không thể là tương lai';
    }

    // Validate grade compatibility (only if grade is provided)
    if (grade) {
      const gradeNum = parseInt(grade);
      if (!isNaN(gradeNum)) {
        // Calculate expected birth year based on grade
        // Assuming students start grade 1 at age 6
        const expectedBirthYear = currentYear - (6 + gradeNum - 1);
        
        // Allow 2 years variation for students who might repeat grades
        const minBirthYear = expectedBirthYear - 2; // Allow 2 years older
        const maxBirthYear = expectedBirthYear + 1; // Allow 1 year younger
        
        if (yearNum < minBirthYear || yearNum > maxBirthYear) {
          return `Năm sinh không phù hợp với lớp ${grade}. Năm sinh dự kiến: ${expectedBirthYear} (±2 năm)`;
        }
      }
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert date format from dd/MM/yyyy to yyyy-MM-dd
      const convertDateFormat = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      // Map form data to API format
      const apiData = {
        fullName: formData.fullName,
        birthDate: convertDateFormat(formData.birthDate), // Convert date format
        phoneNumber: formData.phoneNumber,
        address: `${formData.address}, ${formData.ward}, ${formData.province}`, // Create full address
        bio: formData.bio,
        grade: formData.grade,
        school: formData.school
      };
      
      await profileService.updateCurrentProfile(apiData);
      
      // Refresh profile completion status after successful update
      await checkProfileStatus(role);
      
      // Show success message
      alert('Profile đã được cập nhật thành công!');
      
      router.push('/profile');
    } catch (error: any) {
      console.error('Error completing profile:', error);
      
      // Check if error message contains authentication information
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('Phiên đăng nhập') || errorMessage.includes('Unauthorized')) {
        alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login page
        router.push('/auth/login');
      } else if (errorMessage.includes('Unauthenticated')) {
        alert('Bạn cần đăng nhập để cập nhật profile. Vui lòng đăng nhập lại.');
        router.push('/auth/login');
      } else {
        alert(`Có lỗi xảy ra khi cập nhật profile: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!email) {
    router.push('/auth/login');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    // Auto-format birth date input
    if (field === 'birthDate') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as dd/MM/yyyy
      let formatted = digitsOnly;
      if (digitsOnly.length >= 3) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2);
      }
      if (digitsOnly.length >= 5) {
        formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4) + '/' + digitsOnly.slice(4, 8);
      }
      
      // Limit to 10 characters (dd/MM/yyyy)
      if (formatted.length > 10) {
        formatted = formatted.slice(0, 10);
      }
      
      value = formatted;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle address cascading (Cấu trúc mới: Province → Ward)
    if (field === 'province') {
      setFormData(prev => ({ ...prev, ward: '' }));
      setWards([]);
      setFilteredWards([]);
      setWardSearch(''); // Reset ward search
      if (value) {
        loadWardsByProvince(value);
      }
    }

    // Validate birth date when grade or birth date changes
    if (field === 'birthDate' || field === 'grade') {
      const birthDate = field === 'birthDate' ? value : formData.birthDate;
      const grade = field === 'grade' ? value : formData.grade;
      
      if (birthDate) {
        const error = validateBirthDate(birthDate, grade);
        if (error) {
          setErrors(prev => ({ ...prev, birthDate: error }));
        } else {
          // Clear error if validation passes
          setErrors(prev => ({ ...prev, birthDate: '' }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/30 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Hoàn thiện hồ sơ của bạn
          </CardTitle>
          <CardDescription className="text-purple-200 text-center">
            Vui lòng cung cấp thông tin để hoàn thiện hồ sơ cá nhân
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-purple-200">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                  className="bg-black/30 border-purple-500/30 text-white"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-sm">{errors.fullName}</p>
                )}
      </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-purple-200">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="bg-black/30 border-purple-500/30 text-white"
                />
      </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="text-purple-200">Trường học</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  placeholder="Nhập tên trường"
                  className="bg-black/30 border-purple-500/30 text-white"
                />
      </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-purple-200">Lớp</Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Lớp 1</SelectItem>
                    <SelectItem value="2">Lớp 2</SelectItem>
                    <SelectItem value="3">Lớp 3</SelectItem>
                    <SelectItem value="4">Lớp 4</SelectItem>
                    <SelectItem value="5">Lớp 5</SelectItem>
                    <SelectItem value="6">Lớp 6</SelectItem>
                    <SelectItem value="7">Lớp 7</SelectItem>
                    <SelectItem value="8">Lớp 8</SelectItem>
                    <SelectItem value="9">Lớp 9</SelectItem>
                    <SelectItem value="10">Lớp 10</SelectItem>
                    <SelectItem value="11">Lớp 11</SelectItem>
                    <SelectItem value="12">Lớp 12</SelectItem>
                  </SelectContent>
                </Select>
      </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-purple-200">Ngày sinh (../../....)</Label>
                <Input
                  id="birthDate"
                  type="text"
                  placeholder="23/04/2017"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="bg-black/30 border-purple-500/30 text-white"
                />
                {errors.birthDate && (
                  <p className="text-red-400 text-sm">{errors.birthDate}</p>
                )}
      </div>

      </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-purple-200">Giới thiệu về bản thân</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Hãy giới thiệu về bản thân..."
                rows={4}
                className="bg-black/30 border-purple-500/30 text-white"
              />
      </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Địa chỉ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-purple-200">Tỉnh/Thành phố *</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Tìm kiếm tỉnh/thành phố..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      onFocus={() => setShowProvinceDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                      className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-400"
                    />
                    {(showProvinceDropdown || provinceSearch) && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-black/90 border border-purple-500/30 rounded-md max-h-60 overflow-y-auto">
                        {filteredProvinces.map((province) => (
                          <div
                            key={province.id}
                            className="px-3 py-2 hover:bg-purple-500/20 cursor-pointer text-white"
                          onClick={() => {
                            handleInputChange('province', province.id);
                            setProvinceSearch(province.name);
                            setShowProvinceDropdown(false);
                          }}
                          >
                            {province.name}
                          </div>
                        ))}
                        {filteredProvinces.length === 0 && provinceSearch && (
                          <div className="px-3 py-2 text-gray-400">Không tìm thấy tỉnh/thành phố</div>
                        )}
                      </div>
                    )}
                  </div>
      </div>

              <div className="space-y-2">
                <Label htmlFor="ward" className="text-purple-200">Phường/Xã *</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={formData.province ? "Tìm kiếm phường/xã..." : "Chọn tỉnh/thành phố trước"}
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    onFocus={() => setShowWardDropdown(true)}
                    onBlur={() => setTimeout(() => setShowWardDropdown(false), 200)}
                    disabled={!formData.province}
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-400 disabled:opacity-50"
                  />
                  {formData.province && (showWardDropdown || wardSearch) && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-black/90 border border-purple-500/30 rounded-md max-h-60 overflow-y-auto">
                      {filteredWards.map((ward) => (
                        <div
                          key={ward.id}
                          className="px-3 py-2 hover:bg-purple-500/20 cursor-pointer text-white"
                          onClick={() => {
                            handleInputChange('ward', ward.id);
                            setWardSearch(ward.name);
                            setShowWardDropdown(false);
                          }}
                        >
                          {ward.name}
                        </div>
                      ))}
                      {filteredWards.length === 0 && wardSearch && (
                        <div className="px-3 py-2 text-gray-400">Không tìm thấy phường/xã</div>
                      )}
                    </div>
                  )}
      </div>
      </div>
      </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-purple-200">Địa chỉ chi tiết</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Số nhà, tên đường..."
                  className="bg-black/30 border-purple-500/30 text-white"
                />
        </div>
      </div>

            {/* Password Setup Section - Only show if password setup is required */}
            {passwordSetupRequired && (
              <div className="space-y-4 border-t border-purple-500/30 pt-6">
                <h3 className="text-lg font-semibold text-white">Bảo mật tài khoản</h3>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Thiết lập mật khẩu (Tùy chọn)</h4>
                      <p className="text-purple-200 text-sm mt-1">
                        Để bảo mật tài khoản tốt hơn, bạn có thể thiết lập mật khẩu. 
                        Điều này giúp bạn đăng nhập ngay cả khi Google OAuth gặp sự cố.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/auth/setup-password')}
                        className="mt-3 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                      >
                        Thiết lập mật khẩu
                      </Button>
                    </div>
        </div>
        </div>
      </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
              >
                {loading ? 'Đang lưu...' : 'Hoàn thành'}
      </Button>
            </div>
    </form>
        </CardContent>
      </Card>
    </div>
  );
}