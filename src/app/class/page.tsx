'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  Clock, 
  TrendingUp, 
  MessageCircle, 
  FileText, 
  Star,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  Target
} from "lucide-react";
import { useState } from "react";

// Mock data
const classData = {
  name: "Toán 9A",
  teacher: "Cô Nguyễn Thị Hoa",
  students: 32,
  avgProgress: 78,
  nextClass: "Thứ 3, 14:00",
  subject: "Toán học"
};

const students = [
  { id: 1, name: "Nguyễn Văn An", avatar: "/api/placeholder/32/32", progress: 85, lastActive: "2 giờ trước", grade: "A" },
  { id: 2, name: "Trần Thị Bình", avatar: "/api/placeholder/32/32", progress: 92, lastActive: "1 giờ trước", grade: "A+" },
  { id: 3, name: "Lê Văn Cường", avatar: "/api/placeholder/32/32", progress: 67, lastActive: "1 ngày trước", grade: "B" },
  { id: 4, name: "Phạm Thị Dung", avatar: "/api/placeholder/32/32", progress: 88, lastActive: "3 giờ trước", grade: "A" },
  { id: 5, name: "Hoàng Văn Thành", avatar: "/api/placeholder/32/32", progress: 45, lastActive: "2 ngày trước", grade: "C" },
];

const assignments = [
  { id: 1, title: "Bài tập Phương trình bậc 2", dueDate: "25/09/2024", submitted: 28, total: 32, status: "active" },
  { id: 2, title: "Kiểm tra giữa kỳ", dueDate: "30/09/2024", submitted: 0, total: 32, status: "upcoming" },
  { id: 3, title: "Luyện tập Hệ phương trình", dueDate: "20/09/2024", submitted: 32, total: 32, status: "completed" },
];

const recentActivities = [
  { id: 1, student: "Trần Thị Bình", action: "hoàn thành bài tập", subject: "Phương trình bậc 2", time: "1 giờ trước" },
  { id: 2, student: "Nguyễn Văn An", action: "tạo mindmap", subject: "Hàm số", time: "2 giờ trước" },
  { id: 3, student: "Phạm Thị Dung", action: "đặt câu hỏi", subject: "Hình học", time: "3 giờ trước" },
];

export default function ClassPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Floating Academic Icons */}
        <div className="absolute inset-0">
          {[GraduationCap, BookOpen, Award, Users].map((Icon, i) => (
            <div
              key={`academic-${i}`}
              className="absolute opacity-10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            >
              <Icon className="size-8 text-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-gradient">
                  {classData.name}
                </h1>
                <p className="text-emerald-200/80">{classData.teacher} • {classData.subject}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl">
                <Plus className="size-4 mr-2" />
                Tạo bài tập
              </Button>
              <Button variant="outline" className="bg-black/30 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 rounded-xl">
                <Settings className="size-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200/70 text-sm">Tổng học sinh</p>
                  <p className="text-2xl font-bold text-white">{classData.students}</p>
                </div>
                <Users className="size-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-teal-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200/70 text-sm">Tiến độ trung bình</p>
                  <p className="text-2xl font-bold text-white">{classData.avgProgress}%</p>
                </div>
                <TrendingUp className="size-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/70 text-sm">Bài tập đang làm</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
                <FileText className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200/70 text-sm">Lớp tiếp theo</p>
                  <p className="text-lg font-bold text-white">{classData.nextClass}</p>
                </div>
                <Clock className="size-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview", label: "Tổng quan", icon: BarChart3 },
            { id: "students", label: "Học sinh", icon: Users },
            { id: "assignments", label: "Bài tập", icon: FileText },
            { id: "activities", label: "Hoạt động", icon: MessageCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    : "bg-black/30 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20"
                }`}
              >
                <Icon className="size-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "students" && (
              <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="size-5 text-emerald-400" />
                    Danh sách học sinh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-emerald-400/30">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-300">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{student.name}</p>
                            <p className="text-sm text-emerald-200/60">Hoạt động: {student.lastActive}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{student.progress}%</p>
                            <Progress value={student.progress} className="w-20" />
                          </div>
                          <Badge className={`
                            ${student.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : ''}
                            ${student.grade === 'A' ? 'bg-teal-500/20 text-teal-300 border-teal-400/30' : ''}
                            ${student.grade === 'B' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : ''}
                            ${student.grade === 'C' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' : ''}
                          `}>
                            {student.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "assignments" && (
              <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="size-5 text-emerald-400" />
                    Bài tập và đánh giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="p-4 bg-black/30 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{assignment.title}</h3>
                            <p className="text-sm text-emerald-200/60">Hạn nộp: {assignment.dueDate}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">
                                {assignment.submitted}/{assignment.total} đã nộp
                              </p>
                              <Progress value={(assignment.submitted / assignment.total) * 100} className="w-24" />
                            </div>
                            <Badge className={`
                              ${assignment.status === 'active' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : ''}
                              ${assignment.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' : ''}
                              ${assignment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : ''}
                            `}>
                              {assignment.status === 'active' ? 'Đang diễn ra' : 
                               assignment.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(activeTab === "overview" || activeTab === "activities") && (
              <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="size-5 text-emerald-400" />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-emerald-500/20">
                        <Target className="size-5 text-teal-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-medium">{activity.student}</span> {activity.action} 
                            <span className="text-emerald-300"> {activity.subject}</span>
                          </p>
                          <p className="text-xs text-emerald-200/60">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30">
                  <Plus className="size-4 mr-2" />
                  Tạo bài tập mới
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30">
                  <Calendar className="size-4 mr-2" />
                  Lên lịch kiểm tra
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-200 hover:bg-purple-500/30">
                  <BarChart3 className="size-4 mr-2" />
                  Xem báo cáo
                </Button>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Star className="size-5 text-yellow-400" />
                  Học sinh xuất sắc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.slice(0, 3).map((student, index) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8 border border-emerald-400/30">
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-300 text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{student.name}</p>
                        <p className="text-xs text-emerald-200/60">{student.progress}% hoàn thành</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
