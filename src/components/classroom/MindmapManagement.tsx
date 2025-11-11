'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, Search, Eye, Edit, Trash2, 
  Share2, BookOpen, Clock, Globe, Lock 
} from 'lucide-react';
import { mindmapService } from '@/lib/services/mindmapService';
import { classroomService } from '@/lib/services/classroom.service';
import { useToast } from '@/hooks/use-toast';

interface MindmapManagementProps {
  classroomId: number;
  isTeacher: boolean;
}

export default function MindmapManagement({ classroomId, isTeacher }: MindmapManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mindmaps, setMindmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<any | null>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
  const [selectedClassroomToAttach, setSelectedClassroomToAttach] = useState<string>('');
  const [isAttaching, setIsAttaching] = useState(false);

  useEffect(() => {
    loadMindmaps();
    if (isTeacher) {
      loadAvailableClassrooms();
    }
  }, [classroomId]);

  const loadAvailableClassrooms = async () => {
    try {
      const classrooms = await classroomService.getMyClassrooms();
      setAvailableClassrooms(classrooms.filter((c: any) => c.id !== classroomId));
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
  };

  const loadMindmaps = async () => {
    try {
      setLoading(true);
      
      // Get classroom contents filtered by RESOURCE type (mindmaps)
      const contents = await classroomService.getClassroomContents(classroomId, !isTeacher);
      const mindmapContents = contents.filter((item: any) => item.type === 'RESOURCE');
      
      // Fetch full mindmap details from mindmap-service
      const mindmapDetails = await Promise.all(
        mindmapContents.map(async (content: any) => {
          try {
            // content.contentId is the mindmap ID
            const mindmap = await mindmapService.viewMindmap(content.contentId);
            return {
              ...mindmap,
              classroomContentId: content.id, // Keep reference to classroom content link
              publishAt: content.publishAt,
              dueAt: content.dueAt,
            };
          } catch (error) {
            console.error(`Error loading mindmap ${content.contentId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out failed loads
      const validMindmaps = mindmapDetails.filter((m): m is NonNullable<typeof m> => m !== null);
      setMindmaps(validMindmaps);
      
      console.log('[MindmapManagement] Loaded classroom mindmaps:', validMindmaps);
    } catch (error) {
      console.error('Error loading mindmaps:', error);
      setMindmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMindmap = () => {
    router.push(`/mindmap/create?classroomId=${classroomId}`);
  };

  const handleViewMindmap = (mindmapId: number) => {
    router.push(`/mindmap/${mindmapId}`);
  };

  const handleDeleteMindmap = async (mindmapId: number) => {
    if (!confirm('Bạn có chắc muốn xóa mindmap này?')) return;

    try {
      await mindmapService.deleteMindmap(mindmapId);
      await loadMindmaps();
    } catch (error) {
      console.error('Error deleting mindmap:', error);
      alert('Xóa mindmap thất bại');
    }
  };

  const handleToggleVisibility = async () => {
    if (!selectedMindmap) return;
    
    try {
      setIsTogglingVisibility(true);
      const newVisibility = selectedMindmap.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
      
      // Update on server
      await mindmapService.updateMindmap(selectedMindmap.id, { 
        title: selectedMindmap.title,
        visibility: newVisibility 
      });
      
      // Update local state immediately
      setMindmaps(prev => prev.map(m => 
        m.id === selectedMindmap.id 
          ? { ...m, visibility: newVisibility }
          : m
      ));
      
      // Show success toast
      toast({
        title: newVisibility === 'PUBLIC' ? '✅ Đã chuyển sang Công khai' : '🔒 Đã chuyển sang Riêng tư',
        description: newVisibility === 'PUBLIC' 
          ? 'Mindmap của bạn giờ đây có thể được mọi người xem' 
          : 'Mindmap của bạn giờ đây chỉ bạn có thể xem',
        duration: 3000,
      });
      
      // Close dialog
      setShowVisibilityDialog(false);
      setSelectedMindmap(null);
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Không thể thay đổi chế độ hiển thị. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const openVisibilityDialog = (mindmap: any) => {
    setSelectedMindmap(mindmap);
    setShowVisibilityDialog(true);
  };

  const openAttachDialog = (mindmap: any) => {
    setSelectedMindmap(mindmap);
    setShowAttachDialog(true);
    setSelectedClassroomToAttach('');
  };

  const handleAttachToClassroom = async () => {
    if (!selectedMindmap || !selectedClassroomToAttach) return;
    
    try {
      setIsAttaching(true);
      const targetClassroomId = parseInt(selectedClassroomToAttach);
      
      // Attach mindmap to selected classroom
      await classroomService.attachContent(targetClassroomId, {
        contentId: selectedMindmap.id,
        type: 'RESOURCE',
        visible: true,
        orderIndex: 0
      });
      
      toast({
        title: '✅ Đã thêm vào lớp học',
        description: 'Mindmap đã được thêm vào lớp học thành công',
        duration: 3000,
      });
      
      setShowAttachDialog(false);
      setSelectedMindmap(null);
    } catch (error: any) {
      console.error('Error attaching mindmap:', error);
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể thêm mindmap vào lớp học',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsAttaching(false);
    }
  };

  const filteredMindmaps = mindmaps.filter(mindmap =>
    mindmap.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mindmap.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mindmaps ({mindmaps.length})</CardTitle>
            {isTeacher && (
              <Button onClick={handleCreateMindmap}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo mindmap mới
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mindmap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mindmaps Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMindmaps.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Không tìm thấy mindmap nào' : 'Chưa có mindmap nào'}
              </p>
              {isTeacher && !searchQuery && (
                <Button onClick={handleCreateMindmap} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mindmap đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMindmaps.map((mindmap) => (
                <Card key={mindmap.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2">
                        {mindmap.title}
                      </CardTitle>
                      <Badge 
                        variant={mindmap.visibility === 'PUBLIC' ? 'default' : 'secondary'}
                        className={mindmap.visibility === 'PUBLIC' ? 'bg-green-500' : 'bg-orange-500'}
                      >
                        {mindmap.visibility === 'PUBLIC' ? (
                          <><Globe className="w-3 h-3 mr-1" />Công khai</>
                        ) : (
                          <><Lock className="w-3 h-3 mr-1" />Riêng tư</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mindmap.description || 'Không có mô tả'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{mindmap.grade}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(mindmap.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewMindmap(mindmap.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem
                      </Button>
                      {isTeacher && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openVisibilityDialog(mindmap)}
                            className={mindmap.visibility === 'PUBLIC' 
                              ? "border-green-500 text-green-600 hover:bg-green-50"
                              : "border-orange-500 text-orange-600 hover:bg-orange-50"
                            }
                            title={mindmap.visibility === 'PUBLIC' ? 'Chuyển sang Riêng tư' : 'Chuyển sang Công khai'}
                          >
                            {mindmap.visibility === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openAttachDialog(mindmap)}
                            title="Chia sẻ vào lớp học"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMindmap(mindmap.id)}
                            className="text-destructive hover:text-destructive"
                            title="Xóa mindmap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility Toggle Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedMindmap?.visibility === 'PUBLIC' ? (
                <><Lock className="h-5 w-5 text-orange-500" /> Chuyển sang Riêng tư</>
              ) : (
                <><Globe className="h-5 w-5 text-green-500" /> Chuyển sang Công khai</>
              )}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedMindmap?.visibility === 'PUBLIC' ? (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn chuyển mindmap <strong>&quot;{selectedMindmap?.title}&quot;</strong> sang <strong className="text-orange-600">Riêng tư</strong>?
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-orange-800">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Sau khi chuyển, chỉ bạn mới có thể xem mindmap này.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn chuyển mindmap <strong>&quot;{selectedMindmap?.title}&quot;</strong> sang <strong className="text-green-600">Công khai</strong>?
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-green-800">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Sau khi chuyển, mọi người đều có thể xem mindmap này.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowVisibilityDialog(false);
                setSelectedMindmap(null);
              }}
              disabled={isTogglingVisibility}
            >
              Hủy
            </Button>
            <Button
              onClick={handleToggleVisibility}
              disabled={isTogglingVisibility}
              className={selectedMindmap?.visibility === 'PUBLIC' 
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
              }
            >
              {isTogglingVisibility ? (
                <>Đang xử lý...</>
              ) : (
                <>Xác nhận</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach to Classroom Dialog */}
      <Dialog open={showAttachDialog} onOpenChange={setShowAttachDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Share2 className="h-5 w-5 text-blue-500" />
              Chia sẻ Mindmap vào Lớp học
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Chọn lớp học để thêm mindmap <strong>&quot;{selectedMindmap?.title}&quot;</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {availableClassrooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Không có lớp học khác</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn lớp học:</label>
                <select
                  value={selectedClassroomToAttach}
                  onChange={(e) => setSelectedClassroomToAttach(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn lớp học --</option>
                  {availableClassrooms.map((classroom: any) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} ({classroom.studentCount || 0} học sinh)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowAttachDialog(false);
                setSelectedMindmap(null);
                setSelectedClassroomToAttach('');
              }}
              disabled={isAttaching}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAttachToClassroom}
              disabled={isAttaching || !selectedClassroomToAttach || availableClassrooms.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isAttaching ? (
                <>Đang thêm...</>
              ) : (
                <><Share2 className="w-4 h-4 mr-2" />Chia sẻ</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
