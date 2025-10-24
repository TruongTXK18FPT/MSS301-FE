'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZoomIn, ZoomOut, Download, Share2, Library, Plus, Save, Undo, Redo, Settings, Brain, Calculator, Triangle, Circle, Star, Target, BookOpen, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";

const nodeTemplates = [
  {
    id: 'concept',
    name: 'Khái niệm',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    description: 'Khái niệm chính'
  },
  {
    id: 'formula',
    name: 'Công thức',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    description: 'Công thức toán học'
  },
  {
    id: 'example',
    name: 'Ví dụ',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    description: 'Ví dụ minh họa'
  },
  {
    id: 'practice',
    name: 'Luyện tập',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    description: 'Bài tập thực hành'
  },
  {
    id: 'geometry',
    name: 'Hình học',
    icon: Triangle,
    color: 'from-pink-500 to-rose-500',
    description: 'Hình học'
  },
  {
    id: 'theory',
    name: 'Lý thuyết',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    description: 'Nội dung lý thuyết'
  }
];

const mathTemplates = [
  {
    id: 'algebra',
    name: 'Đại số cơ bản',
    nodes: [
      { name: 'Biến số', type: 'concept' },
      { name: 'x, y, z', type: 'example' },
      { name: 'Biểu thức', type: 'concept' },
      { name: '2x + 3y', type: 'example' }
    ]
  },
  {
    id: 'quadratic',
    name: 'Phương trình bậc 2',
    nodes: [
      { name: 'ax² + bx + c = 0', type: 'formula' },
      { name: 'Δ = b² - 4ac', type: 'formula' },
      { name: 'x₁,₂ = (-b ± √Δ)/2a', type: 'formula' }
    ]
  },
  {
    id: 'geometry',
    name: 'Hình học phẳng',
    nodes: [
      { name: 'Tam giác', type: 'geometry' },
      { name: 'S = ½ × đáy × cao', type: 'formula' },
      { name: 'Tứ giác', type: 'geometry' },
      { name: 'Đường tròn', type: 'geometry' }
    ]
  }
];

export default function MindmapEditorPage() {
  const [mindmapTitle, setMindmapTitle] = useState("Mindmap mới");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNodeType, setSelectedNodeType] = useState("concept");
  const [mathSymbols, setMathSymbols] = useState<Array<{left: string, top: string, animationDelay: string, animationDuration: string}>>([]);

  useEffect(() => {
    // Generate math symbols positions on client side only to avoid hydration mismatch
    const symbols = ['∑', '∫', '∞', 'π', '√', '±', '∆', '≈'];
    const generatedSymbols = symbols.map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${6 + Math.random() * 4}s`
    }));
    setMathSymbols(generatedSymbols);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 25));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Floating Math Symbols */}
        <div className="absolute inset-0">
          {mathSymbols.map((symbol, i) => (
            <div
              key={`symbol-${i}`}
              className="absolute opacity-10 animate-float text-2xl font-bold text-purple-400"
              style={{
                left: symbol.left,
                top: symbol.top,
                animationDelay: symbol.animationDelay,
                animationDuration: symbol.animationDuration
              }}
            >
              {['∑', '∫', '∞', 'π', '√', '±', '∆', '≈'][i]}
            </div>
          ))}
        </div>
      </div>

      <div className="h-screen flex flex-col relative z-10">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
                <Brain className="size-6 text-white" />
              </div>
              <div className="flex flex-col">
                <Input
                  value={mindmapTitle}
                  onChange={(e) => setMindmapTitle(e.target.value)}
                  className="text-xl font-bold bg-transparent border-none text-white placeholder:text-purple-200/50 p-0 h-auto focus:ring-0"
                  placeholder="Tên mindmap..."
                />
                <p className="text-sm text-purple-200/60">Mindmap Editor - Vũ trụ tri thức</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Undo className="size-4 mr-2" />
                Hoàn tác
              </Button>
              <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Redo className="size-4 mr-2" />
                Làm lại
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Share2 className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Settings className="size-4" />
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl shadow-lg shadow-purple-500/30">
                <Save className="size-4 mr-2" />
                Lưu
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white rounded-xl shadow-lg shadow-pink-500/30">
                <Download className="size-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-4">
          {/* Left Sidebar - Node Templates */}
          <aside className="w-80">
            <Card className="h-full bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/30">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Library className="text-purple-400" />
                  Thư viện Node
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Template Selection */}
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-2 block">Mẫu có sẵn</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-black/30 border-purple-400/30 text-white rounded-xl">
                      <SelectValue placeholder="Chọn mẫu toán học" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-purple-400/30 rounded-xl">
                      {mathTemplates.map((template) => (
                        <SelectItem 
                          key={template.id} 
                          value={template.id}
                          className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 rounded-lg"
                        >
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Node Templates */}
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-3 block">Loại Node</label>
                  <div className="space-y-2">
                    {nodeTemplates.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <div
                          key={template.id}
                          className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
                            selectedNodeType === template.id
                              ? 'border-purple-400/50 bg-purple-500/20'
                              : 'border-purple-500/30 bg-black/30 hover:bg-purple-500/10'
                          }`}
                          onClick={() => setSelectedNodeType(template.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color}`}>
                              <IconComponent className="size-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">{template.name}</p>
                              <p className="text-xs text-purple-200/60">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Node Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="size-4 mr-2" />
                  Thêm Node
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Canvas */}
          <main className="flex-1 relative">
            <Card className="h-full bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden">
              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '2rem 2rem',
                  transform: `scale(${zoomLevel / 100})`
                }}
              ></div>
              
              {/* Canvas Content */}
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm mb-4">
                    <Brain className="size-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white mb-2">Canvas vũ trụ tri thức</h3>
                    <p className="text-purple-200/70">Kéo thả các node từ thư viện để bắt đầu tạo mindmap</p>
                  </div>
                  
                  {selectedTemplate && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Preview: {mathTemplates.find(t => t.id === selectedTemplate)?.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {mathTemplates.find(t => t.id === selectedTemplate)?.nodes.map((node, index) => {
                          const nodeTemplate = nodeTemplates.find(nt => nt.id === node.type);
                          return (
                            <Badge 
                              key={index}
                              className={`bg-gradient-to-r ${nodeTemplate?.color} text-white px-3 py-2 rounded-xl shadow-lg`}
                            >
                              {node.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-xl border border-purple-500/30 p-3 rounded-full shadow-xl">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-purple-200 hover:text-white hover:bg-purple-500/20"
                onClick={handleZoomOut}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="font-mono text-sm w-16 text-center text-white font-semibold">
                {zoomLevel}%
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-purple-200 hover:text-white hover:bg-purple-500/20"
                onClick={handleZoomIn}
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>

            {/* Mini Map */}
            <div className="absolute top-4 right-4 w-48 h-32 bg-black/50 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden">
              <div className="p-2 border-b border-purple-500/30">
                <p className="text-xs font-medium text-purple-200">Mini Map</p>
              </div>
              <div className="flex-1 flex items-center justify-center h-24">
                <p className="text-xs text-purple-200/60">Tổng quan mindmap</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
