'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, Search, Calendar, Edit, Trash2, Share, Eye, Lock, Globe, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { mindmapService } from "@/lib/services/mindmapService";
import MindmapCreateForm from "@/components/mindmap/MindmapCreateForm";
import MindmapEditor from "@/components/mindmap/MindmapEditor";
import { useAuth } from "@/context/auth-context";

// Removed hardcoded templates - now only showing user-created mindmaps

export default function MindMapPage() {
  const { id: currentUserId } = useAuth(); // Lấy userId hiện tại
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("my-mindmaps");
  const [brainIcons, setBrainIcons] = useState<Array<{left: string, top: string, animationDelay: string, animationDuration: string}>>([]);

  const [userMindmaps, setUserMindmaps] = useState<any[]>([]);
  const [publicMindmaps, setPublicMindmaps] = useState<any[]>([]);
  const [publicPagination, setPublicPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMindmap, setEditingMindmap] = useState<any>(null);
  const [viewingMindmap, setViewingMindmap] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Generate brain icons positions on client side only to avoid hydration mismatch
    const generatedIcons = new Array(8).fill(null).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${5 + Math.random() * 3}s`
    }));
    setBrainIcons(generatedIcons);
    
    // Fetch user mindmaps
    loadMindmaps();
  }, []);

  useEffect(() => {
    // Load public mindmaps when tab is selected
    if (selectedCategory === 'public') {
      loadPublicMindmaps();
    }
  }, [selectedCategory]);

  const loadMindmaps = async () => {
    try {
      const mindmaps = await mindmapService.getUserMindmaps();
      setUserMindmaps(mindmaps);
    } catch (error) {
      console.error('Failed to load mindmaps:', error);
    }
  };

  const loadPublicMindmaps = async (page: number = 0) => {
    try {
      const result = await mindmapService.getPublicMindmaps(page, 20);
      setPublicMindmaps(result.content || []);
      setPublicPagination({
        page,
        totalPages: result.totalPages || 0,
        totalElements: result.totalElements || 0
      });
    } catch (error) {
      console.error('Failed to load public mindmaps:', error);
    }
  };

  const handleCreateSuccess = (mindmap: any) => {
    setUserMindmaps(prev => [mindmap, ...prev]);
    setShowCreateForm(false);
    setEditingMindmap(mindmap);
  };

  const handleEditMindmap = (mindmap: any) => {
    setEditingMindmap(mindmap);
  };

  const handleViewMindmap = async (mindmap: any) => {
    try {
      // Sử dụng viewMindmap để có thể xem cả mindmap PUBLIC
      const fullMindmap = await mindmapService.viewMindmap(mindmap.id);
      setViewingMindmap(fullMindmap);
    } catch (error) {
      console.error('Failed to load mindmap:', error);
      alert('❌ Không thể xem mindmap này. Vui lòng thử lại.');
    }
  };

  const handleDeleteMindmap = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mindmap này?')) return;
    
    setIsDeleting(true);
    try {
      await mindmapService.deleteMindmap(id);
      setUserMindmaps(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete mindmap:', error);
      alert('Xóa mindmap thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async (mindmap: any) => {
    try {
      const currentVisibility = mindmap.visibility || 'PRIVATE';
      const newVisibility = currentVisibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
      
      await mindmapService.updateMindmap(mindmap.id, {
        title: mindmap.title,
        visibility: newVisibility
      });
      
      // Update local state
      setUserMindmaps(prev => prev.map(m => 
        m.id === mindmap.id 
          ? { ...m, visibility: newVisibility }
          : m
      ));
      
      const message = newVisibility === 'PUBLIC' 
        ? '✅ Đã chuyển sang Công khai' 
        : '🔒 Đã chuyển sang Riêng tư';
      alert(message);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      alert('❌ Có lỗi khi thay đổi chế độ hiển thị');
    }
  };

  const handleCloseEditor = () => {
    setEditingMindmap(null);
    loadMindmaps(); // Reload to get updated data
  };

  const handleCloseViewer = () => {
    setViewingMindmap(null);
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="size-4 text-green-400" />;
      case 'CLASSROOM':
        return <Users className="size-4 text-blue-400" />;
      default:
        return <Lock className="size-4 text-gray-400" />;
    }
  };

  const getVisibilityLabel = (visibility?: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Công khai';
      case 'CLASSROOM':
        return 'Lớp học';
      default:
        return 'Riêng tư';
    }
  };

  const categories = [
    { value: "my-mindmaps", label: "Của tôi" },
    { value: "public", label: "Công khai" }
  ];

  const filteredUserMindmaps = userMindmaps.filter(mindmap =>
    mindmap && 
    mindmap.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublicMindmaps = publicMindmaps.filter(mindmap =>
    mindmap && 
    mindmap.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMindmaps = selectedCategory === 'public' ? filteredPublicMindmaps : filteredUserMindmaps;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Floating Brain Icons */}
        <div className="absolute inset-0">
          {brainIcons.map((icon, index) => (
            <div
              key={`brain-${icon.left}-${icon.top}-${index}`}
              className="absolute opacity-10 animate-float"
              style={{
                left: icon.left,
                top: icon.top,
                animationDelay: icon.animationDelay,
                animationDuration: icon.animationDuration
              }}
            >
              <Brain className="size-8 text-purple-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
              <Brain className="size-12 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient mb-4">
            MindMap Universe
          </h1>
          <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
            Khám phá và tạo những mindmap toán học tuyệt vời. Biến kiến thức phức tạp thành những mạng lưới tri thức dễ hiểu.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm mindmap..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50 rounded-xl h-12 backdrop-blur-sm focus:border-pink-400/50 focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-xl ${
                  selectedCategory === category.value
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-black/30 border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white shadow-lg shadow-pink-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="size-4 mr-2" />
            Tạo mới
          </Button>
        </div>

        {/* User/Public Mindmaps Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Brain className="size-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory === 'public' ? 'Mindmap Công khai' : 'Mindmap của bạn'}
              </h2>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">
                {selectedCategory === 'public' 
                  ? `${publicPagination.totalElements} mindmap công khai`
                  : `${filteredUserMindmaps.length} mindmap`
                }
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentMindmaps.map((mindmap, index) => (
                <Card key={`mindmap-${mindmap.id}-${index}`} className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105 overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${mindmap.color || 'from-pink-500 to-violet-500'}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-white mb-1 group-hover:text-pink-200 transition-colors">
                          {mindmap.title || 'Untitled'}
                        </CardTitle>
                        <CardDescription className="text-pink-200/70 text-sm">
                          {mindmap.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs">
                        Lớp {mindmap.grade || 'N/A'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-pink-200/70 text-sm">
                        <Brain className="size-4" />
                        {Array.isArray(mindmap.nodes) ? mindmap.nodes.length : 0} nodes
                      </div>
                      <div className="flex items-center gap-2 text-pink-200/70 text-sm">
                        <Calendar className="size-4" />
                        {mindmap.lastModified || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleViewMindmap(mindmap)}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg"
                      >
                        <Eye className="size-4 mr-1" />
                        Xem
                      </Button>
                      
                      {/* Chỉ hiện nút Sửa/Xóa cho mindmap của user */}
                      {selectedCategory !== 'public' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleEditMindmap(mindmap)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white rounded-lg"
                          >
                            <Edit className="size-4 mr-1" />
                            Sửa
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteMindmap(mindmap.id)}
                            disabled={isDeleting}
                            className="bg-black/30 border-red-400/30 text-red-300 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Visibility Toggle & Badge - chỉ cho mindmap của user */}
                    <div className="flex items-center justify-between">
                      {selectedCategory !== 'public' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVisibility(mindmap)}
                          className={`flex items-center gap-2 text-xs ${
                            mindmap.visibility === 'PUBLIC'
                              ? 'bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30'
                              : 'bg-orange-500/20 border-orange-400/30 text-orange-300 hover:bg-orange-500/30'
                          }`}
                          title={mindmap.visibility === 'PUBLIC' ? 'Chuyển sang Riêng tư' : 'Chuyển sang Công khai'}
                        >
                          {getVisibilityIcon(mindmap.visibility)}
                          <span>{getVisibilityLabel(mindmap.visibility)}</span>
                        </Button>
                      )}
                      {selectedCategory === 'public' && (
                        <div className="flex items-center gap-2 text-xs text-green-300">
                          <Globe className="size-3" />
                          <span>Công khai</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-pink-200/70">
                        <Calendar className="size-3" />
                        {mindmap.lastModified || 'Unknown'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {currentMindmaps.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Brain className="size-16 text-pink-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedCategory === 'public' ? 'Chưa có mindmap công khai nào' : 'Chưa có mindmap nào'}
                </h3>
                <p className="text-pink-200/60 mb-6">
                  {selectedCategory === 'public' 
                    ? 'Các mindmap công khai từ người dùng khác sẽ xuất hiện ở đây'
                    : 'Tạo mindmap đầu tiên của bạn ngay bây giờ!'
                  }
                </p>
                {selectedCategory !== 'public' && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white rounded-xl"
                  >
                    <Plus className="size-4 mr-2" />
                    Tạo mindmap mới
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination cho Public Mindmaps */}
          {selectedCategory === 'public' && publicPagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => loadPublicMindmaps(Math.max(0, publicPagination.page - 1))}
                disabled={publicPagination.page === 0}
                className="bg-black/30 border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
              >
                ← Trước
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-white">
                  Trang {publicPagination.page + 1} / {publicPagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => loadPublicMindmaps(Math.min(publicPagination.totalPages - 1, publicPagination.page + 1))}
                disabled={publicPagination.page >= publicPagination.totalPages - 1}
                className="bg-black/30 border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
              >
                Sau →
              </Button>
            </div>
          )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MindmapCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Mindmap Editor Modal */}
      {editingMindmap && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="w-full h-full">
            <MindmapEditor
              mindmap={editingMindmap}
              onClose={handleCloseEditor}
              onSave={(updated: any) => {
                setUserMindmaps(prev => prev.map(m => m.id === updated.id ? updated : m));
              }}
              onDelete={handleDeleteMindmap}
              readOnly={false}
            />
          </div>
        </div>
      )}

      {/* Mindmap Viewer Modal - readOnly cho mindmap công khai hoặc không phải của user */}
      {viewingMindmap && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="w-full h-full">
            <MindmapEditor
              mindmap={viewingMindmap}
              onClose={handleCloseViewer}
              readOnly={selectedCategory === 'public' || viewingMindmap.userId?.toString() !== currentUserId}
            />
          </div>
        </div>
      )}
    </div>
  );
}