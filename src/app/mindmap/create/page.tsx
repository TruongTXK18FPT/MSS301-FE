'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import MindmapCreateForm from '@/components/mindmap/MindmapCreateForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MindmapCreatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classroomId = searchParams.get('classroomId');

  const handleSuccess = (mindmap: any) => {
    // If created from classroom, redirect back to classroom
    if (classroomId) {
      router.push(`/classroom/${classroomId}`);
    } else {
      // Otherwise go to mindmap editor
      router.push(`/mindmap/${mindmap.id}`);
    }
  };

  const handleCancel = () => {
    if (classroomId) {
      router.push(`/classroom/${classroomId}`);
    } else {
      router.push('/mindmap');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="mb-6 bg-black/30 border-purple-400/30 text-purple-200 hover:bg-black/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <MindmapCreateForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          classroomId={classroomId ? parseInt(classroomId) : undefined}
        />
      </div>
    </div>
  );
}

export default function MindmapCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <MindmapCreatePageContent />
    </Suspense>
  );
}
