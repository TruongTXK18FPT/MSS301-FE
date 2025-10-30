'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, BookOpen, FileText, ClipboardList, 
  Award, Settings, ArrowLeft, Plus, Eye, 
  Edit, Trash2, Download, Upload 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { classroomService } from '@/lib/services/classroom.service';
import { useAuth } from '@/context/auth-context';

// Sub-components
import {
  ClassroomOverview,
  StudentManagement,
  MindmapManagement,
  QuizManagement,
  AssignmentManagement,
  LessonManagement,
  GradingPanel
} from '@/components/classroom';

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const classroomId = Number(params.id);

  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClassroom();
  }, [classroomId]);

  const loadClassroom = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getClassroomById(classroomId);
      setClassroom(data);
    } catch (error) {
      console.error('Error loading classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Không tìm thấy lớp học</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const isTeacher = auth?.role === 'TEACHER';

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
            <p className="text-muted-foreground">{classroom.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-muted-foreground">
                Mã lớp: <span className="font-mono font-semibold">{classroom.joinCode || 'N/A'}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                classroom.isPublic ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {classroom.isPublic ? 'Công khai' : 'Được bảo vệ'}
              </span>
            </div>
          </div>

          {isTeacher && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classroom.currentStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tối đa {classroom.maxStudents || 50} học sinh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mindmaps</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classroom.contentCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tài liệu học tập
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classroom.assignmentCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classroom.quizCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Kiểm tra trắc nghiệm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
          <TabsTrigger value="mindmaps">Mindmaps</TabsTrigger>
          <TabsTrigger value="lessons">Bài giảng</TabsTrigger>
          <TabsTrigger value="assignments">Bài tập</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz</TabsTrigger>
          {isTeacher && <TabsTrigger value="grading">Chấm điểm</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ClassroomOverview classroom={classroom} />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentManagement classroomId={classroomId} isTeacher={isTeacher} />
        </TabsContent>

        <TabsContent value="mindmaps" className="space-y-4">
          <MindmapManagement classroomId={classroomId} isTeacher={isTeacher} />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <LessonManagement classroomId={classroomId} isTeacher={isTeacher} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <AssignmentManagement classroomId={classroomId} isTeacher={isTeacher} />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <QuizManagement classroomId={classroomId} isTeacher={isTeacher} />
        </TabsContent>

        {isTeacher && (
          <TabsContent value="grading" className="space-y-4">
            <GradingPanel classroomId={classroomId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
