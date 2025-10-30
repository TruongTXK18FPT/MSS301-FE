'use client';

import { useState, useEffect, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Save, Download, Share, Edit, Trash2, Plus, Minus, X, Sparkles, Zap, Target, Eye, Calculator, FileQuestion } from "lucide-react";
import { mindmapService } from '@/lib/services/mindmapService';
import NodeDetailView from './NodeDetailView';
import ExerciseGeneratorForm from './ExerciseGeneratorForm';

// Backend node structure
interface BackendNode {
  id: number;
  mindmapId: number;
  title: string;
  content?: string;
  nodeType?: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  parentNodeId?: number;
  level?: number;
  orderIndex?: number;
  isCollapsed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MindmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  level?: number;
  content?: string;
  exercises?: Exercise[];
  nodeType?: 'concept' | 'formula' | 'example' | 'exercise';
  backendId?: number; // ID từ backend
}

interface Exercise {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
}

interface MindmapEditorProps {
  readonly mindmap: {
    id: number;
    title: string;
    description?: string;
    grade: string;
    subject: string;
    nodes?: any[]; // Accept any structure from backend
    edges?: MindmapEdge[];
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  };
  onSave?: (mindmap: any) => void;
  onDelete?: (id: number) => void;
  onClose?: () => void;
}

// Convert backend nodes to frontend format
const convertBackendNode = (backendNode: any): MindmapNode => {
  return {
    id: backendNode.id?.toString() || `node_${Date.now()}`,
    label: backendNode.title || backendNode.label || 'Untitled',
    x: backendNode.positionX || backendNode.x || 400,
    y: backendNode.positionY || backendNode.y || 300,
    color: backendNode.backgroundColor || backendNode.color || '#8B5CF6',
    size: backendNode.width ? backendNode.width / 2 : 30,
    level: backendNode.level || 0,
    content: backendNode.content || '',
    nodeType: (backendNode.nodeType?.toLowerCase() || 'concept') as any,
    exercises: [],
    backendId: backendNode.id
  };
};

