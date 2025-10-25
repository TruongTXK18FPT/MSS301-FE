'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Building2,
  Users,
  Calendar,
  Globe,
  Shield,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Mock data
const mockTenants = [
  {
    id: 1,
    name: 'Trường THPT Nguyễn Du',
    domain: 'nguyendu.edu.vn',
    adminEmail: 'admin@nguyendu.edu.vn',
    adminName: 'Nguyễn Văn Hiệu trưởng',
    status: 'active',
    subscription: 'Premium',
    userCount: 1250,
    classroomCount: 45,
    maxUsers: 2000,
    createdAt: '2024-01-01',
    lastActive: '2024-01-20',
    region: 'Hồ Chí Minh',
    features: ['Analytics', 'Custom Branding', 'API Access']
  },
  {
    id: 2,
    name: 'Trường THCS Lê Lợi',
    domain: 'leloi.edu.vn',
    adminEmail: 'admin@leloi.edu.vn',
    adminName: 'Trần Thị Hiệu trưởng',
    status: 'active',
    subscription: 'Basic',
    userCount: 680,
    classroomCount: 28,
    maxUsers: 1000,
    createdAt: '2024-01-05',
    lastActive: '2024-01-19',
    region: 'Hà Nội',
    features: ['Analytics']
  },
  {
    id: 3,
    name: 'Trường THPT Quốc tế ABC',
    domain: 'abc-international.edu.vn',
    adminEmail: 'admin@abc-international.edu.vn',
    adminName: 'John Smith',
    status: 'active',
    subscription: 'Enterprise',
    userCount: 2100,
    classroomCount: 78,
    maxUsers: 5000,
    createdAt: '2024-01-03',
    lastActive: '2024-01-20',
    region: 'Đà Nẵng',
    features: ['Analytics', 'Custom Branding', 'API Access', 'Priority Support', 'White Label']
  },
  {
    id: 4,
    name: 'Trường THCS Bình Minh',
    domain: 'binhminh.edu.vn',
    adminEmail: 'admin@binhminh.edu.vn',
    adminName: 'Lê Văn Minh',
    status: 'suspended',
    subscription: 'Basic',
    userCount: 320,
    classroomCount: 15,
    maxUsers: 1000,
    createdAt: '2024-01-08',
    lastActive: '2024-01-15',
    region: 'Cần Thơ',
    features: ['Analytics']
  }
];

