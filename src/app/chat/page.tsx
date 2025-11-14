'use client';

import { useState, useEffect, useRef } from 'react';

// Type definition for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Loader, Send, User, Brain, Calculator, 
  BookOpen, Zap, Plus, Trash2, MessageSquare, 
  Clock, ChevronLeft, ChevronRight, Mic, MicOff,
  Volume2, VolumeX, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { 
  chatbotService, 
  ChatSessionResponse, 
  ChatRole,
  EXPERT_PROFILES,
  ExpertProfile,
  Source
} from '@/lib/services/chatbot.service';
import { getAllDocuments, DocumentResponseDto, DocumentStatus, getFileSearchStores, FileSearchStoreResponse } from '@/lib/services/document.service';
import MarkdownMessage from '@/components/chat/MarkdownMessage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Toast helper - fallback to console if toast library not available
const toast = {
  success: (message: string) => {
    if (typeof globalThis.window !== 'undefined' && (globalThis.window as any).toast?.success) {
      (globalThis.window as any).toast.success(message);
    } else {
      console.log('✅', message);
    }
  },
  error: (message: string) => {
    if (typeof globalThis.window !== 'undefined' && (globalThis.window as any).toast?.error) {
      (globalThis.window as any).toast.error(message);
    } else {
      console.error('❌', message);
      alert(message);
    }
  }
};

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  audioUrl?: string;
  sources?: Source[];
};

