'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Image as ImageIcon,
  X,
  Upload,
  Type,
  Calculator
} from 'lucide-react';
import { mediaService } from '@/lib/services/media.service';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  allowImage?: boolean;
  folder?: string;
}

export default function MathTextInput({
  value,
  onChange,
  placeholder = 'Enter text or math equation...',
  rows = 3,
  label,
  allowImage = true,
  folder = 'quiz-questions',
}: MathTextInputProps) {
  const [uploading, setUploading] = useState(false);
  const [showMathHelp, setShowMathHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse text to extract images and math
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'image' | 'math' | 'block-math'; content: string }> = [];
    
    // Match images ![alt](url)
    // Match inline math $...$
    // Match block math $$...$$
    const regex = /!\[([^\]]*)\]\(([^)]+)\)|\$\$([^$]+)\$\$|\$([^$]+)\$|([^$!]+)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        // Image
        parts.push({ type: 'image', content: match[2] });
      } else if (match[3]) {
        // Block math $$...$$
        parts.push({ type: 'block-math', content: match[3].trim() });
      } else if (match[4]) {
        // Inline math $...$
        parts.push({ type: 'math', content: match[4].trim() });
      } else if (match[5]) {
        // Plain text
        parts.push({ type: 'text', content: match[5] });
      }
    }
    
    return parts;
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await mediaService.uploadFile(file, folder);
      
      // Insert image markdown at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = value.substring(0, start);
        const after = value.substring(end);
        const imageMarkdown = `![${file.name}](${result.secureUrl})`;
        onChange(before + imageMarkdown + after);
      } else {
        onChange(value + `\n![${file.name}](${result.secureUrl})`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Tải hình ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const insertMath = (mathType: 'inline' | 'block') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const selectedText = value.substring(start, end);
    
    let mathMarkdown = '';
    if (mathType === 'inline') {
      mathMarkdown = `$${selectedText || 'x^2 + y^2 = z^2'}$`;
    } else {
      mathMarkdown = `\n$$\n${selectedText || '\\sum_{i=1}^{n} x_i = n'}\n$$\n`;
    }
    
    onChange(before + mathMarkdown + after);
    
    // Set cursor position after inserted math
    setTimeout(() => {
      const newPosition = start + (mathType === 'inline' ? 1 : 4);
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const renderPreview = () => {
    const parts = parseContent(value);
    
    return (
      <div className="prose prose-sm max-w-none">
        {parts.map((part, index) => {
          if (part.type === 'image') {
            return (
              <img
                key={index}
                src={part.content}
                alt="Question image"
                className="max-w-full h-auto rounded border"
                style={{ maxHeight: '200px' }}
              />
            );
          } else if (part.type === 'math') {
            try {
              return <InlineMath key={index} math={part.content} />;
            } catch (error) {
              return <span key={index} className="text-red-500">{part.content}</span>;
            }
          } else if (part.type === 'block-math') {
            try {
              return (
                <div key={index} className="my-2">
                  <BlockMath math={part.content} />
                </div>
              );
            } catch (error) {
              return <div key={index} className="text-red-500">{part.content}</div>;
            }
          } else {
            return <span key={index}>{part.content}</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        {allowImage && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>Đang tải...</>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Hình ảnh
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertMath('inline')}
        >
          <Calculator className="w-4 h-4 mr-1" />
          Công thức inline
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertMath('block')}
        >
          <Type className="w-4 h-4 mr-1" />
          Công thức block
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMathHelp(!showMathHelp)}
        >
          {showMathHelp ? 'Ẩn' : 'Hiện'} Trợ giúp
        </Button>
      </div>

      {/* Math Help */}
      {showMathHelp && (
        <div className="text-xs bg-blue-50 dark:bg-blue-950 p-3 rounded border">
          <p className="font-semibold mb-2">Ví dụ LaTeX Math:</p>
          <ul className="space-y-1">
            <li>• Inline: <code>$x^2 + y^2 = z^2$</code> → <InlineMath math="x^2 + y^2 = z^2" /></li>
            <li>• Phân số: <code>$\frac{"{a}{b}"}$</code> → <InlineMath math="\frac{a}{b}" /></li>
            <li>• Căn bậc 2: <code>$\sqrt{"{x}"}$</code> → <InlineMath math="\sqrt{x}" /></li>
            <li>• Tổng: <code>$\sum_{"{i=1}"}^{"{n}"} x_i$</code> → <InlineMath math="\sum_{i=1}^{n} x_i" /></li>
            <li>• Tích phân: <code>$\int_a^b f(x) dx$</code> → <InlineMath math="\int_a^b f(x) dx" /></li>
            <li>• Ký tự Hy Lạp: <code>$\alpha, \beta, \gamma, \pi$</code> → <InlineMath math="\alpha, \beta, \gamma, \pi" /></li>
            <li>• Hình ảnh: <code>![mô tả](url)</code></li>
          </ul>
        </div>
      )}

      {/* Input Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />

      {/* Preview */}
      {value && (
        <div className="border rounded p-3 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs font-semibold mb-2 text-muted-foreground">Xem trước:</p>
          {renderPreview()}
        </div>
      )}
    </div>
  );
}