const subscriptionOptions = [
  { value: 'Basic', label: 'Basic', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'Premium', label: 'Premium', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'Enterprise', label: 'Enterprise', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
];

const statusOptions = [
  { value: 'active', label: 'Hoạt động', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'suspended', label: 'Tạm khóa', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'inactive', label: 'Không hoạt động', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
];

export default function TenantManagement() {
  const [tenants, setTenants] = useState(mockTenants);
  const [filteredTenants, setFilteredTenants] = useState(mockTenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Filter tenants
  useEffect(() => {
    let filtered = tenants;

    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription === subscriptionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === statusFilter);
    }

    setFilteredTenants(filtered);
  }, [tenants, searchTerm, subscriptionFilter, statusFilter]);

  const handleDeleteTenant = (tenantId: number) => {
    setTenants(tenants.filter(tenant => tenant.id !== tenantId));
  };

  const handleToggleStatus = (tenantId: number) => {
    setTenants(tenants.map(tenant => 
      tenant.id === tenantId 
        ? { 
            ...tenant, 
            status: tenant.status === 'active' ? 'suspended' : 'active' 
          }
        : tenant
    ));
  };

  const handleCreateTenant = (tenantData: any) => {
    const newTenant = {
      id: Math.max(...tenants.map(t => t.id)) + 1,
      ...tenantData,
      userCount: 0,
      classroomCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      features: tenantData.subscription === 'Basic' ? ['Analytics'] :
                tenantData.subscription === 'Premium' ? ['Analytics', 'Custom Branding', 'API Access'] :
                ['Analytics', 'Custom Branding', 'API Access', 'Priority Support', 'White Label']
    };
    setTenants([...tenants, newTenant]);
    setIsCreateDialogOpen(false);
  };

  const handleEditTenant = (tenantData: any) => {
    setTenants(tenants.map(tenant => 
      tenant.id === selectedTenant.id 
        ? { ...tenant, ...tenantData }
        : tenant
    ));
    setIsEditDialogOpen(false);
    setSelectedTenant(null);
  };

  const getSubscriptionColor = (subscription: string) => {
    const option = subscriptionOptions.find(opt => opt.value === subscription);
    return option?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Tenant</h2>
          <p className="text-slate-400">Quản lý các tổ chức trong hệ thống</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng Tenants</p>
                <p className="text-2xl font-bold text-white">{tenants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Hoạt động</p>
                <p className="text-2xl font-bold text-white">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng Users</p>
                <p className="text-2xl font-bold text-white">
                  {tenants.reduce((sum, t) => sum + t.userCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Enterprise</p>
                <p className="text-2xl font-bold text-white">
                  {tenants.filter(t => t.subscription === 'Enterprise').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn gói đăng ký" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả gói</SelectItem>
                {subscriptionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Danh sách Tenants</CardTitle>
          <CardDescription className="text-slate-400">
            Hiển thị {filteredTenants.length} trong tổng số {tenants.length} tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/20">
                <TableHead className="text-slate-300">Tổ chức</TableHead>
                <TableHead className="text-slate-300">Admin</TableHead>
                <TableHead className="text-slate-300">Gói đăng ký</TableHead>
                <TableHead className="text-slate-300">Thống kê</TableHead>
                <TableHead className="text-slate-300">Trạng thái</TableHead>
                <TableHead className="text-slate-300">Khu vực</TableHead>
                <TableHead className="text-slate-300">Ngày tạo</TableHead>
                <TableHead className="text-slate-300">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="border-purple-500/10 hover:bg-slate-700/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{tenant.name}</p>
                        <p className="text-sm text-slate-400 flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {tenant.domain}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tenant.features.slice(0, 2).map((feature, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {tenant.features.length > 2 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-slate-500/10 text-slate-300 border-slate-500/30"
                            >
                              +{tenant.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{tenant.adminName}</p>
                      <p className="text-sm text-slate-400">{tenant.adminEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getSubscriptionColor(tenant.subscription)}
                    >
                      {tenant.subscription}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Users:</span>
                        <span className="text-white">
                          {tenant.userCount.toLocaleString()}/{tenant.maxUsers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Lớp học:</span>
                        <span className="text-white">{tenant.classroomCount}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ 
                            width: `${(tenant.userCount / tenant.maxUsers) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(tenant.status)}
                    >
                      {statusOptions.find(opt => opt.value === tenant.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {tenant.region}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                      {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-purple-500/20">
                        <DropdownMenuLabel className="text-white">Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-purple-500/20" />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(tenant.id)}
                          className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                        >
                          {tenant.status === 'active' ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Tạm khóa
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:bg-purple-500/20 hover:text-white">
                          <Settings className="w-4 h-4 mr-2" />
                          Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-purple-500/20" />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Tenant mới</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tạo tổ chức mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Tên tổ chức</Label>
                <Input
                  id="name"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Nhập tên tổ chức"
                />
              </div>
              <div>
                <Label htmlFor="domain" className="text-slate-300">Domain</Label>
                <Input
                  id="domain"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="example.edu.vn"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminName" className="text-slate-300">Tên admin</Label>
                <Input
                  id="adminName"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Nhập tên admin"
                />
              </div>
              <div>
                <Label htmlFor="adminEmail" className="text-slate-300">Email admin</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="admin@example.edu.vn"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscription" className="text-slate-300">Gói đăng ký</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn gói đăng ký" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxUsers" className="text-slate-300">Số users tối đa</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="1000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="region" className="text-slate-300">Khu vực</Label>
              <Input
                id="region"
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Hồ Chí Minh"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
            <Button 
              onClick={() => handleCreateTenant({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Tạo Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Tenant</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cập nhật thông tin tổ chức
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-slate-300">Tên tổ chức</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedTenant?.name}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-domain" className="text-slate-300">Domain</Label>
                <Input
                  id="edit-domain"
                  defaultValue={selectedTenant?.domain}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-adminName" className="text-slate-300">Tên admin</Label>
                <Input
                  id="edit-adminName"
                  defaultValue={selectedTenant?.adminName}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-adminEmail" className="text-slate-300">Email admin</Label>
                <Input
                  id="edit-adminEmail"
                  type="email"
                  defaultValue={selectedTenant?.adminEmail}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subscription" className="text-slate-300">Gói đăng ký</Label>
                <Select defaultValue={selectedTenant?.subscription}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn gói đăng ký" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-maxUsers" className="text-slate-300">Số users tối đa</Label>
                <Input
                  id="edit-maxUsers"
                  type="number"
                  defaultValue={selectedTenant?.maxUsers}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-region" className="text-slate-300">Khu vực</Label>
              <Input
                id="edit-region"
                defaultValue={selectedTenant?.region}
                className="bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
            <Button 
              onClick={() => handleEditTenant({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
