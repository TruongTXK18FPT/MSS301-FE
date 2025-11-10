'use client';

import { useParams } from 'next/navigation';
import { DocumentDetail } from '@/components/admin/document-management';

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  return <DocumentDetail documentId={documentId} />;
}
