'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Eye, Edit, Trash2, 
  Share2, BookOpen, Clock 
} from 'lucide-react';
import { mindmapService } from '@/lib/services/mindmapService';

interface MindmapManagementProps {
  classroomId: number;
  isTeacher: boolean;
}

export default function MindmapManagement({ classroomId, isTeacher }: MindmapManagementProps) {
  const router = useRouter();
  const [mindmaps, setMindmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMindmaps();
  }, [classroomId]);

  const loadMindmaps = async () => {
    try {
      setLoading(true);
      // TODO: Implement classroomService.getClassroomMindmaps
      // For now, using mock data
      setMindmaps([]);
    } catch (error) {
      console.error('Error loading mindmaps:', error);
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
                      <Badge variant={mindmap.isPublic ? 'default' : 'secondary'}>
                        {mindmap.isPublic ? 'Công khai' : 'Riêng tư'}
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
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMindmap(mindmap.id)}
                            className="text-destructive hover:text-destructive"
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
    </div>
  );
}
