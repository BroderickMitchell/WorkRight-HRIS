"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CostSplit,
  CostSplitInput,
  EmployeeProfilePayload,
  EmploymentEvent,
  EmploymentEventType,
  GeneratedDocument,
  UpdateEmployeeProfileInput
} from '@workright/profile-schema';
import {
  deleteCostSplit,
  employeeCostSplitsKey,
  employeeDocumentsKey,
  employeeHistoryKey,
  employeeProfileQueryKey,
  exportHistory,
  fetchCostSplits,
  fetchDocuments,
  fetchEmployeeProfile,
  fetchHistory,
  generateDocument,
  updateEmployeeSection,
  upsertCostSplits
} from '@/lib/employee-profile';
import {
  assignRoster,
  fetchRosterAssignments,
  fetchRosterTemplates,
  rosterAssignmentsKey,
  rosterTemplatesKey
} from '@/lib/rosters';
import { ProfileHeader } from './profile-header';
import { ProfileSkeleton } from './profile-skeleton';
import { PersonalInfoCard } from './personal-info-card';
import { ContactInfoCard } from './contact-info-card';
import { JobInfoCard } from './job-info-card';
import { CompensationCard } from './compensation-card';
import { TimeEligibilityCard } from './time-eligibility-card';
import { CostSplitsCard } from './cost-splits-card';
import { DocumentsCard } from './documents-card';
import { HistoryCard } from './history-card';
import { useHasUnsavedChanges, useProfileEditingStore } from './use-profile-editing';
import { Card } from '@workright/ui';
import { RosterAssignmentsCard } from './roster-assignments-card';

interface EmployeeProfileShellProps {
  employeeId: string;
}

