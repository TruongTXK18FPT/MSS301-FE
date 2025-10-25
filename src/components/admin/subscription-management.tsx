'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  Crown,
  Zap
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockSubscriptions = [
  {
    id: 1,
    name: 'Basic',
    description: 'Gói cơ bản cho cá nhân và nhóm nhỏ',
    price: 0,
    billingCycle: 'monthly',
    maxUsers: 100,
    maxClassrooms: 10,
    features: [
      'Tạo lớp học cơ bản',
      'Quản lý học sinh',
      'Tạo bài tập đơn giản',
      'Hỗ trợ email'
    ],
    isActive: true,
    isPopular: false,
    tenantCount: 15,
    createdAt: '2024-01-01',
    color: 'blue'
  },
  {
    id: 2,
    name: 'Premium',
    description: 'Gói nâng cao cho trường học và tổ chức',
    price: 29.99,
    billingCycle: 'monthly',
    maxUsers: 1000,
    maxClassrooms: 100,
    features: [
      'Tất cả tính năng Basic',
      'Analytics chi tiết',
      'Custom branding',
      'API access',
      'Hỗ trợ ưu tiên',
      'Tích hợp bên thứ 3'
    ],
    isActive: true,
    isPopular: true,
    tenantCount: 8,
    createdAt: '2024-01-01',
    color: 'purple'
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'Gói doanh nghiệp với tính năng đầy đủ',
    price: 99.99,
    billingCycle: 'monthly',
    maxUsers: 10000,
    maxClassrooms: 1000,
    features: [
      'Tất cả tính năng Premium',
      'White label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'On-premise deployment'
    ],
    isActive: true,
    isPopular: false,
    tenantCount: 3,
    createdAt: '2024-01-01',
    color: 'green'
  },
  {
    id: 4,
    name: 'Starter',
    description: 'Gói khởi đầu cho người mới',
    price: 9.99,
    billingCycle: 'monthly',
    maxUsers: 50,
    maxClassrooms: 5,
    features: [
      'Tạo lớp học cơ bản',
      'Quản lý học sinh',
      'Hỗ trợ email'
    ],
    isActive: false,
    isPopular: false,
    tenantCount: 0,
    createdAt: '2024-01-15',
    color: 'yellow'
  }
];

const billingCycles = [
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'yearly', label: 'Hàng năm' },
  { value: 'lifetime', label: 'Trọn đời' }
];

