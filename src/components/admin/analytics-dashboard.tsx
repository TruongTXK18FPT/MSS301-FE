'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data - trong thực tế sẽ fetch từ API
const userGrowthData = [
  { month: 'T1', users: 1200, teachers: 300, students: 900 },
  { month: 'T2', users: 1450, teachers: 350, students: 1100 },
  { month: 'T3', users: 1680, teachers: 420, students: 1260 },
  { month: 'T4', users: 1920, teachers: 480, students: 1440 },
  { month: 'T5', users: 2150, teachers: 520, students: 1630 },
  { month: 'T6', users: 2380, teachers: 580, students: 1800 },
];

const trafficData = [
  { time: '00:00', visitors: 45, pageViews: 120 },
  { time: '04:00', visitors: 32, pageViews: 85 },
  { time: '08:00', visitors: 180, pageViews: 450 },
  { time: '12:00', visitors: 320, pageViews: 780 },
  { time: '16:00', visitors: 280, pageViews: 650 },
  { time: '20:00', visitors: 150, pageViews: 380 },
];

const classroomStats = [
  { name: 'Lớp Toán', value: 45, color: '#8B5CF6' },
  { name: 'Lớp Lý', value: 30, color: '#06B6D4' },
  { name: 'Lớp Hóa', value: 25, color: '#10B981' },
  { name: 'Lớp Sinh', value: 20, color: '#F59E0B' },
];

const subscriptionData = [
  { name: 'Basic', value: 60, color: '#8B5CF6' },
  { name: 'Premium', value: 30, color: '#06B6D4' },
  { name: 'Enterprise', value: 10, color: '#10B981' },
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: 'Tổng Users',
      value: '2,380',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Lớp học Active',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: GraduationCap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Tenants',
      value: '24',
      change: '+4.1%',
      trend: 'up',
      icon: Building2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+15.3%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card 
              key={index} 
              className={`bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 ${stat.borderColor}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-slate-400">vs tháng trước</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-purple-500/20">
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
            Users
          </TabsTrigger>
          <TabsTrigger value="traffic" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
            Traffic
          </TabsTrigger>
          <TabsTrigger value="classrooms" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
            Lớp học
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span>Tăng trưởng Users</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Biểu đồ tăng trưởng người dùng theo tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #8B5CF6', 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8B5CF6" 
                      fill="url(#colorUsers)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="teachers" 
                      stroke="#06B6D4" 
                      fill="url(#colorTeachers)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#10B981" 
                      fill="url(#colorStudents)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <span>Phân bố Users</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Tỷ lệ các loại người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Students', value: 75, color: '#10B981' },
                        { name: 'Teachers', value: 20, color: '#06B6D4' },
                        { name: 'Admins', value: 5, color: '#8B5CF6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Students', value: 75, color: '#10B981' },
                        { name: 'Teachers', value: 20, color: '#06B6D4' },
                        { name: 'Admins', value: 5, color: '#8B5CF6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #8B5CF6', 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Traffic theo giờ</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Lưu lượng truy cập và page views trong ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #8B5CF6', 
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="#06B6D4" 
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classrooms" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <span>Phân bố Lớp học</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Số lượng lớp học theo môn học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={classroomStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #8B5CF6', 
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {classroomStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>Phân bố Subscription</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tỷ lệ các gói đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #8B5CF6', 
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
