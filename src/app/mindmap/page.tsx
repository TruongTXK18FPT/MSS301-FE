'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, Search, Star, Calendar, Eye, Edit, Trash2, Download, Share } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { mindmapService } from "@/lib/services/mindmapService";
import MindmapCreateForm from "@/components/mindmap/MindmapCreateForm";
import MindmapEditor from "@/components/mindmap/MindmapEditor";

// Mock data for mindmaps
const mindmapTemplates = [
  {
    id: 1,
    title: "Đại số cơ bản",
    description: "Tổng quan về đại số lớp 6-7",
    category: "Đại số",
    grade: "6-7",
    nodes: 15,
    isTemplate: true,
    preview: "Variables → Expressions → Equations",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Hình học phẳng",
    description: "Các hình cơ bản và công thức",
    category: "Hình học",
    grade: "8-9",
    nodes: 20,
    isTemplate: true,
    preview: "Tam giác → Tứ giác → Đường tròn",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    title: "Phương trình bậc hai",
    description: "Giải và ứng dụng phương trình bậc 2",
    category: "Đại số",
    grade: "9-10",
    nodes: 12,
    isTemplate: true,
    preview: "ax² + bx + c = 0 → Delta → Nghiệm",
    color: "from-purple-500 to-violet-500"
  },
  {
    id: 4,
    title: "Lượng giác cơ bản",
    description: "Sin, Cos, Tan và ứng dụng",
    category: "Lượng giác",
    grade: "10-11",
    nodes: 18,
    isTemplate: true,
    preview: "Đường tròn → Góc → Hàm số",
    color: "from-orange-500 to-red-500"
  }
];

const userMindmaps = [
  {
    id: 101,
    title: "Bài tập Toán 9",
    description: "Ôn tập kiểm tra giữa kỳ",
    category: "Cá nhân",
    grade: "9",
    nodes: 8,
    isTemplate: false,
    lastModified: "2 ngày trước",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 102,
    title: "Hệ phương trình",
    description: "Phương pháp giải hệ PT",
    category: "Cá nhân", 
    grade: "9",
    nodes: 6,
    isTemplate: false,
    lastModified: "1 tuần trước",
    color: "from-indigo-500 to-purple-500"
  }
];

export default function MindMapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [brainIcons, setBrainIcons] = useState<Array<{left: string, top: string, animationDelay: string, animationDuration: string}>>([]);

  const [userMindmaps, setUserMindmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMindmap, setEditingMindmap] = useState<any>(null);

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

  const loadMindmaps = async () => {
    try {
      setLoading(true);
      const mindmaps = await mindmapService.getUserMindmaps();
      setUserMindmaps(mindmaps);
    } catch (error) {
      console.error('Failed to load mindmaps:', error);
    } finally {
      setLoading(false);
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

  const handleCloseEditor = () => {
    setEditingMindmap(null);
  };

  const categories = ["all", "Đại số", "Hình học", "Lượng giác", "Cá nhân"];

  const filteredTemplates = mindmapTemplates.filter(template =>
    (selectedCategory === "all" || template.category === selectedCategory) &&
    template.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserMindmaps = userMindmaps.filter(mindmap =>
    mindmap && 
    (selectedCategory === "all" || selectedCategory === "Cá nhân") &&
    mindmap.title && 
    mindmap.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Floating Brain Icons */}
        <div className="absolute inset-0">
          {brainIcons.map((icon, i) => (
            <div
              key={`brain-${i}`}
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
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-black/30 border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
                }`}
              >
                {category === "all" ? "Tất cả" : category}
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

        {/* Templates Section */}
        {(selectedCategory === "all" || selectedCategory !== "Cá nhân") && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="size-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Templates toán học</h2>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                {filteredTemplates.length} mẫu
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${template.color}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                          {template.title}
                        </CardTitle>
                        <CardDescription className="text-purple-200/70 text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                        Lớp {template.grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <p className="text-sm text-purple-200/60 mb-2">Cấu trúc:</p>
                      <p className="text-sm text-white bg-black/30 rounded-lg px-3 py-2 font-mono">
                        {template.preview}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-purple-200/70 text-sm">
                        <Brain className="size-4" />
                        {template.nodes} nodes
                      </div>
                      <div className="flex items-center gap-2 text-purple-200/70 text-sm">
                        <Star className="size-4 text-yellow-400" />
                        Template
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/mindmap/editor?template=${template.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg">
                          <Eye className="size-4 mr-1" />
                          Xem
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="bg-black/30 border-purple-400/30 text-purple-200 hover:bg-purple-500/20 rounded-lg">
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Mindmaps Section */}
        {(selectedCategory === "all" || selectedCategory === "Cá nhân") && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Brain className="size-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Mindmap của bạn</h2>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">
                {filteredUserMindmaps.length} mindmap
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUserMindmaps.map((mindmap) => (
                <Card key={mindmap.id} className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105 overflow-hidden group">
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
                        {mindmap.nodes || 0} nodes
                      </div>
                      <div className="flex items-center gap-2 text-pink-200/70 text-sm">
                        <Calendar className="size-4" />
                        {mindmap.lastModified || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleEditMindmap(mindmap)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white rounded-lg"
                      >
                        <Edit className="size-4 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button size="sm" variant="outline" className="bg-black/30 border-pink-400/30 text-pink-200 hover:bg-pink-500/20 rounded-lg">
                        <Share className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-black/30 border-red-400/30 text-red-300 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredUserMindmaps.length === 0 && (
              <div className="text-center py-12">
                <Brain className="size-16 text-pink-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Chưa có mindmap nào</h3>
                <p className="text-pink-200/60 mb-6">Tạo mindmap đầu tiên của bạn ngay bây giờ!</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white rounded-xl"
                >
                  <Plus className="size-4 mr-2" />
                  Tạo mindmap mới
                </Button>
              </div>
            )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full h-[90vh] max-w-6xl">
            <MindmapEditor
              mindmap={editingMindmap}
              onClose={handleCloseEditor}
            />
          </div>
        </div>
      )}
    </div>
  );
}