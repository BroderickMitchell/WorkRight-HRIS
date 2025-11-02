'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle, ClipboardList, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@workright/ui';
import { CommunicationPost } from '../../../../../lib/api/communications';
import { useCommunicationAckSummary } from '../../../../../lib/hooks/useCommunications';
import AckSummaryDrawer from './AckSummaryDrawer';

interface PostCardProps {
  post: CommunicationPost;
  onEdit: () => void;
  onDelete: () => void;
  onAcknowledge: () => void;
}

const formatDateTime = (iso: string) => format(new Date(iso), 'dd MMM yyyy, h:mm a');

export default function PostCard({ post, onEdit, onDelete, onAcknowledge }: PostCardProps) {
  const [showAckSummary, setShowAckSummary] = useState(false);
  const ackSummaryQuery = useCommunicationAckSummary(post.id, showAckSummary);

  const createdAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const editedLabel = post.editedAt ? `Edited ${formatDistanceToNow(new Date(post.editedAt), { addSuffix: true })}` : null;

  const canShowAckSummary = Boolean(post.ackSummary);
  const ackSummary = ackSummaryQuery.data;

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">{post.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                {post.author.givenName} {post.author.familyName}
              </span>
              <span aria-hidden>•</span>
              <span>{createdAgo}</span>
              {editedLabel ? (
                <span className="flex items-center gap-1 text-warning">
                  <AlertTriangle className="h-3 w-3" /> {editedLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.requireAck ? (
              post.myAck?.acknowledged ? (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" /> Acknowledged {post.myAck.acknowledgedAt ? `on ${formatDateTime(post.myAck.acknowledgedAt)}` : ''}
                </Badge>
              ) : (
                <Button size="sm" onClick={onAcknowledge}>
                  Mark as acknowledged
                </Button>
              )
            ) : null}

            {post.canEdit || post.canDelete ? (
              <div className="flex items-center gap-1">
                {post.canEdit ? (
                  <Button size="icon" variant="ghost" onClick={onEdit} title="Edit post">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                ) : null}
                {post.canDelete ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm('Remove this update?')) onDelete();
                    }}
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {post.department ? <Badge variant="outline">{post.department.name}</Badge> : null}
          {post.targetTeams.map((team) => (
            <Badge key={team.id} variant="outline">
              {team.name}
            </Badge>
          ))}
          {post.requireAck ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> Ack required
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <div className="whitespace-pre-wrap text-foreground">{post.body}</div>

        {post.attachments && post.attachments.length ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {post.attachments.map((attachment, index) => (
                <a
                  key={`${attachment.url}-${index}`}
                  href={attachment.url}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-primary transition hover:bg-primary/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-3 w-3" /> {attachment.name}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {post.mentions && post.mentions.length ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Mentions</p>
            <div className="flex flex-wrap gap-2">
              {post.mentions.map((mention, index) => (
                <Badge key={`${mention.userId}-${index}`} variant="secondary">
                  @{mention.userId}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {post.requireAck && canShowAckSummary ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
            {post.ackSummary ? (
              <span>
                Acknowledged {post.ackSummary.acknowledged} of {post.ackSummary.required} • Pending {post.ackSummary.pending}
              </span>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setShowAckSummary(true)}>
              View acknowledgement progress
            </Button>
          </div>
        ) : null}
      </CardContent>

      {showAckSummary ? (
        <AckSummaryDrawer
          open={showAckSummary}
          onOpenChange={setShowAckSummary}
          loading={ackSummaryQuery.isLoading}
          summary={ackSummary}
          post={post}
        />
      ) : null}
    </Card>
  );
}
