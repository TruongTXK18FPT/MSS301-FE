'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/services/axios";
import { CheckCircle, XCircle, Eye, Clock, User, Mail } from "lucide-react";

interface PendingTeacher {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface TeacherDetails {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  specialization?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  bio?: string;
  approvalStatus?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function TeacherRegistrationsPage() {
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectingTeacherId, setRejectingTeacherId] = useState<string | null>(null);
  const [rejectingTeacherEmail, setRejectingTeacherEmail] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const response = await authApi.get('/users/pending-teachers');
      if (response.data.code === 1000) {
        setPendingTeachers(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      toast({ description: 'Lỗi khi tải danh sách đăng ký giáo viên', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherDetails = async (userId: string) => {
    try {
      // Fetch teacher profile details from profile-service
      const response = await fetch(`http://localhost:8080/api/v1/profile/admin/teachers/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 1000 && data.result) {
          setSelectedTeacher(data.result);
          setShowDetailsDialog(true);
        } else {
          toast({ description: 'Không tìm thấy thông tin giáo viên', variant: 'destructive' });
        }
      } else {
        toast({ description: 'Lỗi khi tải thông tin giáo viên', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      toast({ description: 'Lỗi khi tải thông tin giáo viên', variant: 'destructive' });
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await authApi.post(`/users/${userId}/teacher-approval`, {
        action: 'APPROVE'
      });
      
      if (response.data.code === 1000) {
        toast({ description: 'Đã duyệt đơn đăng ký giáo viên thành công' });
        fetchPendingTeachers();
      } else {
        toast({ description: response.data.message || 'Lỗi khi duyệt đơn', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast({ description: 'Lỗi khi duyệt đơn đăng ký', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      toast({ description: 'Vui lòng nhập lý do từ chối', variant: 'destructive' });
      return;
    }

    setActionLoading(userId);
    try {
      const response = await authApi.post(`/users/${userId}/teacher-approval`, {
        action: 'REJECT',
        rejectionReason: rejectionReason
      });
      
      if (response.data.code === 1000) {
        toast({ description: 'Đã từ chối đơn đăng ký giáo viên' });
        fetchPendingTeachers();
        setShowRejectDialog(false);
        setRejectionReason('');
        setRejectingTeacherId(null);
        setRejectingTeacherEmail('');
      } else {
        toast({ description: response.data.message || 'Lỗi khi từ chối đơn', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast({ description: 'Lỗi khi từ chối đơn đăng ký', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="border-green-500 text-green-500">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="border-red-500 text-red-500">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Không xác định</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý đơn đăng ký giáo viên</h1>
          <p className="text-gray-300">Xem xét và duyệt các đơn đăng ký giáo viên mới</p>
        </div>

        <div className="grid gap-6">
          {pendingTeachers.length === 0 ? (
            <Card className="bg-black/30 backdrop-blur-xl border border-pink-500/30">
              <CardContent className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Không có đơn đăng ký nào</h3>
                <p className="text-gray-400">Hiện tại không có đơn đăng ký giáo viên nào đang chờ duyệt.</p>
              </CardContent>
            </Card>
          ) : (
            pendingTeachers.map((teacher) => (
              <Card key={teacher.id} className="bg-black/30 backdrop-blur-xl border border-pink-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20">
                        <User className="h-6 w-6 text-pink-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{teacher.email}</CardTitle>
                        <CardDescription className="text-gray-300">
                          Đăng ký lúc: {formatDate(teacher.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Chờ duyệt
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{teacher.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchTeacherDetails(teacher.id)}
                          className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/90 border border-pink-500/30 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center justify-between">
                            <span>Chi tiết đơn đăng ký giáo viên</span>
                            {selectedTeacher && getApprovalStatusBadge(selectedTeacher.approvalStatus)}
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Thông tin chi tiết của đơn đăng ký giáo viên
                          </DialogDescription>
                        </DialogHeader>
                        {selectedTeacher ? (
                          <div className="space-y-4 text-white">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-400">Họ và tên:</p>
                                <p className="font-semibold">{selectedTeacher.fullName || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Email:</p>
                                <p className="font-semibold">{selectedTeacher.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Số điện thoại:</p>
                                <p className="font-semibold">{selectedTeacher.phoneNumber || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Địa chỉ:</p>
                                <p className="font-semibold">{selectedTeacher.address || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Tổ/Bộ môn:</p>
                                <p className="font-semibold">{selectedTeacher.department || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Chuyên môn:</p>
                                <p className="font-semibold">{selectedTeacher.specialization || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Kinh nghiệm:</p>
                                <p className="font-semibold">{selectedTeacher.yearsOfExperience || 0} năm</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Ngày đăng ký:</p>
                                <p className="font-semibold">{formatDate(selectedTeacher.createdAt)}</p>
                              </div>
                            </div>
                            {selectedTeacher.qualifications && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Trình độ/Chứng chỉ:</p>
                                <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                  {selectedTeacher.qualifications}
                                </p>
                              </div>
                            )}
                            {selectedTeacher.bio && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Giới thiệu:</p>
                                <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                  {selectedTeacher.bio}
                                </p>
                              </div>
                            )}
                            {selectedTeacher.rejectionReason && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Lý do từ chối:</p>
                                <p className="text-red-300 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                                  {selectedTeacher.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowDetailsDialog(false);
                              setSelectedTeacher(null);
                            }}
                            className="border-gray-500 text-gray-300"
                          >
                            Đóng
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      onClick={() => handleApprove(teacher.id)}
                      disabled={actionLoading === teacher.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading === teacher.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Duyệt
                    </Button>
                    
                    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setRejectingTeacherId(teacher.id);
                            setRejectingTeacherEmail(teacher.email);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/90 border border-pink-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Từ chối đơn đăng ký giáo viên</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Vui lòng nhập lý do từ chối cho giáo viên: {rejectingTeacherEmail}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reason" className="text-white">Lý do từ chối</Label>
                            <Textarea
                              id="reason"
                              placeholder="Nhập lý do từ chối..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="bg-black/40 border-purple-400/30 text-white mt-2"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowRejectDialog(false);
                              setRejectionReason('');
                              setRejectingTeacherId(null);
                              setRejectingTeacherEmail('');
                            }}
                            className="border-gray-500 text-gray-300"
                          >
                            Hủy
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => rejectingTeacherId && handleReject(rejectingTeacherId)}
                            disabled={actionLoading === rejectingTeacherId}
                          >
                            {actionLoading === rejectingTeacherId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : null}
                            Từ chối
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
