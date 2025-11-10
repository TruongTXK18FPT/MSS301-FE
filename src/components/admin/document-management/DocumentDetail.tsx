'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowLeft,
  Loader2,
  BookOpen,
  FileSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  DocumentResponseDto,
  ChapterDto,
  ChunkDto,
  getDocumentById,
  getDocumentStructure,
  getDocumentChunks,
  searchChunks,
  formatFileSize,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '@/lib/services/document.service';
import ProcessingTracker from './ProcessingTracker';

interface DocumentDetailProps {
  documentId: string;
}

export default function DocumentDetail({ documentId }: DocumentDetailProps) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentResponseDto | null>(null);
  const [structure, setStructure] = useState<ChapterDto[]>([]);
  const [chunks, setChunks] = useState<ChunkDto[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<{
    chapter: number;
    lesson: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChunkDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProcessing, setShowProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocumentData();
  }, [documentId]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      const [docResponse, structureResponse] = await Promise.all([
        getDocumentById(documentId),
        getDocumentStructure(documentId),
      ]);

      if (docResponse.success) {
        setDocument(docResponse.data);
        if (docResponse.data.status === 'PROCESSING') {
          setShowProcessing(true);
        }
      }

      if (structureResponse.success) {
        setStructure(structureResponse.data.structure);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterNumber: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNumber)) {
      newExpanded.delete(chapterNumber);
    } else {
      newExpanded.add(chapterNumber);
    }
    setExpandedChapters(newExpanded);
  };

  const loadLessonChunks = async (chapter: number, lesson: number) => {
    try {
      setSelectedLesson({ chapter, lesson });
      setSearchResults([]);
      const response = await getDocumentChunks(documentId, { chapter, lesson });
      if (response.success) {
        setChunks(response.data.chunks);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải nội dung bài học',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await searchChunks(documentId, searchQuery);
      if (response.success) {
        setSearchResults(response.data.results);
        setSelectedLesson(null);
        setChunks([]);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tìm kiếm',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-400/30 text-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-300">Không tìm thấy tài liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Processing Tracker */}
      {showProcessing && (
        <ProcessingTracker
          documentId={documentId}
          onComplete={() => {
            setShowProcessing(false);
            loadDocumentData();
          }}
          onClose={() => setShowProcessing(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-purple-200 hover:bg-purple-500/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-purple-400" />
                  {document.title}
                </CardTitle>
                <p className="text-purple-200 mt-2">{document.description}</p>
              </div>
              <Badge className={getStatusColor(document.status)}>
                {getStatusLabel(document.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-purple-300">Tên file</p>
              <p className="text-white font-medium">{document.filename}</p>
            </div>
            <div>
              <p className="text-purple-300">Kích thước</p>
              <p className="text-white font-medium">{formatFileSize(document.size)}</p>
            </div>
            <div>
              <p className="text-purple-300">Ngôn ngữ</p>
              <p className="text-white font-medium">{document.language}</p>
            </div>
            <div>
              <p className="text-purple-300">Số trang</p>
              <p className="text-white font-medium">{document.totalPages || '-'}</p>
            </div>
            <div>
              <p className="text-purple-300">Tải lên</p>
              <p className="text-white font-medium">{formatDate(document.uploadedAt)}</p>
            </div>
            <div>
              <p className="text-purple-300">Xử lý xong</p>
              <p className="text-white font-medium">
                {document.processedAt ? formatDate(document.processedAt) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-slate-800/50 backdrop-blur-xl border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
              <Input
                placeholder="Tìm kiếm trong tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Structure Sidebar */}
        <Card className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
              Cấu trúc tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {structure.map((chapter) => (
              <div key={chapter.number} className="space-y-1">
                <button
                  onClick={() => toggleChapter(chapter.number)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-purple-500/10 text-white transition-colors"
                >
                  <span className="font-medium">
                    Chapter {chapter.number}: {chapter.title}
                  </span>
                  {expandedChapters.has(chapter.number) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedChapters.has(chapter.number) && (
                  <div className="ml-4 space-y-1">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => loadLessonChunks(chapter.number, lesson.number)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                          selectedLesson?.chapter === chapter.number &&
                          selectedLesson?.lesson === lesson.number
                            ? 'bg-purple-500/20 text-white border border-purple-500/30'
                            : 'text-purple-200 hover:bg-slate-700/50'
                        }`}
                      >
                        <span>
                          Lesson {lesson.number}: {lesson.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {lesson.chunkCount}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center">
              <FileSearch className="w-5 h-5 mr-2 text-purple-400" />
              {searchResults.length > 0
                ? `Kết quả tìm kiếm (${searchResults.length})`
                : selectedLesson
                ? `Chapter ${selectedLesson.chapter}, Lesson ${selectedLesson.lesson}`
                : 'Nội dung tài liệu'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      Chapter {chunk.chapterNumber}, Lesson {chunk.lessonNumber}
                    </Badge>
                    {chunk.pageNumber && (
                      <span className="text-xs text-purple-300">
                        Trang {chunk.pageNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-white leading-relaxed">
                    {highlightText(chunk.content, searchQuery)}
                  </p>
                </div>
              ))
            ) : chunks.length > 0 ? (
              chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      Chunk #{chunk.chunkIndex + 1}
                    </Badge>
                    {chunk.pageNumber && (
                      <span className="text-xs text-purple-300">
                        Trang {chunk.pageNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {chunk.content}
                  </p>
                  {chunk.tokenCount && (
                    <div className="mt-2 text-xs text-purple-300">
                      Tokens: {chunk.tokenCount}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileSearch className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                <p className="text-purple-200">
                  {searchQuery
                    ? 'Không tìm thấy kết quả'
                    : 'Chọn một bài học để xem nội dung'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
