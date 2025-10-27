'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Save,
  Trash2,
  Plus,
  Eye,
  ZoomIn,
  ZoomOut,
  Move,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  FileQuestion,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import NodeDetailView from './NodeDetailView';
import ExerciseGeneratorForm from './ExerciseGeneratorForm';
import { mindmapService } from '@/lib/services/mindmapService';
import { MindmapNodeData, MindmapEdgeData } from '@/lib/dto/mindmap';

interface MindmapEditorNewProps {
  readonly mindmap: {
    id: number;
    title: string;
    description?: string;
    grade: string;
    subject: string;
    nodes?: MindmapNodeData[];
    edges?: MindmapEdgeData[];
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  };
  onSave?: (mindmap: any) => void;
  onDelete?: (id: number) => void;
  onClose?: () => void;
}

export default function MindmapEditorNew({ 
  mindmap, 
  onSave, 
  onDelete, 
  onClose 
}: Readonly<MindmapEditorNewProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MindmapNodeData[]>(mindmap.nodes || []);
  const [edges, setEdges] = useState<MindmapEdgeData[]>(mindmap.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Modal states
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [showExerciseGenerator, setShowExerciseGenerator] = useState(false);
  const [editingNode, setEditingNode] = useState<MindmapNodeData | null>(null);
  const [detailsNode, setDetailsNode] = useState<MindmapNodeData | null>(null);

  // Galaxy theme colors
  const nodeTypeColors = {
    concept: '#8B5CF6',
    formula: '#06B6D4',
    example: '#F59E0B',
    exercise: '#EC4899',
  };

  // Initialize sample nodes if empty
  useEffect(() => {
    if (nodes.length === 0) {
      const rootNode: MindmapNodeData = {
        id: 'root',
        label: mindmap.title,
        x: 400,
        y: 300,
        color: nodeTypeColors.concept,
        size: 50,
        level: 0,
        nodeType: 'concept',
        content: mindmap.description || 'Chủ đề chính của mindmap',
        exercises: [],
        formulas: [],
        concepts: []
      };
      setNodes([rootNode]);
    }
  }, []);

  // Draw mindmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Galaxy background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.5, '#1E1B4B');
    gradient.addColorStop(1, '#312E81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      ctx.fillRect(x, y, size, size);
    }

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourceX = (sourceNode.x + pan.x) * zoom;
        const sourceY = (sourceNode.y + pan.y) * zoom;
        const targetX = (targetNode.x + pan.x) * zoom;
        const targetY = (targetNode.y + pan.y) * zoom;

        const edgeGradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        edgeGradient.addColorStop(0, edge.color || 'rgba(139, 92, 246, 0.4)');
        edgeGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
        edgeGradient.addColorStop(1, edge.color || 'rgba(139, 92, 246, 0.4)');

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = edgeGradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = edge.color || 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 3 * zoom;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = (node.x + pan.x) * zoom;
      const y = (node.y + pan.y) * zoom;
      const radius = (node.size || 20) * zoom;

      // Glow effect
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 15 * zoom);
      glowGradient.addColorStop(0, node.color || nodeTypeColors.concept);
      glowGradient.addColorStop(0.5, `${node.color || nodeTypeColors.concept}80`);
      glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.beginPath();
      ctx.arc(x, y, radius + 15 * zoom, 0, 2 * Math.PI);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4 * zoom;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#F59E0B';
      } else {
        ctx.strokeStyle = node.color || nodeTypeColors.concept;
        ctx.lineWidth = 3 * zoom;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = node.color || nodeTypeColors.concept;
      ctx.fill();

      // Node label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(12, 14 * zoom)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(node.label, x, y);
      ctx.shadowBlur = 0;

      // Content indicators
      let badgeY = y - radius - 15 * zoom;
      
      if (node.exercises && node.exercises.length > 0) {
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(x, badgeY, 10 * zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(8, 10 * zoom)}px Arial`;
        ctx.fillText(node.exercises.length.toString(), x, badgeY);
        badgeY -= 20 * zoom;
      }

      if (node.formulas && node.formulas.length > 0) {
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.arc(x, badgeY, 10 * zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(8, 10 * zoom)}px Arial`;
        ctx.fillText(node.formulas.length.toString(), x, badgeY);
        badgeY -= 20 * zoom;
      }

      if (node.concepts && node.concepts.length > 0) {
        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.arc(x, badgeY, 10 * zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(8, 10 * zoom)}px Arial`;
        ctx.fillText(node.concepts.length.toString(), x, badgeY);
      }
    });
  }, [nodes, edges, selectedNode, zoom, pan]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    const clickedNode = nodes.find(node => {
      const distance = Math.hypot(node.x - x, node.y - y);
      return distance <= (node.size || 20);
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      if (e.detail === 2) {
        // Double click - show details
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
      return distance <= (node.size || 20);
    });

    if (clickedNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - clickedNode.x * zoom, y: e.clientY - clickedNode.y * zoom });
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

    setNodes(nodes.map(n =>
      n.id === selectedNode ? { ...n, x: newX, y: newY } : n
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addNode = () => {
    if (!selectedNode) return;

    const parentNode = nodes.find(n => n.id === selectedNode);
    if (!parentNode) return;

    const newNodeId = `node_${Date.now()}`;
    const angle = Math.random() * 2 * Math.PI;
    const distance = 150;

    const newNode: MindmapNodeData = {
      id: newNodeId,
      label: 'Node mới',
      x: parentNode.x + Math.cos(angle) * distance,
      y: parentNode.y + Math.sin(angle) * distance,
      color: nodeTypeColors.concept,
      size: 35,
      level: (parentNode.level || 0) + 1,
      nodeType: 'concept',
      content: 'Thêm nội dung chi tiết cho node này',
      exercises: [],
      formulas: [],
      concepts: []
    };

    setNodes([...nodes, newNode]);

    const newEdge: MindmapEdgeData = {
      id: `edge_${Date.now()}`,
      source: selectedNode,
      target: newNodeId,
      color: 'rgba(139, 92, 246, 0.5)'
    };

    setEdges([...edges, newEdge]);
    setSelectedNode(newNodeId);
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode === 'root') return;

    setNodes(nodes.filter(n => n.id !== selectedNode));
    setEdges(edges.filter(e => e.source !== selectedNode && e.target !== selectedNode));
    setSelectedNode(null);
  };

  const editNode = () => {
    if (!selectedNode) return;
    
    const node = nodes.find(n => n.id === selectedNode);
    if (node) {
      setEditingNode(node);
      setShowNodeEditor(true);
    }
  };

  const saveNodeEdit = (updates: Partial<MindmapNodeData>) => {
    if (!editingNode) return;

    setNodes(nodes.map(n =>
      n.id === editingNode.id ? { ...n, ...updates } : n
    ));
    setShowNodeEditor(false);
    setEditingNode(null);
  };

  const saveMindmap = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await mindmapService.updateMindmap(mindmap.id, {
        nodes: nodes,
        edges: edges
      });

      setSaveStatus('success');
      
      if (onSave) {
        onSave({ ...mindmap, nodes, edges });
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving mindmap:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10">
      {/* Header */}
      <CardHeader className="pb-4 border-b-2 border-purple-500/50 bg-gradient-to-r from-purple-800 via-purple-700 to-pink-700 shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mindmap.title}</h2>
              <p className="text-purple-100 text-sm mt-1">{mindmap.description || 'Không có mô tả'}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0">
                  {mindmap.grade}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  {mindmap.subject}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-300 bg-green-900/30 px-3 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>Đã lưu</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-300 bg-red-900/30 px-3 py-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>Lỗi lưu</span>
              </div>
            )}

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className={isEditing ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              {isEditing ? <Move className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
            </Button>

            <Button
              onClick={saveMindmap}
              disabled={isSaving}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu
            </Button>

            {onDelete && (
              <Button
                onClick={() => onDelete(mindmap.id)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            )}

            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Toolbar */}
      {isEditing && selectedNode && (
        <div className="px-6 py-4 border-b-2 border-purple-600/40 bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-pink-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Node đã chọn:</span>
              <Badge className="bg-white/20 text-white">
                {selectedNodeData?.label || 'Không có'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addNode}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm node con
              </Button>

              <Button
                onClick={editNode}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Sửa node
              </Button>

              <Button
                onClick={() => {
                  if (selectedNodeData) {
                    setDetailsNode(selectedNodeData);
                    setShowNodeDetails(true);
                  }
                }}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>

              <Button
                onClick={() => setShowExerciseGenerator(true)}
                size="sm"
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Tạo bài tập
              </Button>

              {selectedNode !== 'root' && (
                <Button
                  onClick={deleteNode}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa node
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 z-10">
        <Button
          onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
          size="icon"
          className="bg-white/90 hover:bg-white shadow-lg"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
          size="icon"
          className="bg-white/90 hover:bg-white shadow-lg"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Badge className="bg-white/90 text-gray-900 justify-center">
          {Math.round(zoom * 100)}%
        </Badge>
      </div>

      {/* Canvas */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="w-full h-full cursor-crosshair"
        />
      </CardContent>

      {/* Modals */}
      {showNodeDetails && detailsNode && (
        <NodeDetailView
          nodeId={detailsNode.id}
          nodeName={detailsNode.label}
          onClose={() => {
            setShowNodeDetails(false);
            setDetailsNode(null);
          }}
        />
      )}

      {showExerciseGenerator && selectedNodeData && (
        <ExerciseGeneratorForm
          nodeId={parseInt(selectedNodeData.id)}
          nodeName={selectedNodeData.label}
          onSuccess={(exercises) => {
            // Refresh node data
            const updatedNode = {
              ...selectedNodeData,
              exercises: [...(selectedNodeData.exercises || []), ...exercises]
            };
            setNodes(nodes.map(n => n.id === selectedNodeData.id ? updatedNode : n));
          }}
          onClose={() => setShowExerciseGenerator(false)}
        />
      )}

      {showNodeEditor && editingNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h3 className="text-xl font-bold">Chỉnh sửa Node</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tên node</Label>
                <Input
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Textarea
                  value={editingNode.content || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Loại node</Label>
                <select
                  value={editingNode.nodeType}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    nodeType: e.target.value as any,
                    color: nodeTypeColors[e.target.value as keyof typeof nodeTypeColors]
                  })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="concept">Khái niệm</option>
                  <option value="formula">Công thức</option>
                  <option value="example">Ví dụ</option>
                  <option value="exercise">Bài tập</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => saveNodeEdit(editingNode)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
                <Button
                  onClick={() => {
                    setShowNodeEditor(false);
                    setEditingNode(null);
                  }}
                  variant="outline"
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
