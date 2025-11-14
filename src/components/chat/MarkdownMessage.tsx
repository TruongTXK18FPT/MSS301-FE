'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

// Helper function to match balanced parentheses
function findBalancedParentheses(str: string, startIndex: number): number | null {
  let depth = 0;
  let i = startIndex;
  while (i < str.length) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return null;
}

// Pre-process content to convert math expressions in parentheses to KaTeX format
function preprocessMath(content: string): string {
  let processed = content;
  
  // Fix malformed LaTeX: \left$$...\right$$ -> $$\left...\right$$
  processed = processed.replace(/\\left\$\$/g, '$$\\left');
  processed = processed.replace(/\\right\$\$/g, '\\right$$');
  
  // Fix: $$...$$' -> $$...$$ (remove trailing quote after $$)
  processed = processed.replace(/\$\$'/g, "$$'");
  
  // Fix standalone math commands wrapped in wrong delimiters
  // Example: \left$$\frac{u}{v}\right$$' -> $$\left(\frac{u}{v}\right)'$$
  processed = processed.replace(/\$\$\\left([({])?\\frac\{([^}]+)\}\{([^}]+)\}\\right([)}])?\$\$(['′]?)/g, 
    (match, leftParen, num, denom, rightParen, prime) => {
      const left = leftParen || '(';
      const right = rightParen || ')';
      return `$$\\left${left}\\frac{${num}}{${denom}}\\right${right}${prime || ''}$$`;
    });
  
  // Find all potential math expressions in parentheses
  // Look for patterns like ( \lim... ), ( \frac... ), etc.
  const mathStartPattern = /\(\s*\\[a-zA-Z]+/g;
  let match;
  const replacements: Array<{ start: number; end: number; replacement: string }> = [];
  
  while ((match = mathStartPattern.exec(processed)) !== null) {
    const startPos = match.index;
    const endPos = findBalancedParentheses(processed, startPos);
    
    if (endPos !== null) {
      const mathContent = processed.slice(startPos + 1, endPos).trim();
      
      // Check if it contains LaTeX commands
      if (mathContent.includes('\\')) {
        // Determine if it should be inline or block math
        // Block math for: \lim, \sum, \int, \prod, \sqrt at the start
        const isBlockMath = /^\\\s*(lim|sum|int|prod|sqrt|frac|left|right)/.test(mathContent);
        
        replacements.push({
          start: startPos,
          end: endPos + 1,
          replacement: isBlockMath ? `$$${mathContent}$$` : `$${mathContent}$`
        });
      }
    }
  }
  
  // Apply replacements in reverse order to maintain indices
  const reversedReplacements = [...replacements].reverse();
  for (const { start, end, replacement } of reversedReplacements) {
    processed = processed.slice(0, start) + replacement + processed.slice(end);
  }
  
  return processed;
}

export default function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const processedContent = preprocessMath(content);
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Code blocks and inline code
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            
            if (!inline && match) {
              return (
                <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto my-2">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            
            return (
              <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Headings
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-3 mb-1.5 text-inherit">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mt-2.5 mb-1.5 text-inherit">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mt-2 mb-1 text-inherit">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mt-1.5 mb-1 text-inherit">{children}</h4>,
          // Paragraphs - giảm margin để text gọn hơn
          p: ({ children }) => <p className="mb-1.5 leading-relaxed text-inherit">{children}</p>,
          // Lists - giảm spacing và margin
          ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5 ml-3 text-inherit">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5 ml-3 text-inherit">{children}</ol>,
          li: ({ children }) => <li className="ml-1 text-inherit leading-relaxed">{children}</li>,
          // Strong and emphasis
          strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
          em: ({ children }) => <em className="italic text-inherit">{children}</em>,
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {children}
            </a>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-400 pl-4 my-1.5 italic text-inherit">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => <hr className="my-3 border-purple-500/30" />,
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-purple-500/30">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-purple-600/20">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-purple-500/20">{children}</tr>,
          th: ({ children }) => (
            <th className="border border-purple-500/30 px-4 py-2 text-left font-semibold text-inherit">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-purple-500/30 px-4 py-2 text-inherit">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

