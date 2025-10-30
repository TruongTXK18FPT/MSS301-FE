'use client';

import { useState, useEffect, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Save, Download, Share, Edit, Trash2, Plus, Minus, X, Sparkles, Zap, Target, Eye, Calculator, FileQuestion, Lightbulb } from "lucide-react";
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
  backendId?: number;
  parentNodeId?: number;
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
    nodes?: any[];
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
    backendId: backendNode.id,
    parentNodeId: backendNode.parentNodeId
  };
};

// Wrap text in canvas with proper line breaks
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
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

  // Galaxy theme colors - more vibrant
  const nodeTypeColors = {
    concept: '#8B5CF6',     // Purple
    formula: '#06B6D4',     // Cyan
    example: '#F59E0B',     // Amber
    exercise: '#EC4899',    // Pink
  };

  // Load nodes from backend when component mounts
  useEffect(() => {
    loadNodesFromBackend();
  }, [mindmap.id]);

  const loadNodesFromBackend = async () => {
    try {
      setIsLoadingNodes(true);
      console.log('[MindmapEditor] Loading nodes for mindmap:', mindmap.id);

      // Check if mindmap has ID
      if (!mindmap.id) {
        console.log('[MindmapEditor] No mindmap ID, creating sample nodes');
        createSampleNodes();
        setIsLoadingNodes(false);
        return;
      }

      // Try to load nodes from backend
      try {
        const backendNodes = await mindmapService.getMindmapNodes(mindmap.id);
        console.log('[MindmapEditor] Loaded nodes from backend:', backendNodes);

        if (backendNodes && backendNodes.length > 0) {
          // Convert nodes to frontend format
          const convertedNodes = backendNodes.map(convertBackendNode);
          setNodes(convertedNodes);

          // Create edges from parent-child relationships
          const newEdges: MindmapEdge[] = [];
          backendNodes.forEach((node: any) => {
            if (node.parentNodeId) {
              newEdges.push({
                id: `edge_${node.parentNodeId}_${node.id}`,
                source: node.parentNodeId.toString(),
                target: node.id.toString(),
                color: 'rgba(139, 92, 246, 0.5)'
              });
            }
          });
          setEdges(newEdges);
          console.log('[MindmapEditor] Created edges:', newEdges);
          return;
        }
      } catch (error: any) {
        // If 400 error or auth error, it's likely the mindmap was just created
        console.log('[MindmapEditor] Could not load nodes (expected for new mindmap):', error.message);
      }

      // If no nodes, create sample nodes
      console.log('[MindmapEditor] No nodes found, creating sample nodes');
      createSampleNodes();
    } catch (error) {
      console.error('[MindmapEditor] Error loading nodes:', error);
      createSampleNodes();
    } finally {
      setIsLoadingNodes(false);
    }
  };

  const createSampleNodes = () => {
      // Node trung tâm lớn hơn nhiều
      const sampleNodes: MindmapNode[] = [
        {
          id: 'root',
          label: mindmap.title,
          x: 500,
          y: 350,
          color: nodeTypeColors.concept,
          size: 65, // Node trung tâm lớn hơn rất nhiều
          level: 0,
          nodeType: 'concept',
          content: mindmap.description || 'Chủ đề chính của mindmap',
          exercises: []
        }
      ];
      setNodes(sampleNodes);
      setEdges([]);
  };

  // Add node
  const addNode = (parentId: string, nodeType: 'concept' | 'formula' | 'example' | 'exercise' = 'concept') => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const newNodeId = `node_${Date.now()}`;
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 50;

    const newNode: MindmapNode = {
      id: newNodeId,
      label: nodeType === 'concept' ? 'Khái niệm mới' :
             nodeType === 'formula' ? 'Công thức mới' :
             nodeType === 'example' ? 'Ví dụ mới' : 'Bài tập mới',
      x: parentNode.x + Math.cos(angle) * distance,
      y: parentNode.y + Math.sin(angle) * distance,
      color: nodeTypeColors[nodeType],
      size: 32,
      level: (parentNode.level || 0) + 1,
      nodeType: nodeType,
      content: `Thêm nội dung cho ${nodeType === 'concept' ? 'khái niệm' : nodeType === 'formula' ? 'công thức' : nodeType === 'example' ? 'ví dụ' : 'bài tập'} này`,
      exercises: [],
      parentNodeId: parentNode.backendId // Set parent relationship
    };

    setNodes([...nodes, newNode]);

    // Add edge
    const newEdge: MindmapEdge = {
      id: `edge_${Date.now()}`,
      source: parentId,
      target: newNodeId,
      color: `rgba(${nodeType === 'concept' ? '139, 92, 246' : nodeType === 'formula' ? '6, 182, 212' : nodeType === 'example' ? '245, 158, 11' : '236, 72, 153'}, 0.5)`
    };
    setEdges([...edges, newEdge]);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return;

    // Delete child nodes recursively
    const childNodes = edges.filter(e => e.source === nodeId).map(e => e.target);
    childNodes.forEach(childId => deleteNode(childId));

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
      console.log('[MindmapEditor] Saving mindmap:', {
        id: mindmap.id,
        nodesCount: nodes.length,
        edgesCount: edges.length
      });

      // Convert nodes back to backend format with proper parent relationships
      const backendNodes = nodes.map(node => {
        // Find parent from edges
        const parentEdge = edges.find(e => e.target === node.id);
        const parentNode = parentEdge ? nodes.find(n => n.id === parentEdge.source) : null;

        return {
          id: node.backendId,
          title: node.label,
          content: node.content || '',
          nodeType: node.nodeType?.toUpperCase() || 'CONCEPT',
          positionX: Math.round(node.x),
          positionY: Math.round(node.y),
          backgroundColor: node.color,
          level: node.level || 0,
          width: (node.size || 30) * 2,
          height: (node.size || 30) * 2,
          parentNodeId: parentNode?.backendId || null
        };
      });

      console.log('[MindmapEditor] Converted nodes:', backendNodes);

      // Call the API with nodes (edges are derived from parentNodeId)
      await mindmapService.updateMindmapWithNodes(mindmap.id, {
        title: mindmap.title,
        description: mindmap.description || '',
        grade: mindmap.grade,
        subject: mindmap.subject,
        visibility: mindmap.visibility,
        nodes: backendNodes,
        edges: [] // Backend will create edges from parentNodeId
      });

      setSaveStatus('success');
      console.log('[MindmapEditor] Save successful');

      // Reload to get updated backend IDs
      await loadNodesFromBackend();

      if (onSave) {
        onSave({ ...mindmap, nodes, edges });
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('[MindmapEditor] Error saving mindmap:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Draw mindmap with improved galaxy theme
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
    gradient.addColorStop(0.3, '#1E1B4B');
    gradient.addColorStop(0.6, '#312E81');
    gradient.addColorStop(1, '#4C1D95');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated stars
    const time = Date.now() * 0.001;
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5 % canvas.width);
      const y = (i * 73.2 % canvas.height);
      const size = (Math.sin(time + i) + 1) * 1.5;
      const alpha = (Math.sin(time * 0.5 + i) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw edges with glow effect
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourceX = sourceNode.x + pan.x;
        const sourceY = sourceNode.y + pan.y;
        const targetX = targetNode.x + pan.x;
        const targetY = targetNode.y + pan.y;

        // Draw glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = edge.color || 'rgba(139, 92, 246, 0.8)';
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = edge.color || 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw nodes with galaxy effect
    for (const node of nodes) {
      const x = node.x + pan.x;
      const y = node.y + pan.y;
      const radius = (node.size || 16) * zoom;

      // Draw outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, radius + 20);
      outerGlow.addColorStop(0, node.color + '80');
      outerGlow.addColorStop(0.5, node.color + '40');
      outerGlow.addColorStop(1, node.color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, radius + 20, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node with gradient
      const nodeGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      nodeGradient.addColorStop(0, node.color + 'FF');
      nodeGradient.addColorStop(1, node.color + 'CC');
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FBBF24';
      } else {
        ctx.strokeStyle = '#FFFFFF40';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw label with text wrapping
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(10, 13 * zoom)}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;

      const maxWidth = radius * 1.8;
      const lines = wrapText(ctx, node.label, maxWidth);
      const lineHeight = Math.max(12, 15 * zoom);
      const startY = y - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
      });
      ctx.shadowBlur = 0;

      // Draw exercise badge
      if (node.exercises && node.exercises.length > 0) {
        const badgeX = x + radius * 0.7;
        const badgeY = y - radius * 0.7;
        const badgeRadius = 10 * zoom;

        // Badge background
        ctx.fillStyle = '#EC4899';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#EC4899';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Badge text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(8, 11 * zoom)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(node.exercises.length.toString(), badgeX, badgeY + 4 * zoom);
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

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === 'easy') return 'Dễ';
    if (difficulty === 'medium') return 'Trung bình';
    return 'Khó';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-pink-950/90">
      {/* Header */}
      <CardHeader className="pb-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-pink-800/90 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-white drop-shadow-lg">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg animate-pulse">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 bg-clip-text text-transparent">
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
        <div className="px-6 py-4 border-b border-purple-600/30 bg-gradient-to-r from-purple-900/70 via-purple-800/70 to-pink-800/70 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'concept')}
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Thêm khái niệm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'formula')}
              className="bg-cyan-500/20 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/30"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Thêm công thức
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'example')}
              className="bg-amber-500/20 border-amber-400/30 text-amber-200 hover:bg-amber-500/30"
            >
              <Zap className="h-4 w-4 mr-2" />
              Thêm ví dụ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'exercise')}
              className="bg-pink-500/20 border-pink-400/30 text-pink-200 hover:bg-pink-500/30"
            >
              <FileQuestion className="h-4 w-4 mr-2" />
              Thêm bài tập
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedNode && deleteNode(selectedNode)}
              disabled={!selectedNode || selectedNode === 'root'}
              className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
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
              Chỉnh sửa
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

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="bg-black/30 border-purple-400/30 text-purple-200"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-purple-300 min-w-[50px] text-center font-semibold">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="bg-black/30 border-purple-400/30 text-purple-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {saveStatus !== 'idle' && (
              <div className={`px-4 py-2 rounded-lg font-semibold shadow-lg ${
                saveStatus === 'success' ? 'bg-green-500/30 text-green-100 border border-green-400/50' : 'bg-red-500/30 text-red-100 border border-red-400/50'
              }`}>
                {saveStatus === 'success' ? '✓ Đã lưu thành công' : '✗ Lỗi khi lưu'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="relative w-full h-full">
          {isLoadingNodes ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-pink-950/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-6"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-400 mx-auto opacity-20"></div>
                </div>
                <p className="text-purple-200 text-xl font-bold">Đang tải mindmap...</p>
                <p className="text-purple-300 text-sm mt-2">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className={`w-full h-full ${isEditing ? 'cursor-move' : 'cursor-pointer'}`}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          )}
        </div>
      </CardContent>

      {/* Node Editor Modal */}
      {showNodeEditor && editingNode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/50 shadow-2xl">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-lg w-full border border-purple-500/50 shadow-2xl">
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
            console.log('Generated exercises:', exercises);
            loadNodesFromBackend(); // Reload to get exercises
            setShowExerciseGenerator(false);
          }}
          onClose={() => setShowExerciseGenerator(false)}
        />
      )}
    </div>
  );
}
