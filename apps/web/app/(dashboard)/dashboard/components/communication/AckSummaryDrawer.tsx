'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Loader2, DownloadCloud } from 'lucide-react';
import { Badge, Button, Drawer } from '@workright/ui';
import { CommunicationAckSummary, CommunicationPost } from '../../../../lib/api/communications';

interface AckSummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  summary?: CommunicationAckSummary;
  post: CommunicationPost;
}

const formatDate = (value?: string | null) => (value ? format(new Date(value), 'dd MMM yyyy, h:mm a') : '—');

export default function AckSummaryDrawer({ open, onOpenChange, loading, summary, post }: AckSummaryDrawerProps) {
  const acknowledged = summary?.recipients.filter((recipient) => recipient.acknowledged) ?? [];
  const pending = summary?.recipients.filter((recipient) => !recipient.acknowledged) ?? [];

  const teamLookup = useMemo(() => {
    const map = new Map<string, string>();
    post.targetTeams.forEach((team) => map.set(team.id, team.name));
    return map;
  }, [post.targetTeams]);

  const exportCsv = () => {
    if (!summary) return;
    const header = [
      'postId',
      'postTitle',
      'department',
      'teamName',
      'recipientName',
      'recipientEmail',
      'acknowledged',
      'acknowledgedAt',
      'dueAt'
    ];

    const rows: string[][] = [];
    const fallbackTeams = post.targetTeams.map((team) => team.id);
    summary.recipients.forEach((recipient) => {
      const teams = recipient.teamIds.length ? recipient.teamIds : fallbackTeams;
      const name = `${recipient.user.givenName} ${recipient.user.familyName}`.trim();
      teams.forEach((teamId) => {
        rows.push([
          post.id,
          post.title,
          post.department?.name ?? '',
          teamLookup.get(teamId) ?? teamId,
          name,
          recipient.user.email,
          recipient.acknowledged ? 'yes' : 'no',
          recipient.acknowledgedAt ? new Date(recipient.acknowledgedAt).toISOString() : '',
          post.ackDueAt ?? ''
        ]);
      });
    });

    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${post.id}-acknowledgements.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Acknowledgement progress">
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{post.title}</h3>
          <p className="text-sm text-muted-foreground">
            {post.ackSummary?.acknowledged ?? 0} of {post.ackSummary?.required ?? 0} recipients have acknowledged this
            update.
          </p>
        </div>

        {post.ackDueAt ? (
          <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-sm">
            Due by <span className="font-medium text-foreground">{formatDate(post.ackDueAt)}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!summary || loading}>
            <DownloadCloud className="h-4 w-4" /> Export CSV
          </Button>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>

        {summary ? (
          <div className="space-y-5">
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">By team</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {summary.perTeam.map(({ team, counts }) => (
                  <div key={team.id} className="rounded-lg border border-border/80 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{teamLookup.get(team.id) ?? team.name}</span>
                      <Badge variant="secondary">{counts.required} required</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-xs text-muted-foreground">
                      <span>Acknowledged</span>
                      <span>Pending</span>
                      <span>Completion</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm font-medium">
                      <span>{counts.acknowledged}</span>
                      <span>{counts.pending}</span>
                      <span>
                        {counts.required
                          ? Math.round((counts.acknowledged / counts.required) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Recipients</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <RecipientColumn title="Pending" recipients={pending} teamLookup={teamLookup} />
                <RecipientColumn title="Acknowledged" recipients={acknowledged} teamLookup={teamLookup} />
              </div>
            </section>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Acknowledgement data will appear once recipients are added.</p>
        )}
      </div>
    </Drawer>
  );
}

interface RecipientColumnProps {
  title: string;
  recipients: CommunicationAckSummary['recipients'];
  teamLookup: Map<string, string>;
}

function RecipientColumn({ title, recipients, teamLookup }: RecipientColumnProps) {
  if (!recipients.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
        No recipients in this state.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-foreground">{title}</h5>
      <div className="space-y-2">
        {recipients.map((recipient) => {
          const name = `${recipient.user.givenName} ${recipient.user.familyName}`.trim();
          const teams = recipient.teamIds.length ? recipient.teamIds : Array.from(teamLookup.keys());
          return (
            <div key={recipient.user.id} className="rounded-lg border border-border/60 p-3 text-sm">
              <div className="font-medium text-foreground">{name || recipient.user.email}</div>
              <div className="text-xs text-muted-foreground">{recipient.user.email}</div>
              {teams.length ? (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {teams.map((teamId) => (
                    <Badge key={`${recipient.user.id}-${teamId}`} variant="outline">
                      {teamLookup.get(teamId) ?? teamId}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className="mt-2 text-xs text-muted-foreground">
                Status:{' '}
                {recipient.acknowledged
                  ? `Acknowledged ${formatDate(recipient.acknowledgedAt ?? null)}`
                  : 'Awaiting confirmation'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
