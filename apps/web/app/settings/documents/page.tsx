import { Suspense } from 'react';
import DocumentTemplatesClient from './document-templates-client';

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="h-64 rounded-lg border border-slate-200 bg-slate-50" />
    </div>
  );
}

export default function DocumentTemplatesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DocumentTemplatesClient />
    </Suspense>
  );
}
