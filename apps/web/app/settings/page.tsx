import { Suspense } from 'react';

import SettingsPageClient, { SettingsPageProps } from './settings-page-client';

function SettingsFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      <div className="h-12 w-40 rounded bg-slate-200" />
      <div className="h-40 rounded-lg border border-slate-200 bg-slate-50" />
    </div>
  );
}

export default function SettingsPage(props: SettingsPageProps = {}) {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsPageClient {...props} />
    </Suspense>
  );
}