export default function ChatPage() {
  const { id: userId } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponseDto | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [validFileSearchStores, setValidFileSearchStores] = useState<Set<string>>(new Set());
  const [useVoiceChat, setUseVoiceChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load sessions và documents khi component mount
  useEffect(() => {
    if (userId) {
      loadSessions();
      loadDocuments();
      loadValidFileSearchStores();
    }
  }, [userId]);

  // Load messages khi chọn session
  useEffect(() => {
    if (selectedSession) {
      // Set expert profile khi chọn session
      const expert = chatbotService.getExpertProfileById(selectedSession.expertProfileId);
      setSelectedExpert(expert || null);
      loadMessages(selectedSession.id, selectedSession);
    } else {
      setMessages([]);
      setSelectedExpert(null);
    }
  }, [selectedSession]);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ 
        top: scrollAreaRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  const loadSessions = async () => {
    if (!userId) return;
    try {
      setIsLoadingSessions(true);
      const data = await chatbotService.getSessionsByUserId(Number(userId));
      setSessions(data.filter(s => s.status));
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await getAllDocuments(DocumentStatus.COMPLETED);
      if (response.success && response.data) {
        const docs = response.data.documents || [];
        setDocuments(docs);
        // Log để debug
        console.log('Loaded documents:', docs.map(doc => ({
          id: doc.id,
          title: doc.title,
          hasFileSearch: !!doc.googleFileSearchStoreName,
          fileStoreName: doc.googleFileSearchStoreName
        })));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      // Không hiển thị error vì không bắt buộc phải có documents
    }
  };

  const loadValidFileSearchStores = async () => {
    try {
      const response = await getFileSearchStores();
      if (response.success && response.data) {
        // Tạo Set chứa các store names hợp lệ từ Google
        const validStores = new Set(response.data.map(store => store.name));
        setValidFileSearchStores(validStores);
        console.log('Valid File Search Stores loaded:', Array.from(validStores));
        
        // Kiểm tra nếu selectedDocument không còn hợp lệ, clear nó
        if (selectedDocument) {
          const hasValidStore = !selectedDocument.googleFileSearchStoreName || 
            validStores.has(selectedDocument.googleFileSearchStoreName);
          if (!hasValidStore) {
            console.warn('Selected document no longer has valid file search store, clearing selection');
            setSelectedDocument(null);
          }
        }
      } else {
        // Nếu response không success hoặc không có data, set empty set
        console.warn('Failed to load file search stores:', response.message);
        setValidFileSearchStores(new Set());
        
        // Nếu selectedDocument có store nhưng không load được stores, clear nó
        if (selectedDocument?.googleFileSearchStoreName) {
          console.warn('Cannot validate file search stores, clearing selected document with store');
          setSelectedDocument(null);
        }
      }
    } catch (error) {
      console.warn('Error loading file search stores (timeout/network issue). ' +
                   'System will work but file search validation will be disabled:', error);
      // Nếu không load được (timeout, network error), set empty set
      // Hệ thống vẫn hoạt động nhưng không validate file search stores
      setValidFileSearchStores(new Set());
      
      // Nếu selectedDocument có store nhưng không load được stores, clear nó
      if (selectedDocument?.googleFileSearchStoreName) {
        console.warn('Cannot validate file search stores due to error, clearing selected document with store');
        setSelectedDocument(null);
      }
    }
  };

  const loadMessages = async (sessionId: number, session?: ChatSessionResponse | null) => {
    try {
      setIsLoading(true);
      const data = await chatbotService.getSessionMessages(sessionId);
      const formattedMessages: Message[] = data.map(msg => ({
        role: msg.role === ChatRole.USER ? 'user' : 'assistant',
        content: msg.content,
        createdAt: msg.createdAt,
        audioUrl: msg.audioUrl,
        sources: msg.sources
      }));
      
      // Nếu session mới và chưa có messages, thêm welcome message
      const currentSession = session || selectedSession;
      if (formattedMessages.length === 0 && currentSession) {
        const expert = chatbotService.getExpertProfileById(currentSession.expertProfileId);
        if (expert) {
          formattedMessages.push(
            {
              role: 'system',
              content: `🌟 Chào mừng đến với ${expert.name}! 🌟`
            },
            {
              role: 'assistant',
              content: `${expert.description}. Bạn đang học lớp mấy?`
            }
          );
        }
      }
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
      // Nếu có lỗi nhưng đã có selectedSession, vẫn hiển thị welcome message
      const currentSession = session || selectedSession;
      if (currentSession) {
        const expert = chatbotService.getExpertProfileById(currentSession.expertProfileId);
        if (expert) {
          setMessages([
            {
              role: 'system',
              content: `🌟 Chào mừng đến với ${expert.name}! 🌟`
            },
            {
              role: 'assistant',
              content: `${expert.description}. Bạn đang học lớp mấy?`
            }
          ]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async (expertProfile: ExpertProfile) => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setIsLoading(true);
      const sessionId = await chatbotService.createSession({
        userId: Number(userId),
        expertProfileCode: expertProfile.code // Use code instead of id for reliability
      });
      
      const newSession: ChatSessionResponse = {
        id: sessionId,
        userId: Number(userId),
        expertProfileId: expertProfile.id,
        expertProfileName: expertProfile.name,
        title: `Chat với ${expertProfile.name}`,
        status: true,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      };

      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
      setSelectedExpert(expertProfile);
      setMessages([
        {
          role: 'system',
          content: `🌟 Chào mừng đến với ${expertProfile.name}! 🌟`
        },
        {
          role: 'assistant',
          content: `${expertProfile.description}. Bạn đang học lớp mấy?`
        }
      ]);
      toast.success(`Đã tạo cuộc trò chuyện với ${expertProfile.name}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Không thể tạo cuộc trò chuyện mới');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to send message text
  const sendMessageText = async (messageText: string) => {
    if (!messageText.trim() || !selectedSession || isLoading) return;
    
    const userMessage = messageText.trim();
    
    // Thêm tin nhắn user vào UI ngay
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Nếu chưa có grade level và đang hỏi lớp
    if (!gradeLevel && messages.some(m => m.content.includes('lớp mấy'))) {
      const gradeRegex = /(\d+)/;
      const gradeMatch = gradeRegex.exec(userMessage);
      if (gradeMatch) {
        setGradeLevel(gradeMatch[1]);
      }
    }

    try {
      setIsLoading(true);
      
      // Sử dụng fileStoreName nếu document có googleFileSearchStoreName VÀ store tồn tại trên Google
      // Luôn gửi documentId để fallback nếu fileStoreName không tồn tại
      const rawFileStoreName = selectedDocument?.googleFileSearchStoreName;
      const fileStoreName = rawFileStoreName && validFileSearchStores.has(rawFileStoreName) 
        ? rawFileStoreName 
        : undefined;
      // Luôn gửi documentId để backend có thể fallback nếu fileStoreName không tồn tại
      const documentId = selectedDocument?.id;
      
      // Log để debug
      console.log('Sending message with:', {
        rawFileStoreName,
        fileStoreName,
        documentId,
        documentTitle: selectedDocument?.title,
        hasFileSearch: !!fileStoreName,
        isValidStore: rawFileStoreName ? validFileSearchStores.has(rawFileStoreName) : false
      });
      
      const response = await chatbotService.sendMessage(selectedSession.id, {
        messages: userMessage,
        gradeLevel: gradeLevel || undefined,
        documentId: documentId,
        chapterId: selectedChapter || undefined,
        lessonId: selectedLesson || undefined,
        fileStoreName: fileStoreName || undefined, // Đảm bảo không gửi null
        useVoiceChat: useVoiceChat
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        createdAt: response.createdAt,
        audioUrl: response.audioUrl,
        sources: response.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Reload sessions để cập nhật updateTime
      await loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      // Xóa tin nhắn user nếu lỗi
      setMessages(prev => prev.filter(m => m !== newUserMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !selectedSession || isLoading) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    
    await sendMessageText(userMessage);
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;

    try {
      await chatbotService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Không thể xóa cuộc trò chuyện');
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const getExpertIcon = (expertId: number) => {
    const expert = EXPERT_PROFILES.find(e => e.id === expertId);
    if (!expert) return <Bot className="size-4" />;
    const code = expert.code;
    if (code.includes('algebra')) return <Calculator className="size-4" />;
    if (code.includes('geometry')) return <Brain className="size-4" />;
    if (code.includes('calculus')) return <Zap className="size-4" />;
    if (code.includes('rag')) return <FileText className="size-4" />;
    return <BookOpen className="size-4" />;
  };

  // Voice recording functions with Web Speech API
  const startRecording = async () => {
    try {
      // Check if browser supports Web Speech API
      const SpeechRecognitionClass = typeof window !== 'undefined' 
        ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition)
        : null;
      
      if (!SpeechRecognitionClass) {
        toast.error('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.');
        return;
      }

      // Initialize Speech Recognition
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN'; // Vietnamese language

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        finalTranscriptRef.current = '';
        setRecordingTime(0);
        
        // Start timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let currentFinalTranscript = finalTranscriptRef.current;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinalTranscript += transcript + ' ';
            finalTranscriptRef.current = currentFinalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(currentFinalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          toast.error('Không phát hiện giọng nói. Vui lòng thử lại.');
        } else if (event.error === 'not-allowed') {
          toast.error('Quyền truy cập microphone bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.');
        } else {
          toast.error(`Lỗi nhận diện giọng nói: ${event.error}`);
        }
        stopRecording();
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Không thể bắt đầu ghi âm. Vui lòng thử lại.');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    setIsRecording(false);
    
    // Get final transcript from ref (more reliable than state)
    const finalTranscript = finalTranscriptRef.current.trim();
    setTranscript('');
    finalTranscriptRef.current = '';
    setRecordingTime(0);
    
    // Auto-send message if there's transcript
    if (finalTranscript && selectedSession && !isLoading) {
      // Small delay to ensure UI updates
      setTimeout(async () => {
        await sendMessageText(finalTranscript);
      }, 100);
    } else if (finalTranscript) {
      // If can't send, set to input for manual send
      setUserInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
    }
  };

  // Audio playback functions
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setAudioPlaying(audioUrl);
    
    audio.onended = () => {
      setAudioPlaying(null);
    };
    
    audio.onerror = () => {
      toast.error('Không thể phát audio');
      setAudioPlaying(null);
    };
    
    audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioPlaying(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="container mx-auto max-w-7xl py-4 h-screen flex gap-4">
        {/* Sidebar - Sessions List */}
        <div className={cn(
          "transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}>
          <Card className="h-full bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl flex flex-col">
            <CardHeader className="border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Cuộc trò chuyện
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-purple-300 hover:text-purple-100"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-2">
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="size-6 animate-spin text-purple-400" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-purple-300/70">
                  <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const expert = chatbotService.getExpertProfileById(session.expertProfileId);
  return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedSession(session);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all",
                          selectedSession?.id === session.id
                            ? "bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-400/50"
                            : "bg-purple-900/20 border border-purple-500/20 hover:bg-purple-800/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 mt-0.5">
                              {getExpertIcon(session.expertProfileId)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {expert?.name || session.expertProfileName}
                              </p>
                              <p className="text-xs text-purple-300/70 truncate mt-0.5">
                                {session.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-purple-400/60">
                                <Clock className="size-3" />
                                {formatTime(session.updateTime)}
                              </div>
                            </div>
        </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
        </div>
      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t border-purple-500/30">
              <Button
                onClick={() => {
                  setSelectedSession(null);
                  setSelectedExpert(null);
                  setMessages([]);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              >
                <Plus className="size-4 mr-2" />
                Cuộc trò chuyện mới
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="absolute left-4 top-4 z-20 text-purple-300 hover:text-purple-100 bg-black/40 backdrop-blur-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
          )}

          {!selectedSession && !selectedExpert ? (
            // Expert Selection
            <Card className="h-full bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl flex flex-col">
              <CardHeader className="border-b border-purple-500/30">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse">
                <Bot className="size-8 text-white" />
              </div>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
                MathMind AI Universe
                  </CardTitle>
              <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse">
                <Brain className="size-8 text-white" />
              </div>
            </div>
                <p className="text-center text-purple-300/70 mt-4">
                  Chọn một AI Mathematician để bắt đầu cuộc phiêu lưu toán học của bạn!
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {EXPERT_PROFILES.map((expert) => (
                    <Button
                      key={expert.id}
                      onClick={() => createNewSession(expert)}
                      disabled={isLoading}
                      className="p-6 h-auto bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-xl hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      <div className="flex flex-col items-center gap-3 text-center w-full">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
                          {expert.code.includes('algebra') && <Calculator className="size-6 text-white" />}
                          {expert.code.includes('geometry') && <Brain className="size-6 text-white" />}
                          {expert.code.includes('calculus') && <Zap className="size-6 text-white" />}
                          {expert.code.includes('problem') && <BookOpen className="size-6 text-white" />}
                          {expert.code.includes('rag') && <FileText className="size-6 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{expert.name}</h3>
                          <p className="text-sm text-purple-200 mt-1">{expert.description}</p>
                          <Badge className="mt-2 bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                            {expert.specialty}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Chat Interface
            <Card className="h-full bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl flex flex-col">
              <CardHeader className="border-b border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
                      {selectedExpert && getExpertIcon(selectedExpert.id)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        {selectedExpert?.name || selectedSession?.expertProfileName}
                      </CardTitle>
                      <p className="text-sm text-purple-300/70">
                        {selectedExpert?.specialty || 'AI Mathematician'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={useVoiceChat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseVoiceChat(!useVoiceChat)}
                      className={cn(
                        "transition-all",
                        useVoiceChat && "bg-cyan-500 hover:bg-cyan-600"
                      )}
                    >
                      {useVoiceChat ? <Volume2 className="size-4 mr-2" /> : <VolumeX className="size-4 mr-2" />}
                      Voice Chat
                    </Button>
                </div>
              </div>
                {/* Document Selector for RAG Tutor */}
                {selectedExpert?.useRag && (
                  <div className="mt-4 flex items-center gap-3">
                    <Select
                      value={selectedDocument?.id || ''}
                      onValueChange={(value) => {
                        const doc = documents.find(d => d.id === value);
                        setSelectedDocument(doc || null);
                        setSelectedChapter('');
                        setSelectedLesson('');
                        // Log để debug
                        if (doc) {
                          const hasValidFileSearch = doc.googleFileSearchStoreName && 
                            validFileSearchStores.has(doc.googleFileSearchStoreName);
                          console.log('Document selected:', {
                            id: doc.id,
                            title: doc.title,
                            hasFileSearch: !!doc.googleFileSearchStoreName,
                            fileStoreName: doc.googleFileSearchStoreName,
                            isValidStore: hasValidFileSearch
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-400/30 text-white w-full">
                        <SelectValue placeholder="Chọn tài liệu để chat..." />
                      </SelectTrigger>
                      <SelectContent>
                        {documents.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-purple-300/70">Chưa có tài liệu nào</div>
                        ) : (() => {
                          // Filter documents: chỉ hiển thị documents có store hợp lệ HOẶC không có store
                          // Ẩn documents có store nhưng store không tồn tại trên Google (đã bị xóa)
                          const validDocuments = documents.filter(doc => {
                            if (doc.status !== DocumentStatus.COMPLETED) return false;
                            
                            // Nếu không có store, vẫn hiển thị (dùng RAG truyền thống)
                            if (!doc.googleFileSearchStoreName) return true;
                            
                            // Nếu có store, chỉ hiển thị nếu store hợp lệ
                            return validFileSearchStores.has(doc.googleFileSearchStoreName);
                          });
                          
                          if (validDocuments.length === 0) {
                            return (
                              <div className="px-2 py-1.5 text-sm text-purple-300/70">
                                Không có tài liệu khả dụng. Vui lòng upload lại tài liệu.
                              </div>
                            );
                          }
                          
                          return validDocuments.map((doc) => {
                            // Chỉ hiển thị file search icon nếu store tồn tại trên Google
                            const hasFileSearch = doc.googleFileSearchStoreName && 
                              validFileSearchStores.has(doc.googleFileSearchStoreName);
                            return (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.title} 
                                {hasFileSearch && ' 📚'} 
                                {doc.status === DocumentStatus.COMPLETED && ' ✓'}
                              </SelectItem>
                            );
                          });
                        })()}
                      </SelectContent>
                    </Select>
                    {selectedDocument?.googleFileSearchStoreName && 
                     validFileSearchStores.has(selectedDocument.googleFileSearchStoreName) && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                        File Search Ready
                      </Badge>
                    )}
          </div>
                )}
              </CardHeader>
          
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
                  {messages.map((message) => {
                    const messageId = message.createdAt ? `${message.role}-${message.createdAt}` : `${message.role}-${Date.now()}-${Math.random()}`;
                    const messageClasses = cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap backdrop-blur-sm border shadow-lg",
                      message.role === 'user' && "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-400/30 text-purple-100 shadow-purple-500/20 ml-auto",
                      message.role === 'system' && "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 text-yellow-100 shadow-yellow-500/20 text-center font-bold mx-auto",
                      message.role === 'assistant' && "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-cyan-400/30 text-cyan-100 shadow-cyan-500/20"
                    );
                
                return (
                      <div
                        key={messageId}
                        className={cn(
                          "flex items-start gap-4",
                          message.role === 'user' && "justify-end",
                          message.role === 'system' && "justify-center"
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500">
                      <Bot className="size-6 text-white" />
                    </div>
                  )}
                  {message.role === 'system' && (
                          <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                            <Brain className="size-6 text-white" />
                          </div>
                        )}
                        <div className={messageClasses}>
                          {message.role === 'assistant' || message.role === 'system' ? (
                            message.content ? (
                              <>
                                <MarkdownMessage 
                                  content={message.content}
                                  className="text-current"
                                />
                                {/* Audio playback button */}
                                {message.audioUrl && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (audioPlaying === message.audioUrl) {
                                          stopAudio();
                                        } else {
                                          playAudio(message.audioUrl!);
                                        }
                                      }}
                                      className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20"
                                    >
                                      {audioPlaying === message.audioUrl ? (
                                        <>
                                          <VolumeX className="size-4 mr-2" />
                                          Dừng phát
                                        </>
                                      ) : (
                                        <>
                                          <Volume2 className="size-4 mr-2" />
                                          Phát audio
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}
                                {/* Sources from RAG */}
                                {message.sources && message.sources.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-cyan-400/20">
                                    <p className="text-xs font-semibold text-cyan-300 mb-2">Nguồn tham khảo:</p>
                                    <div className="space-y-2">
                                      {message.sources.slice(0, 3).map((source) => (
                                        <div key={`${source.documentId}-${source.chapterId}-${source.lessonId}-${source.pageNumber}`} className="text-xs bg-black/20 rounded p-2">
                                          <p className="text-cyan-200/80 line-clamp-2">{source.content}</p>
                                          {source.chapterTitle && (
                                            <p className="text-purple-300/60 mt-1">
                                              {source.chapterTitle}
                                              {source.lessonTitle && ` - ${source.lessonTitle}`}
                                              {source.pageNumber && ` (Trang ${source.pageNumber})`}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                    </div>
                  )}
                              </>
                            ) : (
                              <p className="text-current">Đang tải...</p>
                            )
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                  </div>
                  {message.role === 'user' && (
                          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
                      <User className="size-6 text-white" />
                    </div>
                  )}
                </div>
                );
              })}
                  {isLoading && (
                    <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse">
                    <Bot className="size-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 text-cyan-100 rounded-2xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin size-5" />
                          <span>Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <CardContent className="p-6 border-t border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
                {/* Recording indicator */}
                {isRecording && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                          <div className="relative w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                        <span className="text-red-300 font-semibold">Đang ghi âm...</span>
                        <span className="text-red-400/70 text-sm">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                  <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MicOff className="size-4 mr-2" />
                        Dừng ghi âm
                      </Button>
                      </div>
                    {transcript && (
                      <div className="mt-3 p-3 bg-black/30 rounded-lg border border-red-400/20">
                        <p className="text-sm text-red-200/80">
                          <span className="font-semibold">Đang nhận diện:</span> {transcript}
                        </p>
                      </div>
                    )}
              </div>
            )}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <div className="flex-1 flex gap-2">
                    {/* Voice recording button with enhanced animation */}
                  <Button 
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "h-14 w-14 rounded-xl transition-all relative overflow-hidden",
                        isRecording && "bg-red-500 hover:bg-red-600 animate-pulse"
                      )}
                      disabled={isLoading || !selectedSession}
                    >
                      {isRecording ? (
                        <>
                          <div className="absolute inset-0 bg-red-500 animate-ping opacity-20"></div>
                          <MicOff className="size-5 relative z-10" />
                        </>
                      ) : (
                        <Mic className="size-5" />
                      )}
                  </Button>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                      placeholder={isRecording ? "Đang ghi âm..." : "Nhập câu hỏi của bạn hoặc nhấn nút mic để nói..."}
                  className="bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/70 rounded-xl h-14 flex-1 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={isLoading || !selectedSession || isRecording}
                />
                  </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-14 w-14 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/30" 
                    disabled={isLoading || !userInput.trim() || !selectedSession || isRecording}
                >
                  <Send className="size-6" />
                </Button>
              </form>
          </CardContent>
        </Card>
          )}
        </div>
      </div>
    </div>
  );
}
