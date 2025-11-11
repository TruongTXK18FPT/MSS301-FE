'use client';

import { useState, useEffect, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Save, Edit, Trash2, Plus, Minus, X, Sparkles, Target, Calculator, FileQuestion, Lightbulb, Globe, Lock, Eye } from "lucide-react";
import { mindmapService } from '@/lib/services/mindmapService';
import { useToast } from '@/hooks/use-toast';
import NodeDetailView from './NodeDetailView';
import ExerciseGeneratorForm from './ExerciseGeneratorForm';
import ConceptGeneratorForm from './ConceptGeneratorForm';
import FormulaGeneratorForm from './FormulaGeneratorForm';
import type { ConceptResponse, FormulaResponse, ExerciseResponse } from '@/lib/dto';

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
  nodeType?: 'CONCEPT' | 'FORMULA' | 'EXERCISE';
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
    userId?: number;
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
  readOnly?: boolean; // Chế độ chỉ xem, không cho edit
}

// Convert backend nodes to frontend format
const convertBackendNode = (backendNode: any, nodeTypeColors: Record<string, string>): MindmapNode => {
  // Get color based on node type, fallback to backend color or default purple
  const nodeType = backendNode.nodeType || 'CONCEPT';
  const typeColor = nodeTypeColors[nodeType] || nodeTypeColors[nodeType.toLowerCase()] || '#8B5CF6';
  
  return {
    id: backendNode.id?.toString() || `node_${Date.now()}`,
    label: backendNode.title || backendNode.label || 'Untitled',
    x: backendNode.positionX || backendNode.x || 400,
    y: backendNode.positionY || backendNode.y || 300,
    color: typeColor,  // Use color based on node type
    size: backendNode.width ? backendNode.width / 2 : 30,
    level: backendNode.level || 0,
    content: backendNode.content || '',
    nodeType: nodeType,
    exercises: [],
    backendId: backendNode.id,
    parentNodeId: backendNode.parentNodeId
  };
};

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number): string => {
  if (!color) return '#8B5CF6';
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
  const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
  const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));
  
  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
};

// Helper function to get node icon
const getNodeIcon = (nodeType?: string): string => {
  switch (nodeType) {
    case 'formula': return '∑';
    case 'exercise': return '?';
    case 'example': return '★';
    default: return '●';
  }
};

