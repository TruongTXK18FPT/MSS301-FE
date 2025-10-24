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
import { AuthAPI } from '@/services/auth.service';
import { profileService } from '@/lib/services/profileService';

export default function ProfileCompletePage() {
  const router = useRouter();
  const { email, username, loading: authLoading } = useAuth();
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
    district: '',
    ward: ''
  });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    console.log('[ProfileComplete] Loading provinces...');
    
    // Always load fallback data first
    setProvinces([
      { id: '01', name: 'Hà Nội' }, { id: '02', name: 'TP. Hồ Chí Minh' }, { id: '03', name: 'Đà Nẵng' },
      { id: '04', name: 'Hải Phòng' }, { id: '05', name: 'Cần Thơ' }, { id: '06', name: 'An Giang' },
      { id: '07', name: 'Bà Rịa - Vũng Tàu' }, { id: '08', name: 'Bắc Giang' }, { id: '09', name: 'Bắc Kạn' },
      { id: '10', name: 'Bạc Liêu' }, { id: '11', name: 'Bắc Ninh' }, { id: '12', name: 'Bến Tre' },
      { id: '13', name: 'Bình Định' }, { id: '14', name: 'Bình Dương' }, { id: '15', name: 'Bình Phước' },
      { id: '16', name: 'Bình Thuận' }, { id: '17', name: 'Cà Mau' }, { id: '18', name: 'Cao Bằng' },
      { id: '19', name: 'Đắk Lắk' }, { id: '20', name: 'Đắk Nông' }
    ]);

    // Try to load from API if we have a token
    const token = localStorage.getItem('authToken');
    console.log('[ProfileComplete] Provinces token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    if (!token) {
      console.log('No token found, using fallback data');
      return;
    }

    try {
      console.log('[ProfileComplete] Fetching provinces from API...');
      // Try the correct endpoint first
      const response = await fetch('http://localhost:8080/api/v1/profile/addresses/provinces', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[ProfileComplete] Provinces API response status:', response.status);
      
      if (response.status === 401) {
        console.log('Unauthorized, skipping provinces load');
        return;
      }
      
      if (response.status === 404) {
        console.log('Address endpoint not found, using fallback data');
        // Use fallback data for Vietnamese provinces
        setProvinces([
          { id: '01', name: 'Hà Nội' },
          { id: '02', name: 'TP. Hồ Chí Minh' },
          { id: '03', name: 'Đà Nẵng' },
          { id: '04', name: 'Hải Phòng' },
          { id: '05', name: 'Cần Thơ' },
          { id: '06', name: 'An Giang' },
          { id: '07', name: 'Bà Rịa - Vũng Tàu' },
          { id: '08', name: 'Bắc Giang' },
          { id: '09', name: 'Bắc Kạn' },
          { id: '10', name: 'Bạc Liêu' },
          { id: '11', name: 'Bắc Ninh' },
          { id: '12', name: 'Bến Tre' },
          { id: '13', name: 'Bình Định' },
          { id: '14', name: 'Bình Dương' },
          { id: '15', name: 'Bình Phước' },
          { id: '16', name: 'Bình Thuận' },
          { id: '17', name: 'Cà Mau' },
          { id: '18', name: 'Cao Bằng' },
          { id: '19', name: 'Đắk Lắk' },
          { id: '20', name: 'Đắk Nông' }
        ]);
        return;
      }
      
      const data = await response.json();
      console.log('[ProfileComplete] Provinces API response data:', data);
      if (data.code === 1000) {
        console.log('[ProfileComplete] Setting provinces:', data.result);
        setProvinces(data.result || []);
      } else {
        console.log('[ProfileComplete] API returned non-1000 code:', data.code);
      }
    } catch (error: any) {
      console.error('[ProfileComplete] Error loading provinces:', error);
      console.error('[ProfileComplete] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Use fallback data on error
      setProvinces([
        { id: '01', name: 'Hà Nội' },
        { id: '02', name: 'TP. Hồ Chí Minh' },
        { id: '03', name: 'Đà Nẵng' },
        { id: '04', name: 'Hải Phòng' },
        { id: '05', name: 'Cần Thơ' }
      ]);
    }
  };

  // Load districts when province changes
  const loadDistricts = async (provinceId: string) => {
    // Always load fallback data first
    setDistricts([
      { id: '001', name: 'Quận 1' },
      { id: '002', name: 'Quận 2' },
      { id: '003', name: 'Quận 3' },
      { id: '004', name: 'Quận 4' },
      { id: '005', name: 'Quận 5' },
      { id: '006', name: 'Quận 6' },
      { id: '007', name: 'Quận 7' },
      { id: '008', name: 'Quận 8' },
      { id: '009', name: 'Quận 9' },
      { id: '010', name: 'Quận 10' }
    ]);
    setWards([]);

    // Try to load from API if we have a token
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, using fallback data');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/profile/addresses/districts?provinceId=${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log('Unauthorized, skipping districts load');
        return;
      }
      
      if (response.status === 404) {
        console.log('Districts endpoint not found, using fallback data');
        // Use fallback data for districts
        setDistricts([
          { id: '001', name: 'Quận 1' },
          { id: '002', name: 'Quận 2' },
          { id: '003', name: 'Quận 3' },
          { id: '004', name: 'Quận 4' },
          { id: '005', name: 'Quận 5' }
        ]);
        setWards([]);
        return;
      }
      
      const data = await response.json();
      if (data.code === 1000) {
        setDistricts(data.result || []);
        setWards([]); // Clear wards when province changes
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      // Use fallback data on error
      setDistricts([
        { id: '001', name: 'Quận 1' },
        { id: '002', name: 'Quận 2' },
        { id: '003', name: 'Quận 3' }
      ]);
      setWards([]);
    }
  };

  // Load wards when district changes
  const loadWards = async (districtId: string) => {
    // Always load fallback data first
    setWards([
      { id: '001', name: 'Phường 1' },
      { id: '002', name: 'Phường 2' },
      { id: '003', name: 'Phường 3' },
      { id: '004', name: 'Phường 4' },
      { id: '005', name: 'Phường 5' },
      { id: '006', name: 'Phường 6' },
      { id: '007', name: 'Phường 7' },
      { id: '008', name: 'Phường 8' },
      { id: '009', name: 'Phường 9' },
      { id: '010', name: 'Phường 10' }
    ]);

    // Try to load from API if we have a token
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, using fallback data');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/profile/addresses/wards?districtId=${districtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log('Unauthorized, skipping wards load');
        return;
      }
      
      if (response.status === 404) {
        console.log('Wards endpoint not found, using fallback data');
        // Use fallback data for wards
        setWards([
          { id: '001', name: 'Phường 1' },
          { id: '002', name: 'Phường 2' },
          { id: '003', name: 'Phường 3' },
          { id: '004', name: 'Phường 4' },
          { id: '005', name: 'Phường 5' }
        ]);
        return;
      }
      
      const data = await response.json();
      if (data.code === 1000) {
        setWards(data.result || []);
      }
    } catch (error) {
      console.error('Error loading wards:', error);
      // Use fallback data on error
      setWards([
        { id: '001', name: 'Phường 1' },
        { id: '002', name: 'Phường 2' },
        { id: '003', name: 'Phường 3' }
      ]);
    }
  };

  // Validate birth date based on grade
  const validateBirthDate = (birthDate: string, grade: string) => {
    if (!birthDate || !grade) return '';

    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const gradeNum = parseInt(grade);

    // Calculate expected birth year based on grade
    // Assuming students start grade 1 at age 6
    const expectedBirthYear = currentYear - (6 + gradeNum - 1);
    const minBirthYear = expectedBirthYear - 1; // Allow 1 year variation
    const maxBirthYear = expectedBirthYear + 1;

    if (birthYear < minBirthYear || birthYear > maxBirthYear) {
      return `Năm sinh không phù hợp với lớp ${grade}. Năm sinh dự kiến: ${expectedBirthYear}`;
    }

    if (birthYear > currentYear) {
      return 'Năm sinh không thể là tương lai';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updateCurrentProfile(formData);
      router.push('/profile');
    } catch (error) {
      console.error('Error completing profile:', error);
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle address cascading
    if (field === 'province') {
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      setDistricts([]);
      setWards([]);
      if (value) {
        loadDistricts(value);
      }
    } else if (field === 'district') {
      setFormData(prev => ({ ...prev, ward: '' }));
      setWards([]);
      if (value) {
        loadWards(value);
      }
    }

    // Validate birth date when grade or birth date changes
    if (field === 'birthDate' || field === 'grade') {
      const birthDate = field === 'birthDate' ? value : formData.birthDate;
      const grade = field === 'grade' ? value : formData.grade;
      
      if (birthDate && grade) {
        const error = validateBirthDate(birthDate, grade);
        if (error) {
          setErrors(prev => ({ ...prev, birthDate: error }));
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
                <Label htmlFor="birthDate" className="text-purple-200">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="bg-black/30 border-purple-500/30 text-white"
                />
                {errors.birthDate && (
                  <p className="text-red-400 text-sm">{errors.birthDate}</p>
                )}
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
                  <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                    <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(provinces) && provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
      </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-purple-200">Quận/Huyện *</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => handleInputChange('district', value)}
                    disabled={!formData.province}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(districts) && districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-purple-200">Phường/Xã *</Label>
                  <Select 
                    value={formData.ward} 
                    onValueChange={(value) => handleInputChange('ward', value)}
                    disabled={!formData.district}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30 text-white">
                      <SelectValue placeholder="Chọn phường/xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(wards) && wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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