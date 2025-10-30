'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexPreviewProps {
  content: string;
  className?: string;
}

export default function LatexPreview({ content, className = '' }: LatexPreviewProps) {
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'image' | 'math' | 'block-math'; content: string }> = [];
    
    // Match images ![alt](url), block math $$...$$, inline math $...$
    const regex = /!\[([^\]]*)\]\(([^)]+)\)|\$\$([^$]+)\$\$|\$([^$]+)\$|([^$!]+)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        parts.push({ type: 'image', content: match[2] });
      } else if (match[3]) {
        parts.push({ type: 'block-math', content: match[3].trim() });
      } else if (match[4]) {
        parts.push({ type: 'math', content: match[4].trim() });
      } else if (match[5]) {
        parts.push({ type: 'text', content: match[5] });
      }
    }
    
    return parts;
  };

  const parts = parseContent(content);

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'image') {
          return (
            <img
              key={index}
              src={part.content}
              alt="Content image"
              className="max-w-full h-auto rounded my-2"
              style={{ maxHeight: '300px' }}
            />
          );
        } else if (part.type === 'math') {
          try {
            return <InlineMath key={index} math={part.content} />;
          } catch (error) {
            return (
              <span key={index} className="text-red-500 bg-red-50 px-1 rounded">
                ${part.content}$ (Invalid LaTeX)
              </span>
            );
          }
        } else if (part.type === 'block-math') {
          try {
            return (
              <div key={index} className="my-4">
                <BlockMath math={part.content} />
              </div>
            );
          } catch (error) {
            return (
              <div key={index} className="text-red-500 bg-red-50 p-2 rounded my-2">
                $${part.content}$$ (Invalid LaTeX)
              </div>
            );
          }
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </div>
  );
}