// Wrap text in canvas with proper line breaks
const wrapText = (ctx: CanvasRenderingContext2D, text: string | null, maxWidth: number): string[] => {
  // Handle null or undefined text
  if (!text) {
    return [];
  }

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

// Calculate dynamic node size based on text content
const calculateNodeSize = (ctx: CanvasRenderingContext2D, text: string, baseSize: number = 60, zoom: number = 1): number => {
  if (!text) return baseSize * zoom;
  
  // Set font for measurement
  const fontSize = Math.max(13, 16 * zoom);
  ctx.font = `bold ${fontSize}px 'Inter', 'Segoe UI', -apple-system, sans-serif`;
  
  // Measure text width
  const textWidth = ctx.measureText(text).width;
  
  // Calculate required radius to fit text (with padding)
  const minRadius = Math.max(baseSize, (textWidth / 2) + 25);
  
  return Math.min(minRadius * zoom, 120 * zoom); // Cap at 120 to prevent huge nodes
};

export default function MindmapEditor({ mindmap, onSave, onDelete, onClose, readOnly = false }: Readonly<MindmapEditorProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [detailsNode, setDetailsNode] = useState<MindmapNode | null>(null);
  const [showExerciseGenerator, setShowExerciseGenerator] = useState(false);
  const [showConceptGenerator, setShowConceptGenerator] = useState(false);
  const [showFormulaGenerator, setShowFormulaGenerator] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [currentVisibility, setCurrentVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'CLASSROOM'>(mindmap.visibility || 'PRIVATE');
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  
  // Store node entity data (concepts, formulas, exercises)
  const [nodeConcepts, setNodeConcepts] = useState<Record<number, ConceptResponse[]>>({});
  const [nodeFormulas, setNodeFormulas] = useState<Record<number, FormulaResponse[]>>({});
  const [nodeExercises, setNodeExercises] = useState<Record<number, ExerciseResponse[]>>({});

  // Galaxy theme colors - more vibrant
  const nodeTypeColors: Record<string, string> = {
    concept: '#8B5CF6',     // Purple - Khái niệm
    formula: '#06B6D4',     // Cyan - Công thức (xanh)
    example: '#F59E0B',     // Amber
    exercise: '#EC4899',    // Pink - Bài tập (hồng)
    center: '#EAB308',      // Yellow - Node trung tâm (vàng)
    root: '#EAB308',        // Yellow - Node root (vàng)
    CONCEPT: '#8B5CF6',     // Purple - Khái niệm (tím)
    FORMULA: '#06B6D4',     // Cyan - Công thức (xanh)
    EXERCISE: '#EC4899',    // Pink - Bài tập (hồng)
    CENTER: '#EAB308',      // Yellow - Node trung tâm (vàng)
    ROOT: '#EAB308',        // Yellow - Node root (vàng)
  };

  // Load nodes from backend when component mounts
  useEffect(() => {
    loadNodesFromBackend();
  }, [mindmap.id]);

  // Center view with initial zoom when nodes are loaded
  useEffect(() => {
    if (nodes.length > 0 && canvasRef.current) {
      // Calculate optimal zoom based on number of nodes
      const optimalZoom = nodes.length > 15 ? 0.5 : nodes.length > 10 ? 0.7 : 1.0;
      
      // Delay to ensure canvas is fully rendered
      setTimeout(() => {
        centerView(optimalZoom);
      }, 100);
    }
  }, [nodes.length]);

  const centerView = (targetZoom: number = 1.0) => {
    if (nodes.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Calculate bounding box of all nodes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const nodeWidth = (node.size || 40) * 2;
      const nodeHeight = (node.size || 40) * 1.5;
      const padding = 50;
      minX = Math.min(minX, node.x - nodeWidth/2 - padding);
      maxX = Math.max(maxX, node.x + nodeWidth/2 + padding);
      minY = Math.min(minY, node.y - nodeHeight/2 - padding);
      maxY = Math.max(maxY, node.y + nodeHeight/2 + padding);
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Set zoom to targetZoom (default 100% = 1.0)
    const newZoom = targetZoom;
    
    // Center the view - pan should center the content at the target zoom level
    const newPanX = canvas.width / 2 - (centerX * newZoom);
    const newPanY = canvas.height / 2 - (centerY * newZoom);
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    
    console.log('[centerView] Adjusted view:', { 
      nodes: nodes.length, 
      bounds: { minX, maxX, minY, maxY },
      zoom: newZoom, 
      pan: { x: newPanX, y: newPanY },
      center: { centerX, centerY }
    });
  };

  // Auto-layout nodes in circular/radial pattern
  const autoLayoutNodes = () => {
    if (nodes.length === 0) return;

    // Find root node (level 0 or node with id 'root')
    const rootNode = nodes.find(n => n.id === 'root' || n.level === 0);
    if (!rootNode) {
      console.warn('[autoLayout] No root node found');
      return;
    }

    // Center root node
    const centerX = 500;
    const centerY = 400;
    
    // Update root position
    updateNode(rootNode.id, { x: centerX, y: centerY });

    // Group nodes by level
    const nodesByLevel: Record<number, MindmapNode[]> = {};
    nodes.forEach(node => {
      if (node.id === rootNode.id) return;
      const level = node.level || 1;
      if (!nodesByLevel[level]) nodesByLevel[level] = [];
      nodesByLevel[level].push(node);
    });

    // Layout each level in circular pattern
    Object.keys(nodesByLevel).forEach(levelKey => {
      const level = parseInt(levelKey);
      const levelNodes = nodesByLevel[level];
      const nodeCount = levelNodes.length;
      
      // Calculate radius based on level (200px per level + spacing for node count)
      const baseRadius = 200 + (level - 1) * 150;
      const radius = Math.max(baseRadius, (nodeCount * 80) / (2 * Math.PI)); // Ensure enough space
      
      // Distribute nodes evenly in circle
      levelNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodeCount - Math.PI / 2; // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        updateNode(node.id, { x, y });
      });
    });

    // Auto-center after layout
    setTimeout(() => {
      const optimalZoom = nodes.length > 15 ? 0.5 : nodes.length > 10 ? 0.7 : 1.0;
      centerView(optimalZoom);
    }, 100);
    
    console.log('[autoLayout] Layout completed:', { 
      totalNodes: nodes.length, 
      levels: Object.keys(nodesByLevel).length 
    });
  };

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
        // Sử dụng viewMindmapNodes nếu readOnly, getMindmapNodes nếu không
        const backendNodes = readOnly 
          ? await mindmapService.viewMindmapNodes(mindmap.id)
          : await mindmapService.getMindmapNodes(mindmap.id);
        console.log('[MindmapEditor] Loaded nodes from backend:', backendNodes);

        if (backendNodes && backendNodes.length > 0) {
          // Convert nodes to frontend format
          const convertedNodes = backendNodes.map(node => convertBackendNode(node, nodeTypeColors));
          setNodes(convertedNodes);

          // Create edges from parent-child relationships
          const newEdges: MindmapEdge[] = [];
          backendNodes.forEach((node: any) => {
            if (node.parentNodeId) {
              // Find parent node in converted nodes
              const parentNodeIndex = backendNodes.findIndex((n: any) => n.id === node.parentNodeId);
              const currentNodeIndex = backendNodes.findIndex((n: any) => n.id === node.id);
              
              if (parentNodeIndex >= 0 && currentNodeIndex >= 0) {
                // Use the frontend node IDs (which were assigned during conversion)
                const sourceNodeId = convertedNodes[parentNodeIndex].id;
                const targetNodeId = convertedNodes[currentNodeIndex].id;
                
                newEdges.push({
                  id: `edge_${node.parentNodeId}_${node.id}`,
                  source: sourceNodeId,  // Use frontend node ID
                  target: targetNodeId,  // Use frontend node ID
                  color: 'rgba(139, 92, 246, 0.5)'
                });
              }
            }
          });
          setEdges(newEdges);
          console.log('[MindmapEditor] Created edges:', newEdges);
          console.log('[MindmapEditor] Loaded nodes:', convertedNodes.length, 'edges:', newEdges.length);
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
          nodeType: 'CONCEPT',
          content: mindmap.description || 'Chủ đề chính của mindmap',
          exercises: []
        }
      ];
      setNodes(sampleNodes);
      setEdges([]);
  };

  // Add node
  const addNode = (parentId: string, nodeType: 'CONCEPT' | 'FORMULA' | 'EXERCISE' = 'CONCEPT') => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) {
      console.error('[addNode] Parent node not found:', parentId);
      return;
    }

    const newNodeId = `node_${Date.now()}`;
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 50;

    const newNode: MindmapNode = {
      id: newNodeId,
      label: nodeType === 'CONCEPT' ? 'Khái niệm mới' :
             nodeType === 'FORMULA' ? 'Công thức mới' : 'Bài tập mới',
      x: parentNode.x + Math.cos(angle) * distance,
      y: parentNode.y + Math.sin(angle) * distance,
      color: nodeTypeColors[nodeType],
      size: 32,
      level: (parentNode.level || 0) + 1,
      nodeType: nodeType,
      content: `Thêm nội dung cho ${nodeType === 'CONCEPT' ? 'khái niệm' : nodeType === 'FORMULA' ? 'công thức' : 'bài tập'} này`,
      exercises: [],
      parentNodeId: parentNode.backendId // Set parent relationship for backend
    };

    setNodes([...nodes, newNode]);

    // Add edge - IMPORTANT: Use frontend node IDs (node.id, not backendId)
    const newEdge: MindmapEdge = {
      id: `edge_${Date.now()}`,
      source: parentNode.id,  // Use frontend ID
      target: newNodeId,      // Use frontend ID
      color: `rgba(${nodeType === 'CONCEPT' ? '139, 92, 246' : nodeType === 'FORMULA' ? '6, 182, 212' : '236, 72, 153'}, 0.5)`
    };
    setEdges([...edges, newEdge]);
    
    console.log('[addNode] Added node:', newNodeId, 'parent:', parentNode.id, 'edge:', newEdge);
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
      // Validate mindmap ID
      if (!mindmap.id) {
        console.error('[MindmapEditor] Cannot save: mindmap.id is undefined');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }

      console.log('[MindmapEditor] Saving mindmap:', {
        id: mindmap.id,
        nodesCount: nodes.length,
        edgesCount: edges.length
      });

      // Convert nodes back to backend format with proper parent relationships
      // IMPORTANT: Use actual node coordinates (not affected by pan/zoom)
      const backendNodes = nodes.map(node => {
        // Find parent from edges (edges use frontend node IDs)
        const parentEdge = edges.find(e => e.target === node.id);
        const parentNode = parentEdge ? nodes.find(n => n.id === parentEdge.source) : null;

        console.log(`[MindmapEditor] Converting node: id=${node.id}, backendId=${node.backendId}, label=${node.label}`);

        // Map frontend nodeType to backend NodeType enum
        const mapNodeType = (frontendType?: string): string => {
          if (!frontendType) return 'CONCEPT';
          const upperType = frontendType.toUpperCase();
          // Map frontend types to backend enum values
          switch (upperType) {
            case 'FORMULA':
            case 'CÔNG THỨC':
              return 'FORMULA';
            case 'EXERCISE':
            case 'BÀI TẬP':
              return 'EXERCISE';
            case 'EXAMPLE':
            case 'VÍ DỤ':
              return 'EXAMPLE';
            case 'CONCEPT':
            case 'KHÁI NIỆM':
            default:
              return 'CONCEPT';
          }
        };

        // For circular nodes, use diameter as both width and height
        const nodeSize = node.size || 60; // Match the new base size for circles
        const diameter = nodeSize * 2;

        return {
          id: node.backendId,
          title: node.label || 'Untitled', // Ensure title is never null/empty
          content: node.content || '',
          nodeType: mapNodeType(node.nodeType), // Ensure valid enum value
          // Use actual node coordinates - these are independent of pan/zoom
          positionX: Math.round(node.x),
          positionY: Math.round(node.y),
          backgroundColor: node.color,
          level: node.level || 0,
          width: diameter, // Use diameter for circular nodes
          height: diameter, // Use diameter for circular nodes
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

  const toggleVisibility = async () => {
    try {
      setIsTogglingVisibility(true);
      const newVisibility = currentVisibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
      
      // Update on server
      await mindmapService.updateMindmap(mindmap.id, { 
        title: mindmap.title,
        visibility: newVisibility 
      });
      
      // Update local state
      setCurrentVisibility(newVisibility);
      
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
      
      // Notify parent component if callback exists
      if (onSave) {
        onSave({ ...mindmap, visibility: newVisibility });
      }
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

  // Draw mindmap with improved galaxy theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Polyfill for roundRect if not available
    if (!ctx.roundRect) {
      (ctx as any).roundRect = function(x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas with black space background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated floating stars (like homepage)
    const time = Date.now() * 0.001;
    for (let i = 0; i < 150; i++) {
      const x = (i * 137.5 % canvas.width);
      const y = (i * 73.2 % canvas.height);
      const size = (Math.sin(time * 0.3 + i) + 1) * 0.8 + 0.5;
      const alpha = (Math.sin(time * 0.5 + i) + 1) * 0.3 + 0.3; // Range: 0.3-0.9
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw edges with beautiful curves and glow effects
    for (const edge of edges) {
      // Edge source/target now use frontend node IDs (node.id)
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        // Apply zoom and pan to node positions
        const sourceX = (sourceNode.x * zoom) + pan.x;
        const sourceY = (sourceNode.y * zoom) + pan.y;
        const targetX = (targetNode.x * zoom) + pan.x;
        const targetY = (targetNode.y * zoom) + pan.y;

        // Calculate control points for curved edge
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(80 * zoom, distance * 0.3);
        
        // Control points for smooth curve
        const cp1x = sourceX + dx * 0.5 + (dy * curvature) / distance;
        const cp1y = sourceY + dy * 0.5 - (dx * curvature) / distance;
        const cp2x = targetX - dx * 0.5 + (dy * curvature) / distance;
        const cp2y = targetY - dy * 0.5 - (dx * curvature) / distance;

        // Draw edge glow (multiple layers for better effect)
        ctx.shadowBlur = 20 * zoom;
        ctx.shadowColor = edge.color || 'rgba(139, 92, 246, 0.6)';
        
        // Main edge line with gradient
        const edgeGradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        edgeGradient.addColorStop(0, edge.color || 'rgba(139, 92, 246, 0.8)');
        edgeGradient.addColorStop(0.5, edge.color || 'rgba(139, 92, 246, 0.6)');
        edgeGradient.addColorStop(1, edge.color || 'rgba(139, 92, 246, 0.4)');
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetX, targetY);
        ctx.strokeStyle = edgeGradient;
        ctx.lineWidth = 3 * zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      } else {
        console.warn('[drawCanvas] Edge has missing node:', { 
          edge, 
          sourceFound: !!sourceNode, 
          targetFound: !!targetNode,
          availableNodeIds: nodes.map(n => n.id)
        });
      }
    }

    // Draw nodes with modern design - circular nodes
    for (const node of nodes) {
      const x = (node.x * zoom) + pan.x;
      const y = (node.y * zoom) + pan.y;
      const baseSize = node.size || 60; // Increased base size for larger circles
      
      // Calculate dynamic radius based on text content
      const radius = calculateNodeSize(ctx, node.label, baseSize, zoom);
      
      const isSelected = selectedNode === node.id;
      const nodeColor = node.color || '#8B5CF6';

      // Draw outer glow/halo effect - enhanced
      const glowSize = isSelected ? 35 * zoom : 25 * zoom;
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + glowSize);
      const glowAlpha = isSelected ? '80' : '50';
      glowGradient.addColorStop(0, nodeColor + glowAlpha);
      glowGradient.addColorStop(0.4, nodeColor + '30');
      glowGradient.addColorStop(0.7, nodeColor + '10');
      glowGradient.addColorStop(1, nodeColor + '00');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15 * zoom;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4 * zoom;

      // Draw main node background with enhanced radial gradient
      const nodeGradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
      );
      const lightColor = adjustColorBrightness(nodeColor, 25);
      const midColor = adjustColorBrightness(nodeColor, 5);
      const darkColor = adjustColorBrightness(nodeColor, -15);
      nodeGradient.addColorStop(0, lightColor);
      nodeGradient.addColorStop(0.5, midColor);
      nodeGradient.addColorStop(1, darkColor);
      
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw inner highlight for 3D effect
      const highlightGradient = ctx.createRadialGradient(
        x - radius * 0.4, y - radius * 0.4, 0,
        x - radius * 0.2, y - radius * 0.2, radius * 0.6
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Draw border with enhanced styling
      if (isSelected) {
        // Outer glow border
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 5 * zoom;
        ctx.shadowBlur = 20 * zoom;
        ctx.shadowColor = '#FBBF24';
      } else {
        // Subtle border with glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2.5 * zoom;
        ctx.shadowBlur = 8 * zoom;
        ctx.shadowColor = nodeColor + '60';
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner border for depth
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Draw icon based on nodeType with background circle
      const iconSize = 20 * zoom;
      const iconY = y - radius * 0.4; // Position icon in upper part of circle
      const iconRadius = iconSize * 0.7;
      
      // Icon background circle with glow
      const iconGradient = ctx.createRadialGradient(x, iconY, 0, x, iconY, iconRadius);
      iconGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      iconGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = iconGradient;
      ctx.beginPath();
      ctx.arc(x, iconY, iconRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${iconSize}px 'Segoe UI Symbol', 'Arial', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3 * zoom;
      const icon = getNodeIcon(node.nodeType);
      ctx.fillText(icon, x, iconY);
      ctx.shadowBlur = 0;

      // Draw label with text wrapping and enhanced typography
      const fontSize = Math.max(13, 16 * zoom);
      const maxWidth = radius * 1.6; // Adjust max width for circular layout
      const lines = wrapText(ctx, node.label, maxWidth);
      const lineHeight = Math.max(16, 18 * zoom);
      const totalHeight = lines.length * lineHeight;
      
      // Center text in the circle, below the icon
      const textStartY = y + (iconSize * 0.3);

      // Text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 5 * zoom;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${fontSize}px 'Inter', 'Segoe UI', -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      lines.forEach((line, index) => {
        const lineY = textStartY + (index - (lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, x, lineY);
      });
      ctx.shadowBlur = 0;

      // Draw exercise badge in top-right of circle
      if (node.exercises && node.exercises.length > 0) {
        const badgeAngle = Math.PI / 4; // 45 degrees (top-right)
        const badgeDistance = radius * 0.75;
        const badgeX = x + Math.cos(-badgeAngle) * badgeDistance;
        const badgeY = y + Math.sin(-badgeAngle) * badgeDistance;
        const badgeRadius = 12 * zoom;

        // Badge background with glow
        ctx.fillStyle = '#EC4899';
        ctx.shadowBlur = 8 * zoom;
        ctx.shadowColor = '#EC4899';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Badge text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(9, 10 * zoom)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.exercises.length.toString(), badgeX, badgeY);
      }
    }
  }, [nodes, edges, selectedNode, zoom, pan]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent click if we just finished dragging
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Convert screen coordinates to canvas coordinates
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked node - check if click is within circular node bounds
    const clickedNode = nodes.find(node => {
      const radius = node.size || 60; // Match the new base size for circles
      const dx = canvasX - node.x;
      const dy = canvasY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
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
    // Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked node - check if click is within circular node bounds
    const clickedNode = nodes.find(node => {
      const radius = node.size || 60; // Match the new base size for circles
      const dx = canvasX - node.x;
      const dy = canvasY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });

    if (clickedNode) {
      setIsDragging(true);
      // Store the offset between mouse position and node position
      setDragStart({ 
        x: e.clientX, 
        y: e.clientY, 
        nodeX: clickedNode.x, 
        nodeY: clickedNode.y 
      });
      setSelectedNode(clickedNode.id);
      e.preventDefault(); // Prevent text selection
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate mouse movement delta
    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;
    
    // Update node position based on original position + delta
    const newX = dragStart.nodeX + deltaX;
    const newY = dragStart.nodeY + deltaY;

    updateNode(selectedNode, { x: newX, y: newY });
    e.preventDefault();
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
            {/* Chỉ hiện nút chỉnh sửa khi không phải readOnly */}
            {!readOnly && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVisibilityDialog(true)}
                  className={currentVisibility === 'PUBLIC' 
                    ? "bg-green-500/20 backdrop-blur border-green-300/50 text-green-200 hover:bg-green-500/30"
                    : "bg-orange-500/20 backdrop-blur border-orange-300/50 text-orange-200 hover:bg-orange-500/30"
                  }
                >
                  {currentVisibility === 'PUBLIC' ? (
                    <><Globe className="h-4 w-4 mr-2" />Công khai</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Riêng tư</>
                  )}
                </Button>
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
              </>
            )}
            
            {/* Hiện badge "Chỉ xem" khi readOnly */}
            {readOnly && (
              <Badge className="bg-blue-500/20 border-blue-400/30 text-blue-200 px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                Chế độ xem
              </Badge>
            )}
            
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur">
                <X className="h-4 w-4 mr-2" />
                Đóng
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Toolbar - chỉ hiện khi không phải readOnly */}
      {isEditing && !readOnly && (
        <div className="px-6 py-4 border-b border-purple-600/30 bg-gradient-to-r from-purple-900/70 via-purple-800/70 to-pink-800/70 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'CONCEPT')}
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Thêm khái niệm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'FORMULA')}
              className="bg-cyan-500/20 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/30"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Thêm công thức
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode || 'root', 'EXERCISE')}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  setShowConceptGenerator(true);
                }
              }}
              disabled={!selectedNode}
              className="bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tạo khái niệm AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedNode) {
                  setShowFormulaGenerator(true);
                }
              }}
              disabled={!selectedNode}
              className="bg-cyan-500/20 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tạo công thức AI
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={autoLayoutNodes}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200 hover:from-purple-500/30 hover:to-pink-500/30"
                title="Tự động sắp xếp nodes đẹp mắt"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Auto Layout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => centerView(1.0)}
                className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                title="Căn giữa view để xem tất cả nodes"
              >
                <Target className="h-4 w-4 mr-2" />
                Căn giữa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
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
                    value={editingNode.nodeType || 'CONCEPT'}
                    onValueChange={(value: 'CONCEPT' | 'FORMULA' | 'EXERCISE') =>
                      setEditingNode({...editingNode, nodeType: value, color: nodeTypeColors[value]})
                    }
                  >
                    <SelectTrigger className="bg-black/30 border-purple-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/30">
                      <SelectItem value="CONCEPT" className="text-purple-200">Khái niệm</SelectItem>
                      <SelectItem value="FORMULA" className="text-cyan-300">Công thức</SelectItem>
                      <SelectItem value="EXERCISE" className="text-pink-300">Bài tập</SelectItem>
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
          nodeId={detailsNode.backendId?.toString() || ''}
          nodeName={detailsNode.label}
          nodeType={detailsNode.nodeType}
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
            // Reload node data to get new exercises
            const nodeBackendId = nodes.find(n => n.id === selectedNode)?.backendId;
            if (nodeBackendId) {
              mindmapService.getExercisesByNode(nodeBackendId).then((exercises: ExerciseResponse[]) => {
                setNodeExercises(prev => ({ ...prev, [nodeBackendId]: exercises }));
              }).catch(console.error);
            }
            setShowExerciseGenerator(false);
          }}
          onClose={() => setShowExerciseGenerator(false)}
        />
      )}

      {/* Concept Generator Modal */}
      {showConceptGenerator && selectedNode && (
        <ConceptGeneratorForm
          nodeId={parseInt(nodes.find(n => n.id === selectedNode)?.backendId?.toString() || selectedNode)}
          nodeName={nodes.find(n => n.id === selectedNode)?.label || 'Node'}
          onSuccess={(concepts) => {
            console.log('Generated concepts:', concepts);
            // Reload node data to get new concepts
            const nodeBackendId = nodes.find(n => n.id === selectedNode)?.backendId;
            if (nodeBackendId) {
              mindmapService.getConceptsByNode(nodeBackendId).then((concepts: ConceptResponse[]) => {
                setNodeConcepts(prev => ({ ...prev, [nodeBackendId]: concepts }));
              }).catch(console.error);
            }
            setShowConceptGenerator(false);
          }}
          onClose={() => setShowConceptGenerator(false)}
        />
      )}

      {/* Formula Generator Modal */}
      {showFormulaGenerator && selectedNode && (
        <FormulaGeneratorForm
          nodeId={parseInt(nodes.find(n => n.id === selectedNode)?.backendId?.toString() || selectedNode)}
          nodeName={nodes.find(n => n.id === selectedNode)?.label || 'Node'}
          onSuccess={(formulas) => {
            console.log('Generated formulas:', formulas);
            // Reload node data to get new formulas
            const nodeBackendId = nodes.find(n => n.id === selectedNode)?.backendId;
            if (nodeBackendId) {
              mindmapService.getFormulasByNode(nodeBackendId).then((formulas: FormulaResponse[]) => {
                setNodeFormulas(prev => ({ ...prev, [nodeBackendId]: formulas }));
              }).catch(console.error);
            }
            setShowFormulaGenerator(false);
          }}
          onClose={() => setShowFormulaGenerator(false)}
        />
      )}

      {/* Visibility Toggle Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {currentVisibility === 'PUBLIC' ? (
                <><Lock className="h-5 w-5 text-orange-500" /> Chuyển sang Riêng tư</>
              ) : (
                <><Globe className="h-5 w-5 text-green-500" /> Chuyển sang Công khai</>
              )}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {currentVisibility === 'PUBLIC' ? (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn chuyển mindmap này sang <strong className="text-orange-600">Riêng tư</strong>?
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
                    Bạn có chắc chắn muốn chuyển mindmap này sang <strong className="text-green-600">Công khai</strong>?
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
              onClick={() => setShowVisibilityDialog(false)}
              disabled={isTogglingVisibility}
            >
              Hủy
            </Button>
            <Button
              onClick={toggleVisibility}
              disabled={isTogglingVisibility}
              className={currentVisibility === 'PUBLIC' 
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
    </div>
  );
}
