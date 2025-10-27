'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Save, Download, Share, Edit, Trash2, Plus, Minus } from "lucide-react";

interface MindmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  level?: number;
}

interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
}

interface MindmapEditorProps {
  mindmap: {
    id: number;
    title: string;
    description?: string;
    grade: string;
    subject: string;
    nodes?: MindmapNode[];
    edges?: MindmapEdge[];
  };
  onSave?: (mindmap: any) => void;
  onDelete?: (id: number) => void;
  onClose?: () => void;
}

export default function MindmapEditor({ mindmap, onSave, onDelete, onClose }: MindmapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MindmapNode[]>(mindmap.nodes || []);
  const [edges, setEdges] = useState<MindmapEdge[]>(mindmap.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Màu sắc cho các level khác nhau
  const nodeColors = [
    '#3B82F6', // Blue - root
    '#10B981', // Green - level 1
    '#F59E0B', // Yellow - level 2
    '#EF4444', // Red - level 3
    '#8B5CF6', // Purple - level 4
    '#06B6D4', // Cyan - level 5
  ];

  // Khởi tạo mindmap mẫu nếu chưa có nodes
  useEffect(() => {
    if (nodes.length === 0) {
      const sampleNodes: MindmapNode[] = [
        { id: 'root', label: mindmap.title, x: 400, y: 200, color: nodeColors[0], size: 20, level: 0 },
        { id: 'node1', label: 'Khái niệm cơ bản', x: 200, y: 100, color: nodeColors[1], size: 16, level: 1 },
        { id: 'node2', label: 'Công thức', x: 600, y: 100, color: nodeColors[1], size: 16, level: 1 },
        { id: 'node3', label: 'Ứng dụng', x: 400, y: 300, color: nodeColors[1], size: 16, level: 1 },
      ];
      setNodes(sampleNodes);

      const sampleEdges: MindmapEdge[] = [
        { id: 'edge1', source: 'root', target: 'node1', color: '#6B7280' },
        { id: 'edge2', source: 'root', target: 'node2', color: '#6B7280' },
        { id: 'edge3', source: 'root', target: 'node3', color: '#6B7280' },
      ];
      setEdges(sampleEdges);
    }
  }, [mindmap.title]);

  // Vẽ mindmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ edges trước
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x * zoom, sourceNode.y * zoom);
        ctx.lineTo(targetNode.x * zoom, targetNode.y * zoom);
        ctx.strokeStyle = edge.color || '#6B7280';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Vẽ nodes
    nodes.forEach(node => {
      const x = node.x * zoom;
      const y = node.y * zoom;
      const radius = (node.size || 16) * zoom;

      // Vẽ node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || nodeColors[0];
      ctx.fill();
      ctx.strokeStyle = selectedNode === node.id ? '#1F2937' : '#E5E7EB';
      ctx.lineWidth = selectedNode === node.id ? 3 : 1;
      ctx.stroke();

      // Vẽ label
      ctx.fillStyle = '#1F2937';
      ctx.font = `${12 * zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y + 4 * zoom);
    });
  }, [nodes, edges, selectedNode, zoom]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Kiểm tra click vào node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance <= (node.size || 16);
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else {
      setSelectedNode(null);
    }
  };

  const addNode = () => {
    if (!selectedNode) return;

    const selectedNodeData = nodes.find(n => n.id === selectedNode);
    if (!selectedNodeData) return;

    const newNode: MindmapNode = {
      id: `node_${Date.now()}`,
      label: 'Node mới',
      x: selectedNodeData.x + 150,
      y: selectedNodeData.y + 50,
      color: nodeColors[(selectedNodeData.level || 0) + 1] || nodeColors[0],
      size: 14,
      level: (selectedNodeData.level || 0) + 1
    };

    setNodes([...nodes, newNode]);
    setEdges([...edges, {
      id: `edge_${Date.now()}`,
      source: selectedNode,
      target: newNode.id,
      color: '#6B7280'
    }]);
  };

  const deleteNode = () => {
    if (!selectedNode) return;

    setNodes(nodes.filter(n => n.id !== selectedNode));
    setEdges(edges.filter(e => e.source !== selectedNode && e.target !== selectedNode));
    setSelectedNode(null);
  };

  const updateNodeLabel = (nodeId: string, newLabel: string) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, label: newLabel } : node
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              {mindmap.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{mindmap.grade}</Badge>
              <Badge variant="outline">{mindmap.subject}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Thoát chỉnh sửa' : 'Chỉnh sửa'}
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Lưu
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Đóng
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Toolbar */}
      {isEditing && (
        <div className="px-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNode}
              disabled={!selectedNode}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm node
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteNode}
              disabled={!selectedNode}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa node
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <CardContent className="flex-1 p-0">
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-200 rounded-lg cursor-pointer"
            onClick={handleCanvasClick}
          />
          
          {/* Node editor */}
          {isEditing && selectedNode && (
            <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
              <h4 className="font-medium mb-2">Chỉnh sửa node</h4>
              <input
                type="text"
                value={nodes.find(n => n.id === selectedNode)?.label || ''}
                onChange={(e) => updateNodeLabel(selectedNode, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Nhập tên node"
              />
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