const colors = [
  { value: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
  { value: 'purple', label: 'Tím', class: 'bg-purple-500' },
  { value: 'green', label: 'Xanh lá', class: 'bg-green-500' },
  { value: 'yellow', label: 'Vàng', class: 'bg-yellow-500' },
  { value: 'red', label: 'Đỏ', class: 'bg-red-500' },
  { value: 'pink', label: 'Hồng', class: 'bg-pink-500' }
];

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  // Filter subscriptions
  useEffect(() => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => 
        statusFilter === 'active' ? sub.isActive : !sub.isActive
      );
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter]);

  const handleDeleteSubscription = (subscriptionId: number) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
  };

  const handleToggleStatus = (subscriptionId: number) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, isActive: !sub.isActive }
        : sub
    ));
  };

  const handleTogglePopular = (subscriptionId: number) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, isPopular: !sub.isPopular }
        : sub
    ));
  };

  const handleCreateSubscription = (subscriptionData: any) => {
    const newSubscription = {
      id: Math.max(...subscriptions.map(s => s.id)) + 1,
      ...subscriptionData,
      tenantCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSubscriptions([...subscriptions, newSubscription]);
    setIsCreateDialogOpen(false);
  };

  const handleEditSubscription = (subscriptionData: any) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === selectedSubscription.id 
        ? { ...sub, ...subscriptionData }
        : sub
    ));
    setIsEditDialogOpen(false);
    setSelectedSubscription(null);
  };

  const getColorClass = (color: string) => {
    const colorObj = colors.find(c => c.value === color);
    return colorObj?.class || 'bg-gray-500';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatPrice = (price: number, billingCycle: string) => {
    if (price === 0) return 'Miễn phí';
    const symbol = billingCycle === 'yearly' ? '/năm' : '/tháng';
    return `$${price}${symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Subscription</h2>
          <p className="text-slate-400">Quản lý các gói đăng ký trong hệ thống</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Gói mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng gói</p>
                <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Đang hoạt động</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptions.filter(s => s.isActive).length}
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
                <p className="text-sm text-slate-400">Tổng tenants</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptions.reduce((sum, s) => sum + s.tenantCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Doanh thu/tháng</p>
                <p className="text-2xl font-bold text-white">
                  ${subscriptions.reduce((sum, s) => sum + (s.price * s.tenantCount), 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm gói đăng ký..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <Card 
            key={subscription.id} 
            className={`bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 ${
              subscription.isPopular ? 'ring-2 ring-purple-500/30' : ''
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${getColorClass(subscription.color)} rounded-lg flex items-center justify-center`}>
                    {subscription.name === 'Basic' && <Star className="w-6 h-6 text-white" />}
                    {subscription.name === 'Premium' && <Crown className="w-6 h-6 text-white" />}
                    {subscription.name === 'Enterprise' && <Zap className="w-6 h-6 text-white" />}
                    {subscription.name === 'Starter' && <CreditCard className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      {subscription.name}
                      {subscription.isPopular && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          Phổ biến
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {subscription.description}
                    </CardDescription>
                  </div>
                </div>
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
                        setSelectedSubscription(subscription);
                        setIsEditDialogOpen(true);
                      }}
                      className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleStatus(subscription.id)}
                      className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                    >
                      {subscription.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Vô hiệu hóa
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Kích hoạt
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleTogglePopular(subscription.id)}
                      className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {subscription.isPopular ? 'Bỏ phổ biến' : 'Đánh dấu phổ biến'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-500/20" />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {formatPrice(subscription.price, subscription.billingCycle)}
                </div>
                <div className="text-sm text-slate-400">
                  {billingCycles.find(bc => bc.value === subscription.billingCycle)?.label}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{subscription.maxUsers.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Users tối đa</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{subscription.maxClassrooms}</div>
                  <div className="text-xs text-slate-400">Lớp học tối đa</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Tính năng:</h4>
                <ul className="space-y-1">
                  {subscription.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-xs text-slate-400 flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {subscription.features.length > 3 && (
                    <li className="text-xs text-slate-500">
                      +{subscription.features.length - 3} tính năng khác
                    </li>
                  )}
                </ul>
              </div>

              {/* Status & Tenants */}
              <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(subscription.isActive)}
                >
                  {subscription.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
                <div className="text-sm text-slate-400">
                  {subscription.tenantCount} tenants
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Subscription Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Gói đăng ký mới</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tạo gói đăng ký mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Tên gói</Label>
                <Input
                  id="name"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Nhập tên gói"
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-slate-300">Màu sắc</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${color.class} rounded`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-300">Mô tả</Label>
              <Input
                id="description"
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập mô tả gói"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-slate-300">Giá ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="billingCycle" className="text-slate-300">Chu kỳ thanh toán</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map(cycle => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxUsers" className="text-slate-300">Users tối đa</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="maxClassrooms" className="text-slate-300">Lớp học tối đa</Label>
              <Input
                id="maxClassrooms"
                type="number"
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="isActive" defaultChecked />
                <Label htmlFor="isActive" className="text-slate-300">Kích hoạt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isPopular" />
                <Label htmlFor="isPopular" className="text-slate-300">Phổ biến</Label>
              </div>
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
              onClick={() => handleCreateSubscription({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Tạo Gói
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Gói đăng ký</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cập nhật thông tin gói đăng ký
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-slate-300">Tên gói</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedSubscription?.name}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-color" className="text-slate-300">Màu sắc</Label>
                <Select defaultValue={selectedSubscription?.color}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${color.class} rounded`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-slate-300">Mô tả</Label>
              <Input
                id="edit-description"
                defaultValue={selectedSubscription?.description}
                className="bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price" className="text-slate-300">Giá ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  defaultValue={selectedSubscription?.price}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-billingCycle" className="text-slate-300">Chu kỳ thanh toán</Label>
                <Select defaultValue={selectedSubscription?.billingCycle}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map(cycle => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-maxUsers" className="text-slate-300">Users tối đa</Label>
                <Input
                  id="edit-maxUsers"
                  type="number"
                  defaultValue={selectedSubscription?.maxUsers}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-maxClassrooms" className="text-slate-300">Lớp học tối đa</Label>
              <Input
                id="edit-maxClassrooms"
                type="number"
                defaultValue={selectedSubscription?.maxClassrooms}
                className="bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-isActive" 
                  defaultChecked={selectedSubscription?.isActive}
                />
                <Label htmlFor="edit-isActive" className="text-slate-300">Kích hoạt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-isPopular" 
                  defaultChecked={selectedSubscription?.isPopular}
                />
                <Label htmlFor="edit-isPopular" className="text-slate-300">Phổ biến</Label>
              </div>
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
              onClick={() => handleEditSubscription({})}
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
