'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, UserCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { profileService } from '@/lib/services';

interface AddStudentModalProps {
  onStudentAdded?: () => void;
}

export default function AddStudentModal({ onStudentAdded }: AddStudentModalProps) {
  const [open, setOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      setError('Vui lòng nhập email học sinh');
      return;
    }

    if (!relationship) {
      setError('Vui lòng chọn mối quan hệ');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await profileService.addStudentToGuardian(studentEmail, relationship);
      
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setStudentEmail('');
        setRelationship('');
        setOpen(false);
        onStudentAdded?.();
      }, 2000);

    } catch (error: any) {
      console.error('Add student failed:', error);
      setError(error.message || 'Không thể thêm học sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
      setSuccess(false);
      setStudentEmail('');
      setRelationship('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Thêm học sinh
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <span>Thêm học sinh quản lý</span>
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Nhập email học sinh và mối quan hệ để gửi lời mời xác nhận
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Đã gửi lời mời xác nhận đến {studentEmail}. Học sinh sẽ nhận được mã xác nhận qua email.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentEmail" className="text-purple-200">Email học sinh</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Nhập email học sinh"
                className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder:text-purple-300"
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-purple-200">Mối quan hệ</Label>
            <Select value={relationship} onValueChange={setRelationship} disabled={loading || success}>
              <SelectTrigger className="bg-black/20 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn mối quan hệ" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-purple-500/30">
                <SelectItem value="Parent" className="text-white hover:bg-purple-500/20">Cha/Mẹ</SelectItem>
                <SelectItem value="Guardian" className="text-white hover:bg-purple-500/20">Người giám hộ</SelectItem>
                <SelectItem value="Relative" className="text-white hover:bg-purple-500/20">Người thân</SelectItem>
                <SelectItem value="Tutor" className="text-white hover:bg-purple-500/20">Gia sư</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleAddStudent}
              disabled={loading || !studentEmail.trim() || !relationship || success}
              className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đã gửi
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi lời mời
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
            <h4 className="text-white font-medium mb-2 text-sm">Quy trình xác nhận:</h4>
            <ul className="text-purple-200 text-xs space-y-1">
              <li>1. Học sinh nhận email với mã xác nhận</li>
              <li>2. Học sinh truy cập trang profile của mình</li>
              <li>3. Click nút "Xác nhận Guardian"</li>
              <li>4. Nhập mã để hoàn tất quan hệ</li>
              <li>5. Mã có hiệu lực trong 24 giờ</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
