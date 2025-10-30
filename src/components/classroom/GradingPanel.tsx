'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, Eye, 
  Edit, Save, Award, Filter 
} from 'lucide-react';

interface GradingPanelProps {
  classroomId: number;
}

export default function GradingPanel({ classroomId }: GradingPanelProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  useEffect(() => {
    setSubmissions([
      {
        id: 1,
        studentName: 'Nguyễn Văn A',
        assignmentTitle: 'Bài tập về phương trình bậc 2',
        submittedAt: new Date(),
        status: 'pending',
        score: null,
      },
      {
        id: 2,
        studentName: 'Trần Thị B',
        assignmentTitle: 'Quiz: Hàm số bậc nhất',
        submittedAt: new Date(Date.now() - 86400000),
        status: 'graded',
        score: 8.5,
      },
    ]);
  }, [classroomId]);

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
    setGradeDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    try {
      setLoading(true);
      // TODO: Implement grading API
      console.log('Saving grade:', {
        submissionId: selectedSubmission.id,
        score: parseFloat(score),
        feedback,
      });

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === selectedSubmission.id
            ? { ...sub, score: parseFloat(score), feedback, status: 'graded' }
            : sub
        )
      );

      setGradeDialogOpen(false);
      alert('Chấm điểm thành công!');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Chấm điểm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Chờ chấm</Badge>;
      case 'graded':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" /> Đã chấm</Badge>;
      case 'late':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Nộp muộn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Chờ chấm điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đã chấm điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{gradedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {gradedCount > 0
                ? (submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / gradedCount).toFixed(1)
                : '0.0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách bài nộp</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ chấm</SelectItem>
                <SelectItem value="graded">Đã chấm</SelectItem>
                <SelectItem value="late">Nộp muộn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không có bài nộp nào</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Bài tập</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-center">Điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.studentName}</TableCell>
                      <TableCell>{submission.assignmentTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-center">
                        {submission.score !== null ? (
                          <div className="inline-flex items-center gap-1 font-semibold">
                            <Award className="w-4 h-4 text-yellow-500" />
                            {submission.score}/10
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chấm điểm bài nộp</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSubmission && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Học sinh</p>
                    <p className="font-medium">{selectedSubmission.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bài tập</p>
                    <p className="font-medium">{selectedSubmission.assignmentTitle}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Điểm (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Nhập điểm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nhận xét</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học sinh..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveGrade} disabled={loading || !score}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu điểm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