export default function MindmapEditor({ mindmap, onSave, onDelete, onClose }: Readonly<MindmapEditorProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [nodes, setNodes] = useState<MindmapNode[]>([]);
  const [edges, setEdges] = useState<MindmapEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNode, setEditingNode] = useState<MindmapNode | null>(null);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({});
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [detailsNode, setDetailsNode] = useState<MindmapNode | null>(null);
  const [showExerciseGenerator, setShowExerciseGenerator] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);

  // Galaxy theme colors
  const nodeTypeColors = {
    concept: '#8B5CF6', // Purple
    formula: '#06B6D4', // Cyan
    example: '#F59E0B', // Amber
    exercise: '#EC4899', // Pink
  };

  // Load nodes từ backend khi component mount
  useEffect(() => {
    loadNodesFromBackend();
  }, [mindmap.id]);

  const loadNodesFromBackend = async () => {
    try {
      setIsLoadingNodes(true);
      console.log('[MindmapEditor] Loading nodes for mindmap:', mindmap.id);
      
      // Load nodes từ backend
      const backendNodes = await mindmapService.getMindmapNodes(mindmap.id);
      console.log('[MindmapEditor] Loaded nodes from backend:', backendNodes);
      
      if (backendNodes && backendNodes.length > 0) {
        // Convert nodes sang format frontend
        const convertedNodes = backendNodes.map(convertBackendNode);
        setNodes(convertedNodes);
        
        // Tạo edges từ parent-child relationships
        const newEdges: MindmapEdge[] = [];
        backendNodes.forEach((node: any) => {
          if (node.parentNodeId) {
            newEdges.push({
              id: `edge_${node.id}`,
              source: node.parentNodeId.toString(),
              target: node.id.toString(),
              color: 'rgba(139, 92, 246, 0.5)'
            });
          }
        });
        setEdges(newEdges);
        console.log('[MindmapEditor] Created edges:', newEdges);
      } else {
        // Nếu không có nodes, tạo sample nodes
        console.log('[MindmapEditor] No nodes found, creating sample nodes');
        createSampleNodes();
      }
    } catch (error) {
      console.error('[MindmapEditor] Error loading nodes:', error);
      // Fallback: tạo sample nodes
      createSampleNodes();
    } finally {
      setIsLoadingNodes(false);
    }
  };

  const createSampleNodes = () => {
      const sampleNodes: MindmapNode[] = [
        { 
          id: 'root', 
          label: mindmap.title, 
          x: 400, 
          y: 200, 
          color: nodeTypeColors.concept, 
          size: 40,  // Tăng size node trung tâm
          level: 0,
          nodeType: 'concept',
          content: mindmap.description || 'Chủ đề chính của mindmap',
          exercises: []
        },
        { 
          id: 'node1', 
          label: 'Khái niệm cơ bản', 
          x: 200, 
          y: 100, 
          color: nodeTypeColors.concept, 
          size: 28,  // Tăng size các node con
          level: 1,
          nodeType: 'concept',
          content: 'Các khái niệm cơ bản cần nắm vững. Bao gồm: định nghĩa, tính chất, và cách vận dụng vào thực tế.',
          exercises: []
        },
        { 
          id: 'node2', 
          label: 'Công thức', 
          x: 600, 
          y: 100, 
          color: nodeTypeColors.formula, 
          size: 28, 
          level: 1,
          nodeType: 'formula',
          content: 'Các công thức quan trọng cần ghi nhớ. Áp dụng vào giải bài tập và giải quyết vấn đề thực tế.',
          exercises: []
        },
        { 
          id: 'node3', 
          label: 'Ví dụ minh họa', 
          x: 400, 
          y: 300, 
          color: nodeTypeColors.example, 
          size: 28, 
          level: 1,
          nodeType: 'example',
          content: 'Các ví dụ thực tế giúp hiểu rõ hơn về lý thuyết. Mỗi ví dụ đều có lời giải chi tiết.',
          exercises: []
        },
      ];
      setNodes(sampleNodes);

      const sampleEdges: MindmapEdge[] = [
        { id: 'edge1', source: 'root', target: 'node1', color: 'rgba(139, 92, 246, 0.5)' },
        { id: 'edge2', source: 'root', target: 'node2', color: 'rgba(6, 182, 212, 0.5)' },
        { id: 'edge3', source: 'root', target: 'node3', color: 'rgba(245, 158, 11, 0.5)' },
      ];
      setEdges(sampleEdges);
  };

  // Các function quản lý nodes
  const addNode = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const newNodeId = `node_${Date.now()}`;
    const newNode: MindmapNode = {
      id: newNodeId,
      label: 'Node mới',
      x: parentNode.x + (Math.random() - 0.5) * 200,
      y: parentNode.y + (Math.random() - 0.5) * 200,
      color: nodeTypeColors.concept,
      size: 30, // Tăng size cho node mới
      level: (parentNode.level || 0) + 1,
      nodeType: 'concept',
      content: 'Thêm nội dung chi tiết cho node này',
      exercises: []
    };

    setNodes([...nodes, newNode]);
    
    // Thêm edge
    const newEdge: MindmapEdge = {
      id: `edge_${Date.now()}`,
      source: parentId,
      target: newNodeId,
      color: 'rgba(139, 92, 246, 0.5)'
    };
    setEdges([...edges, newEdge]);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return;
    
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setShowNodeEditor(false);
  };

  const updateNode = (nodeId: string, updates: Partial<MindmapNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const addExercise = (nodeId: string) => {
    const exercise: Exercise = {
      id: `exercise_${Date.now()}`,
      question: newExercise.question || '',
      answer: newExercise.answer || '',
      difficulty: newExercise.difficulty || 'easy'
    };

    updateNode(nodeId, {
      exercises: [...(nodes.find(n => n.id === nodeId)?.exercises || []), exercise]
    });

    setNewExercise({});
    setShowExerciseForm(false);
  };

  const deleteExercise = (nodeId: string, exerciseId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    updateNode(nodeId, {
      exercises: node.exercises?.filter(e => e.id !== exerciseId) || []
    });
  };

  const saveMindmap = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      console.log('Saving mindmap:', { nodes, edges });
      
      // Convert nodes back to backend format if needed
      const backendNodes = nodes.map(node => ({
        id: node.backendId,
        title: node.label,
        content: node.content,
        nodeType: node.nodeType?.toUpperCase(),
        positionX: node.x,
        positionY: node.y,
        backgroundColor: node.color,
        level: node.level
      }));
      
      await mindmapService.updateMindmap(mindmap.id, {
        title: mindmap.title,
        description: mindmap.description,
        visibility: mindmap.visibility
      });
      
      setSaveStatus('success');
      
      if (onSave) {
        onSave({ ...mindmap, nodes, edges });
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving mindmap:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Vẽ mindmap với galaxy theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas with galaxy background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.5, '#1E1B4B');
    gradient.addColorStop(1, '#312E81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
      ctx.fillRect(x, y, size, size);
    }

    // Vẽ edges với glow effect
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceX = sourceNode.x + pan.x;
        const sourceY = sourceNode.y + pan.y;
        const targetX = targetNode.x + pan.x;
        const targetY = targetNode.y + pan.y;

        // Draw glow
        const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        gradient.addColorStop(0, edge.color || 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
        gradient.addColorStop(1, edge.color || 'rgba(139, 92, 246, 0.3)');
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = edge.color || 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Vẽ nodes với galaxy effect
    for (const node of nodes) {
      const x = node.x + pan.x;
      const y = node.y + pan.y;
      const radius = (node.size || 16) * zoom;

      // Draw glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 10);
      gradient.addColorStop(0, node.color || nodeTypeColors.concept);
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      ctx.beginPath();
      ctx.arc(x, y, radius + 10, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw node border
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = node.color || nodeTypeColors.concept;
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw node fill
      ctx.fillStyle = node.color || nodeTypeColors.concept;
      ctx.fill();

      // Draw label with glow
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${12 * zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(node.label, x, y + 4 * zoom);
      ctx.shadowBlur = 0;

      // Draw exercise count
      if (node.exercises && node.exercises.length > 0) {
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(x + (radius * 0.7), y - (radius * 0.7), 8 * zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${10 * zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(node.exercises.length.toString(), x + (radius * 0.7), y - (radius * 0.7) + 4 * zoom);
      }
    }
  }, [nodes, edges, selectedNode, zoom, pan]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    const clickedNode = nodes.find(node => {
      const distance = Math.hypot(node.x - x, node.y - y);
      return distance <= (node.size || 16);
    });

    if (clickedNode) {
      if (isEditing) {
        setSelectedNode(clickedNode.id);
      } else {
        // Click để xem chi tiết khi không edit
        setDetailsNode(clickedNode);
        setShowNodeDetails(true);
      }
    } else {
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    const clickedNode = nodes.find(node => {
      const distance = Math.hypot(node.x - x, node.y - y);
      return distance <= (node.size || 16);
    });

    if (clickedNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - clickedNode.x, y: e.clientY - clickedNode.y });
      setSelectedNode(clickedNode.id);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newX = (e.clientX - rect.left) / zoom - pan.x;
    const newY = (e.clientY - rect.top) / zoom - pan.y;

    updateNode(selectedNode, { x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const getDifficultyVariant = (difficulty: string) => {
    if (difficulty === 'easy') return 'default';
    if (difficulty === 'medium') return 'secondary';
    return 'destructive';
  };

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === 'easy') return 'Dễ';
    if (difficulty === 'medium') return 'Trung bình';
    return 'Khó';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10">
      {/* Header */}
      <CardHeader className="pb-4 border-b-2 border-purple-500/50 bg-gradient-to-r from-purple-800 via-purple-700 to-pink-700 shadow-lg relative overflow-hidden">
        {/* Animated background stars */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <CardTitle className="flex items-center gap-3 text-white drop-shadow-lg">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-100 to-pink-100 bg-clip-text text-transparent">
                {mindmap.title}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1">
                <Target className="h-4 w-4 mr-1.5" />
                Lớp {mindmap.grade}
              </Badge>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg px-3 py-1">
                <Sparkles className="h-4 w-4 mr-1.5" />
                {mindmap.subject}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all" : "bg-white/10 backdrop-blur border-purple-300/50 text-white hover:bg-white/20"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Thoát' : 'Chỉnh sửa'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={saveMindmap}
              disabled={isSaving}
              className="bg-white/10 backdrop-blur border-blue-300/50 text-white hover:bg-blue-500/20 hover:border-blue-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur border-green-300/50 text-white hover:bg-green-500/20 hover:border-green-400">
              <Download className="h-4 w-4 mr-2" />
              Xuất
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur border-yellow-300/50 text-white hover:bg-yellow-500/20 hover:border-yellow-400">
              <Share className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur">
                <X className="h-4 w-4 mr-2" />
                Đóng
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Toolbar */}
      {isEditing && (
        <div className="px-6 py-4 border-b-2 border-purple-600/40 bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-pink-800/80 shadow-lg relative overflow-hidden">
          {/* Animated stars */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root')}
              disabled={!selectedNode}
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm node
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedNode && deleteNode(selectedNode)}
              disabled={!selectedNode || selectedNode === 'root'}
              className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa node
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  setEditingNode(nodes.find(n => n.id === selectedNode) || null);
                  setShowNodeEditor(true);
                }
              }}
              disabled={!selectedNode}
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa node
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  const node = nodes.find(n => n.id === selectedNode);
                  if (node) {
                    setDetailsNode(node);
                    setShowNodeDetails(true);
                  }
                }
              }}
              disabled={!selectedNode}
              className="bg-cyan-500/20 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/30"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  setShowExerciseGenerator(true);
                }
              }}
              disabled={!selectedNode}
              className="bg-pink-500/20 border-pink-400/30 text-pink-300 hover:bg-pink-500/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tạo bài tập AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  setShowExerciseForm(true);
                }
              }}
              disabled={!selectedNode}
              className="bg-pink-500/20 border-pink-400/30 text-pink-300 hover:bg-pink-500/30"
            >
              <Brain className="h-4 w-4 mr-2" />
              Thêm bài tập
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="bg-black/30 border-purple-400/30 text-purple-200"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-purple-300 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="bg-black/30 border-purple-400/30 text-purple-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Save status indicator */}
            {saveStatus !== 'idle' && (
              <div className={`ml-auto px-3 py-1 rounded-lg ${
                saveStatus === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
              }`}>
                {saveStatus === 'success' ? '✓ Đã lưu' : '✗ Lỗi lưu'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="relative w-full h-full">
          {isLoadingNodes ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-purple-200 text-lg font-semibold">Đang tải mindmap...</p>
                <p className="text-purple-300 text-sm mt-2">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className={`border border-purple-500/30 rounded-lg w-full h-full bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 ${isEditing ? 'cursor-move' : 'cursor-pointer'}`}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          )}
        </div>
      </CardContent>

      {/* Node Details Modal */}
      {showNodeDetails && detailsNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-3 rounded-full shadow-lg" style={{ background: detailsNode.color }}>
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  {detailsNode.label}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNodeDetails(false)} className="text-purple-200 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Lý thuyết */}
                <div className="bg-black/30 rounded-xl p-6 border border-purple-400/30">
                  <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Lý thuyết & Nội dung
                  </h4>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {detailsNode.content || 'Chưa có nội dung chi tiết.'}
                  </p>
                </div>

                {/* Ví dụ minh họa */}
                {detailsNode.exercises && detailsNode.exercises.length > 0 && (
                  <div className="bg-black/30 rounded-xl p-6 border border-purple-400/30">
                    <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-pink-400" />
                      Ví dụ minh họa ({detailsNode.exercises.length})
                    </h4>
                    <div className="space-y-4">
                      {detailsNode.exercises.map((exercise) => (
                        <div key={exercise.id} className="p-4 border border-purple-400/30 rounded-lg bg-black/20">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${
                              exercise.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                              exercise.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {getDifficultyLabel(exercise.difficulty)}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-semibold text-purple-200 mb-1">Câu hỏi:</p>
                              <p className="text-white">{exercise.question}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-purple-200 mb-1">Đáp án:</p>
                              <p className="text-purple-200">{exercise.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Khái niệm cơ bản */}
                <div className="bg-black/30 rounded-xl p-6 border border-purple-400/30">
                  <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    Khái niệm cơ bản
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Node này có level {detailsNode.level}. Đây là phần quan trọng của mindmap giúp bạn hiểu rõ hơn về chủ đề.
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-6 border-t border-purple-400/30 mt-6">
                  <Button 
                    onClick={() => {
                      setEditingNode(detailsNode);
                      setShowNodeDetails(false);
                      setShowNodeEditor(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" onClick={() => setShowNodeDetails(false)} className="bg-black/30 border-purple-400/30 text-purple-200">
                    Đóng
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node Editor Modal */}
      {showNodeEditor && editingNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Chỉnh sửa Node
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNodeEditor(false)} className="text-purple-200 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nodeLabel" className="text-purple-200">Tên node</Label>
                  <Input
                    id="nodeLabel"
                    value={editingNode.label}
                    onChange={(e) => setEditingNode({...editingNode, label: e.target.value})}
                    placeholder="Nhập tên node"
                    className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50"
                  />
                </div>

                <div>
                  <Label htmlFor="nodeType" className="text-purple-200">Loại node</Label>
                  <Select 
                    value={editingNode.nodeType || 'concept'} 
                    onValueChange={(value: 'concept' | 'formula' | 'example' | 'exercise') => 
                      setEditingNode({...editingNode, nodeType: value, color: nodeTypeColors[value]})
                    }
                  >
                    <SelectTrigger className="bg-black/30 border-purple-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/30">
                      <SelectItem value="concept" className="text-purple-200">Khái niệm</SelectItem>
                      <SelectItem value="formula" className="text-cyan-300">Công thức</SelectItem>
                      <SelectItem value="example" className="text-amber-300">Ví dụ</SelectItem>
                      <SelectItem value="exercise" className="text-pink-300">Bài tập</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nodeContent" className="text-purple-200">Nội dung</Label>
                  <Textarea
                    id="nodeContent"
                    value={editingNode.content || ''}
                    onChange={(e) => setEditingNode({...editingNode, content: e.target.value})}
                    placeholder="Nhập nội dung chi tiết..."
                    rows={4}
                    className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50"
                  />
                </div>

                {/* Exercises List */}
                {editingNode.exercises && editingNode.exercises.length > 0 && (
                  <div>
                    <Label className="text-purple-200">Bài tập ({editingNode.exercises.length})</Label>
                    <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                      {editingNode.exercises.map((exercise) => (
                        <div key={exercise.id} className="p-3 border border-purple-400/30 rounded-lg bg-black/20">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${
                              exercise.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                              exercise.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {getDifficultyLabel(exercise.difficulty)}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteExercise(editingNode.id, exercise.id)}
                              className="text-red-300 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm font-medium mb-1 text-white">{exercise.question}</p>
                          <p className="text-sm text-purple-300">{exercise.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      updateNode(editingNode.id, editingNode);
                      setShowNodeEditor(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button variant="outline" onClick={() => setShowNodeEditor(false)} className="bg-black/30 border-purple-400/30 text-purple-200">
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Form Modal */}
      {showExerciseForm && selectedNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-lg w-full border border-purple-500/30 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-pink-400" />
                  Thêm bài tập
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowExerciseForm(false)} className="text-purple-200 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="exerciseQuestion" className="text-purple-200">Câu hỏi</Label>
                  <Textarea
                    id="exerciseQuestion"
                    value={newExercise.question || ''}
                    onChange={(e) => setNewExercise({...newExercise, question: e.target.value})}
                    placeholder="Nhập câu hỏi..."
                    rows={3}
                    className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50"
                  />
                </div>

                <div>
                  <Label htmlFor="exerciseAnswer" className="text-purple-200">Đáp án</Label>
                  <Textarea
                    id="exerciseAnswer"
                    value={newExercise.answer || ''}
                    onChange={(e) => setNewExercise({...newExercise, answer: e.target.value})}
                    placeholder="Nhập đáp án..."
                    rows={2}
                    className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50"
                  />
                </div>

                <div>
                  <Label htmlFor="exerciseDifficulty" className="text-purple-200">Độ khó</Label>
                  <Select 
                    value={newExercise.difficulty || 'easy'} 
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setNewExercise({...newExercise, difficulty: value})
                    }
                  >
                    <SelectTrigger className="bg-black/30 border-purple-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/30">
                      <SelectItem value="easy" className="text-green-300">Dễ</SelectItem>
                      <SelectItem value="medium" className="text-yellow-300">Trung bình</SelectItem>
                      <SelectItem value="hard" className="text-red-300">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => addExercise(selectedNode)}
                    disabled={!newExercise.question || !newExercise.answer}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white"
                  >
                    Thêm bài tập
                  </Button>
                  <Button variant="outline" onClick={() => setShowExerciseForm(false)} className="bg-black/30 border-purple-400/30 text-purple-200">
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Node Details Modal */}
      {showNodeDetails && detailsNode && (
        <NodeDetailView
          nodeId={detailsNode.backendId?.toString() || detailsNode.id}
          nodeName={detailsNode.label}
          onClose={() => {
            setShowNodeDetails(false);
            setDetailsNode(null);
          }}
        />
      )}
      
      {/* Exercise Generator Modal */}
      {showExerciseGenerator && selectedNode && (
        <ExerciseGeneratorForm
          nodeId={parseInt(nodes.find(n => n.id === selectedNode)?.backendId?.toString() || selectedNode)}
          nodeName={nodes.find(n => n.id === selectedNode)?.label || 'Node'}
          onSuccess={(exercises) => {
            // Refresh node data after generating exercises
            console.log('Generated exercises:', exercises);
            setShowExerciseGenerator(false);
          }}
          onClose={() => setShowExerciseGenerator(false)}
        />
      )}
    </div>
  );
}