export function EmployeeProfileShell({ employeeId }: EmployeeProfileShellProps) {
  const queryClient = useQueryClient();
  const [historyFilters, setHistoryFilters] = useState<{ type?: EmploymentEventType; from?: string; to?: string }>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const hasUnsaved = useHasUnsavedChanges();

  useEffect(() => {
    if (!banner) return;
    const timeout = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError
  } = useQuery({
    queryKey: employeeProfileQueryKey(employeeId),
    queryFn: () => fetchEmployeeProfile(employeeId)
  });

  const { data: costSplits = [], isFetching: isCostSplitLoading } = useQuery({
    queryKey: employeeCostSplitsKey(employeeId),
    queryFn: () => fetchCostSplits(employeeId),
    enabled: Boolean(profile)
  });

  const { data: documents = [], refetch: refetchDocuments, isFetching: isDocumentsLoading } = useQuery({
    queryKey: employeeDocumentsKey(employeeId),
    queryFn: () => fetchDocuments(employeeId),
    enabled: Boolean(profile)
  });

  const { data: history = [], refetch: refetchHistory, isFetching: isHistoryLoading } = useQuery({
    queryKey: employeeHistoryKey(employeeId, historyFilters),
    queryFn: () => fetchHistory(employeeId, historyFilters),
    enabled: Boolean(profile),
    placeholderData: (previousData) => previousData
  });

  const { data: rosterTemplates = [], isFetching: isRosterTemplatesLoading } = useQuery({
    queryKey: rosterTemplatesKey(),
    queryFn: () => fetchRosterTemplates(),
    enabled: Boolean(profile?.permissions.canEditJob)
  });

  const { data: rosterAssignments = [], isFetching: isRosterAssignmentsLoading } = useQuery({
    queryKey: rosterAssignmentsKey(employeeId),
    queryFn: () => fetchRosterAssignments({ employeeId }),
    enabled: Boolean(profile)
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateEmployeeProfileInput) => updateEmployeeSection(employeeId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: employeeProfileQueryKey(employeeId) });
      const previous = queryClient.getQueryData<EmployeeProfilePayload>(employeeProfileQueryKey(employeeId));
      if (previous) {
        const optimistic = { ...previous, [input.section]: input.payload } as EmployeeProfilePayload;
        queryClient.setQueryData(employeeProfileQueryKey(employeeId), optimistic);
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(employeeProfileQueryKey(employeeId), context.previous);
      }
      setBanner('Unable to save changes. Please try again.');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(employeeProfileQueryKey(employeeId), data);
      setBanner('Changes saved successfully.');
      useProfileEditingStore.getState().reset();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeProfileQueryKey(employeeId) });
    }
  });

  const costSplitMutation = useMutation({
    mutationFn: (splits: CostSplitInput[]) => upsertCostSplits(employeeId, splits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeCostSplitsKey(employeeId) });
      queryClient.invalidateQueries({ queryKey: employeeProfileQueryKey(employeeId) });
      setBanner('Cost coding updated.');
    },
    onError: () => setBanner('Cost split update failed. Check overlaps and try again.')
  });

  const costSplitDeleteMutation = useMutation({
    mutationFn: (splitId: string) => deleteCostSplit(splitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeCostSplitsKey(employeeId) });
      queryClient.invalidateQueries({ queryKey: employeeProfileQueryKey(employeeId) });
      setBanner('Cost split removed.');
    },
    onError: () => setBanner('Failed to delete cost split. Try again later.')
  });

  const documentMutation = useMutation({
    mutationFn: (input: { templateId: string; format: 'PDF' | 'DOCX' }) => generateDocument(employeeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeDocumentsKey(employeeId) });
      queryClient.invalidateQueries({ queryKey: employeeHistoryKey(employeeId, historyFilters) });
      setBanner('Document generated successfully.');
    },
    onError: () => setBanner('Document generation failed. Please review the template.')
  });

  const exportMutation = useMutation({
    mutationFn: (filters: { type?: EmploymentEventType; from?: string; to?: string }) => exportHistory(employeeId, filters),
    onSuccess: (response) => {
      setBanner('History export ready. Downloading…');
      window.open(response.url, '_blank', 'noopener');
    },
    onError: () => setBanner('Unable to export history right now.')
  });

  const rosterAssignMutation = useMutation({
    mutationFn: (input: { templateId: string; locationId?: string; effectiveFrom: string; effectiveTo?: string }) =>
      assignRoster({ employeeId, ...input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rosterAssignmentsKey(employeeId) });
      setBanner('Roster assignment saved.');
    },
    onError: () => setBanner('Unable to assign roster. Check details and try again.')
  });

  useEffect(() => {
    if (!documentsOpen) return;
    refetchDocuments();
  }, [documentsOpen, refetchDocuments]);

  useEffect(() => {
    refetchHistory();
  }, [historyFilters, refetchHistory]);

  const permissions = profile?.permissions;

  const handleGenerateHeader = () => {
    if (!permissions?.canGenerateDocuments) {
      setBanner('You do not have permission to generate documents.');
      return;
    }
    setDocumentsOpen(true);
  };

  const handleViewHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentDocuments: GeneratedDocument[] = useMemo(() => documents, [documents]);
  const currentHistory: EmploymentEvent[] = useMemo(() => history, [history]);
  const currentCostSplits: CostSplit[] = useMemo(() => costSplits, [costSplits]);
  const currentRosterAssignments = useMemo(() => rosterAssignments, [rosterAssignments]);
  const currentRosterTemplates = useMemo(() => rosterTemplates, [rosterTemplates]);

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (isProfileError || !profile) {
    return (
      <Card className="p-6 text-sm text-rose-600">
        We couldn’t load the employee profile. Refresh the page or contact support if the issue persists.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        employee={profile.employee}
        onGenerateDocument={handleGenerateHeader}
        onExportPdf={handleGenerateHeader}
        onViewHistory={handleViewHistory}
      />

      {banner ? (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          {banner}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PersonalInfoCard
            data={profile.personal}
            canEdit={profile.permissions.canEditPersonal}
            onSave={async (payload) => {
              await updateMutation.mutateAsync({ section: 'personal', payload });
            }}
            isSaving={updateMutation.isPending}
          />
          <ContactInfoCard
            data={profile.contact}
            canEdit={profile.permissions.canEditPersonal}
            onSave={async (payload) => {
              await updateMutation.mutateAsync({ section: 'contact', payload });
            }}
            isSaving={updateMutation.isPending}
          />
          <JobInfoCard
            data={profile.job}
            canEdit={profile.permissions.canEditJob}
            onSave={async (payload) => {
              await updateMutation.mutateAsync({ section: 'job', payload });
            }}
            isSaving={updateMutation.isPending}
          />
          <TimeEligibilityCard
            data={profile.timeAndEligibility}
            canEdit={profile.permissions.canEditJob}
            onSave={async (payload) => {
              await updateMutation.mutateAsync({ section: 'timeAndEligibility', payload });
            }}
            isSaving={updateMutation.isPending}
          />
          <RosterAssignmentsCard
            assignments={currentRosterAssignments}
            templates={currentRosterTemplates}
            canManage={profile.permissions.canEditJob}
            defaultLocationId={profile.job.location?.id}
            isLoading={isRosterAssignmentsLoading || isRosterTemplatesLoading}
            isAssigning={rosterAssignMutation.isPending}
            onAssign={async (input) => {
              await rosterAssignMutation.mutateAsync(input);
            }}
          />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <CompensationCard
            data={profile.compensation}
            canEdit={profile.permissions.canEditCompensation}
            onSave={async (payload) => {
              await updateMutation.mutateAsync({ section: 'compensation', payload });
            }}
            isSaving={updateMutation.isPending}
          />
          <CostSplitsCard
            splits={currentCostSplits}
            canManage={profile.permissions.canManageCostSplits}
            onSave={async (splits) => {
              await costSplitMutation.mutateAsync(splits);
            }}
            onDelete={async (splitId) => {
              await costSplitDeleteMutation.mutateAsync(splitId);
            }}
            isMutating={costSplitMutation.isPending || costSplitDeleteMutation.isPending || isCostSplitLoading}
          />
          <DocumentsCard
            generated={currentDocuments}
            templates={profile.documents.templates}
            canGenerate={profile.permissions.canGenerateDocuments}
            onGenerate={async (input) => {
              await documentMutation.mutateAsync(input);
            }}
            isGenerating={documentMutation.isPending || isDocumentsLoading}
            isDialogOpen={documentsOpen}
            onDialogChange={setDocumentsOpen}
          />
        </div>
      </div>

      <div ref={historyRef}>
        <HistoryCard
          events={currentHistory}
          onFiltersChange={(filters) => setHistoryFilters(filters)}
          onExport={(filters) => exportMutation.mutateAsync(filters)}
          isLoading={isHistoryLoading}
          isExporting={exportMutation.isPending}
        />
      </div>
    </div>
  );
}
