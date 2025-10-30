'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Shield, Users } from 'lucide-react';

interface ClassroomOverviewProps {
  classroom: any;
}

export default function ClassroomOverview({ classroom }: ClassroomOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Classroom Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin lớp học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Số lượng học sinh</p>
                <p className="text-2xl font-bold">{classroom.studentCount || 0}/{classroom.maxStudents || 50}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Trạng thái</p>
                <p className="text-lg font-semibold">
                  {classroom.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ngày tạo</p>
                <p className="text-sm">
                  {new Date(classroom.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cập nhật lần cuối</p>
                <p className="text-sm">
                  {new Date(classroom.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {classroom.joinCode && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Mã tham gia lớp học</p>
              <div className="flex items-center gap-2">
                <code className="px-4 py-2 bg-muted rounded-md text-lg font-mono font-bold">
                  {classroom.joinCode}
                </code>
                <p className="text-sm text-muted-foreground">
                  Chia sẻ mã này để học sinh tham gia
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chưa có hoạt động nào
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tỷ lệ hoàn thành bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Trung bình các bài tập
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Điểm trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0.0</p>
            <p className="text-xs text-muted-foreground mt-1">
              Trên thang điểm 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tài liệu học tập</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classroom.mindmapCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Mindmaps và bài giảng
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
