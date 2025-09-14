'use client';

import { generateMathMindMap } from "@/ai/flows/ai-chatbot-math-mindmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, Loader, Send, User, Brain, Calculator, BookOpen, Zap } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

type Message = {
  role: 'user' | 'bot' | 'system';
  content: string;
  actions?: React.ReactNode;
};

type ChatState = 'model_selection' | 'asking_grade' | 'asking_goal' | 'generating' | 'showing_mindmap' | 'done';

type AIModel = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  specialty: string;
};

const aiModels: AIModel[] = [
  {
    id: 'algebra-master',
    name: 'Algebra Master',
    description: 'Chuyên gia về đại số và phương trình',
    icon: <Calculator className="size-6" />,
    specialty: 'Đại số & Phương trình'
  },
  {
    id: 'geometry-genius',
    name: 'Geometry Genius', 
    description: 'Thầy giáo hình học thông minh',
    icon: <Brain className="size-6" />,
    specialty: 'Hình học & Không gian'
  },
  {
    id: 'calculus-wizard',
    name: 'Calculus Wizard',
    description: 'Pháp sư giải tích cao cấp',
    icon: <Zap className="size-6" />,
    specialty: 'Giải tích & Vi tích phân'
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'Chuyên gia giải bài tập tổng hợp',
    icon: <BookOpen className="size-6" />,
    specialty: 'Giải bài tập tổng hợp'
  }
];

const gradeLevels = Array.from({ length: 12 }, (_, i) => i + 1);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>('model_selection');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatState === 'model_selection' && messages.length === 0) {
      setMessages([
        { role: 'system', content: '🌟 Chào mừng đến với MathMind AI! 🌟' },
        { role: 'bot', content: 'Chọn một AI Mathematician để bắt đầu cuộc phiêu lưu toán học của bạn!' }
      ]);
    }
  }, [chatState, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (role: Message['role'], content: string, actions?: React.ReactNode) => {
    setMessages(prev => [...prev, { role, content, actions }]);
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    addMessage('user', `Tôi chọn ${model.name} - ${model.specialty}`);
    addMessage('bot', `Tuyệt vời! Tôi là ${model.name}, ${model.description}. Để bắt đầu, bạn đang học lớp mấy?`);
    setChatState('asking_grade');
  };

  const handleGradeSelect = (selectedGrade: number) => {
    if (chatState !== 'asking_grade') return;
    setGrade(selectedGrade);
    addMessage('user', `Tôi học lớp ${selectedGrade}.`);
    addMessage('bot', `Tuyệt vời! Vậy mục tiêu học tập của bạn hôm nay là gì? (Ví dụ: học bảng nhân, ôn tập phương trình bậc hai)`);
    setChatState('asking_goal');
  };

  const handleGoalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatState !== 'asking_goal' || !userInput.trim() || !grade) return;
    
    const goal = userInput.trim();
    addMessage('user', goal);
    setUserInput('');
    setChatState('generating');
    addMessage('bot', 'Đang tạo mindmap cho bạn, vui lòng đợi trong giây lát...');

    try {
      const result = await generateMathMindMap({ gradeLevel: grade, learningGoal: goal });
      const mindmapActions = (
        <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="bg-transparent border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:text-neon-blue">Mở Editor</Button>
            <Button size="sm" variant="outline" className="bg-transparent border-teal text-teal hover:bg-teal/10 hover:text-teal">Luyện tập 10 câu</Button>
            <Button size="sm" variant="outline" className="bg-transparent border-gold text-gold hover:bg-gold/10 hover:text-gold">Xem nguồn</Button>
        </div>
      );
      addMessage('bot', `Đây là mindmap đề xuất cho bạn:\n\n${result.mindMap}`, mindmapActions);
      setChatState('showing_mindmap');
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại.');
      setChatState('asking_goal');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-60 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Galaxy Spiral */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-cyan-500 to-purple-500 animate-spin-slow"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-8 relative z-10">
        <Card className="h-[85vh] flex flex-col bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse">
                <Bot className="size-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient">
                MathMind AI Universe
              </h1>
              <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse">
                <Brain className="size-8 text-white" />
              </div>
            </div>
            {selectedModel && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                  {selectedModel.icon}
                  <span className="text-purple-200 font-medium">{selectedModel.name}</span>
                </div>
              </div>
            )}
          </div>
          
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => {
                const messageKey = `message-${Date.now()}-${index}`;
                let messageClasses = "max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap backdrop-blur-sm border shadow-lg animate-message-pop";
                
                if (message.role === 'user') {
                  messageClasses += " bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-400/30 text-purple-100 shadow-purple-500/20";
                } else if (message.role === 'system') {
                  messageClasses += " bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 text-yellow-100 shadow-yellow-500/20 text-center font-bold";
                } else {
                  messageClasses += " bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-cyan-400/30 text-cyan-100 shadow-cyan-500/20";
                }
                
                return (
                <div key={messageKey} className={cn("flex items-start gap-4 animate-fade-in", message.role === 'user' && "justify-end")}>
                  {message.role === 'bot' && (
                    <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/50 animate-pulse">
                      <Bot className="size-6 text-white" />
                    </div>
                  )}
                  {message.role === 'system' && (
                    <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50">
                      <Brain className="size-6 text-white animate-bounce" />
                    </div>
                  )}
                  <div className={cn(messageClasses)}>
                    <p>{message.content}</p>
                    {message.actions && <div className="mt-3">{message.actions}</div>}
                  </div>
                  {message.role === 'user' && (
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50">
                      <User className="size-6 text-white" />
                    </div>
                  )}
                </div>
                );
              })}
              {chatState === 'generating' && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse">
                    <Bot className="size-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 text-cyan-100 rounded-2xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin size-5" />
                      <span>Đang khám phá vũ trụ toán học...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <CardContent className="p-6 border-t border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
            {chatState === 'model_selection' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map((model) => (
                  <Button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className="p-6 h-auto bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-xl hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
                        {model.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{model.name}</h3>
                        <p className="text-sm text-purple-200 mt-1">{model.description}</p>
                        <span className="text-xs text-cyan-300 mt-2 block">{model.specialty}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            {chatState === 'asking_grade' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {gradeLevels.map(g => (
                  <Button 
                    key={g} 
                    onClick={() => handleGradeSelect(g)} 
                    className="h-12 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-400/30 hover:from-purple-500/40 hover:to-cyan-500/40 text-white font-bold rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    {g}
                  </Button>
                ))}
              </div>
            )}
            
            {chatState === 'asking_goal' && (
              <form onSubmit={handleGoalSubmit} className="flex gap-3">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Nhập mục tiêu học tập của bạn..."
                  className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/70 rounded-xl h-14 flex-1 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                  disabled={chatState !== 'asking_goal'}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-14 w-14 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/30" 
                  disabled={chatState !== 'asking_goal' || !userInput.trim()}
                >
                  <Send className="size-6" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
